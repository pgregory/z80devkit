import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

import {makeGenericTest, modeText} from './helpers.js'

describe('CP', function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
    this.cleanRegs = {}
  })

  // CP A, [B,C,D,E,H,L]
  const combinations8bit = [
    { source: 'B', mode: 'register', offset: 0, opcodes: [0xB8], length: 1 },
    { source: 'C', mode: 'register', offset: 0, opcodes: [0xB9], length: 1 },
    { source: 'D', mode: 'register', offset: 0, opcodes: [0xBA], length: 1 },
    { source: 'E', mode: 'register', offset: 0, opcodes: [0xBB], length: 1 },
    { source: 'H', mode: 'register', offset: 0, opcodes: [0xBC], length: 1 },
    { source: 'L', mode: 'register', offset: 0, opcodes: [0xBD], length: 1 },
    { source: 'IXh', mode: 'register', offset: 0, opcodes: [0xDD, 0xBC], length: 2 },
    { source: 'IXl', mode: 'register', offset: 0, opcodes: [0xDD, 0xBD], length: 2 },
    { source: 'IYh', mode: 'register', offset: 0, opcodes: [0xFD, 0xBC], length: 2 },
    { source: 'IYl', mode: 'register', offset: 0, opcodes: [0xFD, 0xBD], length: 2 },
    { source: 'HL', mode: 'register indirect', offset: 0, opcodes: [0xBE], length: 1 },
    { source: 'IX', mode: 'indexed', offset: 1, opcodes: [0xDD, 0xBE, 0x01], length: 3 },
    { source: 'IY', mode: 'indexed', offset: 1, opcodes: [0xFD, 0xBE, 0x01], length: 3 },
    { source: null, mode: 'immediate', offset: 0, opcodes: [0xFE], length: 2 /* Instruction length to include 'n' byte */ },
  ]
  for(let i = 0; i < combinations8bit.length; i += 1) {
    const c = combinations8bit[i]
    let desc = `CP ${modeText(c.source, c.mode)}`
    describe(desc, function() {
      makeGenericTest('result in negative', 'CP', 'A', 'register', c.source, c.mode, c.offset, 0x00, 0x01, 0x00, c.opcodes, c.length, {S: true, N: true}, ["PC"])
      makeGenericTest('result in positive', 'CP', 'A', 'register', c.source, c.mode, c.offset, 0x02, 0x01, 0x02, c.opcodes, c.length, {S: false, N: true}, ["PC"])
      makeGenericTest('result in zero', 'CP', 'A', 'register', c.source, c.mode, c.offset, 0x01, 0x01, 0x01, c.opcodes, c.length, {Z: true, N: true}, ["PC"])
      makeGenericTest('result in non zero', 'CP', 'A', 'register', c.source, c.mode, c.offset, 0x05, 0x01, 0x05, c.opcodes, c.length, {Z: false, N: true}, ["PC"])
      makeGenericTest('result in half carry', 'CP', 'A', 'register', c.source, c.mode, c.offset, 0x10, 0x01, 0x10, c.opcodes, c.length, {H: true, N: true}, ["PC"])
      makeGenericTest('result in no half carry', 'CP', 'A', 'register', c.source, c.mode, c.offset, 0x20, 0x10, 0x20, c.opcodes, c.length, {H: false, N: true}, ["PC"])
      makeGenericTest('result in overflow', 'CP', 'A', 'register', c.source, c.mode, c.offset, 0x80, 0x10, 0x80, c.opcodes, c.length, {P: true, N: true}, ["PC"])
      makeGenericTest('result in no overflow', 'CP', 'A', 'register', c.source, c.mode, c.offset, 0x20, 0x08, 0x20, c.opcodes, c.length, {P: false, N: true}, ["PC"])
      makeGenericTest('result in carry', 'CP', 'A', 'register', c.source, c.mode, c.offset, 0x00, 0x01, 0x00, c.opcodes, c.length, {C: true, N: true}, ["PC"])
      makeGenericTest('result in no carry', 'CP', 'A', 'register', c.source, c.mode, c.offset, 0x02, 0x01, 0x02, c.opcodes, c.length, {C: false, N: true}, ["PC"])
    })
  }
  
  // CP A,A
  describe(`CP A, A`, function() {
      makeGenericTest('result in positive', 'CP', 'A', 'register', 'A', 'register', 0, 0x02, 0x02, 0x02, [0xBF], 1, {S: false, N: true}, ["PC"])
      makeGenericTest('result in zero', 'CP', 'A', 'register', 'A', 'register', 0, 0x01, 0x01, 0x01, [0xBF], 1, {Z: true, N: true}, ["PC"])
      makeGenericTest('result in no half carry', 'CP', 'A', 'register', 'A', 'register', 0, 0x20, 0x20, 0x20, [0xBF], 1, {H: false, N: true}, ["PC"])
      makeGenericTest('result in no overflow', 'CP', 'A', 'register', 'A', 'register', 0, 0x20, 0x20, 0x20, [0xBF], 1, {P: false, N: true}, ["PC"])
      makeGenericTest('result in no carry', 'CP', 'A', 'register', 'A', 'register', 0, 0x02, 0x02, 0x02, [0xBF], 1, {C: false, N: true}, ["PC"])
  })
})
