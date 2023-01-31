import { WarpFactory } from 'warp-contracts'

const smartweave = WarpFactory.forLocal()

export async function getLatestState(contractId: string) {
  const stateResult = await smartweave.contract(contractId).readState()

  return stateResult.cachedValue.state
}

(async () => {
  try {
    const state = await getLatestState(process.env.TX_ID || '')
    console.log(state)
  } catch (error) {
    console.error(error.message)
  }
})()
