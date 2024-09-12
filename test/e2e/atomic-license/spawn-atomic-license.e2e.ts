import {
  createDataItemSigner,
  spawn as aoSpawn
} from '@permaweb/aoconnect'
import Arweave from 'arweave'
import { readFileSync } from 'fs'

import { sendAosMessage } from '../../util/send-aos-message'

const wallet = JSON.parse(readFileSync('./.secrets/key.json').toString())
const arweave = Arweave.init({
  host: 'frostor.xyz',
  port: 443,
  protocol: 'https'
})
const signer = createDataItemSigner(wallet)
const appName = '@artbycity/atomic-license'
const luaSourceTxId = 'Y5agjnLO_Sd2g1hZbAY9tGHI3OAaPQBkpCnTrSUkGow'
const AOS_MODULE_ID = 'cbn0KKrBZH7hdNkNokuXLtGryrWM--PjSTBqIzw9Kkk'
const SCHEDULER_ID = '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA'

async function spawnAtomicLicense() {
  console.debug(`Fetching LUA Source code from tx id ${luaSourceTxId}`)
  const luaSource = await arweave.transactions.getData(
    luaSourceTxId,
    { decode: true, string: true }
  ) as string

  console.debug(`Spawning new AO process`)
  const processId = await aoSpawn({
    module: AOS_MODULE_ID,
    scheduler: SCHEDULER_ID,
    signer,
    tags: [{ name: 'App-Name', value: appName }]
  })

  console.debug(`Sending Eval Action of LUA Source to process ${processId}`)
  const result = await sendAosMessage({
    processId,
    data: luaSource,
    signer,
    tags: [
      { name: 'Action', value: 'Eval' },
      { name: 'App-Name', value: appName },
      {
        name: 'Source-Code-TX-ID',
        value: luaSourceTxId
      }
    ]
  })

  console.log('Spawn atomic license result', result)
}

spawnAtomicLicense()
  .then()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
