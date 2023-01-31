import fs from 'fs/promises'
import { WarpFactory } from 'warp-contracts'

const smartweave = WarpFactory.forLocal()

async function updateState(contractId: string) {
  const wallet = JSON.parse(
    (await fs.readFile(process.env.DEPLOYER_KEYFILE || '')).toString()
  )
  const contract = smartweave.contract(contractId).connect(wallet)
  const input = {
    function: 'register',
    username: 'jim'
  }

  const txId = await contract.writeInteraction(input)

  console.log('Updated State TX ID', txId)
}

(async () => {
  try {
    await updateState(process.env.TX_ID || '')
  } catch (error) {
    console.error(error.message)
  }
})()
