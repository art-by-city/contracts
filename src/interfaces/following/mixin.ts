import { Constructor, ContractConstructor, Interaction } from '../../util'
import { ContractAssert, ContractError } from '../../../environment'
import { FollowingState } from './state'

export function WithFollowing<
  State extends FollowingState,  
  Contract extends ContractConstructor<State>
>(contract?: Contract) {
  return class WithFollowing extends (contract || class {} as Contract) {
    follow(state: State, { input }: Interaction) {
      const { address } = input

      ContractAssert(typeof address === 'string', 'Address must be a string')
      ContractAssert(
        !state.following.includes(address),
        'Already following address'
      )

      state.following.push(address)

      return { state, result: true }
    }

    unfollow(state: State, { input }: Interaction) {
      const { address } = input

      ContractAssert(typeof address === 'string', 'Address must be a string')

      const idx = state.following.findIndex(a => a === address)
      if (idx >= 0) {
        state.following.splice(idx, 1)
      } else {
        throw new ContractError('Address not followed')
      }

      return { state, result: true }
    }

    following(state: State) {
      return { state, result: state.following }
    }
  }
}
