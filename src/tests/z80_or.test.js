import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

import {makeMath8Test, makeMath16Test} from './math.js'


describe('OR', function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
    this.cleanRegs = {}
  })

  // OR A, [B,C,D,E,H,L]
  const combinations8bit = [
    { source: 'B', mode: 'register', offset: 0, opcodes: [0xB0], length: 1 },
    { source: 'C', mode: 'register', offset: 0, opcodes: [0xB1], length: 1 },
    { source: 'D', mode: 'register', offset: 0, opcodes: [0xB2], length: 1 },
    { source: 'E', mode: 'register', offset: 0, opcodes: [0xB3], length: 1 },
    { source: 'H', mode: 'register', offset: 0, opcodes: [0xB4], length: 1 },
    { source: 'L', mode: 'register', offset: 0, opcodes: [0xB5], length: 1 },
    { source: 'IXh', mode: 'register', offset: 0, opcodes: [0xDD, 0xB4], length: 2 },
    { source: 'IXl', mode: 'register', offset: 0, opcodes: [0xDD, 0xB5], length: 2 },
    { source: 'IYh', mode: 'register', offset: 0, opcodes: [0xFD, 0xB4], length: 2 },
    { source: 'IYl', mode: 'register', offset: 0, opcodes: [0xFD, 0xB5], length: 2 },
    { source: 'HL', mode: 'register indirect', offset: 0, opcodes: [0xB6], length: 1 },
    { source: 'IX', mode: 'indexed', offset: 1, opcodes: [0xDD, 0xB6, 0x01], length: 3 },
    { source: 'IY', mode: 'indexed', offset: 1, opcodes: [0xFD, 0xB6, 0x01], length: 3 },
    { source: null, mode: 'immediate', offset: 0, opcodes: [0xF6], length: 2 /* Instruction length to include 'n' byte */ },
  ]
  for(let i = 0; i < combinations8bit.length; i += 1) {
    const c = combinations8bit[i]
    let desc = ''
    switch(c.mode) {
      case 'register indirect':
        desc = `OR A, (${c.source})`
        break
      case 'indexed':
        desc = `OR A, (${c.source}+d)`
        break
      case 'register':
      default:
        desc = `OR A, ${c.source}`
        break
    }
    describe(desc, function() {
      makeMath8Test('resulting in zero', 'OR', 'A', 'register', c.source, c.mode, c.offset, 0x00, 0x00, 0x00, c.opcodes, c.length, {H: false, C: false, Z: true, N: false}, ["PC", "A"])
      makeMath8Test('resulting in non zero', 'OR', 'A', 'register', c.source, c.mode, c.offset, 0xAA, 0x00, 0xAA, c.opcodes, c.length, {H: false, C: false, Z: false, N: false}, ["PC", "A"])
      makeMath8Test('resulting in negative', 'OR', 'A', 'register', c.source, c.mode, c.offset, 0x80, 0x0A, 0x8A, c.opcodes, c.length, {H: false, C: false, S: true, N: false}, ["PC", "A"])
      makeMath8Test('resulting in positive', 'OR', 'A', 'register', c.source, c.mode, c.offset, 0x08, 0x0A, 0x0A, c.opcodes, c.length, {H: false, C: false, S: false, N: false}, ["PC", "A"])
      makeMath8Test('resulting in even parity', 'OR', 'A', 'register', c.source, c.mode, c.offset, 0x0A, 0xA0, 0xAA, c.opcodes, c.length, {H: false, C: false, P: true, N: false}, ["PC", "A"])
      makeMath8Test('resulting in odd parity', 'OR', 'A', 'register', c.source, c.mode, c.offset, 0xB0, 0x0A, 0xBA, c.opcodes, c.length, {H: false, C: false, P: false, N: false}, ["PC", "A"])
    })
  }

  // OR A,A
  describe('OR A, A', function() {
    makeMath8Test('resulting in zero', 'OR', 'A', 'register', 'A', 'register', 0, 0x00, 0x00, 0x00, [0xB7], 1, {H: false, C: false, Z: true, N: false}, ["PC", "A"])
    makeMath8Test('resulting in non zero', 'OR', 'A', 'register', 'A', 'register', 0, 0xAA, 0xAA, 0xAA, [0xB7], 1, {H: false, C: false, Z: false, N: false}, ["PC", "A"])
    makeMath8Test('resulting in negative', 'OR', 'A', 'register', 'A', 'register', 0, 0x80, 0x80, 0x80, [0xB7], 1, {H: false, C: false, S: true, N: false}, ["PC", "A"])
    makeMath8Test('resulting in positive', 'OR', 'A', 'register', 'A', 'register', 0, 0x08, 0x08, 0x08, [0xB7], 1, {H: false, C: false, S: false, N: false}, ["PC", "A"])
    makeMath8Test('resulting in even parity', 'OR', 'A', 'register', 'A', 'register', 0, 0xAA, 0xAA, 0xAA, [0xB7], 1, {H: false, C: false, P: true, N: false}, ["PC", "A"])
    makeMath8Test('resulting in odd parity', 'OR', 'A', 'register', 'A', 'register', 0, 0xBA, 0xBA, 0xBA, [0xB7], 1, {H: false, C: false, P: false, N: false}, ["PC", "A"])
  })
})
