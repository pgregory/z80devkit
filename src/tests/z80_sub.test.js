import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

import {makeGenericTest, modeText} from './helpers.js'

describe('SUB', function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
    this.cleanRegs = {}
  })

  // SUB A, [B,C,D,E,H,L]
  const combinations8bit = [
    { source: 'B', mode: 'register', offset: 0, opcodes: [0x90], length: 1 },
    { source: 'C', mode: 'register', offset: 0, opcodes: [0x91], length: 1 },
    { source: 'D', mode: 'register', offset: 0, opcodes: [0x92], length: 1 },
    { source: 'E', mode: 'register', offset: 0, opcodes: [0x93], length: 1 },
    { source: 'H', mode: 'register', offset: 0, opcodes: [0x94], length: 1 },
    { source: 'L', mode: 'register', offset: 0, opcodes: [0x95], length: 1 },
    { source: 'HL', mode: 'register indirect', offset: 0, opcodes: [0x96], length: 1 },
    { source: 'IX', mode: 'indexed', offset: 1, opcodes: [0xDD, 0x96, 0x01], length: 3 },
    { source: 'IY', mode: 'indexed', offset: 1, opcodes: [0xFD, 0x96, 0x01], length: 3 },
    { source: null, mode: 'immediate', offset: 0, opcodes: [0xD6], length: 2 /* Instruction length to include 'n' byte */ },
  ]
  for(let i = 0; i < combinations8bit.length; i += 1) {
    const c = combinations8bit[i]
    let desc = `SUB A, ${modeText(c.source, c.mode)}`
    describe(desc, function() {
      makeGenericTest('result in negative', 'CP', 'A', 'register', c.source, c.mode, c.offset, 0x00, 0x01, 0xFF, c.opcodes, c.length, {S: true, N: true}, ["PC", "A"])
      makeGenericTest('result in positive', 'CP', 'A', 'register', c.source, c.mode, c.offset, 0x02, 0x01, 0x01, c.opcodes, c.length, {S: false, N: true}, ["PC", "A"])
      makeGenericTest('result in zero', 'CP', 'A', 'register', c.source, c.mode, c.offset, 0x01, 0x01, 0x00, c.opcodes, c.length, {Z: true, N: true}, ["PC", "A"])
      makeGenericTest('result in non zero', 'CP', 'A', 'register', c.source, c.mode, c.offset, 0x05, 0x01, 0x04, c.opcodes, c.length, {Z: false, N: true}, ["PC", "A"])
      makeGenericTest('result in half carry', 'CP', 'A', 'register', c.source, c.mode, c.offset, 0x10, 0x01, 0x0F, c.opcodes, c.length, {H: true, N: true}, ["PC", "A"])
      makeGenericTest('result in no half carry', 'CP', 'A', 'register', c.source, c.mode, c.offset, 0x20, 0x10, 0x10, c.opcodes, c.length, {H: false, N: true}, ["PC", "A"])
      makeGenericTest('result in overflow', 'CP', 'A', 'register', c.source, c.mode, c.offset, 0x80, 0x10, 0x70, c.opcodes, c.length, {P: true, N: true}, ["PC", "A"])
      makeGenericTest('result in no overflow', 'CP', 'A', 'register', c.source, c.mode, c.offset, 0x20, 0x08, 0x18, c.opcodes, c.length, {P: false, N: true}, ["PC", "A"])
      makeGenericTest('result in carry', 'CP', 'A', 'register', c.source, c.mode, c.offset, 0x00, 0x01, 0xFF, c.opcodes, c.length, {C: true, N: true}, ["PC", "A"])
      makeGenericTest('result in no carry', 'CP', 'A', 'register', c.source, c.mode, c.offset, 0x02, 0x01, 0x01, c.opcodes, c.length, {C: false, N: true}, ["PC", "A"])
    })
  }
  
  // SUB A,A
  describe(`SUB A, A`, function() {
    makeGenericTest('result in positive', 'CP', 'A', 'register', 'A', 'register', 0, 0x02, 0x02, 0x02, [0xBF], 1, {S: false, N: true}, ["PC", "A"])
    makeGenericTest('result in zero', 'CP', 'A', 'register', 'A', 'register', 0, 0x01, 0x01, 0x01, [0xBF], 1, {Z: true, N: true}, ["PC", "A"])
    makeGenericTest('result in no half carry', 'CP', 'A', 'register', 'A', 'register', 0, 0x20, 0x20, 0x20, [0xBF], 1, {H: false, N: true}, ["PC", "A"])
    makeGenericTest('result in no overflow', 'CP', 'A', 'register', 'A', 'register', 0, 0x20, 0x20, 0x20, [0xBF], 1, {P: false, N: true}, ["PC", "A"])
    makeGenericTest('result in no carry', 'CP', 'A', 'register', 'A', 'register', 0, 0x02, 0x02, 0x02, [0xBF], 1, {C: false, N: true}, ["PC", "A"])
  })
})
