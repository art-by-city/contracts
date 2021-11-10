import fs from 'fs/promises'
import Arweave from 'arweave'
import { SmartWeaveNodeFactory } from 'redstone-smartweave'

const arweave = new Arweave({
  protocol: process.env.ARWEAVE_PROTOCOL || 'http',
  host: process.env.ARWEAVE_HOST || 'localhost',
  port: process.env.ARWEAVE_PORT || 1984
})
const smartweave = SmartWeaveNodeFactory.memCached(arweave)

async function updateState(contractId: string) {
  const wallet = JSON.parse(
    (await fs.readFile(process.env.DEPLOYER_KEYFILE || '')).toString()
  )
  const contract = smartweave.contract(contractId).connect(wallet)
  const input = {
    function: 'register',
    username: 'Jim'
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
