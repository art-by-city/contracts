import 'mocha'
import { expect } from 'chai'

import { Interaction } from '../../../src/util'
import {
  FollowingState,
  WithFollowing
} from '../../../src/interfaces/following'

const OWNER = '0xOWNER'
const ALICE = '0xALICE'
const BOB = '0xBOB'

describe('Following Interface', () => {
  context('follow()', () => {
    it('should follow addresses', () => {
      const FollowingContract = WithFollowing(Object)
      const contract = new FollowingContract()
      const initialState: FollowingState = { following: [] }
      const interaction: Interaction = {
        caller: OWNER,
        input: {
          function: 'follow',
          address: ALICE
        }
      }
  
      const { state } = contract.follow(initialState, interaction)
  
      expect(state.following).to.include(ALICE)
    })

    it('should require followed addresses to be strings', () => {
      const FollowingContract = WithFollowing(Object)
      const contract = new FollowingContract()
      const initialState: FollowingState = { following: [] }
      const interaction: Interaction = {
        caller: OWNER,
        input: {
          function: 'follow'
        }
      }

      expect(() => contract.follow(initialState, interaction)).to.throw()
    })

    it('should require followed addresses to be unique', () => {
      const FollowingContract = WithFollowing(Object)
      const contract = new FollowingContract()
      const initialState: FollowingState = { following: [ ALICE ] }
      const interaction: Interaction = {
        caller: OWNER,
        input: {
          function: 'follow',
          address: ALICE
        }
      }

      expect(() => contract.follow(initialState, interaction)).to.throw()
    })
  })

  context('unfollow()', () => {
    it('should unfollow addresses', () => {
      const FollowingContract = WithFollowing(Object)
      const contract = new FollowingContract()
      const initialState: FollowingState = { following: [ ALICE, BOB ] }
      const interaction: Interaction = {
        caller: OWNER,
        input: {
          function: 'unfollow',
          address: ALICE
        }
      }
  
      const { state } = contract.unfollow(initialState, interaction)
  
      expect(state.following).to.not.include(ALICE)
      expect(state.following).to.include(BOB)
    })

    it('should require unfollowed addresses to be strings', () => {
      const FollowingContract = WithFollowing(Object)
      const contract = new FollowingContract()
      const initialState: FollowingState = { following: [ ALICE, BOB ] }
      const interaction: Interaction = {
        caller: OWNER,
        input: {
          function: 'unfollow'
        }
      }
  
      expect(() => contract.unfollow(initialState, interaction)).to.throw()
    })

    it('should require unfollowed addresses to exist', () => {
      const FollowingContract = WithFollowing(Object)
      const contract = new FollowingContract()
      const initialState: FollowingState = { following: [] }
      const interaction: Interaction = {
        caller: OWNER,
        input: {
          function: 'unfollow',
          address: ALICE
        }
      }
  
      expect(() => contract.unfollow(initialState, interaction)).to.throw()
    })
  })

  context('following()', () => {
    it('provides view of followed addresses', () => {
      const FollowingContract = WithFollowing(Object)
      const contract = new FollowingContract()
      const initialState: FollowingState = { following: [ ALICE, BOB ] }

      const { result: following } = contract.following(initialState)

      expect(following).to.have.length(2)
      expect(following).to.include(ALICE)
      expect(following).to.include(BOB)
    })
  })
})
