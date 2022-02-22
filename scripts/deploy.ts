import 'dotenv/config'
import fs from 'fs/promises'
import Arweave from 'arweave'

const arweave = new Arweave({
  protocol: process.env.ARWEAVE_PROTOCOL || 'http',
  host: process.env.ARWEAVE_HOST || 'localhost',
  port: process.env.ARWEAVE_PORT || 1984
})

const APP_NAME = process.env.APP_NAME || 'ArtByCity-Development'
const APP_VERSION = process.env.APP_VERSION || 'development'

async function deployContract(name: string) {
  // Read wallet file, path from environment
  const wallet = JSON.parse(
    (await fs.readFile(process.env.DEPLOYER_KEYFILE || 'no-keyfile')).toString()
  )

  // Read contract source JS file
  const contractSourceJS = await fs.readFile(
    `dist/${name}/contract.js`
  )

  // Read initial state JSON file
  const initialStateJSON = await fs.readFile(`src/${name}/state.json`)

  // Create contract tx
  const contractTx = await arweave.createTransaction(
    { data: contractSourceJS },
    wallet
  )
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
  initialStateTx.addTag('App-Name', APP_NAME)
  initialStateTx.addTag('App-Version', APP_VERSION)
  initialStateTx.addTag('Content-Type', 'application/json')
  initialStateTx.addTag('Contract-Src', contractTxId)
  initialStateTx.addTag('Contract-Name', `${name}`)

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
    await deployContract('usernames')
  } catch (error) {
    console.error(error)
  }
})()
