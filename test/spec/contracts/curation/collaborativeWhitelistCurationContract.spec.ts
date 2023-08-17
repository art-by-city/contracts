import 'mocha'
import { expect } from 'chai'

import { ContractError } from '../../../../environment'
import {
  collaborativeWhitelistCurationHandle as handle,
  CollaborativeWhitelistCurationInput,
  CollaborativeWhitelistCurationState
} from '../../../../src/contracts/curation'
import { Interaction } from '../../../../src/util'

const CONTRACT_OWNER = '0xCONTRACT-OWNER'
const ALICE = '0xALICE'
const BOB = '0xBOB'
const ITEM_1 = '0xITEM-1'
const ITEM_2 = '0xITEM-2'
const ITEM_3 = '0xITEM-3'
let initState: CollaborativeWhitelistCurationState
function resetState() {
  initState = {
    owner: CONTRACT_OWNER,
    title: '',
    metadata: {},
    items: [],
    hidden: [],
    roles: {
      curator: []
    },
    addressWhitelist: []
  }
}

describe('collaborative whitelist curation contract', () => {
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
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
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

  it('should prevent everyone else from adding curators', () => {
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
      caller: ALICE,
      input: {
        function: 'addCurator',
        address: BOB
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should allow owner to remove curators', () => {
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'removeCurator',
        address: BOB
      }
    }

    const { state } = handle(
      {
        ...initState,
        roles: { curator: [ ALICE, BOB ] }
      },
      interaction
    )

    expect(state.roles.curator).to.have.lengthOf(1)
    expect(state.roles.curator).to.include(ALICE)
    expect(state.roles.curator).to.not.include(BOB)
  })

  it('should prevent everyone else from removing curators', () => {
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
      caller: ALICE,
      input: {
        function: 'removeCurator',
        address: BOB
      }
    }

    expect(() => handle(
      {
        ...initState,
        roles: { curator: [ ALICE, BOB ] }
      },
      interaction
    )).to.throw(ContractError)
  })

  /**
   * Title
   */
  it('should allow owner to set title', () => {
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
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
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
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
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
      caller: BOB,
      input: {
        function: 'setTitle',
        title: 'Title set by Bob'
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  /**
   * Metadata
   */
  it('should allow owner to set metadata', () => {
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'setMetadata',
        metadata: { my: 'metadata' }
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.metadata).to.deep.equal(interaction.input.metadata)
  })

  it('should allow curators to set metadata', () => {
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
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
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
      caller: BOB,
      input: {
        function: 'setMetadata',
        metadata: { bob: 'is here' }
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  /**
   * Pinned items
   */
  it('should allow owner to add items', () => {
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
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
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
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
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
      caller: BOB,
      input: {
        function: 'addItem',
        item: ITEM_1
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should allow owner to remove items', () => {
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
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
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
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
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
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

  it('should allow owner to set items', () => {
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
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
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
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
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
      caller: BOB,
      input: {
        function: 'setItems',
        items: [ ITEM_2, ITEM_3 ]
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  /**
   * Hidden items
   */
  it('should allow owner to hide items', () => {
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
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
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
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
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
      caller: BOB,
      input: {
        function: 'hideItem',
        item: ITEM_1
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should allow owner to unhide items', () => {
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
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
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
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
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
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

  it('should allow owner to set hidden items', () => {
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'setHiddenItems',
        items: [ ITEM_2, ITEM_3 ]
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.hidden).to.have.lengthOf(2)
    expect(state.hidden).include(ITEM_2)
    expect(state.hidden).include(ITEM_3)
  })

  it('should allow curators to set hidden items', () => {
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
      caller: ALICE,
      input: {
        function: 'setHiddenItems',
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

    expect(state.hidden).to.have.lengthOf(2)
    expect(state.hidden).include(ITEM_2)
    expect(state.hidden).include(ITEM_3)
  })

  it('should prevent everyone else from setting hidden items', () => {
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
      caller: BOB,
      input: {
        function: 'setHiddenItems',
        items: [ ITEM_2, ITEM_3 ]
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

  /**
   * Whitelist Management
   */
  it('should allow owner to add to whitelist', () => {
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'addToWhitelist',
        address: ALICE
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.addressWhitelist).to.have.lengthOf(1)
    expect(state.addressWhitelist).to.include(ALICE)
  })

  it('should allow curators to add to whitelist', () => {
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
      caller: ALICE,
      input: {
        function: 'addToWhitelist',
        address: BOB
      }
    }

    const { state } = handle(
      {
        ...initState,
        roles: { curator: [ ALICE ] }
      },
      interaction
    )

    expect(state.addressWhitelist).to.have.lengthOf(1)
    expect(state.addressWhitelist).to.include(BOB)
  })

  it('should prevent everyone else from adding to whitelist', () => {
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
      caller: BOB,
      input: {
        function: 'addToWhitelist',
        address: ALICE
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should allow owner to remove from whitelist', () => {
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'removeFromWhitelist',
        address: ALICE
      }
    }

    const { state } = handle(
      {
        ...initState,
        addressWhitelist: [ ALICE, BOB ]
      },
      interaction
    )

    expect(state.addressWhitelist).to.have.lengthOf(1)
    expect(state.addressWhitelist).to.not.include(ALICE)
    expect(state.addressWhitelist).to.include(BOB)
  })

  it('should allow curators to remove from whitelist', () => {
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
      caller: ALICE,
      input: {
        function: 'removeFromWhitelist',
        address: ALICE
      }
    }

    const { state } = handle(
      {
        ...initState,
        roles: { curator: [ ALICE ] },
        addressWhitelist: [ ALICE, BOB ]
      },
      interaction
    )

    expect(state.addressWhitelist).to.have.lengthOf(1)
    expect(state.addressWhitelist).to.not.include(ALICE)
    expect(state.addressWhitelist).to.include(BOB)
  })

  it('should prevent everyone else from removing from whitelist', () => {
    const interaction: Interaction<
      CollaborativeWhitelistCurationInput
    > = {
      caller: BOB,
      input: {
        function: 'removeFromWhitelist',
        address: ALICE
      }
    }

    expect(() => handle(
      {
        ...initState,
        addressWhitelist: [ ALICE, BOB ]
      },
      interaction
    )).to.throw(ContractError)
  })
})
