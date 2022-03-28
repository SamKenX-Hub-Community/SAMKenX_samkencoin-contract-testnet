const assert = require('assert')

const parseCsv = require('../test/utils').parseCsv
const Token = artifacts.require("./contracts/Samkencoin.sol")
const Airdrop = artifacts.require("./contracts/SamkencoinAirdrop.sol")
const SCALING_FACTOR = web3.utils.toBN(10 ** 18)

async function fireTx() {
  let { recipients, amounts, airdropSupply } = await parseCsv(web3)
  console.log(recipients, amounts.map(a => a.toString()), airdropSupply)
  const airdrop = await Airdrop.at(process.env.AIRDROP_CONTRACT)
  const token = await Token.at(process.env.TOKEN_CONTRACT)
  airdropSupply = web3.utils.toBN(airdropSupply).mul(SCALING_FACTOR)
  let airdropContractBalance = await token.balanceOf.call(airdrop.address)
  console.log('airdropContractBalance', airdropContractBalance.toString())
  assert.ok(airdropContractBalance.gte(airdropSupply), 'airdropContractBalance is less than airdropSupply')

  const gasEstimate = await airdrop.airdropTokens.estimateGas(process.env.TOKEN_CONTRACT, recipients, amounts)
  console.log('gasEstimate', gasEstimate)
  return airdrop.airdropTokens(process.env.TOKEN_CONTRACT, recipients, amounts, {
    gas: gasEstimate + 10000,
    gasPrice: web3.utils.toWei('15', 'gwei')
  })
}

module.exports = async function(callback) {
  // perform actions
  try {
    const tx = await fireTx();
    console.log(tx)
    console.log('gasUsed', tx.receipt.gasUsed)
    callback();
  } catch (e) {
    console.log(e)
  }
}
