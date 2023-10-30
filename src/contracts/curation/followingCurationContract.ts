import { ContractError } from '../../../environment'

import {
  ContractFunctionInput,
  Interaction,
  OnlyOwner
} from '../../util'
import {
  BaseCurationContract,
  BaseCurationState,
  OwnableCurationContract,
  OwnableCurationState
} from '.'
import {
  FollowingState,
  WithFollowing
} from '../../interfaces/following'

export type OwnerlessFollowingCurationState = BaseCurationState & FollowingState

export type FollowingCurationState =
  BaseCurationState
  & OwnableCurationState
  & FollowingState

export type FollowingCurationResult = any

export class OwnerlessFollowingCurationContract extends WithFollowing(
  BaseCurationContract<OwnerlessFollowingCurationState>
) {}

export class FollowingCurationContract extends WithFollowing<
  FollowingCurationState,
  typeof OwnableCurationContract<FollowingCurationState>
>(OwnableCurationContract<FollowingCurationState>) {
  @OnlyOwner
  follow(state: FollowingCurationState, action: Interaction) {
    return super.follow(state, action)
  }

  @OnlyOwner
  unfollow(state: FollowingCurationState, action: Interaction) {
    return super.unfollow(state, action)
  }

  following(state: FollowingCurationState) {
    return super.following(state)
  }
}

export default function handle(
  state: FollowingCurationState,
  action: Interaction<ContractFunctionInput>
) {
  const contract = new FollowingCurationContract()

  switch (action.input.function) {
    case 'setTitle':
      return contract.setTitle(state, action)
    case 'setMetadata':
      return contract.setMetadata(state, action)
    case 'addItem':
      return contract.addItem(state, action)
    case 'removeItem':
      return contract.removeItem(state, action)
    case 'setItems':
      return contract.setItems(state, action)
    case 'hideItem':
      return contract.hideItem(state, action)
    case 'unhideItem':
      return contract.unhideItem(state, action)
    case 'setHiddenItems':
      return contract.setHiddenItems(state, action)
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