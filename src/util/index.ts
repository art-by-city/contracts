import { ContractInteraction, HandlerResult } from 'warp-contracts'

// export type Constructor<T = {}> = new (...args: any[]) => T
export interface Constructor<T = {}> {
  new (...args: any[]): T
}

export type ContractFunctionInput = {
  function: string
  [key: string]: any
}

export type AnyContractFunctionInput = {
  [key: string | number | symbol]: any
}

export type PartialFunctionInput<T extends ContractFunctionInput> =
  Partial<T> & Pick<T, 'function'>

export type NarrowContractInput<Input, func> = Input extends { function: func }
  ? Input
  : never

export type ContractClassType<
  ContractState,
  Input extends ContractFunctionInput,
  Result
> = {
  [FunctionName in Input['function']]: <State extends ContractState>(
    state: State,
    action: ContractInteraction<NarrowContractInput<Input, FunctionName>>
  ) => HandlerResult<State, Result>
}

export * from './ownable'
export * from './accessControl'
