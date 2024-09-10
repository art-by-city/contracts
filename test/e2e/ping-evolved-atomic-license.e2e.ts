import { createDataItemSigner } from '@permaweb/aoconnect'
import { readFileSync } from 'node:fs'

import { sendAosMessage } from '../util/send-aos-message'

const processId = 'E5H55Ilc8JrRqiRM3hlryfihavwTZm862YAVRp49q3w'
const wallet = JSON.parse(readFileSync('./.secrets/key.json').toString())

;(async () => {
  console.log(
    `Pinging atomic license ao process ${processId}`
  )

  const { messageId, result } = await sendAosMessage({
    processId: processId,
    signer: createDataItemSigner(wallet),
    tags: [{ name: 'Action', value: 'Ping' }]
  })

  const response = result.Messages[0].Data

  console.log(
    `Got response ${response} with message ${messageId}`
  )
})().catch(console.error)