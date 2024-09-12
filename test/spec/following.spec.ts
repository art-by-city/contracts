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

const followingContractSource = readFileSync(
  join(resolve(), './dist/following.lua'),
  'utf-8',
)

describe('Following', () => {
  let originalHandle: FullAOHandleFunction
  let memory: ArrayBuffer

  beforeEach(async () => {
    const loader = await createLoader(followingContractSource)
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

  describe('Follow', () => {
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

  describe('Unfollow', () => {
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
