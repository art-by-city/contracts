import Arweave from 'arweave'
import { SmartWeaveNodeFactory } from 'redstone-smartweave'

const arweave = new Arweave({
  protocol: process.env.ARWEAVE_PROTOCOL || 'http',
  host: process.env.ARWEAVE_HOST || 'localhost',
  port: process.env.ARWEAVE_PORT || 1984
})

const smartweave = SmartWeaveNodeFactory.memCached(arweave)

async function getLatestState(contractId: string) {
  const latestState = await smartweave.contract(contractId).readState()

  console.log(latestState)
}

(async () => {
  try {
    await getLatestState(process.env.TX_ID || '')
  } catch (error) {
    console.error(error.message)
  }
})()
