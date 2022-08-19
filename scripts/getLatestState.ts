import Arweave from 'arweave'
import { WarpNodeFactory } from 'warp-contracts'

const arweave = new Arweave({
  protocol: process.env.ARWEAVE_PROTOCOL || 'http',
  host: process.env.ARWEAVE_HOST || 'localhost',
  port: process.env.ARWEAVE_PORT || 1984
})

const smartweave = WarpNodeFactory.forTesting(arweave)

async function getLatestState(contractId: string) {
  const stateResult = await smartweave.contract(contractId).readState()

  console.log(stateResult)
}

(async () => {
  try {
    await getLatestState(process.env.TX_ID || '')
  } catch (error) {
    console.error(error.message)
  }
})()
