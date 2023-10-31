import { HandlerResult } from 'warp-contracts'

import { ContractError } from '../../../environment'
import {
  ContractFunctionInput,
  Interaction,
  OnlyOwner,
  OnlyOwnerOrRole
} from '../../util'
import {
  BaseCurationContract,
  Collaborative,
  CollaborativeCurationState,
  FollowingCurationState
} from '.'
import { WithFollowing } from '../../../src/interfaces/following'

export type CollaborativeFollowingCurationState =
  CollaborativeCurationState & FollowingCurationState

export type CollaborativeFollowingCurationResult = any

export class CollaborativeFollowingCurationContract extends Collaborative(
  WithFollowing(BaseCurationContract<CollaborativeFollowingCurationState>)
) {
  @OnlyOwner
  addCurator(state: CollaborativeFollowingCurationState, action: Interaction) {
    return super.addCurator(state, action)
  }

  @OnlyOwner
  removeCurator(
    state: CollaborativeFollowingCurationState,
    action: Interaction
  ) {
    return super.removeCurator(state, action)
  }

  @OnlyOwnerOrRole('curator')
  setTitle(state: CollaborativeFollowingCurationState, action: Interaction) {
    return super.setTitle(state, action)
  }

  @OnlyOwnerOrRole('curator')
  setMetadata(state: CollaborativeFollowingCurationState, action: Interaction) {
    return super.setMetadata(state, action)
  }

  @OnlyOwnerOrRole('curator')
  addItem(state: CollaborativeFollowingCurationState, action: Interaction) {
    return super.addItem(state, action)
  }

  @OnlyOwnerOrRole('curator')
  removeItem(state: CollaborativeFollowingCurationState, action: Interaction) {
    return super.removeItem(state, action)
  }

  @OnlyOwnerOrRole('curator')
  setItems(state: CollaborativeFollowingCurationState, action: Interaction) {
    return super.setItems(state, action)
  }

  @OnlyOwnerOrRole('curator')
  hideItem(state: CollaborativeFollowingCurationState, action: Interaction) {
    return super.hideItem(state, action)
  }

  @OnlyOwnerOrRole('curator')
  unhideItem(state: CollaborativeFollowingCurationState, action: Interaction) {
    return super.unhideItem(state, action)
  }

  @OnlyOwnerOrRole('curator')
  setHiddenItems(
    state: CollaborativeFollowingCurationState,
    action: Interaction
  ) {
    return super.setHiddenItems(state, action)
  }

  @OnlyOwnerOrRole('curator')
  follow(
    state: CollaborativeFollowingCurationState,
    action: Interaction
  ) {
    return super.follow(state, action)
  }

  @OnlyOwnerOrRole('curator')
  unfollow(
    state: CollaborativeFollowingCurationState,
    action: Interaction
  ) {
    return super.unfollow(state, action)
  }
}

export default function handle(
  state: CollaborativeFollowingCurationState,
  action: Interaction<ContractFunctionInput>
): HandlerResult<CollaborativeFollowingCurationState, any> {
  const contract = new CollaborativeFollowingCurationContract()

  switch (action.input.function) {
    case 'addCurator':
      return contract.addCurator(state, action) as HandlerResult<CollaborativeFollowingCurationState, any>
    case 'removeCurator':
      return contract.removeCurator(state, action) as HandlerResult<CollaborativeFollowingCurationState, any>
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
      return contract.follow(state, action) as HandlerResult<CollaborativeFollowingCurationState, any>
    case 'unfollow':
      return contract.unfollow(state, action) as HandlerResult<CollaborativeFollowingCurationState, any>
    case 'following':
      return contract.following(state) as HandlerResult<CollaborativeFollowingCurationState, any>
    default:
      throw new ContractError('Invalid input')
  }
}
