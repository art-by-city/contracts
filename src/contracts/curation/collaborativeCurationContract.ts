import { HandlerResult } from 'warp-contracts'

import { ContractAssert, ContractError } from '../../../environment'
import {
  AccessControl,
  Constructor,
  ContractFunctionInput,
  Interaction,
  OnlyOwner,
  OnlyOwnerOrRole,
  PartialFunctionInput
} from '../../util'
import {
  AddItem,
  BaseCurationContract,
  HideItem,
  OwnableCurationInput,
  OwnableCurationState,
  RemoveItem,
  SetHiddenItems,
  SetItems,
  SetMetadata,
  SetTitle,
  UnhideItem
} from './'

export type CollaborativeCurationState =
  OwnableCurationState & AccessControl<'curator'>

export interface AddCurator extends ContractFunctionInput {
  function: 'addCurator',
  address: string
}

export interface RemoveCurator extends ContractFunctionInput {
  function: 'removeCurator',
  address: string
}

export type CollaborativeCurationInput = OwnableCurationInput
  | PartialFunctionInput<AddCurator>
  | PartialFunctionInput<RemoveCurator>

export type CollaborativeCurationResult = any

export type CollaborativeCurationHandlerResult = HandlerResult<
  CollaborativeCurationState,
  CollaborativeCurationResult
>

export function Collaborative<Contract extends Constructor>(
  ContractBase: Contract
) {
  return class Collaborate extends ContractBase {
    addCurator(
      state: CollaborativeCurationState,
      action: Interaction<PartialFunctionInput<AddCurator>>
    ): HandlerResult<CollaborativeCurationState, CollaborativeCurationResult> {
      const address = action.input.address

      ContractAssert(typeof address === 'string', 'Address must be a string')

      ContractAssert(
        !state.roles.curator.includes(address),
        'Address already has curator role'
      )

      state.roles.curator.push(address)

      return { state, result: true }
    }

    removeCurator(
      state: CollaborativeCurationState,
      action: Interaction<PartialFunctionInput<RemoveCurator>>
    ): HandlerResult<CollaborativeCurationState, CollaborativeCurationResult> {
      const address = action.input.address

      ContractAssert(typeof address === 'string', 'Address must be a string')

      const idx = state.roles.curator.findIndex(a => a === address)
      if (idx >= 0) {
        state.roles.curator.splice(idx, 1)
      } else {
        throw new ContractError('Address is not a curator')
      }

      return { state, result: true }
    }
  }
};;

class BaseCurationWithCollaborationContract
  extends BaseCurationContract<CollaborativeCurationState> {}

export class CollaborativeCurationContract
  extends Collaborative(BaseCurationWithCollaborationContract)
{
  @OnlyOwner
  addCurator(
    state: CollaborativeCurationState,
    action: Interaction<PartialFunctionInput<AddCurator>>
  ): CollaborativeCurationHandlerResult {
    return super.addCurator(state, action)
  }

  @OnlyOwner
  removeCurator(
    state: CollaborativeCurationState,
    action: Interaction<PartialFunctionInput<RemoveCurator>>
  ): CollaborativeCurationHandlerResult {
    return super.removeCurator(state, action)
  }

  @OnlyOwnerOrRole('curator')
  setTitle(
    state: CollaborativeCurationState,
    action: Interaction<PartialFunctionInput<SetTitle>>
  ): CollaborativeCurationHandlerResult {
    return super.setTitle(state, action)
  }

  @OnlyOwnerOrRole('curator')
  setMetadata(
    state: CollaborativeCurationState,
    action: Interaction<PartialFunctionInput<SetMetadata>>
  ): CollaborativeCurationHandlerResult {
    return super.setMetadata(state, action)
  }

  @OnlyOwnerOrRole('curator')
  addItem(
    state: CollaborativeCurationState,
    action: Interaction<PartialFunctionInput<AddItem>>
  ): CollaborativeCurationHandlerResult {
    return super.addItem(state, action)
  }

  @OnlyOwnerOrRole('curator')
  removeItem(
    state: CollaborativeCurationState,
    action: Interaction<PartialFunctionInput<RemoveItem>>
  ): CollaborativeCurationHandlerResult {
    return super.removeItem(state, action)
  }

  @OnlyOwnerOrRole('curator')
  setItems(
    state: CollaborativeCurationState,
    action: Interaction<PartialFunctionInput<SetItems>>
  ): CollaborativeCurationHandlerResult {
    return super.setItems(state, action)
  }

  @OnlyOwnerOrRole('curator')
  hideItem(
    state: CollaborativeCurationState,
    action: Interaction<PartialFunctionInput<HideItem>>
  ): CollaborativeCurationHandlerResult {
    return super.hideItem(state, action)
  }

  @OnlyOwnerOrRole('curator')
  unhideItem(
    state: CollaborativeCurationState,
    action: Interaction<PartialFunctionInput<UnhideItem>>
  ): CollaborativeCurationHandlerResult {
    return super.unhideItem(state, action)
  }

  @OnlyOwnerOrRole('curator')
  setHiddenItems(
    state: CollaborativeCurationState,
    action: Interaction<PartialFunctionInput<SetHiddenItems>>
  ): CollaborativeCurationHandlerResult {
    return super.setHiddenItems(state, action)
  }
}

export default function handle(
  state: CollaborativeCurationState,
  action: Interaction<CollaborativeCurationInput>
): CollaborativeCurationHandlerResult {
  const contract = new CollaborativeCurationContract()
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
    default:
      throw new ContractError('Invalid input')
  }
}
