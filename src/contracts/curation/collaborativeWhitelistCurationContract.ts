import { HandlerResult } from 'warp-contracts'

import { ContractError } from '../../../environment'
import {
  AccessControl,
  Interaction,
  OnlyOwner,
  OnlyOwnerOrRole,
  PartialFunctionInput
} from '../../util'
import {
  AddCurator,
  AddItem,
  AddToWhitelist,
  Collaborative,
  CollaborativeCurationInput,
  HideItem,
  OwnableCurationState,
  RemoveCurator,
  RemoveFromWhitelist,
  RemoveItem,
  SetHiddenItems,
  SetItems,
  SetMetadata,
  SetTitle,
  UnhideItem,
  WhitelistCurationContract,
  WhitelistCurationInput,
  WhitelistCurationState
} from './'

export type CollaborativeWhitelistCurationState = OwnableCurationState
  & WhitelistCurationState
  & AccessControl<'curator'>

export type CollaborativeWhitelistCurationInput = CollaborativeCurationInput
  | WhitelistCurationInput

export type CollaborativeWhitelistCurationResult = any

export type CollaborativeWhitelistCurationHandlerResult = HandlerResult<
  CollaborativeWhitelistCurationState,
  CollaborativeWhitelistCurationResult
>

export class CollaborativeWhitelistCurationContract
  extends Collaborative(WhitelistCurationContract)
{
  @OnlyOwner
  addCurator(
    state: CollaborativeWhitelistCurationState,
    action: Interaction<PartialFunctionInput<AddCurator>>
  ): CollaborativeWhitelistCurationHandlerResult {
    // TODO -> fix type cast
    return super.addCurator(
      state,
      action
    ) as CollaborativeWhitelistCurationHandlerResult
  }

  @OnlyOwner
  removeCurator(
    state: CollaborativeWhitelistCurationState,
    action: Interaction<PartialFunctionInput<RemoveCurator>>
  ): CollaborativeWhitelistCurationHandlerResult {
    // TODO -> fix type cast
    return super.removeCurator(
      state,
      action
    ) as CollaborativeWhitelistCurationHandlerResult
  }

  @OnlyOwnerOrRole('curator')
  setTitle(
    state: CollaborativeWhitelistCurationState,
    action: Interaction<PartialFunctionInput<SetTitle>>
  ): CollaborativeWhitelistCurationHandlerResult {
    // TODO -> fix type cast
    return super.setTitle(
      state,
      action
    ) as CollaborativeWhitelistCurationHandlerResult
  }

  @OnlyOwnerOrRole('curator')
  setMetadata(
    state: CollaborativeWhitelistCurationState,
    action: Interaction<PartialFunctionInput<SetMetadata>>
  ): CollaborativeWhitelistCurationHandlerResult {
    // TODO -> fix type cast
    return super.setMetadata(
      state,
      action
    ) as CollaborativeWhitelistCurationHandlerResult
  }

  @OnlyOwnerOrRole('curator')
  addItem(
    state: CollaborativeWhitelistCurationState,
    action: Interaction<PartialFunctionInput<AddItem>>
  ): CollaborativeWhitelistCurationHandlerResult {
    // TODO -> fix type cast
    return super.addItem(
      state,
      action
    ) as CollaborativeWhitelistCurationHandlerResult
  }

  @OnlyOwnerOrRole('curator')
  removeItem(
    state: CollaborativeWhitelistCurationState,
    action: Interaction<PartialFunctionInput<RemoveItem>>
  ): CollaborativeWhitelistCurationHandlerResult {
    // TODO -> fix type cast
    return super.removeItem(
      state,
      action
    ) as CollaborativeWhitelistCurationHandlerResult
  }

  @OnlyOwnerOrRole('curator')
  setItems(
    state: CollaborativeWhitelistCurationState,
    action: Interaction<PartialFunctionInput<SetItems>>
  ): CollaborativeWhitelistCurationHandlerResult {
    // TODO -> fix type cast
    return super.setItems(
      state,
      action
    ) as CollaborativeWhitelistCurationHandlerResult
  }

  @OnlyOwnerOrRole('curator')
  hideItem(
    state: CollaborativeWhitelistCurationState,
    action: Interaction<PartialFunctionInput<HideItem>>
  ): CollaborativeWhitelistCurationHandlerResult {
    // TODO -> fix type cast
    return super.hideItem(
      state,
      action
    ) as CollaborativeWhitelistCurationHandlerResult
  }

  @OnlyOwnerOrRole('curator')
  unhideItem(
    state: CollaborativeWhitelistCurationState,
    action: Interaction<PartialFunctionInput<UnhideItem>>
  ): CollaborativeWhitelistCurationHandlerResult {
    // TODO -> fix type cast
    return super.unhideItem(
      state,
      action
    ) as CollaborativeWhitelistCurationHandlerResult
  }

  @OnlyOwnerOrRole('curator')
  setHiddenItems(
    state: CollaborativeWhitelistCurationState,
    action: Interaction<PartialFunctionInput<SetHiddenItems>>
  ): CollaborativeWhitelistCurationHandlerResult {
    // TODO -> fix type cast
    return super.setHiddenItems(
      state,
      action
    ) as CollaborativeWhitelistCurationHandlerResult
  }

  @OnlyOwnerOrRole('curator')
  addToWhitelist(
    state: CollaborativeWhitelistCurationState,
    action: Interaction<PartialFunctionInput<AddToWhitelist>>
  ): CollaborativeWhitelistCurationHandlerResult {
    // @ts-ignore
    return super.addToWhitelist(state, action)
  }

  @OnlyOwnerOrRole('curator')
  removeFromWhitelist(
    state: CollaborativeWhitelistCurationState,
    action: Interaction<PartialFunctionInput<RemoveFromWhitelist>>
  ): CollaborativeWhitelistCurationHandlerResult {
    // @ts-ignore
    return super.removeFromWhitelist(state, action)
  }
}

export default function handle(
  state: CollaborativeWhitelistCurationState,
  action: Interaction<CollaborativeWhitelistCurationInput>
): CollaborativeWhitelistCurationHandlerResult {
  const contract = new CollaborativeWhitelistCurationContract()
  const caller = action.caller
  const input = action.input

  switch (input.function) {
    case 'addCurator':
      return contract.addCurator(state, { caller, input })
    case 'removeCurator':
      return contract.removeCurator(state, { caller, input })
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
    case 'addToWhitelist':
      return contract.addToWhitelist(state, { caller, input })
    case 'removeFromWhitelist':
      return contract.removeFromWhitelist(state, { caller, input })
    default:
      throw new ContractError('Invalid input')
  }
}
