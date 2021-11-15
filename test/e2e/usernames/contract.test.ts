import fs from 'fs/promises'
import path from 'path'
import ArLocal from 'arlocal'
import Arweave from 'arweave'
import { JWKInterface } from 'arweave/node/lib/wallet'
import {
  Contract,
  LoggerFactory,
  SmartWeave,
  SmartWeaveNodeFactory
} from 'redstone-smartweave'

import { UsernamesContractState } from '../../../src/usernames/contract'
import { expect } from 'chai'

const ARLOCAL_PORT = Number.parseInt(process.env.ARLOCAL_PORT || '1984')

describe('usernames contract', () => {
  let arlocal: ArLocal,
      arweave: Arweave,
      smartweave: SmartWeave,
      wallet: JWKInterface,
      walletAddress: string,
      contract: Contract<UsernamesContractState>

  async function mine() {
    await arweave.api.get('mine')
  }

  beforeEach('reset test environment', async () => {
    arlocal = new ArLocal(ARLOCAL_PORT, false)
    await arlocal.start()

    arweave = Arweave.init({
      host: 'localhost',
      port: ARLOCAL_PORT,
      protocol: 'http'
    })

    LoggerFactory.INST.logLevel('error')

    smartweave = SmartWeaveNodeFactory.memCached(arweave)

    wallet = await arweave.wallets.generate()
    walletAddress = await arweave.wallets.jwkToAddress(wallet)

    const contractSrc = await fs.readFile(
      path.join(__dirname, '../../../dist/usernames/contract.js')
    )
    const initialState = await fs.readFile(
      path.join(__dirname, '../../../src/usernames/state.json')
    )

    const contractTxId = await smartweave.createContract.deploy({
      wallet,
      initState: initialState.toString(),
      src: contractSrc.toString()
    })

    contract = smartweave.contract<UsernamesContractState>(contractTxId)
    contract.connect(wallet)

    await mine()
  })

  afterEach(async () => {
    await arlocal.stop()
  })

  it('should read state', async () => {
    const { state } = await contract.readState()

    expect(state.usernames).to.be.empty
  })
})
