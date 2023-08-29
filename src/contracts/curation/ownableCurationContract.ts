import { ContractError } from '../../../environment'

import {
  ContractFunctionInput,
  Interaction,
  OnlyOwner,
  OwnableState
} from '../../util'
import { BaseCurationContract, BaseCurationState } from './baseCurationContract'

export type OwnableCurationState = OwnableState & BaseCurationState

export type OwnableCurationResult = any

export class OwnableCurationContract<State extends OwnableCurationState>
  extends BaseCurationContract<State>
{
  @OnlyOwner
  setTitle(state: State, action: Interaction) {
    return super.setTitle(state, action)
  }

  @OnlyOwner
  setMetadata(state: State, action: Interaction) {
    return super.setMetadata(state, action)
  }

  @OnlyOwner
  addItem(state: State, action: Interaction) {
    return super.addItem(state, action)
  }

  @OnlyOwner
  removeItem(state: State, action: Interaction) {
    return super.removeItem(state, action)
  }

  @OnlyOwner
  setItems(state: State, action: Interaction) {
    return super.setItems(state, action)
  }

  @OnlyOwner
  hideItem(state: State, action: Interaction) {
    return super.hideItem(state, action)
  }

  @OnlyOwner
  unhideItem(state: State, action: Interaction) {
    return super.unhideItem(state, action)
  }

  @OnlyOwner
  setHiddenItems(state: State, action: Interaction) {
    return super.setHiddenItems(state, action)
  }
}

export default function handle(
  state: OwnableCurationState,
  action: Interaction<ContractFunctionInput>
) {
  const contract = new OwnableCurationContract()

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
    default:
      throw new ContractError('Invalid input')
  }
}
