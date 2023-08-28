import { HandlerResult } from 'warp-contracts'

import { ContractError } from '../../../environment'
import {
  AccessControlState,
  ContractFunctionInput,
  Interaction,
  OnlyOwner,
  OnlyOwnerOrRole
} from '../../util'
import {
  Collaborative,
  CollaborativeCurationState,
  WhitelistCurationContract,
  WhitelistCurationState
} from './'

export type CollaborativeWhitelistCurationState =
  CollaborativeCurationState & WhitelistCurationState

export type CollaborativeWhitelistCurationResult = any

export class CollaborativeWhitelistCurationContract
  extends Collaborative(WhitelistCurationContract)
{
  @OnlyOwner
  addCurator(state: CollaborativeWhitelistCurationState, action: Interaction) {
    return super.addCurator(state, action) as HandlerResult<CollaborativeWhitelistCurationState, any>
  }

  @OnlyOwner
  removeCurator(
    state: CollaborativeWhitelistCurationState,
    action: Interaction
  ) {
    return super.removeCurator(state, action) as HandlerResult<CollaborativeWhitelistCurationState, any>
  }

  @OnlyOwnerOrRole('curator')
  setTitle(state: CollaborativeWhitelistCurationState, action: Interaction) {
    return super.setTitle(state, action) as HandlerResult<CollaborativeWhitelistCurationState, any>
  }

  @OnlyOwnerOrRole('curator')
  setMetadata(state: CollaborativeWhitelistCurationState, action: Interaction) {
    return super.setMetadata(state, action) as HandlerResult<CollaborativeWhitelistCurationState, any>
  }

  @OnlyOwnerOrRole('curator')
  addItem(state: CollaborativeWhitelistCurationState, action: Interaction) {
    return super.addItem(state, action) as HandlerResult<CollaborativeWhitelistCurationState, any>
  }

  @OnlyOwnerOrRole('curator')
  removeItem(state: CollaborativeWhitelistCurationState, action: Interaction) {
    return super.removeItem(state, action) as HandlerResult<CollaborativeWhitelistCurationState, any>
  }

  @OnlyOwnerOrRole('curator')
  setItems(state: CollaborativeWhitelistCurationState, action: Interaction) {
    return super.setItems(state, action) as HandlerResult<CollaborativeWhitelistCurationState, any>
  }

  @OnlyOwnerOrRole('curator')
  hideItem(state: CollaborativeWhitelistCurationState, action: Interaction) {
    return super.hideItem(state, action) as HandlerResult<CollaborativeWhitelistCurationState, any>
  }

  @OnlyOwnerOrRole('curator')
  unhideItem(state: CollaborativeWhitelistCurationState, action: Interaction) {
    return super.unhideItem(state, action) as HandlerResult<CollaborativeWhitelistCurationState, any>
  }

  @OnlyOwnerOrRole('curator')
  setHiddenItems(
    state: CollaborativeWhitelistCurationState,
    action: Interaction
  ) {
    return super.setHiddenItems(state, action) as HandlerResult<CollaborativeWhitelistCurationState, any>
  }

  @OnlyOwnerOrRole('curator')
  addToWhitelist(
    state: CollaborativeWhitelistCurationState,
    action: Interaction
  ) {
    return super.addToWhitelist(state, action) as HandlerResult<CollaborativeWhitelistCurationState, any>
  }

  @OnlyOwnerOrRole('curator')
  removeFromWhitelist(
    state: CollaborativeWhitelistCurationState,
    action: Interaction
  ) {
    return super.removeFromWhitelist(state, action) as HandlerResult<CollaborativeWhitelistCurationState, any>
  }
}

export default function handle(
  state: CollaborativeWhitelistCurationState,
  action: Interaction<ContractFunctionInput>
): HandlerResult<
  CollaborativeWhitelistCurationState,
  CollaborativeWhitelistCurationResult
> {
  const contract = new CollaborativeWhitelistCurationContract()

  switch (action.input.function) {
    case 'addCurator':
      return contract.addCurator(state, action)
    case 'removeCurator':
      return contract.removeCurator(state, action)
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
    case 'addToWhitelist':
      return contract.addToWhitelist(state, action)
    case 'removeFromWhitelist':
      return contract.removeFromWhitelist(state, action)
    default:
      throw new ContractError('Invalid input')
  }
}
