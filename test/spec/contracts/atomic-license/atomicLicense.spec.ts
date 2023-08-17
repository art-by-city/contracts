import 'mocha'
import { expect } from 'chai'

import { ContractError } from '../../../../environment'

import {
  baseAtomicLicenseHandle as handle,
  AtomicLicenseState,
  AtomicLicenseInput
} from '../../../../src/contracts/atomic-license'
import { Interaction } from '../../../../src/util'

const ALICE = '0xALICE'
const BOB = '0xBOB'
const EVOLVED_SRC = '0xEVOLVED-SRC'
let initState: AtomicLicenseState
function resetState() {
  initState = {
    owner: ALICE,
    canEvolve: true
  }
}

describe('base atomic license', () => {
  beforeEach(resetState)

  it('should throw on invalid input', () => {
    expect(() => {
      handle(initState, { caller: ALICE, input: {} } as any)
    }).to.throw(ContractError)
  })

  it('should require new contract src when evolving', () => {
    const interaction: Interaction<AtomicLicenseInput> = {
      caller: ALICE,
      input: {
        function: 'evolve'
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should prevent non-owner from evolving the contract', () => {
    const interaction: Interaction<AtomicLicenseInput> = {
      caller: BOB,
      input: {
        function: 'evolve'
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should allow the owner to evolve the contract', () => {
    const interaction: Interaction<AtomicLicenseInput> = {
      caller: ALICE,
      input: {
        function: 'evolve',
        value: EVOLVED_SRC
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.evolve).to.equal(EVOLVED_SRC)
  })
})
