import 'dotenv/config'
import fs from 'fs/promises'
import Arweave from 'arweave'
import minimist from 'minimist'

const arweaveConfig = {
  protocol: process.env.ARWEAVE_PROTOCOL || 'http',
  host: process.env.ARWEAVE_HOST || 'localhost',
  port: process.env.ARWEAVE_PORT || 1984
}

const arweave = new Arweave(arweaveConfig)

const APP_NAME = process.env.APP_NAME || 'ArtByCity-Development'
const APP_VERSION = process.env.APP_VERSION || 'development'

console.log('ARWEAVE CONFIG', arweaveConfig)

async function deployContract(contractName: string, keyfilePath: string) {
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
    `dist/${contractName}/contract.js`
  )

  // Read initial state JSON file
  const initialStateJSON = await fs.readFile(`src/${contractName}/state.json`)

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

  console.log('Contract TX ID', contractTxId)
  console.log('Initial State TX ID', initialStateTxId)
}

(async () => {
  try {
    const args = minimist(process.argv.slice(2))
    const contractName = args._[0]
      || args.c
      || args.contract
      || process.env.CONTRACT
    const keyfilePath = args._[1]
      || args.k
      || args.keyfile
      || process.env.KEYFILE

    await deployContract(contractName, keyfilePath)
  } catch (error) {
    console.error(error)
  }
})()
