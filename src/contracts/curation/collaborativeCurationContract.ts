import { HandlerResult } from 'warp-contracts'
import { ContractAssert, ContractError } from '../../../environment'
import {
  AccessControlState,
  Constructor,
  ContractFunctionInput,
  Interaction,
  OnlyOwner,
  OnlyOwnerOrRole,
} from '../../util'
import { BaseCurationContract, OwnableCurationState } from './'

export type CollaborativeCurationState =
  OwnableCurationState & AccessControlState<'curator'>

export type CollaborativeCurationResult = any

export function Collaborative<
  State extends CollaborativeCurationState,
  Contract extends Constructor
>(
  ContractBase: Contract
) {
  return class Collaborate extends ContractBase {
    addCurator(state: State, { input }: Interaction) {
      const { address } = input
      ContractAssert(typeof address === 'string', 'Address must be a string')

      ContractAssert(
        !state.roles.curator.includes(address),
        'Address already has curator role'
      )

      state.roles.curator.push(address)

      return { state, result: true }
    }

    removeCurator(state: State, { input }: Interaction) {
      const { address } = input

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
}

export class CollaborativeCurationContract extends Collaborative<
  CollaborativeCurationState,
  typeof BaseCurationContract<CollaborativeCurationState>
>(BaseCurationContract<CollaborativeCurationState>) {
  @OnlyOwner
  addCurator(state: CollaborativeCurationState, action: Interaction) {
    return super.addCurator(state, action)
  }

  @OnlyOwner
  removeCurator(state: CollaborativeCurationState, action: Interaction) {
    return super.removeCurator(state, action)
  }

  @OnlyOwnerOrRole('curator')
  setTitle(state: CollaborativeCurationState, action: Interaction) {
    return super.setTitle(state, action)
  }

  @OnlyOwnerOrRole('curator')
  setMetadata(state: CollaborativeCurationState, action: Interaction) {
    return super.setMetadata(state, action)
  }

  @OnlyOwnerOrRole('curator')
  addItem(state: CollaborativeCurationState, action: Interaction) {
    return super.addItem(state, action)
  }

  @OnlyOwnerOrRole('curator')
  removeItem(state: CollaborativeCurationState, action: Interaction) {
    return super.removeItem(state, action)
  }

  @OnlyOwnerOrRole('curator')
  setItems(state: CollaborativeCurationState, action: Interaction) {
    return super.setItems(state, action)
  }

  @OnlyOwnerOrRole('curator')
  hideItem(state: CollaborativeCurationState, action: Interaction) {
    return super.hideItem(state, action)
  }

  @OnlyOwnerOrRole('curator')
  unhideItem(state: CollaborativeCurationState,  action: Interaction) {
    return super.unhideItem(state, action)
  }

  @OnlyOwnerOrRole('curator')
  setHiddenItems(state: CollaborativeCurationState, action: Interaction) {
    return super.setHiddenItems(state, action)
  }
}

export default function handle(
  state: CollaborativeCurationState,
  action: Interaction<ContractFunctionInput>
) {
  const contract = new CollaborativeCurationContract()

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
    default:
      throw new ContractError('Invalid input')
  }
}
