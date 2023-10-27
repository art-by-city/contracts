import 'dotenv/config'
import fs from 'fs/promises'
import Arweave from 'arweave'
import { JWKInterface } from 'arweave/node/lib/wallet'
import minimist from 'minimist'
import { DataItem } from 'warp-arbundles'
import {
  defaultCacheOptions, 
  Tag,
  Warp,
  WarpFactory
} from 'warp-contracts'
import { ArweaveSigner, DeployPlugin } from 'warp-contracts-plugin-deploy'

// const APP_NAME = process.env.APP_NAME || 'ArtByCity-Development'
// const APP_VERSION = process.env.APP_VERSION || 'development'
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

warp = warp.use(new DeployPlugin())

export async function deployWarpContract(
  contractPath: string,
  contractName: string,
  wallet: JWKInterface,
  contractVersion: string = '0.0.1',
  initState?: string
) {
  const src = (await fs.readFile(contractPath)).toString()
  const tags = [
    new Tag('Protocol', 'ArtByCity'),
    new Tag('Contract-Name', contractName),
    new Tag('Contract-Version', contractVersion)
  ]

  console.log(`Deploying contract ${contractName} @ ${contractVersion}`)

  if (!initState) {
    const signer = new ArweaveSigner(wallet)
    const source = await warp.createSource({ src }, signer) as DataItem    
    const deployedSourceId = await warp.saveSource(source)

    console.log(`Deployed contract ${contractName} @ ${contractVersion}`)
    console.log(`Contract Source TXID: ${deployedSourceId}`)

    return { srcTxId: source.id }
  } else {
    const signer = new ArweaveSigner(wallet)
    const { contractTxId, srcTxId } = await warp.deploy({
      wallet: signer,
      initState,
      src,
      tags
    })

    console.log(`Deployed contract ${contractName} @ ${contractVersion}`)
    console.log(`Contract Source TXID: ${srcTxId}`)
    console.log(`Initial State TXID: ${contractTxId}`)

    return { contractTxId, srcTxId }
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
    const contractVersion = args._[4]
      || args.v
      || args.version
      || process.env.CONTRACT_VERSION
    const initState = args._[5]
      || args.i
      || args.initState
      || process.env.INIT_STATE

    const wallet = JSON.parse((await fs.readFile(keyfilePath)).toString())
    const initialState = deployOnly
      ? undefined
      : (await fs.readFile(initState)).toString()
    await deployWarpContract(
      contractPath,
      contractName,
      wallet,
      contractVersion,
      initialState
    )
  } catch (error) {
    console.error(error)
  }
})()
