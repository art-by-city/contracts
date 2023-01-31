import { ContractInteraction, HandlerResult } from 'warp-contracts'
import { ContractError } from '../../../environment'

import { OnlyOwner, OwnableState, PartialFunctionInput } from '../../util'
import {
  AddItem,
  BaseCurationContract,
  BaseCurationInput,
  BaseCurationState,
  HideItem,
  RemoveItem,
  SetHiddenItems,
  SetItems,
  SetMetadata,
  SetTitle,
  UnhideItem
} from './baseCurationContract'

export type OwnableCurationState = OwnableState & BaseCurationState

export type OwnableCurationInput = BaseCurationInput

export type OwnableCurationResult = any

export class OwnableCurationContract<State extends OwnableCurationState>
  extends BaseCurationContract<State>
{
  @OnlyOwner
  setTitle(
    state: State,
    action: ContractInteraction<PartialFunctionInput<SetTitle>>
  ): HandlerResult<State, OwnableCurationResult> {
    return super.setTitle(state, action)
  }

  @OnlyOwner
  setMetadata(
    state: State,
    action: ContractInteraction<PartialFunctionInput<SetMetadata>>
  ): HandlerResult<State, OwnableCurationResult> {
    return super.setMetadata(state, action)
  }

  @OnlyOwner
  addItem(
    state: State,
    action: ContractInteraction<PartialFunctionInput<AddItem>>
  ): HandlerResult<State, OwnableCurationResult> {
    return super.addItem(state, action)
  }

  @OnlyOwner
  removeItem(
    state: State,
    action: ContractInteraction<PartialFunctionInput<RemoveItem>>
  ): HandlerResult<State, OwnableCurationResult> {
    return super.removeItem(state, action)
  }

  @OnlyOwner
  setItems(
    state: State,
    action: ContractInteraction<PartialFunctionInput<SetItems>>
  ): HandlerResult<State, OwnableCurationResult> {
    return super.setItems(state, action)
  }

  @OnlyOwner
  hideItem(
    state: State,
    action: ContractInteraction<PartialFunctionInput<HideItem>>
  ): HandlerResult<State, OwnableCurationResult> {
    return super.hideItem(state, action)
  }

  @OnlyOwner
  unhideItem(
    state: State,
    action: ContractInteraction<PartialFunctionInput<UnhideItem>>
  ): HandlerResult<State, OwnableCurationResult> {
    return super.unhideItem(state, action)
  }

  @OnlyOwner
  setHiddenItems(
    state: State,
    action: ContractInteraction<PartialFunctionInput<SetHiddenItems>>
  ): HandlerResult<State, OwnableCurationResult> {
    return super.setHiddenItems(state, action)
  }
}

export default function handle(
  state: OwnableCurationState,
  action: ContractInteraction<OwnableCurationInput>
): HandlerResult<OwnableCurationState, OwnableCurationResult> {
  const contract = new OwnableCurationContract()
  const caller = action.caller
  const input = action.input

  switch (input.function) {
    case 'setTitle':
      return contract.setTitle(state, { caller, input })
    case 'setMetadata':
      return contract.setMetadata(state, { caller, input })
    case 'addItem':
      return contract.addItem(state, { caller, input })
    case 'removeItem':
      return contract.removeItem(state, { caller, input })
    case 'setItems':
      return contract.setItems(state, { caller, input })
    case 'hideItem':
      return contract.hideItem(state, { caller, input })
    case 'unhideItem':
      return contract.unhideItem(state, { caller, input })
    case 'setHiddenItems':
      return contract.setHiddenItems(state, { caller, input })
    default:
      throw new ContractError('Invalid input')
  }
}
