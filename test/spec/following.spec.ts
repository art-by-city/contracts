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

describe('Following Contract', () => {
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

    it('Allows Follow action with permission', async () => {
      const doesNotHaveRoleYetResult = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Follow' },
          { name: 'Follow-Address', value: BOB_ADDRESS }
        ]
      })
      expect(doesNotHaveRoleYetResult.Error)
        .to.be.a('string')
        .that.includes('This action is only available to the process Owner')

      await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Grant-Role' },
          { name: 'Grant-To-Address', value: ALICE_ADDRESS },
          { name: 'Role', value: 'follow' }
        ]
      })

      const hasRoleNowResult = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Follow' },
          { name: 'Follow-Address', value: BOB_ADDRESS }
        ]
      })

      expect(hasRoleNowResult.Messages)
        .to.be.an('array')
        .that.is.not.empty
      expect(hasRoleNowResult.Messages[0].Data).to.equal(BOB_ADDRESS)
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

    it('Allows Unfollow action with permission', async () => {
      const doesNotHaveRoleYetResult = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Unfollow' },
          { name: 'Unfollow-Address', value: BOB_ADDRESS }
        ]
      })
      expect(doesNotHaveRoleYetResult.Error)
        .to.be.a('string')
        .that.includes('This action is only available to the process Owner')

      await handle({
        From: OWNER_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Grant-Role' },
          { name: 'Grant-To-Address', value: ALICE_ADDRESS },
          { name: 'Role', value: 'unfollow' }
        ]
      })

      const hasRoleNowResult = await handle({
        From: ALICE_ADDRESS,
        Tags: [
          { name: 'Action', value: 'Unfollow' },
          { name: 'Unfollow-Address', value: BOB_ADDRESS }
        ]
      })

      expect(hasRoleNowResult.Messages)
        .to.be.an('array')
        .that.is.not.empty
      expect(hasRoleNowResult.Messages[0].Data).to.equal(BOB_ADDRESS)
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

  describe('ACL', () => {
    describe('Adding roles', () => {
      it('Allows Owner to add roles', async () => {
        const role = 'admin'
        const result = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Add-Role' },
            { name: 'Role', value: role }
          ]
        })
  
        expect(result.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(result.Messages[0].Data).to.equal(role)
      })

      it('Prevents anyone else from adding roles', async () => {
        const result = await handle({
          From: ALICE_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Add-Role' },
            { name: 'Role', value: 'admin' }
          ]
        })
  
        expect(result.Error)
          .to.be.a('string')
          .that.includes('This action is only available to the process Owner')
      })

      it('Validates when adding roles', async () => {
        const noRoleResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [{ name: 'Action', value: 'Add-Role' }]
        })

        expect(noRoleResult.Error)
          .to.be.a('string')
          .that.includes('Role tag is required')
      })

      it('Allows adding roles with permission', async () => {
        const role = 'new-role'
        const doesNotHaveRoleYetResult = await handle({
          From: ALICE_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Add-Role' },
            { name: 'Role', value: role }
          ]
        })
        expect(doesNotHaveRoleYetResult.Error)
          .to.be.a('string')
          .that.includes('This action is only available to the process Owner')
  
        await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Grant-Role' },
            { name: 'Grant-To-Address', value: ALICE_ADDRESS },
            { name: 'Role', value: 'addRole' }
          ]
        })
  
        const hasRoleNowResult = await handle({
          From: ALICE_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Add-Role' },
            { name: 'Role', value: role }
          ]
        })
  
        expect(hasRoleNowResult.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(hasRoleNowResult.Messages[0].Data).to.equal(role)
      })
    })

    describe('Listing roles', () => {
      it('Allows anyone to list roles', async () => {
        const roles = [
          { role: 'admin', address: ALICE_ADDRESS },
          { role: 'clown', address: BOB_ADDRESS },
          { role: 'king', address: CHARLS_ADDRESS }
        ]
        for (const { role, address } of roles) {
          await handle({
            From: OWNER_ADDRESS,
            Tags: [
              { name: 'Action', value: 'Add-Role' },
              { name: 'Role', value: role }
            ]
          })

          const grantResult = await handle({
            From: OWNER_ADDRESS,
            Tags: [
              { name: 'Action', value: 'Grant-Role' },
              { name: 'Grant-To-Address', value: address },
              { name: 'Role', value: role }
            ]
          })
        }

        const result = await handle({
          From: ALICE_ADDRESS,
          Tags: [{ name: 'Action', value: 'List-Roles' }]
        })

        expect(result.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(JSON.parse(result.Messages[0].Data)).to.deep.equal({
          admin: { [ALICE_ADDRESS]: true },
          clown: { [BOB_ADDRESS]: true },
          king: { [CHARLS_ADDRESS]: true },
          addRole: [],
          follow: [],
          grantRole: [],
          removeRole: [],
          revokeRole: [],
          unfollow: []
        })
      })
    })

    describe('Removing roles', () => {
      it('Allows Owner to remove roles', async () => {
        const roles = [ 'admin', 'clown', 'king' ]
        for (const role of roles) {
          await handle({
            From: OWNER_ADDRESS,
            Tags: [
              { name: 'Action', value: 'Add-Role' },
              { name: 'Role', value: role }
            ]
          })
        }

        const result = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Remove-Role' },
            { name: 'Role', value: roles[1] }
          ]
        })

        expect(result.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(result.Messages[0].Data).to.equal(roles[1])

        const listResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [{ name: 'Action', value: 'List-Roles' }]
        })

        expect(listResult.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(JSON.parse(listResult.Messages[0].Data)).to.deep.equal({
          [roles[0]]: [],
          [roles[2]]: [],
          addRole: [],
          follow: [],
          grantRole: [],
          removeRole: [],
          revokeRole: [],
          unfollow: []
        })
      })

      it('Prevent anyone else from removing roles', async () => {
        const result = await handle({
          From: ALICE_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Remove-Role' },
            { name: 'Role', value: 'admin' }
          ]
        })
  
        expect(result.Error)
          .to.be.a('string')
          .that.includes('This action is only available to the process Owner')
      })

      it('Validates when removing roles', async () => {
        const noRoleResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [{ name: 'Action', value: 'Remove-Role' }]
        })

        expect(noRoleResult.Error)
          .to.be.a('string')
          .that.includes('Role tag is required')
      })

      it('Allows removing roles with permission', async () => {
        const role = 'new-role'
        await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Add-Role' },
            { name: 'Role', value: role }
          ]
        })

        const doesNotHaveRoleYetResult = await handle({
          From: ALICE_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Remove-Role' },
            { name: 'Role', value: role }
          ]
        })
        expect(doesNotHaveRoleYetResult.Error)
          .to.be.a('string')
          .that.includes('This action is only available to the process Owner')
  
        await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Grant-Role' },
            { name: 'Grant-To-Address', value: ALICE_ADDRESS },
            { name: 'Role', value: 'removeRole' }
          ]
        })
  
        const hasRoleNowResult = await handle({
          From: ALICE_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Remove-Role' },
            { name: 'Role', value: role }
          ]
        })
  
        expect(hasRoleNowResult.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(hasRoleNowResult.Messages[0].Data).to.equal(role)
      })
    })

    describe('Granting roles', () => {
      it('Allows Owner to grant roles', async () => {
        await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Add-Role' },
            { name: 'Role', value: 'admin' }
          ]
        })

        const result = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Grant-Role' },
            { name: 'Grant-To-Address', value: ALICE_ADDRESS },
            { name: 'Role', value: 'admin' }
          ]
        })

        expect(result.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(result.Messages[0].Data).to.equal(ALICE_ADDRESS)
      })

      it('Prevent anyone else from granting roles', async () => {
        const result = await handle({
          From: ALICE_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Grant-Role' },
            { name: 'Grant-To-Address', value: ALICE_ADDRESS },
            { name: 'Role', value: 'admin' }
          ]
        })

        expect(result.Error)
          .to.be.a('string')
          .that.includes('This action is only available to the process Owner')
      })

      it('Validates when granting roles', async () => {
        const role = 'admin'
        await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Add-Role' },
            { name: 'Role', value: role }
          ]
        })

        const noRoleResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Grant-Role' },
            { name: 'Grant-To-Address', value: ALICE_ADDRESS }
          ]
        })

        expect(noRoleResult.Error)
          .to.be.a('string')
          .that.includes('Role tag is required')

        const roleThatDoesNotExist = 'king'
        const roleDoesNotExistResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Grant-Role' },
            { name: 'Grant-To-Address', value: ALICE_ADDRESS },
            { name: 'Role', value: roleThatDoesNotExist }
          ]
        })

        expect(roleDoesNotExistResult.Error)
          .to.be.a('string')
          .that.includes(`Role ${roleThatDoesNotExist} does not exist`)

        const noAddressResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Grant-Role' },
            { name: 'Role', value: role }
          ]
        })

        expect(noAddressResult.Error)
          .to.be.a('string')
          .that.includes('Grant-To-Address tag is required')
      })

      it('Allows granting roles with permission', async () => {
        const role = 'new-role'
        await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Add-Role' },
            { name: 'Role', value: role }
          ]
        })

        const doesNotHaveRoleYetResult = await handle({
          From: ALICE_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Grant-Role' },
            { name: 'Grant-To-Address', value: BOB_ADDRESS },
            { name: 'Role', value: role }
          ]
        })
        expect(doesNotHaveRoleYetResult.Error)
          .to.be.a('string')
          .that.includes('This action is only available to the process Owner')
  
        await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Grant-Role' },
            { name: 'Grant-To-Address', value: ALICE_ADDRESS },
            { name: 'Role', value: 'grantRole' }
          ]
        })
  
        const hasRoleNowResult = await handle({
          From: ALICE_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Grant-Role' },
            { name: 'Grant-To-Address', value: BOB_ADDRESS },
            { name: 'Role', value: role }
          ]
        })

        expect(hasRoleNowResult.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(hasRoleNowResult.Messages[0].Data).to.equal(BOB_ADDRESS)
      })
    })

    describe('Revoking roles', () => {
      it('Allows Owner to revoke roles', async () => {
        const role = 'snarf'
        await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Add-Role' },
            { name: 'Role', value: role }
          ]
        })
        const addresses = [ ALICE_ADDRESS, BOB_ADDRESS, CHARLS_ADDRESS ]
        for (const address of addresses) {
          await handle({
            From: OWNER_ADDRESS,
            Tags: [
              { name: 'Action', value: 'Grant-Role' },
              { name: 'Grant-To-Address', value: address },
              { name: 'Role', value: role }
            ]
          })
        }

        const listBeforeRevokeResult = await handle({
          From: ALICE_ADDRESS,
          Tags: [{ name: 'Action', value: 'List-Roles' }]
        })

        expect(listBeforeRevokeResult.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(
          JSON.parse(listBeforeRevokeResult.Messages[0].Data)
        ).to.deep.equal({
          [role]: {
            [ALICE_ADDRESS]: true,
            [BOB_ADDRESS]: true,
            [CHARLS_ADDRESS]: true
          },
          addRole: [],
          follow: [],
          grantRole: [],
          removeRole: [],
          revokeRole: [],
          unfollow: []
        })

        const revokeResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Revoke-Role' },
            { name: 'Revoke-From-Address', value: BOB_ADDRESS },
            { name: 'Role', value: role }
          ]
        })

        expect(revokeResult.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(revokeResult.Messages[0].Data).to.equal(BOB_ADDRESS)

        const listAfterRevokeResult = await handle({
          From: ALICE_ADDRESS,
          Tags: [{ name: 'Action', value: 'List-Roles' }]
        })

        expect(listAfterRevokeResult.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(
          JSON.parse(listAfterRevokeResult.Messages[0].Data)
        ).to.deep.equal({
          [role]: {
            [ALICE_ADDRESS]: true,
            [CHARLS_ADDRESS]: true
          },
          addRole: [],
          follow: [],
          grantRole: [],
          removeRole: [],
          revokeRole: [],
          unfollow: []
        })
      })

      it('Prevent anyone else from revoking roles', async () => {
        const role = 'snarf'
        await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Add-Role' },
            { name: 'Role', value: role }
          ]
        })
        const addresses = [ ALICE_ADDRESS, BOB_ADDRESS, CHARLS_ADDRESS ]
        for (const address of addresses) {
          await handle({
            From: OWNER_ADDRESS,
            Tags: [
              { name: 'Action', value: 'Grant-Role' },
              { name: 'Grant-To-Address', value: address },
              { name: 'Role', value: role }
            ]
          })
        }

        const result = await handle({
          From: ALICE_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Revoke-Role' },
            { name: 'Role', value: role }
          ]
        })
  
        expect(result.Error)
          .to.be.a('string')
          .that.includes('This action is only available to the process Owner')
      })

      it('Validates when revoking roles', async () => {
        await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Add-Role' },
            { name: 'Role', value: 'admin' }
          ]
        })

        const missingRoleResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Revoke-Role' },
            { name: 'Revoke-From-Address', value: BOB_ADDRESS }
          ]
        })
        expect(missingRoleResult.Error)
          .to.be.a('string')
          .that.includes('Role tag is required')

        const missingAddressResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Revoke-Role' },
            { name: 'Role', value: 'admin' }
          ]
        })
        expect(missingAddressResult.Error)
          .to.be.a('string')
          .that.includes('Revoke-From-Address tag is required')

        const unknownRoleResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Revoke-Role' },
            { name: 'Revoke-From-Address', value: BOB_ADDRESS },
            { name: 'Role', value: 'unknown' }
          ]
        })
        expect(unknownRoleResult.Error)
          .to.be.a('string')
          .that.includes('Unknown Role')

        const addressDoesNotHaveRoleResult = await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Revoke-Role' },
            { name: 'Revoke-From-Address', value: BOB_ADDRESS },
            { name: 'Role', value: 'admin' }
          ]
        })
        expect(addressDoesNotHaveRoleResult.Error)
          .to.be.a('string')
          .that.includes('Address does not have Role')
      })

      it('Allows revoking roles with permission', async () => {
        await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Add-Role' },
            { name: 'Role', value: 'admin' }
          ]
        })
        await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Grant-Role' },
            { name: 'Grant-To-Address', value: BOB_ADDRESS },
            { name: 'Role', value: 'admin' }
          ]
        })

        const doesNotHaveRoleYetResult = await handle({
          From: ALICE_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Revoke-Role' },
            { name: 'Revoke-From-Address', value: BOB_ADDRESS },
            { name: 'Role', value: 'admin' }
          ]
        })
        expect(doesNotHaveRoleYetResult.Error)
          .to.be.a('string')
          .that.includes('This action is only available to the process Owner')

        await handle({
          From: OWNER_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Grant-Role' },
            { name: 'Grant-To-Address', value: ALICE_ADDRESS },
            { name: 'Role', value: 'revokeRole' }
          ]
        })

        const hasRoleNowResult = await handle({
          From: ALICE_ADDRESS,
          Tags: [
            { name: 'Action', value: 'Revoke-Role' },
            { name: 'Revoke-From-Address', value: BOB_ADDRESS },
            { name: 'Role', value: 'admin' }
          ]
        })
        expect(hasRoleNowResult.Messages)
          .to.be.an('array')
          .that.is.not.empty
        expect(hasRoleNowResult.Messages[0].Data).to.equal(BOB_ADDRESS)
      })
    })
  })
})
