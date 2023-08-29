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
  WhitelistCurationState,
  WithWhitelist,
} from './'

export type CollaborativeWhitelistCurationState =
  CollaborativeCurationState & WhitelistCurationState

export type CollaborativeWhitelistCurationResult = any

export class BaseWithWhitelistContract extends WithWhitelist(
  BaseCurationContract<CollaborativeWhitelistCurationState>
) {}

export class CollaborativeWhitelistCurationContract
  extends Collaborative(BaseWithWhitelistContract)
{
  @OnlyOwner
  addCurator(state: CollaborativeWhitelistCurationState, action: Interaction) {
    return super.addCurator(state, action)
  }

  @OnlyOwner
  removeCurator(
    state: CollaborativeWhitelistCurationState,
    action: Interaction
  ) {
    return super.removeCurator(state, action)
  }

  @OnlyOwnerOrRole('curator')
  setTitle(state: CollaborativeWhitelistCurationState, action: Interaction) {
    return super.setTitle(state, action)
  }

  @OnlyOwnerOrRole('curator')
  setMetadata(state: CollaborativeWhitelistCurationState, action: Interaction) {
    return super.setMetadata(state, action)
  }

  @OnlyOwnerOrRole('curator')
  addItem(state: CollaborativeWhitelistCurationState, action: Interaction) {
    return super.addItem(state, action)
  }

  @OnlyOwnerOrRole('curator')
  removeItem(state: CollaborativeWhitelistCurationState, action: Interaction) {
    return super.removeItem(state, action)
  }

  @OnlyOwnerOrRole('curator')
  setItems(state: CollaborativeWhitelistCurationState, action: Interaction) {
    return super.setItems(state, action)
  }

  @OnlyOwnerOrRole('curator')
  hideItem(state: CollaborativeWhitelistCurationState, action: Interaction) {
    return super.hideItem(state, action)
  }

  @OnlyOwnerOrRole('curator')
  unhideItem(state: CollaborativeWhitelistCurationState, action: Interaction) {
    return super.unhideItem(state, action)
  }

  @OnlyOwnerOrRole('curator')
  setHiddenItems(
    state: CollaborativeWhitelistCurationState,
    action: Interaction
  ) {
    return super.setHiddenItems(state, action)
  }

  @OnlyOwnerOrRole('curator')
  addToWhitelist(
    state: CollaborativeWhitelistCurationState,
    action: Interaction
  ) {
    return super.addToWhitelist(state, action)
  }

  @OnlyOwnerOrRole('curator')
  removeFromWhitelist(
    state: CollaborativeWhitelistCurationState,
    action: Interaction
  ) {
    return super.removeFromWhitelist(state, action)
  }
}

export default function handle(
  state: CollaborativeWhitelistCurationState,
  action: Interaction<ContractFunctionInput>
): HandlerResult<CollaborativeWhitelistCurationState, any> {
  const contract = new CollaborativeWhitelistCurationContract()

  switch (action.input.function) {
    case 'addCurator':
      return contract.addCurator(state, action) as HandlerResult<CollaborativeWhitelistCurationState, any>
    case 'removeCurator':
      return contract.removeCurator(state, action) as HandlerResult<CollaborativeWhitelistCurationState, any>
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
      return contract.addToWhitelist(state, action) as HandlerResult<CollaborativeWhitelistCurationState, any>
    case 'removeFromWhitelist':
      return contract.removeFromWhitelist(state, action) as HandlerResult<CollaborativeWhitelistCurationState, any>
    default:
      throw new ContractError('Invalid input')
  }
}
