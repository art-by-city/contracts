import 'mocha'
import { expect } from 'chai'
import { ContractInteraction } from 'redstone-smartweave'

import {
  handle,
  UsernamesContractInput,
  UsernamesContractState
} from '../../../src/usernames/contract'

const MOCK_ADDRESS_1 = '0xMOCK-ADDRESS-1'

describe('usernames contract', () => {
  it('registers usernames', () => {
    const state: UsernamesContractState = {
      usernames: {}
    }
    const interaction: ContractInteraction<UsernamesContractInput> = {
      input: {},
      caller: MOCK_ADDRESS_1
    }

    const result = handle(state, interaction)

    expect(result).to.not.be.null
  })
})
