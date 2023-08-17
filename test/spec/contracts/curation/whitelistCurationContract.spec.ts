import 'mocha'
import { expect } from 'chai'

import { ContractError } from '../../../../environment'
import {
  OwnableWhitelistCurationState,
  whitelistCurationHandle as handle,
  WhitelistCurationInput,
  WhitelistCurationState
} from '../../../../src/contracts/curation'
import { Interaction } from '../../../../src/util'

const CONTRACT_OWNER = '0xCONTRACT-OWNER'
const ALICE = '0xALICE'
const BOB = '0xBOB'
const ITEM_1 = '0xITEM-1'
const ITEM_2 = '0xITEM-2'
const ITEM_3 = '0xITEM-3'
let initState: OwnableWhitelistCurationState
function resetState() {
  initState = {
    owner: CONTRACT_OWNER,
    title: '',
    metadata: {},
    items: [],
    hidden: [],
    addressWhitelist: []
  }
}

describe('ownable whitelist curation contract', () => {
  beforeEach(resetState)

  /**
   * Whitelist management
   */
  it('should throw on invalid input', () => {
    expect(() => {
      handle(initState, { caller: ALICE, input: {} } as any)
    }).to.throw(ContractError)
  })

  it('should allow the owner to add to the whitelist', () => {
    const interaction: Interaction<WhitelistCurationInput> = {
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

  it('should require addresses added to the whitelist are strings', () => {
    const interaction: any = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'addToWhitelist',
        address: 5
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should require addresses added to the whitelist are unique', () => {
    const interaction: Interaction<WhitelistCurationInput> = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'addToWhitelist',
        address: ALICE
      }
    }

    expect(() => handle(
      {
        ...initState,
        addressWhitelist: [ ALICE ]
      },
      interaction
    )).to.throw(ContractError)
  })

  it('should prevent non-owners from adding to the whitelist', () => {
    const interaction: Interaction<WhitelistCurationInput> = {
      caller: ALICE,
      input: {
        function: 'addToWhitelist',
        address: ALICE
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should allow the owner to remove from the whitelist', () => {
    const interaction: Interaction<WhitelistCurationInput> = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'removeFromWhitelist',
        address: ALICE
      }
    }

    const { state } = handle(
      { ...initState, addressWhitelist: [ ALICE, BOB ] },
      interaction
    )

    expect(state.addressWhitelist).to.have.lengthOf(1)
    expect(state.addressWhitelist).to.include(BOB)
  })

  it('should require addresses removed from the whitelist are strings', () => {
    const interaction: any = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'removeFromWhitelist',
        address: 5
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should require addresses removed from the whitelist exist', () => {
    const interaction: Interaction<WhitelistCurationInput> = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'removeFromWhitelist',
        address: ALICE
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should prevent non-owners from removing from the whitelist', () => {
    const interaction: Interaction<WhitelistCurationInput> = {
      caller: ALICE,
      input: {
        function: 'removeFromWhitelist',
        address: BOB
      }
    }

    expect(() => handle({
      ...initState,
      addressWhitelist: [ BOB ]
    }, interaction)).to.throw(ContractError)
  })

  /**
   * Title
   */
  it('should allow owner to set title', () => {
    const interaction: Interaction<WhitelistCurationInput> = {
      caller: CONTRACT_OWNER,
      input: {
        function: 'setTitle',
        title: 'My Whitelist Curation'
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.title).to.equal(interaction.input.title)
  })

  it('should prevent everyone else from setting title', () => {
    const interaction: Interaction<WhitelistCurationInput> = {
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
    const interaction: Interaction<WhitelistCurationInput> = {
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
    const interaction: Interaction<WhitelistCurationInput> = {
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
    const interaction: Interaction<WhitelistCurationInput> = {
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
    const interaction: Interaction<WhitelistCurationInput> = {
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
    const interaction: Interaction<WhitelistCurationInput> = {
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
    const interaction: Interaction<WhitelistCurationInput> = {
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
    const interaction: Interaction<WhitelistCurationInput> = {
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
    const interaction: Interaction<WhitelistCurationInput> = {
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
    const interaction: Interaction<WhitelistCurationInput> = {
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
    const interaction: Interaction<WhitelistCurationInput> = {
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
    const interaction: Interaction<WhitelistCurationInput> = {
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
    const interaction: Interaction<WhitelistCurationInput> = {
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
    const interaction: Interaction<WhitelistCurationInput> = {
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
    const interaction: Interaction<WhitelistCurationInput> = {
      caller: ALICE,
      input: {
        function: 'setHiddenItems',
        items: [ ITEM_2, ITEM_3 ]
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })
})
