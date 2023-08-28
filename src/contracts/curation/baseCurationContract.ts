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

export type BaseCurationResult = any

export class BaseCurationContract<State extends BaseCurationState> {
  setTitle(state: State, { input }: Interaction) {
    const { title } = input

    ContractAssert(typeof title === 'string', 'Title must be a string')

    state.title = title

    return { state, result: true }
  }

  setMetadata(state: State, { input }: Interaction) {
    const { metadata } = input

    ContractAssert(
      typeof metadata === 'object' && !Array.isArray(metadata),
      'Metadata must be an object'
    )

    state.metadata = metadata

    return { state, result: true }
  }

  addItem(state: State, { input }: Interaction) {
    const { item } = input

    ContractAssert(typeof item === 'string', 'Item must be a string')
    ContractAssert(!state.items.includes(item), 'Item must be unique')

    state.items.push(item)

    return { state, result: true }
  }

  removeItem(state: State, { input }: Interaction) {
    const { item } = input

    ContractAssert(typeof item === 'string', 'Item must be a string')

    const idx = state.items.findIndex(i => i === item)

    if (idx >= 0) {
      state.items.splice(idx, 1)
    } else {
      throw new ContractError('Item not found')
    }

    return { state, result: true }
  }

  setItems(state: State, { input }: Interaction) {
    const { items } = input

    ContractAssert(Array.isArray(items), 'Items must be an array')
    ContractAssert(
      items.every(i => typeof i === 'string'),
      'Items must be strings'
    )

    state.items = items

    return { state, result: true }
  }

  hideItem(state: State, { input }: Interaction) {
    const { item } = input

    ContractAssert(typeof item === 'string', '(Hidden) Item must be a string')
    ContractAssert(!state.hidden.includes(item), '(Hidden) Item must be unique')

    state.hidden.push(item)

    return { state, result: true }
  }

  unhideItem(state: State, { input }: Interaction) {
    const { item } = input

    ContractAssert(typeof item === 'string', '(Hidden) Item must be a string')

    const idx = state.hidden.findIndex(i => i === item)

    if (idx >= 0) {
      state.hidden.splice(idx, 1)
    } else {
      throw new ContractError('(Hidden) Item not found')
    }

    return { state, result: true }
  }

  setHiddenItems(state: State, { input }: Interaction) {
    const { items } = input

    ContractAssert(Array.isArray(items), '(Hidden) Items must be an array')
    ContractAssert(
      items.every(i => typeof i === 'string'),
      '(Hidden) Items must be strings'
    )

    state.hidden = items

    return { state, result: true }
  }
}

export default function handle(
  state: BaseCurationState,
  action: Interaction<ContractFunctionInput>
): HandlerResult<BaseCurationState, BaseCurationResult> {
  const contract = new BaseCurationContract()

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
