import 'mocha'
import { expect } from 'chai'

import { ContractError } from '../../../../environment'
import {
  baseCurationHandle as handle,
  BaseCurationState
} from '../../../../src/contracts/curation'

const ALICE = '0xALICE'
const ITEM_1 = '0xITEM-1'
const ITEM_2 = '0xITEM-2'
const ITEM_3 = '0xITEM-3'
let initState: BaseCurationState
function resetState() {
  initState = {
    title: '',
    metadata: {},
    items: [],
    hidden: []
  }
}

describe('base curation contract', () => {
  beforeEach(resetState)

  it('should throw on invalid input', () => {
    expect(() => {
      handle(initState, { caller: ALICE, input: {} } as any)
    }).to.throw(ContractError)
  })

  it('should allow a title to be set', () => {
    const title = 'Alice\'s Curation'
    const interaction = {
      caller: ALICE,
      input: {
        function: 'setTitle',
        title
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.title).to.equal(title)
  })

  it('should require title to be a string', () => {
    expect(() => {
      handle(initState, {
        caller: ALICE,
        input: { function: 'setTitle', title: 5 }
      } as any)
    }).to.throw(ContractError)
  })

  it('should allow metadata to be set', () => {
    const metadata = {
      description: 'This is a curation from Alice',
      rating: 5
    }
    const interaction = {
      caller: ALICE,
      input: {
        function: 'setMetadata',
        metadata
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.metadata).to.deep.equal(metadata)
  })

  it('should require metadata to be an object', () => {
    const metadata = 12
    const interaction: any = {
      caller: ALICE,
      input: {
        function: 'setMetadata',
        metadata
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should not allow metadata to be an array', () => {
    const metadata = [12]
    const interaction = {
      caller: ALICE,
      input: {
        function: 'setMetadata',
        metadata
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should allow items to be added', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'addItem',
        item: ITEM_1
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.items).to.have.lengthOf(1)
    expect(state.items).to.include(ITEM_1)
  })

  it('should require added items to be strings', () => {
    const interaction: any = {
      caller: ALICE,
      input: {
        function: 'addItem',
        item: 2
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should require added items to be unique', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'addItem',
        item: ITEM_1
      }
    }

    expect(() => {
      handle({ ...initState, items: [ ITEM_1 ]}, interaction)
    }).to.throw(ContractError)
  })

  it('should allow items to be removed', () => {
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
        items: [ ITEM_1, ITEM_2, ITEM_3 ]
      },
      interaction
    )

    expect(state.items).to.include(ITEM_1)
    expect(state.items).to.not.include(ITEM_2)
    expect(state.items).to.include(ITEM_3)
  })

  it('should require removed item to be a string', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'removeItem',
        item: []
      }
    }

    expect(() => { handle(initState, interaction) }).to.throw(ContractError)
  })

  it('should require removed item exists', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'removeItem',
        item: ITEM_1
      }
    }

    expect(() => { handle(initState, interaction) }).to.throw(ContractError)
  })

  it('should allow items to be set as a whole', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'setItems',
        items: [ ITEM_1, ITEM_2, ITEM_3 ]
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.items).to.equal(interaction.input.items)
  })

  it('should require items being set to be an array of strings', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'setItems',
        items: 5
      }
    }

    expect(() => { handle(initState, interaction) }).to.throw(ContractError)

    const interaction2 = {
      caller: ALICE,
      input: {
        function: 'setItems',
        items: [ ITEM_1, 2, {} ]
      }
    }

    expect(() => { handle(initState, interaction2) }).to.throw(ContractError)
  })

  it('should allow items to be hidden', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'hideItem',
        item: ITEM_1
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.hidden).to.have.lengthOf(1)
    expect(state.hidden).to.include(ITEM_1)
  })

  it('should require hidden items to be strings', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'hideItem',
        item: 2
      }
    }

    expect(() => handle(initState, interaction)).to.throw(ContractError)
  })

  it('should require hidden items to be unique', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'hideItem',
        item: ITEM_1
      }
    }

    expect(() => {
      handle({ ...initState, hidden: [ ITEM_1 ]}, interaction)
    }).to.throw(ContractError)
  })

  it('should allow items to be unhidden', () => {
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
        hidden: [ ITEM_1, ITEM_2, ITEM_3 ]
      },
      interaction
    )

    expect(state.hidden).to.include(ITEM_1)
    expect(state.hidden).to.not.include(ITEM_2)
    expect(state.hidden).to.include(ITEM_3)
  })

  it('should require unhidden item to be a string', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'unhideItem',
        item: []
      }
    }

    expect(() => { handle(initState, interaction) }).to.throw(ContractError)
  })

  it('should require unhidden item exists', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'unhideItem',
        item: ITEM_1
      }
    }

    expect(() => { handle(initState, interaction) }).to.throw(ContractError)
  })

  it('should allow hidden items to be set as a whole', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'setHiddenItems',
        items: [ ITEM_1, ITEM_2, ITEM_3 ]
      }
    }

    const { state } = handle(initState, interaction)

    expect(state.hidden).to.equal(interaction.input.items)
  })

  it('should require hidden items being set to be an array of strings', () => {
    const interaction = {
      caller: ALICE,
      input: {
        function: 'setHiddenItems',
        items: 5
      }
    }

    expect(() => { handle(initState, interaction) }).to.throw(ContractError)

    const interaction2 = {
      caller: ALICE,
      input: {
        function: 'setHiddenItems',
        items: [ ITEM_1, 2, {} ]
      }
    }

    expect(() => { handle(initState, interaction2) }).to.throw(ContractError)
  })
})
