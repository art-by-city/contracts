import { expect } from 'chai'
import AoLoader from '@permaweb/ao-loader'

import {
  AO_ENV,
  BUNDLED_EVOLVED_SOURCE,
  createLoader,
  DEFAULT_HANDLE_OPTIONS,
  DEFAULT_MODULE_ID,
  OWNER_ADDRESS
} from '../util/setup'

describe('Atomic License', () => {
  let originalHandle: AoLoader.handleFunction,
      memory: ArrayBuffer

  beforeEach(async () => {
    const loader = await createLoader()
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
      Data: BUNDLED_EVOLVED_SOURCE
    })

    const afterEvolveResult = await handle({
      Tags: [{ name: 'Action', value: 'Ping' }]
    })

    expect(afterEvolveResult.Messages).to.have.lengthOf(1)
    expect(afterEvolveResult.Messages[0].Data).to.equal('pong')
  })
})
