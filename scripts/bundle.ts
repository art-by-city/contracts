import path from 'path'
import fs from 'fs'

import { bundle } from './lua-bundler'

async function main() {
  const contracts = [
    { contract: 'atomic-license' },
    { contract: 'atomic-license-evolved' },
    { contract: 'curation' },
    { contract: 'following' }
  ]

  for (const { contract } of contracts) {
    console.log(`Bundling Lua for ${contract}`)
    const luaEntryPath = path.join(
      path.resolve(),
      `./src/${contract}.lua`
    )

    if (!fs.existsSync(luaEntryPath)) {
      throw new Error(`Lua entry path not found: ${luaEntryPath}`)
    }

    const bundledLua = bundle(luaEntryPath)

    if (!fs.existsSync(path.join(path.resolve(), './dist'))) {
      fs.mkdirSync(path.join(path.resolve(), './dist'))
    }

    fs.writeFileSync(
      path.join(path.resolve(), `./dist/${contract}.lua`),
      bundledLua
    )
    console.log(`Done Bundling Lua for ${contract}`)
  }

  console.log('Done bundling all Lua contracts')
}

main()
  .then()
  .catch(err => console.error(err))
