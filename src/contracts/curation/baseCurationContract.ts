import { HandlerResult } from 'warp-contracts'

import { ContractAssert, ContractError } from '../../../environment'
import { ContractFunctionInput, Interaction, PartialFunctionInput } from '../../util'

export type BaseCurationMetadata = {
  [key: string]: any
}

export type BaseCurationState = {
  title: string
  metadata: BaseCurationMetadata
  items: string[]
  hidden: string[]
}

export interface SetTitle extends ContractFunctionInput {
  function: 'setTitle'
  title: string
}

export interface SetMetadata extends ContractFunctionInput {
  function: 'setMetadata'
  metadata: BaseCurationMetadata
}

export interface AddItem extends ContractFunctionInput {
  function: 'addItem'
  item: string
}

export interface RemoveItem extends ContractFunctionInput {
  function: 'removeItem'
  item: string
}

export interface SetItems extends ContractFunctionInput {
  function: 'setItems'
  items: string[]
}

export interface HideItem extends ContractFunctionInput {
  function: 'hideItem',
  item: string
}

export interface UnhideItem extends ContractFunctionInput {
  function: 'unhideItem',
  item: string
}

export interface SetHiddenItems extends ContractFunctionInput {
  function: 'setHiddenItems',
  items: string[]
}

export type BaseCurationInput =
  | PartialFunctionInput<SetTitle>
  | PartialFunctionInput<SetMetadata>
  | PartialFunctionInput<AddItem>
  | PartialFunctionInput<RemoveItem>
  | PartialFunctionInput<SetItems>
  | PartialFunctionInput<HideItem>
  | PartialFunctionInput<UnhideItem>
  | PartialFunctionInput<SetHiddenItems>

export type BaseCurationResult = any

export class BaseCurationContract<State extends BaseCurationState> {
  setTitle(
    state: State,
    { input }: Interaction<PartialFunctionInput<SetTitle>>
  ): HandlerResult<State, BaseCurationResult> {
    ContractAssert(typeof input.title === 'string', 'Title must be a string')

    state.title = input.title

    return { state, result: true }
  }

  setMetadata(
    state: State,
    action: Interaction<PartialFunctionInput<SetMetadata>>
  ): HandlerResult<State, BaseCurationResult> {
    ContractAssert(
      typeof action.input.metadata === 'object'
        && !Array.isArray(action.input.metadata),
      'Metadata must be an object'
    )

    state.metadata = action.input.metadata

    return { state, result: true }
  }

  addItem(
    state: State,
    action: Interaction<PartialFunctionInput<AddItem>>
  ): HandlerResult<State, BaseCurationResult> {
    ContractAssert(
      typeof action.input.item === 'string',
      'Item must be a string'
    )

    ContractAssert(
      !state.items.includes(action.input.item),
      'Item must be unique'
    )

    state.items.push(action.input.item)

    return { state, result: true }
  }

  removeItem(
    state: State,
    action: Interaction<PartialFunctionInput<RemoveItem>>
  ): HandlerResult<State, BaseCurationResult> {
    ContractAssert(
      typeof action.input.item === 'string',
      'Item must be a string'
    )

    const idx = state.items.findIndex(i => i === action.input.item)

    if (idx >= 0) {
      state.items.splice(idx, 1)
    } else {
      throw new ContractError('Item not found')
    }

    return { state, result: true }
  }

  setItems(
    state: State,
    action: Interaction<PartialFunctionInput<SetItems>>
  ): HandlerResult<State, BaseCurationResult> {
    ContractAssert(
      Array.isArray(action.input.items),
      'Items must be an array'
    )

    ContractAssert(
      action.input.items.every(i => typeof i === 'string'),
      'Items must be strings'
    )

    state.items = action.input.items

    return { state, result: true }
  }

  hideItem(
    state: State,
    action: Interaction<PartialFunctionInput<HideItem>>
  ): HandlerResult<State, BaseCurationResult> {
    ContractAssert(
      typeof action.input.item === 'string',
      '(Hidden) Item must be a string'
    )

    ContractAssert(
      !state.hidden.includes(action.input.item),
      '(Hidden) Item must be unique'
    )

    state.hidden.push(action.input.item)

    return { state, result: true }
  }

  unhideItem(
    state: State,
    action: Interaction<PartialFunctionInput<UnhideItem>>
  ): HandlerResult<State, BaseCurationResult> {
    ContractAssert(
      typeof action.input.item === 'string',
      '(Hidden) Item must be a string'
    )

    const idx = state.hidden.findIndex(i => i === action.input.item)

    if (idx >= 0) {
      state.hidden.splice(idx, 1)
    } else {
      throw new ContractError('(Hidden) Item not found')
    }

    return { state, result: true }
  }

  setHiddenItems(
    state: State,
    action: Interaction<PartialFunctionInput<SetHiddenItems>>
  ): HandlerResult<State, BaseCurationResult> {
    ContractAssert(
      Array.isArray(action.input.items),
      '(Hidden) Items must be an array'
    )

    ContractAssert(
      action.input.items.every(i => typeof i === 'string'),
      '(Hidden) Items must be strings'
    )

    state.hidden = action.input.items

    return { state, result: true }
  }
}

export default function handle(
  state: BaseCurationState,
  action: Interaction<BaseCurationInput>
): HandlerResult<BaseCurationState, BaseCurationResult> {
  const contract = new BaseCurationContract()
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
