import 'mocha'
import { expect } from 'chai'
import { ContractInteraction } from 'warp-contracts'

import {
  handle,
  UsernamesContractInput,
  UsernamesContractState
} from '../../../../src/contracts/usernames/contract'
import { ContractError } from '../../../../environment'

const MOCK_ADDRESS_1 = '0xMOCK-ADDRESS-1'
const MOCK_ADDRESS_2 = '0xMOCK-ADDRESS-2'
const MOCK_USERNAME_1 = 'mockusername1'
const MOCK_USERNAME_2 = 'mockusername2'

let initState: UsernamesContractState

function resetState() {
  initState = {
    usernames: {}
  }
}

describe('usernames contract', () => {
  describe('register', () => {
    beforeEach(() => {
      resetState()
    })

    it('registers usernames', () => {
      const interaction: ContractInteraction<UsernamesContractInput> = {
        caller: MOCK_ADDRESS_1,
        input: {
          function: 'register',
          username: MOCK_USERNAME_1
        }
      }

      const { state } = handle(initState, interaction)

      expect(state.usernames).to.not.be.empty
      expect(state.usernames[MOCK_ADDRESS_1]).to.equal(MOCK_USERNAME_1)
    })

    it('should not allow a username to be registered twice', () => {
      const interaction: ContractInteraction<UsernamesContractInput> = {
        caller: MOCK_ADDRESS_1,
        input: {
          function: 'register',
          username: MOCK_USERNAME_1
        }
      }

      const { state } = handle(initState, interaction)

      const anotherInteraction: ContractInteraction<UsernamesContractInput> = {
        caller: MOCK_ADDRESS_2,
        input: {
          function: 'register',
          username: MOCK_USERNAME_1
        }
      }

      expect(() => {
        handle(state, anotherInteraction)
      }).to.throw(ContractError)
    })

    it('should allow users to update their username', () => {
      const interaction: ContractInteraction<UsernamesContractInput> = {
        caller: MOCK_ADDRESS_1,
        input: {
          function: 'register',
          username: MOCK_USERNAME_1
        }
      }

      let { state } = handle(initState, interaction)

      const anotherInteraction: ContractInteraction<UsernamesContractInput> = {
        caller: MOCK_ADDRESS_1,
        input: {
          function: 'register',
          username: MOCK_USERNAME_2
        }
      }

      ;({ state } = handle(state, anotherInteraction))

      expect(state.usernames).to.not.be.empty
      expect(state.usernames[MOCK_ADDRESS_1]).to.equal(MOCK_USERNAME_2)
    })

    describe('username validation', () => {
      it('should be a string', () => {
        const interaction: ContractInteraction<UsernamesContractInput> = {
          caller: MOCK_ADDRESS_1,
          input: {
            function: 'register',
            username: 123 as unknown as string
          }
        }

        expect(() => {
          handle(initState, interaction)
        }).to.throw(ContractError)
      })

      it('should be at least 2 characters', () => {
        const interaction: ContractInteraction<UsernamesContractInput> = {
          caller: MOCK_ADDRESS_1,
          input: {
            function: 'register',
            username: 'x'
          }
        }

        expect(
          () => { handle(initState, interaction) }
        ).to.throw(ContractError)
      })

      it('should be no more than 64 characters', () => {
        const interaction: ContractInteraction<UsernamesContractInput> = {
          caller: MOCK_ADDRESS_1,
          input: {
            function: 'register',
            username: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
          }
        }

        expect(
          () => { handle(initState, interaction) }
        ).to.throw(ContractError)
      })

      it('should only contain lowercase letters, numbers, periods, & underscores', () => {
        const symbolInteraction: ContractInteraction<UsernamesContractInput> = {
          caller: MOCK_ADDRESS_1,
          input: {
            function: 'register',
            username: '~~~'
          }
        }

        expect(
          () => { handle(initState, symbolInteraction) }
        ).to.throw(ContractError)

        const caseInteraction: ContractInteraction<UsernamesContractInput> = {
          caller: MOCK_ADDRESS_1,
          input: {
            function: 'register',
            username: 'MOCKUSERNAME1'
          }
        }

        expect(
          () => { handle(initState, caseInteraction) }
        ).to.throw(ContractError)
      })
    })
  })

  describe('release', () => {
    beforeEach(() => {
      resetState()
    })

    it('should allow users to release their username', () => {
      const interaction: ContractInteraction<UsernamesContractInput> = {
        caller: MOCK_ADDRESS_1,
        input: {
          function: 'release'
        }
      }

      const { state } = handle(initState, interaction)

      expect(state.usernames).to.be.empty
      expect(state.usernames[MOCK_ADDRESS_1]).to.be.undefined
    })
  })
})
