import { Interaction } from '../../../src/util'
import { ContractAssert, ContractError } from '../../../environment'

export function handle(
  state: {
    owner: string
    message: string
    numSpeaks: number
    squeaks: string[]
  },
  action: Interaction<any>
) {
  if (action.input.function === 'speak') {
    if (action.caller !== state.owner) {
      throw new ContractError(
        'This function is only available to the contract owner.'
      )
    }

    ContractAssert(
      typeof action.input.message === 'string'
      && action.input.message.length <= 100,
      'Message must be string no longer than 100 chars'
    )

    state.message = action.input.message
    state.numSpeaks = state.numSpeaks + 1

    return { state, result: true }
  }

  if (action.input.function === 'squeak') {
    ContractAssert(
      typeof action.input.message === 'string'
      && action.input.message.length <= 100,
      'Message must be string no longer than 100 chars'
    )

    state.squeaks.push(state.message)

    if (state.squeaks.length > 10) {
      state.squeaks.shift()
    }
    
    return { state, result: true }
  }

  if (action.input.function === 'readSqueak') {
    return { state, result: state.squeaks[action.input.index] }
  }
  
  throw new ContractError('invalid input')
}
