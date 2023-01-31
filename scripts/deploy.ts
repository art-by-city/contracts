import 'dotenv/config'
import fs from 'fs/promises'
import Arweave from 'arweave'
import { JWKInterface } from 'arweave/node/lib/wallet'
import minimist from 'minimist'
import { defaultCacheOptions, Tags, Warp, WarpFactory } from 'warp-contracts'

const arweaveConfig = {
  protocol: process.env.ARWEAVE_PROTOCOL || 'http',
  host: process.env.ARWEAVE_HOST || 'localhost',
  port: process.env.ARWEAVE_PORT || 1984
}

const arweave = new Arweave(arweaveConfig)
let warp: Warp
if (arweaveConfig.protocol === 'https') {
  warp = WarpFactory.forMainnet({
    ...defaultCacheOptions,
    inMemory: true
  })
} else {
  warp = WarpFactory.forLocal()
}
const APP_NAME = process.env.APP_NAME || 'ArtByCity-Development'
const APP_VERSION = process.env.APP_VERSION || 'development'

export async function deployWarpContract(
  contractPath: string,
  contractName: string,
  wallet: JWKInterface,
  deployOnly: boolean = false,
  initialState?: any
) {
  const src = (await fs.readFile(contractPath)).toString()
  const initState = JSON.stringify(initialState)
  const tags: Tags = [
    { name: 'Protocol', value: 'ArtByCity' },
    { name: 'App-Name', value: APP_NAME },
    { name: 'App-Version', value: APP_VERSION },
    { name: 'Contract-Name', value: contractName }
  ]

  console.log(`Deploying ${contractName} contract`)

  if (deployOnly) {
    const srcTx = await warp.createSourceTx({ src }, wallet)

    for (let i = 0; i < tags.length; i++) {
      const { name, value } = tags[i]
      srcTx.addTag(name, value)
    }

    // Sign contract tx
    await arweave.transactions.sign(srcTx, wallet)

    // Deploy contract tx
    await arweave.transactions.post(srcTx)

    console.log(`Deployed ${contractName} contract:`)
    console.log(`\tContract Source TXID: ${srcTx.id}`)

    return { srcTxId: srcTx.id }
  } else {
    const { contractTxId, srcTxId } = await warp.deploy({
      wallet,
      initState,
      src,
      tags
    }, true)

    console.log(`Deployed ${contractName} contract:`)
    console.log(`\tContract Source TXID: ${srcTxId}`)
    console.log(`\tInitial State TXID: ${contractTxId}`)

    return { contractTxId, srcTxId }
  }
}

export async function deployContract(
  contractName: string,
  keyfilePath: string,
  deployOnly: boolean = false
) {
  if (!contractName) {
    throw new Error('No contract specified')
  }

  if (!keyfilePath) {
    throw new Error('No deployer keyfile specified')
  }

  // Read wallet file, path from environment
  const wallet = JSON.parse((await fs.readFile(keyfilePath)).toString())

  // Read contract source JS file
  const contractSourceJS = await fs.readFile(
    `dist/contracts/${contractName}/contract.js`
  )

  // Read initial state JSON file if initializing
  let initialStateJSON: Buffer | null = null
  if (!deployOnly) {
    initialStateJSON = await fs.readFile(
      `src/contracts/${contractName}/state.json`
    )
  }

  // Create contract tx
  const contractTx = await arweave.createTransaction(
    { data: contractSourceJS },
    wallet
  )
  contractTx.addTag('Protocol', 'ArtByCity')
  contractTx.addTag('App-Name', APP_NAME)
  contractTx.addTag('App-Version', APP_VERSION)
  contractTx.addTag('Content-Type', 'application/javascript')

  // Sign contract tx
  await arweave.transactions.sign(contractTx, wallet)
  const contractTxId = contractTx.id

  // Deploy contract tx
  await arweave.transactions.post(contractTx)

  console.log('Contract TX ID', contractTxId)

  if (!deployOnly && initialStateJSON) {
    // Create initial state tx
    const initialStateTx = await arweave.createTransaction(
      { data: initialStateJSON },
      wallet
    )
    initialStateTx.addTag('Protocol', 'ArtByCity')
    initialStateTx.addTag('App-Name', APP_NAME)
    initialStateTx.addTag('App-Version', APP_VERSION)
    initialStateTx.addTag('Content-Type', 'application/json')
    initialStateTx.addTag('Contract-Src', contractTxId)
    initialStateTx.addTag('Contract-Name', `${contractName}`)

    // Sign initial state tx
    await arweave.transactions.sign(initialStateTx, wallet)
    const initialStateTxId = initialStateTx.id

    // Deploy initial state tx
    await arweave.transactions.post(initialStateTx)

    console.log('Initial State TX ID', initialStateTxId)
  }
}

(async () => {
  try {
    const args = minimist(process.argv.slice(2))
    const contractName = args._[0]
      || args.c
      || args.contract
      || process.env.CONTRACT
    const contractPath = args._[1]
      || args.p
      || args['contract-path']
      || process.env.CONTRACT_PATH
    const keyfilePath = args._[2]
      || args.k
      || args.keyfile
      || process.env.KEYFILE
    const deployOnly = args._[3]
      || args.d
      || args.deploy
      || process.env.DEPLOY_ONLY === 'true'

    const wallet = JSON.parse((await fs.readFile(keyfilePath)).toString())
    await deployWarpContract(contractPath, contractName, wallet, deployOnly)
  } catch (error) {
    console.error(error)
  }
})()
