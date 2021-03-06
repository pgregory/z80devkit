import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

import {makeGenericTest, modeText} from './helpers.js'

describe('SBC', function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
    this.cleanRegs = {}
  })

  // SBC A, [B,C,D,E,H,L]
  const combinations8bit = [
    { source: 'A', mode: 'register', offset: 0, opcodes: [0x9F], length: 1 },
    { source: 'B', mode: 'register', offset: 0, opcodes: [0x98], length: 1 },
    { source: 'C', mode: 'register', offset: 0, opcodes: [0x99], length: 1 },
    { source: 'D', mode: 'register', offset: 0, opcodes: [0x9A], length: 1 },
    { source: 'E', mode: 'register', offset: 0, opcodes: [0x9B], length: 1 },
    { source: 'H', mode: 'register', offset: 0, opcodes: [0x9C], length: 1 },
    { source: 'L', mode: 'register', offset: 0, opcodes: [0x9D], length: 1 },
    { source: 'IXh', mode: 'register', offset: 0, opcodes: [0xDD, 0x9C], length: 2 },
    { source: 'IXl', mode: 'register', offset: 0, opcodes: [0xDD, 0x9D], length: 2 },
    { source: 'IYh', mode: 'register', offset: 0, opcodes: [0xFD, 0x9C], length: 2 },
    { source: 'IYl', mode: 'register', offset: 0, opcodes: [0xFD, 0x9D], length: 2 },
    { source: 'HL', mode: 'register indirect', offset: 0, opcodes: [0x9E], length: 1 },
    { source: 'IX', mode: 'indexed', offset: 1, opcodes: [0xDD, 0x9E, 0x01], length: 3 },
    { source: 'IY', mode: 'indexed', offset: 1, opcodes: [0xFD, 0x9E, 0x01], length: 3 },
    { source: null, mode: 'immediate', offset: 0, opcodes: [0xDE], length: 2 /* Instruction length to include 'n' byte */ },
  ]

  for(let i = 0; i < combinations8bit.length; i += 1) {
    const c = combinations8bit[i]
    let desc = `SBC A, ${modeText(c.source, c.mode)}`
    describe(desc, function() {
      makeGenericTest('subtract with C == 1 resulting in negative', 'SBC', 'A', 'register', c.source, c.mode, c.offset, 0x01, 0x01, 0xFF, c.opcodes, c.length, {S: true, N: true}, ["PC", "A"], {C: true})
      if(c.source !== 'A') {
        makeGenericTest('subtract with C == 0 resulting in negative', 'SBC', 'A', 'register', c.source, c.mode, c.offset, 0x01, 0x02, 0xFF, c.opcodes, c.length, {S: true, N: true}, ["PC", "A"], {C: false})
        makeGenericTest('subtract with C == 1 resulting in zero', 'SBC', 'A', 'register', c.source, c.mode, c.offset, 0x01, 0x00, 0x00, c.opcodes, c.length, {Z: true, N: true}, ["PC", "A"], {C: true})
        makeGenericTest('subtract with C == 1 resulting in overflow', 'SBC', 'A', 'register', c.source, c.mode, c.offset, 0x7F, 0xBF, 0xBF, c.opcodes, c.length, {P: true, N: true}, ["PC", "A"], {C: true})
        makeGenericTest('subtract with C == 0 resulting in overflow', 'SBC', 'A', 'register', c.source, c.mode, c.offset, 0x7F, 0xC0, 0xBF, c.opcodes, c.length, {P: true, N: true}, ["PC", "A"], {C: false})
      }
      makeGenericTest('subtract with C == 0 resulting in zero', 'SBC', 'A', 'register', c.source, c.mode, c.offset, 0x01, 0x01, 0x00, c.opcodes, c.length, {Z: true, N: true}, ["PC", "A"], {C: false})
    })
  }

  const combinations16bit = [
    { source: 'BC', opcodes: [0xED, 0x42], length: 2 },
    { source: 'DE', opcodes: [0xED, 0x52], length: 2 },
    { source: 'HL', opcodes: [0xED, 0x62], length: 2 },
    { source: 'SP', opcodes: [0xED, 0x72], length: 2 },
  ]

  for(let i = 0; i < combinations16bit.length; i += 1) {
    const c = combinations16bit[i]
    describe(`SBC HL, ${c.source}`, function() {
      if(c.source !== 'HL') {
        makeGenericTest('subtract with C == 1 resulting in negative', 'SBC', 'HL', 'register16', c.source, 'register16', 0, 0x0001, 0x0001, 0xFFFF, c.opcodes, c.length, {S: true, N: true}, ["PC", "HL"], {C: true})
        makeGenericTest('subtract with C == 0 resulting in negative', 'SBC', 'HL', 'register16', c.source, 'register16', 0, 0x0001, 0x0002, 0xFFFF, c.opcodes, c.length, {S: true, N: true}, ["PC", "HL"], {C: false})
        makeGenericTest('subtract with C == 1 resulting in zero', 'SBC', 'HL', 'register16', c.source, 'register16', 0, 0x0500, 0x04FF, 0x0000, c.opcodes, c.length, {Z: true, N: true}, ["PC", "HL"], {C: true})
        makeGenericTest('subtract with C == 1 resulting in overflow', 'SBC', 'HL', 'register16', c.source, 'register16', 0, 0x7FFF, 0xC000, 0xBFFE, c.opcodes, c.length, {P: true, N: true}, ["PC", "HL"], {C: true})
        makeGenericTest('subtract with C == 0 resulting in overflow', 'SBC', 'HL', 'register16', c.source, 'register16', 0, 0x7FFF, 0xC000, 0xBFFF, c.opcodes, c.length, {P: true, N: true}, ["PC", "HL"], {C: false})
      }
      makeGenericTest('subtract with C == 0 resulting in zero', 'SBC', 'HL', 'register16', c.source, 'register16', 0, 0x0500, 0x0500, 0x0000, c.opcodes, c.length, {Z: true, N: true}, ["PC", "HL"], {C: false})
    })
  }

})
