import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

import {makeMath8Test, makeMath16Test} from './math.js'


describe('XOR', function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
    this.cleanRegs = {}
  })

  // XOR A, [B,C,D,E,H,L]
  const combinations8bit = [
    { source: 'B', mode: 'register', offset: 0, opcodes: [0xA8], length: 1 },
    { source: 'C', mode: 'register', offset: 0, opcodes: [0xA9], length: 1 },
    { source: 'D', mode: 'register', offset: 0, opcodes: [0xAA], length: 1 },
    { source: 'E', mode: 'register', offset: 0, opcodes: [0xAB], length: 1 },
    { source: 'H', mode: 'register', offset: 0, opcodes: [0xAC], length: 1 },
    { source: 'L', mode: 'register', offset: 0, opcodes: [0xAD], length: 1 },
    { source: 'IXh', mode: 'register', offset: 0, opcodes: [0xDD, 0xAC], length: 2 },
    { source: 'IXl', mode: 'register', offset: 0, opcodes: [0xDD, 0xAD], length: 2 },
    { source: 'IYh', mode: 'register', offset: 0, opcodes: [0xFD, 0xAC], length: 2 },
    { source: 'IYl', mode: 'register', offset: 0, opcodes: [0xFD, 0xAD], length: 2 },
    { source: 'HL', mode: 'register indirect', offset: 0, opcodes: [0xAE], length: 1 },
    { source: 'IX', mode: 'indexed', offset: 1, opcodes: [0xDD, 0xAE, 0x01], length: 3 },
    { source: 'IY', mode: 'indexed', offset: 1, opcodes: [0xFD, 0xAE, 0x01], length: 3 },
    { source: null, mode: 'immediate', offset: 0, opcodes: [0xEE], length: 2 /* Instruction length to include 'n' byte */ },
  ]
  for(let i = 0; i < combinations8bit.length; i += 1) {
    const c = combinations8bit[i]
    let desc = ''
    switch(c.mode) {
      case 'register indirect':
        desc = `XOR A, (${c.source})`
        break
      case 'indexed':
        desc = `XOR A, (${c.source}+d)`
        break
      case 'immediate':
        desc = `XOR A, n`
        break
      case 'register':
      default:
        desc = `XOR A, ${c.source}`
        break
    }
    describe(desc, function() {
      makeMath8Test('resulting in zero', 'XOR', 'A', 'register', c.source, c.mode, c.offset, 0x05, 0x05, 0x00, c.opcodes, c.length, {H: false, C: false, Z: true, N: false}, ["PC", "A"])
      makeMath8Test('resulting in non zero', 'XOR', 'A', 'register', c.source, c.mode, c.offset, 0x55, 0x05, 0x50, c.opcodes, c.length, {H: false, C: false, Z: false, N: false}, ["PC", "A"])
      makeMath8Test('resulting in negative', 'XOR', 'A', 'register', c.source, c.mode, c.offset, 0x8A, 0x0A, 0x80, c.opcodes, c.length, {H: false, C: false, S: true, N: false}, ["PC", "A"])
      makeMath8Test('resulting in positive', 'XOR', 'A', 'register', c.source, c.mode, c.offset, 0x1A, 0x0A, 0x10, c.opcodes, c.length, {H: false, C: false, S: false, N: false}, ["PC", "A"])
      makeMath8Test('resulting in even parity', 'XOR', 'A', 'register', c.source, c.mode, c.offset, 0xFF, 0xAA, 0x55, c.opcodes, c.length, {H: false, C: false, P: true, N: false}, ["PC", "A"])
      makeMath8Test('resulting in odd parity', 'XOR', 'A', 'register', c.source, c.mode, c.offset, 0xFF, 0x5B, 0xA4, c.opcodes, c.length, {H: false, C: false, P: false, N: false}, ["PC", "A"])
    })
  }

  // XOR A,A
  describe('XOR A, A', function() {
    makeMath8Test('resulting in zero', 'XOR', 'A', 'register', 'A', 'register', 0, 0x05, 0x05, 0x00, [0xAF], 1, {H: false, C: false, Z: true, N: false}, ["PC", "A"])
    makeMath8Test('resulting in positive', 'XOR', 'A', 'register', 'A', 'register', 0, 0x08, 0x08, 0x00, [0xAF], 1, {H: false, C: false, S: false, N: false}, ["PC", "A"])
    makeMath8Test('resulting in even parity', 'XOR', 'A', 'register', 'A', 'register', 0, 0xAA, 0xAA, 0x00, [0xAF], 1, {H: false, C: false, P: true, N: false}, ["PC", "A"])
  })
})
