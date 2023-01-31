import {
  ContractInteraction,
  EvolveState,
  HandlerResult
} from 'warp-contracts'

import { ContractAssert } from '../../environment'
import { Constructor, ContractFunctionInput, PartialFunctionInput } from './'
import { OnlyOwner, OwnableState } from './ownable'

export type EvolvableState = Partial<EvolveState> & OwnableState
export type EvolvableResult = any

export interface Evolve extends ContractFunctionInput {
  function: 'evolve'
  value: string
}

export function Evolvable<Contract extends Constructor>(
  ContractBase: Contract
) {
  return class EvolvableContract extends ContractBase {
    evolve(
      state: EvolvableState,
      action: ContractInteraction<PartialFunctionInput<Evolve>>
    ): HandlerResult<EvolvableState, EvolvableResult> {
      const { input, caller } = action

      ContractAssert(
        state.owner === caller,
        'Only the owner can evolve the contract.'
      )

      ContractAssert(
        !!input.value,
        'New Contract Source ID is required to evolve.'
      )

      state.evolve = input.value

      return { state, result: true }
    }
  }
}
