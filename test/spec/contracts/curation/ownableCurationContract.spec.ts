import 'mocha'
import { expect } from 'chai'

import { ContractError } from '../../../../environment'
import {
  ownableCurationHandle as handle,
  OwnableCurationInput,
  OwnableCurationState
} from '../../../../src/contracts/curation'
import { Interaction } from '../../../../src/util'

const CONTRACT_OWNER = '0xCONTRACT-OWNER'
const ALICE = '0xALICE'
const ITEM_1 = '0xITEM-1'
const ITEM_2 = '0xITEM-2'
const ITEM_3 = '0xITEM-3'
let initState: OwnableCurationState
function resetState() {
  initState = {
    owner: CONTRACT_OWNER,
    title: '',
    metadata: {},
    items: [],
    hidden: []
  }
}

describe('ownable curation contract', () => {
  beforeEach(resetState)

  it('should throw on invalid input', () => {
    expect(() => {
      handle(initState, { caller: ALICE, input: {} } as any)
    }).to.throw(ContractError)
  })

  it('should allow the owner to set title', () => {
    const interaction: Interaction<OwnableCurationInput> = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'setTitle',
        title: 'My Curation'
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.title).to.equal(interaction.input.title)
  })

  it('should prevent non-owners from setting title', () => {
    const interaction: Interaction<OwnableCurationInput> = {
      caller: ALICE,
      input: {
        function: 'setTitle',
        title: 'Alice\'s Curation'
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should allow the owner to set metadata', () => {
    const interaction: Interaction<OwnableCurationInput> = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'setMetadata',
        metadata: {
          description: 'This is my curation!',
          here: { is: { a: { deep: { property: 5 } } } },
          and: [ 'an', [ 'array', 'with', { stuff: 6 } ] ]
        }
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.metadata).to.deep.equal(interaction.input.metadata)
  })

  it('should prevent non-owners from setting metadata', () => {
    const interaction: Interaction<OwnableCurationInput> = {
      caller: ALICE,
      input: {
        function: 'setMetadata',
        metadata: {
          description: 'This is Alice\'s metadata now!'
        }
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should allow the owner to add items', () => {
    const interaction: Interaction<OwnableCurationInput> = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'addItem',
        item: ITEM_1
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.items).to.have.lengthOf(1)
    expect(state.items).to.include(ITEM_1)
  })

  it('should prevent non-owners from adding items', () => {
    const interaction: Interaction<OwnableCurationInput> = {
      caller: ALICE,
      input: {
        function: 'addItem',
        item: ITEM_1
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should allow the owner to remove items', () => {
    const interaction: Interaction<OwnableCurationInput> = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'removeItem',
        item: ITEM_2
      }
    }

    const { state } = handle(
      {
        ...initState,
        items: [ ITEM_1, ITEM_2, ITEM_3 ]
      },
      interaction
    )

    expect(state.items).to.have.lengthOf(2)
    expect(state.items).to.include(ITEM_1)
    expect(state.items).to.not.include(ITEM_2)
    expect(state.items).to.include(ITEM_3)
  })

  it('should prevent non-owners from removing items', () => {
    const interaction: Interaction<OwnableCurationInput> = {
      caller: ALICE,
      input: {
        function: 'removeItem',
        item: ITEM_2
      }
    }

    expect(() => handle(
      {
        ...initState,
        items: [ ITEM_1, ITEM_2, ITEM_3 ]
      },
      interaction
    )).to.throw(ContractError)
  })

  it('should allow the owner to set items', () => {
    const interaction: Interaction<OwnableCurationInput> = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'setItems',
        items: [ ITEM_2, ITEM_3 ]
      }
    }

    const { state } = handle(
      {
        ...initState,
        items: [ ITEM_1 ]
      },
      interaction
    )

    expect(state.items).to.have.lengthOf(2)
    expect(state.items).to.not.include(ITEM_1)
    expect(state.items).to.include(ITEM_2)
    expect(state.items).to.include(ITEM_3)
  })

  it('should prevent non-owners from setting items', () => {
    const interaction: Interaction<OwnableCurationInput> = {
      caller: ALICE,
      input: {
        function: 'setItems',
        items: [ ITEM_2, ITEM_3 ]
      }
    }

    expect(() => handle(
      {
        ...initState,
        items: [ ITEM_1 ]
      },
      interaction
    )).to.throw(ContractError)
  })

  it('should allow the owner to hide items', () => {
    const interaction: Interaction<OwnableCurationInput> = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'hideItem',
        item: ITEM_1
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.hidden).to.have.lengthOf(1)
    expect(state.hidden).to.include(ITEM_1)
  })

  it('should prevent non-owners from hiding items', () => {
    const interaction: Interaction<OwnableCurationInput> = {
      caller: ALICE,
      input: {
        function: 'addItem',
        item: ITEM_1
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should allow the owner to unhide items', () => {
    const interaction: Interaction<OwnableCurationInput> = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'unhideItem',
        item: ITEM_2
      }
    }

    const { state } = handle(
      {
        ...initState,
        hidden: [ ITEM_1, ITEM_2, ITEM_3 ]
      },
      interaction
    )

    expect(state.hidden).to.have.lengthOf(2)
    expect(state.hidden).to.include(ITEM_1)
    expect(state.hidden).to.not.include(ITEM_2)
    expect(state.hidden).to.include(ITEM_3)
  })

  it('should prevent non-owners from unhiding items', () => {
    const interaction: Interaction<OwnableCurationInput> = {
      caller: ALICE,
      input: {
        function: 'unhideItem',
        item: ITEM_2
      }
    }

    expect(() => handle(
      {
        ...initState,
        hidden: [ ITEM_1, ITEM_2, ITEM_3 ]
      },
      interaction
    )).to.throw(ContractError)
  })

  it('should allow the owner to set hidden items', () => {
    const interaction: Interaction<OwnableCurationInput> = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'setHiddenItems',
        items: [ ITEM_2, ITEM_3 ]
      }
    }

    const { state } = handle(
      {
        ...initState,
        hidden: [ ITEM_1 ]
      },
      interaction
    )

    expect(state.hidden).to.have.lengthOf(2)
    expect(state.hidden).to.not.include(ITEM_1)
    expect(state.hidden).to.include(ITEM_2)
    expect(state.hidden).to.include(ITEM_3)
  })

  it('should prevent non-owners from setting hidden items', () => {
    const interaction: Interaction<OwnableCurationInput> = {
      caller: ALICE,
      input: {
        function: 'setHiddenItems',
        items: [ ITEM_2, ITEM_3 ]
      }
    }

    expect(() => handle(
      {
        ...initState,
        hidden: [ ITEM_1 ]
      },
      interaction
    )).to.throw(ContractError)
  })
})
