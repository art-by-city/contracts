import { HandlerResult } from 'warp-contracts'
import { ContractAssert, ContractError } from '../../../environment'

import {
  Constructor,
  ContractFunctionInput,
  Interaction,
  OnlyOwner,
  // PartialFunctionInput
} from '../../util'
import {
  // BaseCurationContract,
  BaseCurationState,
  OwnableCurationContract,
  OwnableCurationState
} from './'

export type WhitelistState = {
  addressWhitelist: string[]
}

export type WhitelistCurationState =
  BaseCurationState
  & OwnableCurationState
  & WhitelistState

// export type OwnableWhitelistCurationState = OwnableCurationState
//   & WhitelistCurationState

export interface AddToWhitelist extends ContractFunctionInput {
  function: 'addToWhitelist',
  address: string
}

export interface RemoveFromWhitelist extends ContractFunctionInput {
  function: 'removeFromWhitelist',
  address: string
}

export type WhitelistCurationResult = any

export type WhitelistCurationHandlerResult = HandlerResult<
  WhitelistCurationState,
  WhitelistCurationResult
>

export function WithWhitelist<Contract extends Constructor>(
  BaseContract: Contract
) {
  return class WithWhitelist extends BaseContract {
    addToWhitelist(state: WhitelistCurationState, { input }: Interaction) {
      const { address } = input

      ContractAssert(typeof address === 'string', 'Address must be a string')
      ContractAssert(
        !state.addressWhitelist.includes(address),
        'Address already whitelisted'
      )

      state.addressWhitelist.push(address)

      return { state, result: true }
    }

    removeFromWhitelist(state: WhitelistCurationState, { input }: Interaction) {
      const { address } = input

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

// class BaseCurationWithWhitelistContract
//   extends BaseCurationContract<WhitelistCurationState> {}

// export class WhitelistCurationContract
//   extends WithWhitelist(BaseCurationWithWhitelistContract) {}

// class OwnableCurationWithWhitelistContract
//   extends OwnableCurationContract<WhitelistCurationState> {}

export class WhitelistCurationContract
  extends WithWhitelist(OwnableCurationContract<WhitelistCurationState>)
  // extends WithWhitelist(OwnableCurationWithWhitelistContract)
{
  @OnlyOwner
  addToWhitelist(state: WhitelistCurationState, action: Interaction) {
    return super.addToWhitelist(state, action)
  }

  @OnlyOwner
  removeFromWhitelist(state: WhitelistCurationState, action: Interaction) {
    return super.removeFromWhitelist(state, action)
  }
}

export default function handle(
  state: WhitelistCurationState,
  action: Interaction<ContractFunctionInput>
): WhitelistCurationHandlerResult {
  const contract = new WhitelistCurationContract()

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
    case 'addToWhitelist':
      return contract.addToWhitelist(state, action)
    case 'removeFromWhitelist':
      return contract.removeFromWhitelist(state, action)
    default:
      throw new ContractError('Invalid input')
  }
}