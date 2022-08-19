import fs from 'fs/promises'
import path from 'path'
import ArLocal from 'arlocal'
import Arweave from 'arweave'
import { JWKInterface } from 'arweave/node/lib/wallet'
import {
  Contract,
  LoggerFactory,
  Warp,
  WarpNodeFactory
} from 'warp-contracts'

import { UsernamesContractState } from '../../../src/usernames/contract'
import { expect } from 'chai'

const ARLOCAL_PORT = Number.parseInt(process.env.ARLOCAL_PORT || '1984')

describe('usernames contract', function() {
  let arlocal: ArLocal,
      arweave: Arweave,
      smartweave: Warp,
      wallet: JWKInterface,
      walletAddress: string,
      anotherWallet: JWKInterface,
      anotherWalletAddress: string,
      contract: Contract<UsernamesContractState>,
      anotherContractHandle: Contract<UsernamesContractState>,
      contractSrc: string,
      initialStateJson: string,
      initialState: UsernamesContractState

  async function mine(blocks = 1) {
    await arweave.api.get(`mine/${blocks}`)
  }

  this.timeout(7000)

  before('set up environment', async () => {
    arlocal = new ArLocal(ARLOCAL_PORT, false)

    await arlocal.start()

    arweave = Arweave.init({
      host: 'localhost',
      port: ARLOCAL_PORT,
      protocol: 'http'
    })

    LoggerFactory.INST.logLevel('error')

    smartweave = WarpNodeFactory.forTesting(arweave)

    contractSrc = (await fs.readFile(
      path.join(__dirname, '../../../dist/usernames/contract.js')
    )).toString()

    initialStateJson = (await fs.readFile(
      path.join(__dirname, '../../../src/usernames/state.json')
    )).toString()
    initialState = JSON.parse(initialStateJson)
  })

  after('stop arlocal', async () => {
    if (arlocal) {
      await arlocal.stop()
    }
  })

  beforeEach('generate new wallets, deploy fresh contract', async () => {
    wallet = await arweave.wallets.generate()
    walletAddress = await arweave.wallets.jwkToAddress(wallet)
    await arweave.api.get(`/mint/${walletAddress}/184717954005648`)
    anotherWallet = await arweave.wallets.generate()
    anotherWalletAddress = await arweave.wallets.jwkToAddress(anotherWallet)
    await arweave.api.get(`/mint/${anotherWalletAddress}/184717954005648`)

    const { contractTxId } = await smartweave.createContract.deploy({
      wallet,
      initState: initialStateJson,
      src: contractSrc
    })

    contract = smartweave.contract<UsernamesContractState>(contractTxId)
    contract.connect(wallet)

    anotherContractHandle = smartweave.contract<UsernamesContractState>(
      contractTxId
    )
    anotherContractHandle.connect(anotherWallet)

    await mine()
  })

  it('should match initial state after deployment', async () => {
    const { state: { usernames } } = await contract.readState()

    expect(usernames).to.be.empty
  })

  it('should register usernames', async () => {
    const username = 'test'

    await contract.writeInteraction({ function: 'register', username })
    await mine()
    const { state: { usernames } } = await contract.readState()

    expect(usernames).to.not.be.empty
    expect(usernames[walletAddress]).to.equal(username)
  })

  it('should validate usernames', async () => {
    const username = 'TEST'

    await contract.writeInteraction({ function: 'register', username })
    await mine()

    const { state: { usernames } } = await contract.readState()
    expect(usernames).to.be.empty
  })

  it('should allow users to update their usernames', async () => {
    const username1 = 'test1'
    const username2 = 'test2'

    await contract.writeInteraction({
      function: 'register',
      username: username1
    })
    await mine()
    await contract.writeInteraction({
      function: 'register',
      username: username2
    }, undefined, undefined, true)
    // NB: test fails without forcing strict mode on above writeInteraction ?
    await mine()
    const { state: { usernames } } = await contract.readState()

    expect(usernames[walletAddress]).to.equal(username2)
  })

  it('should not allow a username to be registered twice', async () => {
    const username = 'test'

    await contract.writeInteraction({
      function: 'register',
      username
    })
    await mine()
    await anotherContractHandle.writeInteraction({
      function: 'register',
      username
    })
    await mine()
    const { state: { usernames } } = await contract.readState()

    expect(usernames[walletAddress]).to.equal(username)
    expect(usernames[anotherWalletAddress]).to.be.undefined
  })

  it('should release usernames', async () => {
    const username = 'test'

    await contract.writeInteraction({
      function: 'register',
      username
    })
    await mine()
    let { state: { usernames } } = await contract.readState()

    expect(usernames[walletAddress]).to.equal(username)

    await contract.writeInteraction({ function: 'release' })
    await mine()
    ;({ state: { usernames } } = await contract.readState())

    expect(usernames[walletAddress]).to.be.undefined
  })
})
