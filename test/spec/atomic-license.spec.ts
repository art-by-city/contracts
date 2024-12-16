import { expect } from 'chai'
import AoLoader from '@permaweb/ao-loader'
import { readFileSync } from 'fs'
import { join, resolve } from 'path'

import {
  AO_ENV,
  createLoader,
  DEFAULT_HANDLE_OPTIONS,
  DEFAULT_MODULE_ID,
  OWNER_ADDRESS
} from '../util/setup'

const atomicLicenseSource = readFileSync(
  join(resolve(), './dist/atomic-license.lua'),
  'utf-8',
)

const atomicLicenseEvolvedSource = readFileSync(
  join(resolve(), './dist/atomic-license-evolved.lua'),
  'utf-8',
)

describe('Atomic License', () => {
  let originalHandle: AoLoader.handleFunction
  let memory: ArrayBuffer

  beforeEach(async () => {
    const loader = await createLoader(atomicLicenseSource)
    originalHandle = loader.handle
    memory = loader.memory
  })

  async function handle(
    options: Partial<AoLoader.Message> = {},
    mem = memory
  ) {
    return originalHandle(
      mem,
      {
        ...DEFAULT_HANDLE_OPTIONS,
        ...options,
      },
      AO_ENV
    )
  }

  it('Should respond with owner address to "Get-Owner" requests', async () => {
    const result = await handle({
      Tags: [{ name: 'Action', value: 'Get-Owner' }]
    })

    expect(result.Messages).to.have.lengthOf(1)
    expect(result.Messages[0].Data).to.equal(OWNER_ADDRESS)
  })

  it('Should respond with "pong" to "ping" requests after evolve', async () => {
    const beforeEvolveResult = await handle({
      Tags: [{ name: 'Action', value: 'Ping' }]
    })

    expect(beforeEvolveResult.Messages).to.be.empty

    const evolveResult = await handle({
      From: OWNER_ADDRESS,
      Tags: [
        { name: 'Module', value: DEFAULT_MODULE_ID },
        { name: 'Action', value: 'Eval' }
      ],
      Data: atomicLicenseEvolvedSource
    })

    const afterEvolveResult = await handle({
      Tags: [{ name: 'Action', value: 'Ping' }]
    })

    expect(afterEvolveResult.Messages).to.have.lengthOf(1)
    expect(afterEvolveResult.Messages[0].Data).to.equal('pong')
  })
})
