import { ContractInteraction, HandlerResult } from 'warp-contracts'
import { ContractAssert, ContractError } from '../../../environment'

import {
  Constructor,
  ContractFunctionInput,
  OnlyOwner,
  PartialFunctionInput
} from '../../util'
import {
  BaseCurationContract,
  BaseCurationState,
  OwnableCurationContract,
  OwnableCurationInput,
  OwnableCurationState
} from './'

export type WhitelistCurationState = BaseCurationState & {
  addressWhitelist: string[]
}

export type OwnableWhitelistCurationState = OwnableCurationState
  & WhitelistCurationState

export interface AddToWhitelist extends ContractFunctionInput {
  function: 'addToWhitelist',
  address: string
}

export interface RemoveFromWhitelist extends ContractFunctionInput {
  function: 'removeFromWhitelist',
  address: string
}

export type WhitelistCurationInput = OwnableCurationInput
  | PartialFunctionInput<AddToWhitelist>
  | PartialFunctionInput<RemoveFromWhitelist>

export type WhitelistCurationResult = any

export type WhitelistCurationHandlerResult = HandlerResult<
  WhitelistCurationState,
  WhitelistCurationResult
>

export function WithWhitelist<Contract extends Constructor>(
  BaseContract: Contract
) {
  return class WithWhitelist extends BaseContract {
    addToWhitelist(
      state: WhitelistCurationState,
      action: ContractInteraction<PartialFunctionInput<AddToWhitelist>>
    ): HandlerResult<WhitelistCurationState, WhitelistCurationResult> {
      const address = action.input.address

      ContractAssert(typeof address === 'string', 'Address must be a string')

      ContractAssert(
        !state.addressWhitelist.includes(address),
        'Address already whitelisted'
      )

      state.addressWhitelist.push(address)

      return { state, result: true }
    }

    removeFromWhitelist(
      state: WhitelistCurationState,
      action: ContractInteraction<PartialFunctionInput<RemoveFromWhitelist>>
    ): HandlerResult<WhitelistCurationState, WhitelistCurationResult> {
      const address = action.input.address

      ContractAssert(typeof address === 'string', 'Address must be a string')

      const idx = state.addressWhitelist.findIndex(a => a === address)
      if (idx >= 0) {
        state.addressWhitelist.splice(idx, 1)
      } else {
        throw new ContractError('Address not whitelisted')
      }

      return { state, result: true }
    }
  }
}

class BaseCurationWithWhitelistContract
  extends BaseCurationContract<WhitelistCurationState> {}

export class WhitelistCurationContract
  extends WithWhitelist(BaseCurationWithWhitelistContract) {}

class OwnableCurationWithWhitelistContract
  extends OwnableCurationContract<OwnableWhitelistCurationState> {}

export class OwnableWhitelistCurationContract
  extends WithWhitelist(OwnableCurationWithWhitelistContract)
{
  @OnlyOwner
  addToWhitelist(
    state: OwnableWhitelistCurationState,
    action: ContractInteraction<PartialFunctionInput<AddToWhitelist>>
  ): HandlerResult<OwnableWhitelistCurationState, WhitelistCurationResult> {
    // TODO -> fix type cast
    return super.addToWhitelist(
      state,
      action
    ) as HandlerResult<OwnableWhitelistCurationState, WhitelistCurationResult>
  }

  @OnlyOwner
  removeFromWhitelist(
    state: OwnableWhitelistCurationState,
    action: ContractInteraction<PartialFunctionInput<RemoveFromWhitelist>>
  ): HandlerResult<OwnableWhitelistCurationState, WhitelistCurationResult> {
    // TODO -> fix type cast
    return super.removeFromWhitelist(
      state,
      action
    ) as HandlerResult<OwnableWhitelistCurationState, WhitelistCurationResult>
  }
}

export default function handle(
  state: OwnableWhitelistCurationState,
  action: ContractInteraction<WhitelistCurationInput>
): WhitelistCurationHandlerResult {
  const contract = new OwnableWhitelistCurationContract()
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
    case 'addToWhitelist':
      return contract.addToWhitelist(state, { caller, input })
    case 'removeFromWhitelist':
      return contract.removeFromWhitelist(state, { caller, input })
    default:
      throw new ContractError('Invalid input')
  }
}