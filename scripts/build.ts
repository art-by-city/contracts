import path from 'path'
import fs from 'fs/promises'
import { transformAsync } from '@babel/core'
import prettier from 'prettier'

const contracts = [
  'usernames'
]

const opts = {
  configFile: path.resolve(__dirname, '../babel.config.json'),
  filename: 'contract.ts'
}

async function build() {
  for (const contract of contracts) {
    const src = await fs.readFile(`src/${contract}/contract.ts`)

    const babelResult = await transformAsync(src.toString(), opts)

    if (babelResult?.code) {
      const prettyCode = prettier.format(babelResult.code, { parser: 'babel' })

      await fs.mkdir(`dist/${contract}`, { recursive: true })
      await fs.writeFile(`dist/${contract}/contract.js`, prettyCode)
    }
  }
}

(async () => {
  try {
    await build()
  } catch (error) {
    console.error(error)
  }
})()
