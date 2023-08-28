import 'mocha'
import { expect } from 'chai'

import { ContractError } from '../../../../environment'
import {
  collaborativeCurationHandle as handle,
  CollaborativeCurationState
} from '../../../../src/contracts/curation'
import { Interaction } from '../../../../src/util'

const CONTRACT_OWNER = '0xCONTRACT-OWNER'
const ALICE = '0xALICE'
const BOB = '0xBOB'
const ITEM_1 = '0xITEM-1'
const ITEM_2 = '0xITEM-2'
const ITEM_3 = '0xITEM-3'
let initState: CollaborativeCurationState
function resetState() {
  initState = {
    owner: CONTRACT_OWNER,
    title: '',
    metadata: {},
    items: [],
    hidden: [],
    roles: {
      curator: []
    }
  }
}

describe('collaborative curation contract', () => {
  beforeEach(resetState)

  it('should throw on invalid input', () => {
    expect(() => {
      handle(initState, { caller: CONTRACT_OWNER, input: {} } as any)
    }).to.throw(ContractError)
  })

  /**
   * Curator Management
   */
  it('should allow owner to add curators', () => {
    const interaction = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'addCurator',
        address: ALICE
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.roles.curator).to.have.lengthOf(1)
    expect(state.roles.curator).to.include(ALICE)
  })

  it('should require added curators are strings', () => {
    const interaction = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'addCurator',
        address: 5
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should require added curators are unique', () => {
    const interaction = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'addCurator',
        address: ALICE
      }
    }

    expect(() => handle(
      {
        ...initState,
        roles: { curator: [ ALICE ] }
      },
      interaction
    )).to.throw(ContractError)
  })

  it('should prevent everyone else from adding curators', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'addCurator',
        address: ALICE
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should allow owner to remove curators', () => {
    const interaction = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'removeCurator',
        address: ALICE
      }
    }

    const { state } = handle(
      { ...initState, roles: { curator: [ ALICE, BOB ] } },
      interaction
    )

    expect(state.roles.curator).to.have.lengthOf(1)
    expect(state.roles.curator).to.include(BOB)
  })

  it('should require removed curators are strings', () => {
    const interaction = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'removeCurator',
        address: 5
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should require removed curators exist', () => {
    const interaction = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'removeCurator',
        address: ALICE
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should prevent everyone else from removing curators', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'removeCurator',
        address: BOB
      }
    }

    expect(() => handle({
      ...initState,
      roles: { curator: [ BOB ] }
    }, interaction)).to.throw(ContractError)
  })

  /**
   * Title
   */
  it('should allow owner to set title', () => {
    const interaction = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'setTitle',
        title: 'My Curation'
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.title).to.equal(interaction.input.title)
  })

  it('should allow curators to set title', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'setTitle',
        title: 'Title set by Alice'
      }
    }

    const { state } = handle(
      {
        ...initState,
        roles: { curator: [ ALICE ] }
      },
      interaction
    )

    expect(state.title).to.equal(interaction.input.title)
  })

  it('should prevent everyone else from setting title', () => {
    const interaction = {
      caller: BOB,
      input: {
        function: 'setTitle',
        title: 'Title set by BOB'
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  /**
   * Metadata
   */
  it('should allow owner to set metadata', () => {
    const interaction = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'setMetadata',
        metadata: { test: 'metadata' }
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.metadata).to.deep.equal(interaction.input.metadata)
  })

  it('should allow curators to set metadata', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'setMetadata',
        metadata: { alice: 'rocks' }
      }
    }

    const { state } = handle(
      {
        ...initState,
        roles: { curator: [ ALICE ] }
      },
      interaction
    )

    expect(state.metadata).to.deep.equal(interaction.input.metadata)
  })

  it('should prevent everyone else from setting metadata', () => {
    const interaction = {
      caller: BOB,
      input: {
        function: 'setMetadata',
        metadata: { bob: 'says hi' }
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  /**
   * Adding items
   */
  it('should allow owner to add items', () => {
    const interaction = {
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

  it('should allow curators to add items', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'addItem',
        item: ITEM_1
      }
    }

    const { state } = handle(
      {
        ...initState,
        roles: { curator: [ ALICE ] }
      },
      interaction
    )

    expect(state.items).to.have.lengthOf(1)
    expect(state.items).to.include(ITEM_1)
  })

  it('should prevent everyone else from adding items', () => {
    const interaction = {
      caller: BOB,
      input: {
        function: 'addItem',
        item: ITEM_1
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  /**
   * Removing items
   */
  it('should allow owner to remove items', () => {
    const interaction = {
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

  it('should allow curators to remove items', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'removeItem',
        item: ITEM_2
      }
    }

    const { state } = handle(
      {
        ...initState,
        roles: { curator: [ ALICE ] },
        items: [ ITEM_1, ITEM_2, ITEM_3 ]
      },
      interaction
    )

    expect(state.items).to.have.lengthOf(2)
    expect(state.items).to.include(ITEM_1)
    expect(state.items).to.not.include(ITEM_2)
    expect(state.items).to.include(ITEM_3)
  })

  it('should prevent everyone else from removing items', () => {
    const interaction = {
      caller: BOB,
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

  /**
   * Setting items
   */
  it('should allow owner to set items', () => {
    const interaction = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'setItems',
        items: [ ITEM_2, ITEM_3 ]
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.items).to.have.lengthOf(2)
    expect(state.items).to.include(ITEM_2)
    expect(state.items).to.include(ITEM_3)
  })

  it('should allow curators to set items', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'setItems',
        items: [ ITEM_2, ITEM_3 ]
      }
    }

    const { state } = handle(
      {
        ...initState,
        roles: { curator: [ ALICE ] }
      },
      interaction
    )

    expect(state.items).to.have.lengthOf(2)
    expect(state.items).to.include(ITEM_2)
    expect(state.items).to.include(ITEM_3)
  })

  it('should prevent everyone else from setting items', () => {
    const interaction = {
      caller: BOB,
      input: {
        function: 'setItems',
        items: [ ITEM_2, ITEM_3 ]
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  /**
   * Hide items
   */
  it('should allow owner to hide items', () => {
    const interaction = {
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

  it('should allow curators to hide items', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'hideItem',
        item: ITEM_1
      }
    }

    const { state } = handle(
      {
        ...initState,
        roles: { curator: [ ALICE ] }
      },
      interaction
    )

    expect(state.hidden).to.have.lengthOf(1)
    expect(state.hidden).to.include(ITEM_1)
  })

  it('should prevent everyone else from hiding items', () => {
    const interaction = {
      caller: BOB,
      input: {
        function: 'hideItem',
        item: ITEM_1
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  /**
   * Unhide items
   */
  it('should allow owner to unhide items', () => {
    const interaction = {
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

  it('should allow curators to unhide items', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'unhideItem',
        item: ITEM_2
      }
    }

    const { state } = handle(
      {
        ...initState,
        roles: { curator: [ ALICE ] },
        hidden: [ ITEM_1, ITEM_2, ITEM_3 ]
      },
      interaction
    )

    expect(state.hidden).to.have.lengthOf(2)
    expect(state.hidden).to.include(ITEM_1)
    expect(state.hidden).to.not.include(ITEM_2)
    expect(state.hidden).to.include(ITEM_3)
  })

  it('should prevent everyone else from unhiding items', () => {
    const interaction = {
      caller: BOB,
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

  /**
   * Set hidden items
   */
  it('should allow owner to set hidden items', () => {
    const interaction = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'setHiddenItems',
        items: [ ITEM_1, ITEM_2, ITEM_3 ]
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.hidden).to.have.lengthOf(3)
    expect(state.hidden).to.include(ITEM_1)
    expect(state.hidden).to.include(ITEM_2)
    expect(state.hidden).to.include(ITEM_3)
  })

  it('should allow curators to set hidden items', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'setHiddenItems',
        items: [ ITEM_1, ITEM_2, ITEM_3 ]
      }
    }

    const { state } = handle(
      {
        ...initState,
        roles: { curator: [ ALICE ] }
      },
      interaction
    )

    expect(state.hidden).to.have.lengthOf(3)
    expect(state.hidden).to.include(ITEM_1)
    expect(state.hidden).to.include(ITEM_2)
    expect(state.hidden).to.include(ITEM_3)
  })

  it('should prevent everyone else from setting hidden items', () => {
    const interaction = {
      caller: BOB,
      input: {
        function: 'setHiddenItems',
        items: [ ITEM_1, ITEM_2, ITEM_3 ]
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })
})
