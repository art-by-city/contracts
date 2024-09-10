import {
  createDataItemSigner,
  spawn as aoSpawn
} from '@permaweb/aoconnect'
import Arweave from 'arweave'
import { readFileSync } from 'fs'

import { sendAosMessage } from '../util/send-aos-message'

const wallet = JSON.parse(readFileSync('./.secrets/key.json').toString())
const arweave = Arweave.init({
  host: 'frostor.xyz',
  port: 443,
  protocol: 'https'
})
const signer = createDataItemSigner(wallet)
const appName = '@artbycity/atomic-license'
const evolvedLuaSourceTxId = 'xJewRYBMtTkHp1qXp75AnhgaT23LjCgF8S3PjSsl4RE'
const AOS_MODULE_ID = 'cbn0KKrBZH7hdNkNokuXLtGryrWM--PjSTBqIzw9Kkk'
const SCHEDULER_ID = '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA'
const processId = 'E5H55Ilc8JrRqiRM3hlryfihavwTZm862YAVRp49q3w'

async function evolveAtomicLicense() {
  console.debug(`Fetching LUA Source code from tx id ${evolvedLuaSourceTxId}`)
  const luaSource = await arweave.transactions.getData(
    evolvedLuaSourceTxId,
    { decode: true, string: true }
  ) as string

  console.debug(`Sending Eval Action of LUA Source to process ${processId}`)
  const evolveResult = await sendAosMessage({
    processId,
    data: luaSource,
    signer,
    tags: [
      { name: 'Action', value: 'Eval' },
      { name: 'App-Name', value: appName },
      {
        name: 'Source-Code-TX-ID',
        value: evolvedLuaSourceTxId
      }
    ]
  })

  console.log('Evolve result', evolveResult)
}

evolveAtomicLicense()
  .then()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })

// xJewRYBMtTkHp1qXp75AnhgaT23LjCgF8S3PjSsl4RE


