import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

import {makeGenericTest} from './helpers.js'

describe('RLCA', function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
    this.cleanRegs = {}
  })
  makeGenericTest('result in carry', 'RLCA', 'A', 'register', null, null, 0, 0x80, 0x00, 0x01, [0x07], 1, {C: true, H: false, N: false}, ["PC", "A"])
  makeGenericTest('result in no carry', 'RLCA', 'A', 'register', null, null, 0, 0x40, 0x00, 0x80, [0x07], 1, {C: false, H: false, N: false}, ["PC", "A"])
})

