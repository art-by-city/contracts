import 'mocha'
import { expect } from 'chai'

import { ContractError } from '../../../../environment'
import {
  followingCurationHandle as handle,
  FollowingCurationState
} from '../../../../src/contracts/curation'

const CONTRACT_OWNER = '0xCONTRACT-OWNER'
const ALICE = '0xALICE'
const BOB = '0xBOB'
const ITEM_1 = '0xITEM-1'
const ITEM_2 = '0xITEM-2'
const ITEM_3 = '0xITEM-3'
let initState: FollowingCurationState
function resetState() {
  initState = {
    owner: CONTRACT_OWNER,
    title: '',
    metadata: {},
    items: [],
    hidden: [],
    following: []
  }
}

describe('Ownable Following Curation Contract', () => {
  beforeEach(resetState)

  /**
   * Following management
   */
  it('should throw on invalid input', () => {
    expect(() => {
      handle(initState, { caller: ALICE, input: {} } as any)
    }).to.throw(ContractError)
  })

  it('should allow the owner to add followed addresses', () => {
    const interaction = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'follow',
        address: ALICE
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.following).to.have.lengthOf(1)
    expect(state.following).to.include(ALICE)
  })

  it('should require followed addresses to be strings', () => {
    const interaction = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'follow',
        address: 5
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should require followed addresses to be unique', () => {
    const interaction = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'follow',
        address: ALICE
      }
    }

    expect(() => handle(
      {
        ...initState,
        following: [ ALICE ]
      },
      interaction
    )).to.throw(ContractError)
  })

  it('should prevent non-owners from following addresses', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'follow',
        address: ALICE
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should allow the owner to unfollow addresses', () => {
    const interaction = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'unfollow',
        address: ALICE
      }
    }

    const { state } = handle(
      { ...initState, following: [ ALICE, BOB ] },
      interaction
    )

    expect(state.following).to.have.lengthOf(1)
    expect(state.following).to.include(BOB)
  })

  it('should require unfollowed addresses to be strings', () => {
    const interaction = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'unfollow',
        address: 5
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should require unfollowed addresses to exist', () => {
    const interaction = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'unfollow',
        address: ALICE
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should prevent non-owners from unfollowing addresses', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'unfollow',
        address: BOB
      }
    }

    expect(() => handle({
      ...initState,
      following: [ BOB ]
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
        title: 'My Following Curation'
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.title).to.equal(interaction.input.title)
  })

  it('should prevent everyone else from setting title', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'setTitle',
        title: 'Alice\'s Curation'
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
        metadata: { my: 'metadata' }
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.metadata).to.deep.equal(interaction.input.metadata)
  })

  it('should prevent everyone else from setting metadata', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'setMetadata',
        metadata: { alice: 'rocks' }
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

  it('should prevent everyone else from adding items', () => {
    const interaction = {
      caller: ALICE,
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

  it('should prevent everyone else from removing items', () => {
    const interaction = {
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

  it('should prevent everyone else from setting items', () => {
    const interaction = {
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

  /**
   * Hiding items
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

  it('should prevent everyone else from hiding items', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'hideItem',
        item: ITEM_1
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  /**
   * Unhiding items
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

  it('should prevent everyone else from unhiding items', () => {
    const interaction = {
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

  /**
   * Setting hidden items
   */
  it('should allow owner to set hidden items', () => {
    const interaction = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'setHiddenItems',
        items: [ ITEM_2, ITEM_3 ]
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.hidden).to.have.lengthOf(2)
    expect(state.hidden).to.not.include(ITEM_1)
    expect(state.hidden).to.include(ITEM_2)
    expect(state.hidden).to.include(ITEM_3)
  })

  it('should prevent everyone else from setting hidden items', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'setHiddenItems',
        items: [ ITEM_2, ITEM_3 ]
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })
})
