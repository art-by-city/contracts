import { ContractError } from 'warp-contracts'
import { FollowingState, WithFollowing } from '~/src/interfaces/following'
import {
  ContractConstructor,
  ContractFunctionInput,
  Interaction,
  OnlyOwner,
  OwnableState
} from '~/src/util'

type FollowingContractState = FollowingState & OwnableState

export class FollowingContract extends WithFollowing<
  FollowingContractState,
  ContractConstructor<FollowingContractState>
>() {
  @OnlyOwner
  follow(
    state: FollowingContractState,
    action: Interaction
  ) {
    return super.follow(state, action)
  }

  @OnlyOwner
  unfollow(
    state: FollowingContractState,
    action: Interaction
  ) {
    return super.unfollow(state, action)
  }
}

export function handle(
  state: FollowingContractState,
  action: Interaction<ContractFunctionInput>
) {
  const contract = new FollowingContract()

  switch (action.input.function) {
    case 'follow':
      return contract.follow(state, action)
    case 'unfollow':
      return contract.unfollow(state, action)
    case 'following':
      return contract.following(state)
    default:
      throw new ContractError('Invalid input')
  }
}
