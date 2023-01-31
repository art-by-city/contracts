import 'dotenv/config'
import fs from 'fs'
import { Tags, WarpFactory } from 'warp-contracts'

import { deployWarpContract } from './deploy'
import { getLatestState } from './getLatestState'

const keyfilePath = process.env.DEPLOYER_KEYFILE || 'NO-DEPLOYER-KEY-SPECIFIED'
const warp = WarpFactory.forLocal()
const wallet = JSON.parse(fs.readFileSync(keyfilePath).toString())
const APP_NAME = process.env.APP_NAME || 'ArtByCity-Development'
const APP_VERSION = process.env.APP_VERSION || 'development'

export async function testEvolve(
  contractId: string,
  contractName: string,
  newSrcTxid: string
) {
  const contract = warp.contract(contractId).connect(wallet)
  // const c2 = warp.contract(contractId)

  // const newSrcTxid = await contract.save // ???????

  const tags: Tags = [
    { name: 'Protocol', value: 'ArtByCity' },
    { name: 'App-Name', value: APP_NAME },
    { name: 'App-Version', value: APP_VERSION },
    { name: 'Contract-Name', value: contractName }
  ]
  const res = await contract.evolve(newSrcTxid, {
    disableBundling: true,
    tags
  })

  if (res) {
    console.log('Evolve interaction txid', res.originalTxId)
  } else {
    console.error('evolve result was null')
  }
}

(async () => {
  try {
    const contractPath = process.env.CONTRACT || 'NO-CONTRACT-PATH'
    const contractName = process.env.CONTRACT_NAME || 'NO-CONTRACT-NAME'
    const owner = await warp.arweave.wallets.jwkToAddress(wallet)
    const initialState = { owner, canEvolve: true }
    console.log('Deploying with initial state:', initialState)
    const { contractTxId, srcTxId } = await deployWarpContract(
      contractPath,
      contractName,
      wallet,
      false,
      initialState,
    )
    if (contractTxId) {
      await warp.testing.mineBlock()
      await testEvolve(contractTxId, contractName, srcTxId!)
      await warp.testing.mineBlock()
      const state = await getLatestState(contractTxId)
      console.log('Final State', state)
    } else {
      throw new Error('no contract initial state txid')
    }
  } catch (error) {
    console.error(error)
  }
})()
