import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

import {makeMath8Test, makeMath16Test} from './math.js'


describe('AND', function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
    this.cleanRegs = {}
  })

  // AND A, [B,C,D,E,H,L]
  const combinations8bit = [
    { source: 'B', mode: 'register', offset: 0, opcodes: [0xA0], length: 1 },
    { source: 'C', mode: 'register', offset: 0, opcodes: [0xA1], length: 1 },
    { source: 'D', mode: 'register', offset: 0, opcodes: [0xA2], length: 1 },
    { source: 'E', mode: 'register', offset: 0, opcodes: [0xA3], length: 1 },
    { source: 'H', mode: 'register', offset: 0, opcodes: [0xA4], length: 1 },
    { source: 'L', mode: 'register', offset: 0, opcodes: [0xA5], length: 1 },
    { source: 'IXh', mode: 'register', offset: 0, opcodes: [0xDD, 0xA4], length: 2 },
    { source: 'IXl', mode: 'register', offset: 0, opcodes: [0xDD, 0xA5], length: 2 },
    { source: 'IYh', mode: 'register', offset: 0, opcodes: [0xFD, 0xA4], length: 2 },
    { source: 'IYl', mode: 'register', offset: 0, opcodes: [0xFD, 0xA5], length: 2 },
    { source: 'HL', mode: 'register indirect', offset: 0, opcodes: [0xA6], length: 1 },
    { source: 'IX', mode: 'indexed', offset: 1, opcodes: [0xDD, 0xA6, 0x01], length: 3 },
    { source: 'IY', mode: 'indexed', offset: 1, opcodes: [0xFD, 0xA6, 0x01], length: 3 },
    { source: null, mode: 'immediate', offset: 0, opcodes: [0xE6], length: 2 /* Instruction length to include 'n' byte */ },
  ]
  for(let i = 0; i < combinations8bit.length; i += 1) {
    const c = combinations8bit[i]
    let desc = ''
    switch(c.mode) {
      case 'register indirect':
        desc = `AND A, (${c.source})`
        break
      case 'indexed':
        desc = `AND A, (${c.source}+d)`
        break
      case 'register':
      default:
        desc = `AND A, ${c.source}`
        break
    }
    describe(desc, function() {
      makeMath8Test('resulting in zero', 'AND', 'A', 'register', c.source, c.mode, c.offset, 0xAA, 0x55, 0x00, c.opcodes, c.length, {H: true, C: false, Z: true, N: false}, ["PC", "A"])
      makeMath8Test('resulting in non zero', 'AND', 'A', 'register', c.source, c.mode, c.offset, 0xAA, 0x0A, 0x0A, c.opcodes, c.length, {H: true, C: false, Z: false, N: false}, ["PC", "A"])
      makeMath8Test('resulting in negative', 'AND', 'A', 'register', c.source, c.mode, c.offset, 0xAA, 0xA0, 0xA0, c.opcodes, c.length, {H: true, C: false, S: true, N: false}, ["PC", "A"])
      makeMath8Test('resulting in positive', 'AND', 'A', 'register', c.source, c.mode, c.offset, 0xAA, 0x0A, 0x0A, c.opcodes, c.length, {H: true, C: false, S: false, N: false}, ["PC", "A"])
      makeMath8Test('resulting in even parity', 'AND', 'A', 'register', c.source, c.mode, c.offset, 0xAA, 0x88, 0x88, c.opcodes, c.length, {H: true, C: false, P: true, N: false}, ["PC", "A"])
      makeMath8Test('resulting in odd parity', 'AND', 'A', 'register', c.source, c.mode, c.offset, 0xAA, 0x80, 0x80, c.opcodes, c.length, {H: true, C: false, P: false, N: false}, ["PC", "A"])
    })
  }

  // AND A,A
  describe('AND A, A', function() {
      makeMath8Test('resulting in zero', 'AND', 'A', 'register', 'A', 'register', 0, 0x00, 0x00, 0x00, [0xA7], 1, {H: true, C: false, Z: true, N: false}, ["PC", "A"])
      makeMath8Test('resulting in non zero', 'AND', 'A', 'register', 'A', 'register', 0, 0xAA, 0xAA, 0xAA, [0xA7], 1, {H: true, C: false, Z: false, N: false}, ["PC", "A"])
      makeMath8Test('resulting in negative', 'AND', 'A', 'register', 'A', 'register', 0, 0x88, 0x88, 0x88, [0xA7], 1, {H: true, C: false, S: true, N: false}, ["PC", "A"])
      makeMath8Test('resulting in positive', 'AND', 'A', 'register', 'A', 'register', 0, 0x55, 0x55, 0x55, [0xA7], 1, {H: true, C: false, S: false, N: false}, ["PC", "A"])
      makeMath8Test('resulting in even parity', 'AND', 'A', 'register', 'A', 'register', 0, 0x11, 0x11, 0x11, [0xA7], 1, {H: true, C: false, P: true, N: false}, ["PC", "A"])
      makeMath8Test('resulting in odd parity', 'AND', 'A', 'register', 'A', 'register', 0, 0x40, 0x40, 0x40, [0xA7], 1, {H: true, C: false, P: false, N: false}, ["PC", "A"])
  })
})
