import { rollup } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import {
  getBabelOutputPlugin,
  RollupBabelInputPluginOptions
} from '@rollup/plugin-babel'
import cleanup from 'rollup-plugin-cleanup'
import prettier from 'rollup-plugin-prettier'
import { NodePath } from '@babel/core'

const contracts: { [key: string]: string } = {
  'usernames': 'src/contracts/usernames/contract.ts',
  'collaborativeWhitelistCuration':
    'src/contracts/curation/collaborativeWhitelistCurationContract.ts',
  'atomicLicense': 'src/contracts/atomic-license/atomicLicense.ts'
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
    }],
    [{
      visitor: {
        ExportDeclaration(path: NodePath) {
          path.remove()
        }
      }
    }]
  ]
}

async function build() {
  for (const contract in contracts) {
    const bundle = await rollup({
      input: contracts[contract],
      output: {
        format: 'cjs'
      },
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
