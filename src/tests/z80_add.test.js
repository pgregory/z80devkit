import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

import {makeGenericTest, modeText} from './helpers.js'


describe('ADD', function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
    this.cleanRegs = {}
  })

  // ADD A, [B,C,D,E,H,L]
  const combinations8bit = [
    { source: 'B', mode: 'register', offset: 0, opcodes: [0x80], length: 1 },
    { source: 'C', mode: 'register', offset: 0, opcodes: [0x81], length: 1 },
    { source: 'D', mode: 'register', offset: 0, opcodes: [0x82], length: 1 },
    { source: 'E', mode: 'register', offset: 0, opcodes: [0x83], length: 1 },
    { source: 'H', mode: 'register', offset: 0, opcodes: [0x84], length: 1 },
    { source: 'L', mode: 'register', offset: 0, opcodes: [0x85], length: 1 },
    { source: 'IXh', mode: 'register', offset: 0, opcodes: [0xDD, 0x84], length: 2 },
    { source: 'IXl', mode: 'register', offset: 0, opcodes: [0xDD, 0x85], length: 2 },
    { source: 'IYh', mode: 'register', offset: 0, opcodes: [0xFD, 0x84], length: 2 },
    { source: 'IYl', mode: 'register', offset: 0, opcodes: [0xFD, 0x85], length: 2 },
    { source: 'HL', mode: 'register indirect', offset: 0, opcodes: [0x86], length: 1 },
    { source: 'IX', mode: 'indexed', offset: 1, opcodes: [0xDD, 0x86, 0x01], length: 3 },
    { source: 'IY', mode: 'indexed', offset: 1, opcodes: [0xFD, 0x86, 0x01], length: 3 },
    { source: null, mode: 'immediate', offset: 0, opcodes: [0xC6], length: 2 /* Instruction length to include 'n' byte */ },
  ]
  for(let i = 0; i < combinations8bit.length; i += 1) {
    const c = combinations8bit[i]
    let desc = `LD A, ${modeText(c.source, c.sourcemode)}`
    describe(desc, function() {
      makeGenericTest('add resulting in carry', 'ADD', 'A', 'register', c.source, c.mode, c.offset, 0x81, 0x80, 0x01, c.opcodes, c.length, {C: true, N: false}, ["PC", "A"])
      makeGenericTest('add resulting in no carry', 'ADD', 'A', 'register', c.source, c.mode, c.offset, 0x21, 0x20, 0x41, c.opcodes, c.length, {C: false, N: false}, ["PC", "A"])
      makeGenericTest('add resulting in zero', 'ADD', 'A', 'register', c.source, c.mode, c.offset, 0x00, 0x00, 0x00, c.opcodes, c.length, {Z: true, N: false}, ["PC", "A"])
      makeGenericTest('add resulting in zero and carry', 'ADD', 'A', 'register', c.source, c.mode, c.offset, 0x80, 0x80, 0x00, c.opcodes, c.length, {C: true, Z: true, N: false}, ["PC", "A"])
      makeGenericTest('add resulting in overflow', 'ADD', 'A', 'register', c.source, c.mode, c.offset, 0x78, 0x69, 0xE1, c.opcodes, c.length, {P: true, N: false}, ["PC", "A"])
      makeGenericTest('add resulting in no overflow', 'ADD', 'A', 'register', c.source, c.mode, c.offset, 0x78, 0x88, 0x00, c.opcodes, c.length, {P: false, N: false}, ["PC", "A"])
    })
  }

  // ADD A,A
  describe('ADD A, A', function() {
    makeGenericTest('add resulting in carry and overflow', 'ADD', 'A', 'register', 'A', 'register', 0, 0x81, 0x81, 0x02, [0x87], 1, {C: true, P: true, N: false}, ["PC", "A"])
    makeGenericTest('add resulting in no carry or overflow', 'ADD', 'A', 'register', 'A', 'register', 0, 0x21, 0x21, 0x42, [0x87], 1, {C: false, P: false, N: false}, ["PC", "A"])
    makeGenericTest('add resulting in zero with no carry', 'ADD', 'A', 'register', 'A', 'register', 0, 0x00, 0x00, 0x00, [0x87], 1, {C: false, Z: true, N: false}, ["PC", "A"])
    makeGenericTest('add resulting in zero and carry', 'ADD', 'A', 'register', 'A', 'register', 0, 0x80, 0x80, 0x00, [0x87], 1, {C: true, Z: true, N: false}, ["PC", "A"])
  })

  // ADD A, n 
  describe('ADD A, n', function() {
    makeGenericTest('add resulting in carry', 'ADD', 'A', 'register', null, 'immediate', 1, 0x81, 0x80, 0x01, [0xC6, 0x80], 2, {C: true, N: false}, ["PC", "A"])
    makeGenericTest('add resulting in no carry', 'ADD', 'A', 'register', null, 'immediate', 1, 0x21, 0x20, 0x41, [0xC6, 0x20], 2, {C: false, N: false}, ["PC", "A"])
    makeGenericTest('add resulting in zero', 'ADD', 'A', 'register', null, 'immediate', 1, 0x00, 0x00, 0x00, [0xC6, 0x00], 2, {Z: true, N: false}, ["PC", "A"])
    makeGenericTest('add resulting in zero and carry', 'ADD', 'A', 'register', null, 'immediate', 1, 0x80, 0x80, 0x00, [0xC6, 0x80], 2, {C: true, Z: true, N: false}, ["PC", "A"])
    makeGenericTest('add resulting in overflow', 'ADD', 'A', 'register', null, 'immediate', 1, 0x78, 0x69, 0xE1, [0xC6, 0x69], 2, {P: true, N: false}, ["PC", "A"])
    makeGenericTest('add resulting in no overflow', 'ADD', 'A', 'register', null, 'immediate', 1, 0x78, 0x88, 0x00, [0xC6, 0x88], 2, {P: false, N: false}, ["PC", "A"])
  })

  // ADD [HL,IX,IY], [BC,DE,HL,IX,IY,SP]
  const combinations16bit = [
    { dest: 'HL', source: 'BC', opcodes: [0x09], length: 1 },
    { dest: 'HL', source: 'DE', opcodes: [0x19], length: 1 },
    { dest: 'HL', source: 'HL', opcodes: [0x29], length: 1 },
    { dest: 'HL', source: 'SP', opcodes: [0x39], length: 1 },
    { dest: 'IX', source: 'BC', opcodes: [0xDD, 0x09], length: 2 },
    { dest: 'IX', source: 'DE', opcodes: [0xDD, 0x19], length: 2 },
    { dest: 'IX', source: 'IX', opcodes: [0xDD, 0x29], length: 2 },
    { dest: 'IX', source: 'SP', opcodes: [0xDD, 0x39], length: 2 },
    { dest: 'IY', source: 'BC', opcodes: [0xFD, 0x09], length: 2 },
    { dest: 'IY', source: 'DE', opcodes: [0xFD, 0x19], length: 2 },
    { dest: 'IY', source: 'IY', opcodes: [0xFD, 0x29], length: 2 },
    { dest: 'IY', source: 'SP', opcodes: [0xFD, 0x39], length: 2 },
  ]

  for(let i = 0; i < combinations16bit.length; i += 1) {
    const c = combinations16bit[i]
    describe(`ADD ${c.dest}, ${c.source}`, function() {
      makeGenericTest('addition resulting in carry', 'ADD', c.dest, 'register16', c.source, 'register16', 0, 0xA8A1, 0xA8A1, 0x5142, c.opcodes, c.length, {C: true, H: true, N: false}, ["PC", c.dest])
      makeGenericTest('addition resulting in no carry', 'ADD', c.dest, 'register16', c.source, 'register16', 0, 0x4343, 0x4343, 0x8686, c.opcodes, c.length, {C: false, H: false, N: false}, ["PC", c.dest])
    })
  }

})
