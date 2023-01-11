import fs from 'fs/promises'
import path from 'path'
import ArLocal from 'arlocal'
import Arweave from 'arweave'
import { JWKInterface } from 'arweave/node/lib/wallet'
import {
  Contract,
  LoggerFactory,
  Warp,
  WarpNodeFactory
} from 'warp-contracts'
import { expect } from 'chai'


