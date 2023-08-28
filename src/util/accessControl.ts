import { ContractInteraction, HandlerResult } from 'warp-contracts'
import { OwnableState } from '.'

import { ContractAssert, ContractError } from '../../environment'

export type AccessControlState<Roles extends string | number | symbol> = {
  roles: {
    [role in Roles]: string[]
  }
}

export const OnlyRole = (role: string) => <
  S extends AccessControlState<typeof role>
>(
  _target: Object,
  _propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<
    (state: S, action: ContractInteraction<any>) => HandlerResult<S, any>
  >
) => {
  if (descriptor.value) {
    const originalMethod = descriptor.value
    const wrapper = (
      state: S,
      action: ContractInteraction<any>
    ) => {
      // if (allowOwner) {
      //   ContractAssert(
      //     state.roles[role].includes(action.caller) || action.caller === state.owner,
      //     `This function is only available to the owner or addresses with ${role} role`
      //   )
      // } else {

      // }

      ContractAssert(
        state.roles[role].includes(action.caller),
        `This function is only available to addresses with ${role} role`
      )

      return originalMethod.apply(this, [state, action])
    }
    descriptor.value = wrapper
  }

  return descriptor
}

export const OnlyOwnerOrRole = (role: string) => <
  S extends (OwnableState & AccessControlState<typeof role>)
>(
  _target: Object,
  _propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<
    (state: S, action: ContractInteraction<any>) => HandlerResult<S, any>
  >
) => {
if (descriptor.value) {
  const originalMethod = descriptor.value
  const wrapper = (
    state: S,
    action: ContractInteraction<any>
  ) => {
    const caller = action.caller, owner = state.owner
    ContractAssert(
      state.roles[role].includes(caller) || caller === owner,
      `This function is only available to the owner or ${role} role`
    )

    return originalMethod.apply(this, [state, action])
  }
  descriptor.value = wrapper
}

return descriptor
}
