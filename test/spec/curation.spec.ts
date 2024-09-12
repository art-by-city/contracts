import { expect } from 'chai'
import AoLoader from '@permaweb/ao-loader'
import { readFileSync } from 'fs'
import { join, resolve } from 'path'

import {
  ALICE_ADDRESS,
  AO_ENV,
  BOB_ADDRESS,
  CHARLS_ADDRESS,
  createLoader,
  DEFAULT_HANDLE_OPTIONS,
  FullAOHandleFunction,
  OWNER_ADDRESS
} from '../util/setup'

const curationContractSource = readFileSync(
  join(resolve(), './dist/curation.lua'),
  'utf-8',
)
const DEFAULT_CURATION_TITLE = 'Default curation title'
const DEFAULT_DESCRIPTION = 'Default curation description'
const DEFAULT_ITEMS = ['default', 'list', 'of', 'items']

describe('Curation Contract', () => {
  let originalHandle: FullAOHandleFunction
  let memory: ArrayBuffer

  beforeEach(async () => {
    const loader = await createLoader(
      curationContractSource,
      [
        { name: 'Title', value: DEFAULT_CURATION_TITLE },
        { name: 'Description', value: DEFAULT_DESCRIPTION }
      ]
    )
    originalHandle = loader.handle
    memory = loader.memory
  })

  async function handle(
    options: Partial<AoLoader.Message> = {},
    mem = memory
  ) {
    return originalHandle(
      mem,
      {
        ...DEFAULT_HANDLE_OPTIONS,
        ...options,
      },
      AO_ENV
    )
  }

  describe('Title', () => {
    it('Allows Owner to set title', async () => {
      const title = 'my curation'
      const result = await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Set-Title' },
          { name: 'Title', value: title }
        ]
      })

      expect(result.Messages)
        .to.be.an('array')
        .that.is.not.empty
      expect(result.Messages[0].Data).to.equal(title)
    })

    it('Prevents anyone else from setting title', async () => {
      const title = 'my curation'
      const result = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Set-Title' },
          { name: 'Title', value: title }
        ]
      })

      expect(result.Error)
        .to.be.a('string')
        .that.includes('This action is only available to the process Owner')
    })

    it('Validates when setting title', async () => {
      const result = await handle({
        From: OWNER_ADDRESS,
        Tags: [{ name: 'Action', value: 'Set-Title' }]
      })

      expect(result.Error)
        .to.be.a('string')
        .that.includes('Title tag is required')
    })

    it('Allows anyone to read the title', async () => {
      const title = 'my curation'
      await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Set-Title' },
          { name: 'Title', value: title }
        ]
      })

      const result = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Get-Title' }
        ]
      })

      expect(result.Messages)
        .to.be.an('array')
        .that.is.not.empty
      expect(result.Messages[0].Data).to.equal(title)
    })

    it('Deploys with default title from spawn (eval?) tag', async () => {
      const result = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Get-Title' }
        ]
      })

      expect(result.Messages).to.not.be.empty
      expect(result.Messages[0].Data).to.equal(DEFAULT_CURATION_TITLE)
    })
  })

  describe('Metadata', () => {
    it('Allows Owner to set metadata', async () => {
      const metadata = { description: 'this is a curation contract' }
      const metadataString = JSON.stringify(metadata)
      const result = await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Set-Metadata' },
        ],
        Data: metadataString
      })

      expect(result.Messages)
        .to.be.an('array')
        .that.is.not.empty
      expect(result.Messages[0].Data).to.equal(metadataString)
    })

    it('Validates metadata as valid json', async () => {
      const badJsonResult = await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Set-Metadata' },
        ],
        Data: 'weeewoooooo'
      })

      expect(badJsonResult.Error)
        .to.be.a('string')
        .that.includes('Invalid metadata JSON')

      const noJsonResult = await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Set-Metadata' },
        ]
      })

      expect(noJsonResult.Error)
        .to.be.a('string')
        .that.includes('Invalid metadata JSON') 
    })

    it('Prevents anyone else from setting metadata', async () => {
      const result = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Set-Metadata' },
        ],
        Data: JSON.stringify({ description: 'alice description' })
      })

      expect(result.Error)
        .to.be.a('string')
        .that.includes('This action is only available to the process Owner')
    })

    it('Allows anyone to read the metadata', async () => {
      const metadata = { description: 'this is a curation contract' }
      const metadataString = JSON.stringify(metadata)
      await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Set-Metadata' },
        ],
        Data: metadataString
      })

      const result = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Get-Metadata' },
        ],
      })

      expect(result.Messages)
        .to.be.an('array')
        .that.is.not.empty
      expect(result.Messages[0].Data).to.equal(metadataString)
    })

    it('Deploys with metadata.description from spawn (eval?) tag', async () => {
      const result = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Get-Metadata' }
        ]
      })

      expect(result.Messages).to.not.be.empty
      expect(result.Messages[0].Data).to.equal(
        JSON.stringify({ description: DEFAULT_DESCRIPTION })
      )
    })
  })

  describe('Curated Items', () => {
    describe('Adding', () => {
      it('Allows Owner to add items', async () => {
        const item = 'fancy pants yancy'
        const result = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Add-Item' },
            { name: 'Item', value: item }
          ]
        })

        expect(result.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(result.Messages[0].Data)
          .to.be.a('string')
          .that.equals(item)
      })

      it('Prevents anyone else from adding items', async () => {
        const result = await handle({
          From: ALICE_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Add-Item' },
            { name: 'Item', value: 'alice item' }
          ]
        })
  
        expect(result.Error)
          .to.be.a('string')
          .that.includes('This action is only available to the process Owner')
      })

      it('Validates when adding items', async () => {
        const result = await handle({
          From: OWNER_ADDRESS,
          Tags: [{ name: 'Action', value: 'Add-Item' }]
        })

        expect(result.Error)
          .to.be.a('string')
          .that.includes('Item tag is required')
      })
    })

    describe('Listing', () => {
      it('Allows anyone to list curated items', async () => {
        const items = [ 'one', 'two', 'three' ]
        for (const item of items) {
          await handle({
            From: OWNER_ADDRESS,
            Tags: [
              { name: 'Action', value: 'Add-Item' },
              { name: 'Item', value: item }
            ]
          })
        }

        const result = await handle({
          From: ALICE_ADDRESS,
          Tags: [{ name: 'Action', value: 'List-Items' }]
        })

        expect(result.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(result.Messages[0].Data)
          .to.be.a('string')
          .that.equals(JSON.stringify(items))
      })

      it('Allows listing of hidden items if requested', async () => {
        const items = [ 'one', 'two', 'three' ]
        for (const item of items) {
          await handle({
            From: OWNER_ADDRESS,
            Tags: [
              { name: 'Action', value: 'Add-Item' },
              { name: 'Item', value: item }
            ]
          })
        }

        await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Hide-Item' },
            { name: 'Item-Index', value: '2' }
          ]
        })

        const result = await handle({
          From: ALICE_ADDRESS,
          Tags: [
            { name: 'Action', value: 'List-Items' },
            { name: 'Include-Hidden', value: 'true' }
          ]
        })

        expect(result.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(JSON.parse(result.Messages[0].Data))
          .to.deep.equal([
            { hidden: false, item: 'one' },
            { hidden: true, item: 'two' },
            { hidden: false, item: 'three' }
          ])
      })
    })

    describe('Removing', () => {
      it('Allows Owner to remove items', async () => {
        const items = [ 'one', 'two', 'three' ]
        for (const item of items) {
          await handle({
            From: OWNER_ADDRESS,
            Tags: [
              { name: 'Action', value: 'Add-Item' },
              { name: 'Item', value: item }
            ]
          })
        }

        const itemIndex = 1
        const itemIndexString = (itemIndex + 1).toString()
        const result = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Remove-Item' },
            { name: 'Item-Index', value: itemIndexString }
          ]
        })

        expect(result.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(result.Messages[0].Data)
          .to.be.a('string')
          .that.equals(items[itemIndex])

        const listResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'List-Items' }
          ]
        })

        expect(listResult.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(listResult.Messages[0].Data)
          .to.be.a('string')
          .that.equals(
            JSON.stringify(items.filter((_,idx) => idx !== itemIndex))
          )
      })

      it('Prevents anyone else from removing items', async () => {
        const result = await handle({
          From: ALICE_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Remove-Item' },
            { name: 'Item-Index', value: '2' }
          ]
        })
  
        expect(result.Error)
          .to.be.a('string')
          .that.includes('This action is only available to the process Owner')
      })

      it('Validates when removing items', async () => {
        const items = [ 'one', 'two', 'three' ]
        for (const item of items) {
          await handle({
            From: OWNER_ADDRESS,
            Tags: [
              { name: 'Action', value: 'Add-Item' },
              { name: 'Item', value: item }
            ]
          })
        }

        const noItemIndexResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Remove-Item' }
          ]
        })

        expect(noItemIndexResult.Error)
          .to.be.a('string')
          .that.includes('Item-Index tag is required')

        const badItemIndexResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Remove-Item' },
            { name: 'Item-Index', value: 'ttttttttt' }
          ]
        })

        expect(badItemIndexResult.Error)
          .to.be.a('string')
          .that.includes('Invalid Item-Index')

        const outOfBoundsIndexResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Remove-Item' },
            { name: 'Item-Index', value: '5' }
          ]
        })

        expect(outOfBoundsIndexResult.Error)
          .to.be.a('string')
          .that.includes('Invalid Item-Index')
      })
    })

    describe('Setting', () => {
      it('Allows Owner to set items (from tags)', async () => {
        const items = [ 'one', 'two', 'three' ]
        const result = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Set-Items' },
            { name: 'Items', value: JSON.stringify(items) }
          ]
        })

        expect(result.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(result.Messages[0].Data)
          .to.be.a('string')
          .that.equals(items.length.toString())

        const listResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'List-Items' }
          ]
        })

        expect(listResult.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(listResult.Messages[0].Data)
          .to.be.a('string')
          .that.equals(JSON.stringify(items))
      })

      it('Allows Owner to set items (from data)', async () => {
        const items = [ 'one', 'two', 'three' ]
        const result = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Set-Items' }
          ],
          Data: JSON.stringify({ items })
        })

        expect(result.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(result.Messages[0].Data)
          .to.be.a('string')
          .that.equals(items.length.toString())

        const listResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'List-Items' }
          ]
        })

        expect(listResult.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(listResult.Messages[0].Data)
          .to.be.a('string')
          .that.equals(JSON.stringify(items))
      })

      it('Prevents anyone else from setting items', async () => {
        const result = await handle({
          From: ALICE_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Set-Items' },
            { name: 'Items', value: '2' }
          ]
        })
  
        expect(result.Error)
          .to.be.a('string')
          .that.includes('This action is only available to the process Owner')
      })

      it('Validates when setting items', async () => {
        const noItemsResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [{ name: 'Action', value: 'Set-Items' }]
        })

        expect(noItemsResult.Error)
          .to.be.a('string')
          .that.includes('Items required')

        const badItemsFromTagsResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Set-Items' },
            { name: 'Items', value: '3' }
          ]
        })

        expect(badItemsFromTagsResult.Error)
          .to.be.a('string')
          .that.includes('Items required')

        const badItemsFromDataResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [{ name: 'Action', value: 'Set-Items' }],
          Data: '3'
        })

        expect(badItemsFromDataResult.Error)
          .to.be.a('string')
          .that.includes('Items required')
      })

      it('Deploys with list of items from spawn (eval?) data')
      it('Deploys with list of items from spawn (eval?) tags')
    })

    describe('Hiding', () => {
      it('Allows Owner to hide items', async () => {
        const items = [ 'one', 'two', 'three' ]
        await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Set-Items' },
            { name: 'Items', value: JSON.stringify(items) }
          ]
        })
        const itemIndex = 1
        const itemIndexString = (itemIndex + 1).toString()

        const result = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Hide-Item' },
            { name: 'Item-Index', value: itemIndexString }
          ]
        })

        expect(result.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(result.Messages[0].Data)
          .to.be.a('string')
          .that.equals(items[itemIndex])

        const listResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'List-Items' }
          ]
        })

        expect(listResult.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(listResult.Messages[0].Data)
          .to.be.a('string')
          .that.equals(
            JSON.stringify(items.filter((_,idx) => idx !== itemIndex))
          )
      })

      it('Prevents anyone else from hiding items', async () => {
        const result = await handle({
          From: ALICE_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Hide-Item' },
            { name: 'Item-Index', value: '2' }
          ]
        })
  
        expect(result.Error)
          .to.be.a('string')
          .that.includes('This action is only available to the process Owner')
      })

      it('Validates when hiding items', async () => {
        const items = [ 'one', 'two', 'three' ]
        for (const item of items) {
          await handle({
            From: OWNER_ADDRESS,
            Tags: [
              { name: 'Action', value: 'Add-Item' },
              { name: 'Item', value: item }
            ]
          })
        }

        const noItemIndexResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Hide-Item' }
          ]
        })

        expect(noItemIndexResult.Error)
          .to.be.a('string')
          .that.includes('Item-Index tag is required')

        const badItemIndexResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Hide-Item' },
            { name: 'Item-Index', value: 'ttttttttt' }
          ]
        })

        expect(badItemIndexResult.Error)
          .to.be.a('string')
          .that.includes('Invalid Item-Index')

        const outOfBoundsIndexResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Hide-Item' },
            { name: 'Item-Index', value: '5' }
          ]
        })

        expect(outOfBoundsIndexResult.Error)
          .to.be.a('string')
          .that.includes('Invalid Item-Index')
      })
    })

    describe('Unhiding', () => {
      it('Allows Owner to unhide items', async () => {
        const items = [ 'one', 'two', 'three' ]
        await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Set-Items' },
            { name: 'Items', value: JSON.stringify(items) }
          ]
        })
        const itemIndex = 1
        const itemIndexString = (itemIndex + 1).toString()

        await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Hide-Item' },
            { name: 'Item-Index', value: itemIndexString }
          ]
        })

        const result = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Unhide-Item' },
            { name: 'Item-Index', value: itemIndexString }
          ]
        })

        expect(result.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(result.Messages[0].Data)
          .to.be.a('string')
          .that.equals(items[itemIndex])

        const listResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'List-Items' }
          ]
        })

        expect(listResult.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(listResult.Messages[0].Data)
          .to.be.a('string')
          .that.equals(JSON.stringify(items))
      })

      it('Prevents anyone else from unhiding items', async () => {
        const result = await handle({
          From: ALICE_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Unhide-Item' },
            { name: 'Item-Index', value: '2' }
          ]
        })
  
        expect(result.Error)
          .to.be.a('string')
          .that.includes('This action is only available to the process Owner')
      })

      it('Validates when unhiding items', async () => {
        const items = [ 'one', 'two', 'three' ]
        for (const item of items) {
          await handle({
            From: OWNER_ADDRESS,
            Tags: [
              { name: 'Action', value: 'Add-Item' },
              { name: 'Item', value: item }
            ]
          })
        }

        const noItemIndexResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Unhide-Item' }
          ]
        })

        expect(noItemIndexResult.Error)
          .to.be.a('string')
          .that.includes('Item-Index tag is required')

        const badItemIndexResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Unhide-Item' },
            { name: 'Item-Index', value: 'ttttttttt' }
          ]
        })

        expect(badItemIndexResult.Error)
          .to.be.a('string')
          .that.includes('Invalid Item-Index')

        const outOfBoundsIndexResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Unhide-Item' },
            { name: 'Item-Index', value: '5' }
          ]
        })

        expect(outOfBoundsIndexResult.Error)
          .to.be.a('string')
          .that.includes('Invalid Item-Index')
      })
    })
  })

  describe('Following', () => {
    describe('Following', () => {
      it('Allows Owner to follow an address', async () => {
        const result = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Follow' },
            { name: 'Follow-Address', value: ALICE_ADDRESS }
          ]
        })

        expect(result.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(result.Messages[0].Data).to.equal(ALICE_ADDRESS)
      })
  
      it('Prevents anyone else from following an address', async () => {
        const result = await handle({
          From: ALICE_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Follow' },
            { name: 'Follow-Address', value: ALICE_ADDRESS }
          ]
        })

        expect(result.Error)
          .to.be.a('string')
          .that.includes('This action is only available to the process Owner')
      })
  
      it('Validates when following an address', async () => {
        const result = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Follow' }
          ]
        })
  
        expect(result.Error)
          .to.be.a('string')
          .that.includes('Follow-Address tag is required')
      })
    })
  
    describe('Unfollowing', () => {
      it('Allows Owner to unfollow an address', async () => {
        const addresses = [ ALICE_ADDRESS, BOB_ADDRESS, CHARLS_ADDRESS ]
        for (const address of addresses) {
          await handle({
            From: OWNER_ADDRESS,
            Tags: [
              { name: 'Action', value: 'Follow' },
              { name: 'Follow-Address', value: address }
            ]
          })
        }
  
        const result = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Unfollow' },
            { name: 'Unfollow-Address', value: BOB_ADDRESS }
          ]
        })
  
        expect(result.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(result.Messages[0].Data).to.equal(BOB_ADDRESS)
      })
  
      it('Prevents anyone else from unfollowing an address', async () => {
        const result = await handle({
          From: ALICE_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Unfollow' },
            { name: 'Unfollow-Address', value: ALICE_ADDRESS }
          ]
        })
  
        expect(result.Error)
          .to.be.a('string')
          .that.includes('This action is only available to the process Owner')
      })
  
      it('Validates when unfollowing an address', async () => {
        const result = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Unfollow' }
          ]
        })
  
        expect(result.Error)
          .to.be.a('string')
          .that.includes('Unfollow-Address tag is required')
      })
    })
  
    describe('List following', () => {
      it('Allows anyone to list followed addresses', async () => {
        const addresses = [ ALICE_ADDRESS, BOB_ADDRESS, CHARLS_ADDRESS ]
        for (const address of addresses) {
          await handle({
            From: OWNER_ADDRESS,
            Tags: [
              { name: 'Action', value: 'Follow' },
              { name: 'Follow-Address', value: address }
            ]
          })
        }
  
        const result = await handle({
          From: OWNER_ADDRESS,
          Tags: [{ name: 'Action', value: 'Get-Following' }]
        })
  
        expect(result.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(JSON.parse(result.Messages[0].Data).sort())
          .to.deep.equal(addresses)
      })
    })
  })

  describe('Ownable', () => {
    it('Allows anyone to get Owner', async () => {
      const result = await handle({
        From: ALICE_ADDRESS,
        Tags: [{ name: 'Action', value: 'Get-Owner' }]
      })

      expect(result.Messages)
        .to.be.an('array')
        .that.is.not.empty
      expect(result.Messages[0].Data).to.equal(OWNER_ADDRESS)
    })

    it('Allow transfer of Owner', async () => {
      const transferOwnerResult = await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Transfer-Owner' },
          { name: 'New-Owner', value: ALICE_ADDRESS }
        ]
      })

      expect(transferOwnerResult.Messages)
        .to.be.an('array')
        .that.is.not.empty
      expect(transferOwnerResult.Messages[0].Data).to.equal(ALICE_ADDRESS)

      const getOwnerResult = await handle({
        From: ALICE_ADDRESS,
        Tags: [{ name: 'Action', value: 'Get-Owner' }]
      })

      expect(getOwnerResult.Messages)
        .to.be.an('array')
        .that.is.not.empty
      expect(getOwnerResult.Messages[0].Data).to.equal(ALICE_ADDRESS)
    })

    it('Prevents anyone else from transferring Owner', async () => {
      const result = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Transfer-Owner' },
          { name: 'New-Owner', value: ALICE_ADDRESS }
        ]
      })

      expect(result.Error)
        .to.be.a('string')
        .that.includes('This action is only available to the process Owner')
    })

    it('Validates when transferring Owner', async () => {
      const result = await handle({
        From: OWNER_ADDRESS,
        Tags: [{ name: 'Action', value: 'Transfer-Owner' }]
      })

      expect(result.Error)
        .to.be.a('string')
        .that.includes('New-Owner tag is required')
    })

    it('Allows new Owner control', async () => {
      await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Transfer-Owner' },
          { name: 'New-Owner', value: ALICE_ADDRESS }
        ]
      })

      const aliceTitle = 'alice title'
      const setTitleResult = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Set-Title' },
          { name: 'Title', value: aliceTitle }
        ]
      })

      expect(setTitleResult.Messages)
        .to.be.an('array')
        .that.is.not.empty
      expect(setTitleResult.Messages[0].Data).to.equal(aliceTitle)

      const aliceMetadata = { description: 'alice description' }
      const aliceMetadataString = JSON.stringify(aliceMetadata)
      const setMetadataResult = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Set-Metadata' }
        ],
        Data: aliceMetadataString
      })

      expect(setMetadataResult.Messages)
        .to.be.an('array')
        .that.is.not.empty
      expect(setMetadataResult.Messages[0].Data).to.equal(aliceMetadataString)

      const aliceItem = 'fancy pants yancy'
      const addItemResult = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Add-Item' },
          { name: 'Item', value: aliceItem }
        ]
      })

      expect(addItemResult.Messages)
        .to.be.an('array')
        .that.is.not.empty
      expect(addItemResult.Messages[0].Data)
        .to.be.a('string')
        .that.equals(aliceItem)

      const removeItemResult = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Remove-Item' },
          { name: 'Item-Index', value: '1' }
        ]
      })

      expect(removeItemResult.Messages)
        .to.be.an('array')
        .that.is.not.empty
      expect(removeItemResult.Messages[0].Data)
        .to.be.a('string')
        .that.equals(aliceItem)

      const aliceItems = [ 'one', 'two', 'three' ]
      const result = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Set-Items' },
          { name: 'Items', value: JSON.stringify(aliceItems) }
        ]
      })

      expect(result.Messages)
        .to.be.an('array')
        .that.is.not.empty
      expect(result.Messages[0].Data)
        .to.be.a('string')
        .that.equals(aliceItems.length.toString())

      const hideItemIndex = 1
      const hideItemIndexString = (hideItemIndex + 1).toString()
      const hideItemResult = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Hide-Item' },
          { name: 'Item-Index', value: hideItemIndexString }
        ]
      })

      expect(hideItemResult.Messages)
        .to.be.an('array')
        .that.is.not.empty
      expect(hideItemResult.Messages[0].Data)
        .to.be.a('string')
        .that.equals(aliceItems[hideItemIndex])

      const unhideItemResult = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Unhide-Item' },
          { name: 'Item-Index', value: hideItemIndexString }
        ]
      })

      expect(unhideItemResult.Messages)
        .to.be.an('array')
        .that.is.not.empty
      expect(unhideItemResult.Messages[0].Data)
        .to.be.a('string')
        .that.equals(aliceItems[hideItemIndex])

      const followResult = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Follow' },
          { name: 'Follow-Address', value: CHARLS_ADDRESS }
        ]
      })

      expect(followResult.Messages)
        .to.be.an('array')
        .that.is.not.empty
      expect(followResult.Messages[0].Data).to.equal(CHARLS_ADDRESS)

      await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Follow' },
          { name: 'Follow-Address', value: BOB_ADDRESS }
        ]
      })
      const unfollowResult = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Unfollow' },
          { name: 'Unfollow-Address', value: BOB_ADDRESS }
        ]
      })

      expect(unfollowResult.Messages)
        .to.be.an('array')
        .that.is.not.empty
      expect(unfollowResult.Messages[0].Data).to.equal(BOB_ADDRESS)

      const transferOwnerResult = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Transfer-Owner' },
          { name: 'New-Owner', value: BOB_ADDRESS }
        ]
      })

      expect(transferOwnerResult.Messages)
        .to.be.an('array')
        .that.is.not.empty
      expect(transferOwnerResult.Messages[0].Data).to.equal(BOB_ADDRESS)
    })

    it('Prevents process owner control after transfer', async () => {
      await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Transfer-Owner' },
          { name: 'New-Owner', value: ALICE_ADDRESS }
        ]
      })

      const setTitleResult = await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Set-Title' },
          { name: 'Title', value: 'new title' }
        ]
      })

      expect(setTitleResult.Error)
        .to.be.a('string')
        .that.includes('This action is only available to the process Owner')

      const setMetadataResult = await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Set-Metadata' }
        ],
        Data: JSON.stringify({ description: 'new description' })
      })

      expect(setMetadataResult.Error)
        .to.be.a('string')
        .that.includes('This action is only available to the process Owner')

      const addItemResult = await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Add-Item' },
          { name: 'Item', value: 'item' }
        ]
      })

      expect(addItemResult.Error)
        .to.be.a('string')
        .that.includes('This action is only available to the process Owner')

      const removeItemResult = await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Remove-Item' },
          { name: 'Item-Index', value: '1' }
        ]
      })

      expect(removeItemResult.Error)
        .to.be.a('string')
        .that.includes('This action is only available to the process Owner')

      const setItemsResult = await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Set-Items' },
          { name: 'Items', value: JSON.stringify(['one']) }
        ]
      })

      expect(setItemsResult.Error)
        .to.be.a('string')
        .that.includes('This action is only available to the process Owner')

      const hideItemResult = await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Hide-Item' },
          { name: 'Item-Index', value: '2' }
        ]
      })

      expect(hideItemResult.Error)
        .to.be.a('string')
        .that.includes('This action is only available to the process Owner')

      const unhideItemResult = await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Unhide-Item' },
          { name: 'Item-Index', value: '2' }
        ]
      })

      expect(unhideItemResult.Error)
        .to.be.a('string')
        .that.includes('This action is only available to the process Owner')

      const followResult = await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Follow' },
          { name: 'Follow-Address', value: ALICE_ADDRESS }
        ]
      })

      expect(followResult.Error)
        .to.be.a('string')
        .that.includes('This action is only available to the process Owner')

      const unfollowResult = await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Unfollow' },
          { name: 'Unfollow-Address', value: ALICE_ADDRESS }
        ]
      })

      expect(unfollowResult.Error)
        .to.be.a('string')
        .that.includes('This action is only available to the process Owner')

      const transferOwnerResult = await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Transfer-Owner' },
          { name: 'New-Owner', value: OWNER_ADDRESS }
        ]
      })

      expect(transferOwnerResult.Error)
        .to.be.a('string')
        .that.includes('This action is only available to the process Owner')
    })
  })
})
