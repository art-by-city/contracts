import { rollup } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import {
  getBabelOutputPlugin,
  RollupBabelInputPluginOptions
} from '@rollup/plugin-babel'
import cleanup from 'rollup-plugin-cleanup'
import prettier from 'rollup-plugin-prettier'

const contracts: { [key: string]: string } = {
  'usernames': 'src/contracts/usernames/contract.ts',
  'collaborativeWhitelistCuration':
    'src/contracts/curation/collaborativeWhitelistCurationContract.ts'
}

const babelOpts: RollupBabelInputPluginOptions = {
  filename: 'contract.ts',
  presets: ['@babel/preset-typescript'],
  plugins: [
    ['babel-plugin-transform-remove-imports', {
      'removeAll': true
    }],
    ['@babel/plugin-proposal-decorators', {
      'version': '2022-03'
    }]
  ]
}

async function build() {
  for (const contract in contracts) {
    const bundle = await rollup({
      input: contracts[contract],
      plugins: [
        typescript(),
        getBabelOutputPlugin(babelOpts),
        cleanup(),
        prettier({
          singleQuote: true,
          parser: 'babel'
        })
      ],
      external: [
        /(..\/)+environment/
      ],
      onwarn(warning, rollupWarn) {
        if (warning.code !== 'CIRCULAR_DEPENDENCY') {
          rollupWarn(warning)
        }
      }
    })

    bundle.write({
      file: `dist/contracts/${contract}/contract.js`
    })

    await bundle.close()
  }
}

(async () => {
  try {
    await build()
  } catch (error) {
    console.error(error)
  }
})()
