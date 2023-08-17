import { HandlerResult } from 'warp-contracts'

import { ContractError } from '../../../environment'
import {
  Evolvable,
  EvolvableState,
  Evolve,
  Interaction,
  OwnableState,
  PartialFunctionInput
} from '../../util'

export type AtomicLicenseState = OwnableState & EvolvableState
export type AtomicLicenseInput = PartialFunctionInput<Evolve>
export type AtomicLicenseResult = true
export class AtomicLicenseContract extends Evolvable(Object) {}

export default function handle(
  state: AtomicLicenseState,
  action: Interaction<AtomicLicenseInput>
): HandlerResult<AtomicLicenseState, AtomicLicenseResult> {
  const contract = new AtomicLicenseContract()
  const caller = action.caller
  const input = action.input

  switch (input.function) {
    case 'evolve':
      return contract.evolve(
        state,
        { caller, input }
      ) as HandlerResult<AtomicLicenseState, AtomicLicenseResult>
    default:
      throw new ContractError('Invalid input')
  }
}
