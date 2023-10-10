import 'mocha'
import { expect } from 'chai'

import { ContractError } from '../../../../environment'
import { handle } from '../../../../src/contracts/hello-world/contract'
import { Interaction } from '../../../../src/util'

const OWNER = 'owner'
const ALICE = 'alice'

let initState: any

function resetState() {
  initState = {
    owner: OWNER,
    numSpeaks: 0,
    squeaks: []
  }
}

describe('hello world contract', () => {

  beforeEach(resetState)

  it('throws on invalid input', () => {
    expect(
      () => handle(initState, { caller: "test", input: {} })
    ).to.throw(ContractError, 'invalid input')
  })

  it('should allow a message to be stored', () => {
    const message = Math.random().toString()
    const interaction: Interaction<any> = {
      input: {
        function: 'speak',
        message
      },
      caller: OWNER
    }
    
    const { state } = handle(initState, interaction)

    expect(state.message).to.equal(message)
  })

  it('should prevent non-owners from speaking', () => {
    const message = Math.random().toString()
    const interaction: Interaction<any> = {
      input: {
        function: 'speak',
        message
      },
      caller: ALICE
    }
    
    expect(() => handle(initState, interaction)).to.throw(
      ContractError,
      'This function is only available to the contract owner.'
    )
  })

  it('should track how many times the owner has spoken', () => {
    const message = Math.random().toString()
    const interaction: Interaction<any> = {
      input: {
        function: 'speak',
        message
      },
      caller: OWNER
    }

    const { state } = handle(initState, interaction)

    expect(state.numSpeaks).to.equal(1)

    const { state: state2 } = handle(state, interaction)

    expect(state2.numSpeaks).to.equal(2)

    const { state: state3 } = handle(state2, interaction)

    expect(state3.numSpeaks).to.equal(3)
  })

  it('should allow anyone to squeak, tracking the last 10 squeaks', () => {
    const interactions: Interaction<any>[] = []
    for (let i = 0; i < 11; i++) {
      interactions.push({
        caller: ALICE,
        input: {
          function: 'squeak',
          message: `squeak${i}`
        }
      })
    }

    let currentState = initState
    for (let i = 0; i < interactions.length; i++) {
      const { state } = handle(currentState, interactions[i])
      currentState = state
    }

    expect(currentState.squeaks)
      .to.be.an('array')
      .and.to.have.lengthOf(10)
      .and.to.not.contain(interactions[0].input.message)
  })

  it('should ensure speak messages are strings of length <= 100', () => {
    const undefinedMessage: Interaction<any> = {
      caller: OWNER,
      input: {
        function: 'speak'
      }
    }

    const tooBigMessage: Interaction<any> = {
      caller: OWNER,
      input: {
        function: 'speak',
        message:
          'blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah'
          + 'blahblahblahblahblahblahblahblahblah'
      }
    }

    expect(() => handle(initState, undefinedMessage)).to.throw(
      ContractError,
      'Message must be string no longer than 100 chars'
    )
    expect(() => handle(initState, tooBigMessage)).to.throw(
      ContractError,
      'Message must be string no longer than 100 chars'
    )
  })

  it('should ensure squeak messages are strings no longer than 100 chars', () => {
    const undefinedMessage: Interaction<any> = {
      caller: ALICE,
      input: {
        function: 'squeak'
      }
    }

    const tooBigMessage: Interaction<any> = {
      caller: ALICE,
      input: {
        function: 'squeak',
        message:
          'blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah'
          + 'blahblahblahblahblahblahblahblahblah'
      }
    }

    expect(() => handle(initState, undefinedMessage)).to.throw(
      ContractError,
      'Message must be string no longer than 100 chars'
    )
    expect(() => handle(initState, tooBigMessage)).to.throw(
      ContractError,
      'Message must be string no longer than 100 chars'
    )
  })

  it('should provide a readSqueak method to read a squeak by index', () => {
    const squeaks = ['one', 'two', 'three', 'tootsie pop owl']
    const index = 2
    const interaction: Interaction<any> = {
      caller: ALICE,
      input: {
        function: 'readSqueak',
        index
      }
    }

    const { result: result1 } = handle({
      owner: OWNER,
      numSpeaks: 0,
      message: '',
      squeaks
    }, interaction)

    expect(result1).to.equal(squeaks[index])

    const { result: result2 } = handle({
      owner: OWNER,
      numSpeaks: 0,
      message: '',
      squeaks
    }, {
      caller: ALICE,
      input: {
        function: 'readSqueak',
        index: 99
      }
    })

    expect(result2).to.be.undefined
  })
})