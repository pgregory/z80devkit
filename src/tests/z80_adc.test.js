import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

import {makeMath8Test, makeMath16Test} from './math.js'
import {shouldNotAlterFlags, selectRegs, shouldNotAffectRegisters} from './helpers.js'

describe('ADC', function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
    this.cleanRegs = {}
  })

  // ADC A, [B,C,D,E,H,L]
  const combinations8bit = [
    { source: 'A', mode: 'register', offset: 0, opcodes: [0x8F], length: 1 },
    { source: 'B', mode: 'register', offset: 0, opcodes: [0x88], length: 1 },
    { source: 'C', mode: 'register', offset: 0, opcodes: [0x89], length: 1 },
    { source: 'D', mode: 'register', offset: 0, opcodes: [0x8A], length: 1 },
    { source: 'E', mode: 'register', offset: 0, opcodes: [0x8B], length: 1 },
    { source: 'H', mode: 'register', offset: 0, opcodes: [0x8C], length: 1 },
    { source: 'L', mode: 'register', offset: 0, opcodes: [0x8D], length: 1 },
    { source: 'IXh', mode: 'register', offset: 0, opcodes: [0xDD, 0x8C], length: 2 },
    { source: 'IXl', mode: 'register', offset: 0, opcodes: [0xDD, 0x8D], length: 2 },
    { source: 'IYh', mode: 'register', offset: 0, opcodes: [0xFD, 0x8C], length: 2 },
    { source: 'IYl', mode: 'register', offset: 0, opcodes: [0xFD, 0x8D], length: 2 },
    { source: 'HL', mode: 'register indirect', offset: 0, opcodes: [0x8E], length: 1 },
    { source: 'IX', mode: 'indexed', offset: 1, opcodes: [0xDD, 0x8E, 0x01], length: 3 },
    { source: 'IY', mode: 'indexed', offset: 1, opcodes: [0xFD, 0x8E, 0x01], length: 3 },
  ]

  for(let i = 0; i < combinations8bit.length; i += 1) {
    const c = combinations8bit[i]
    let desc = ''
    switch(c.mode) {
      case 'register indirect':
        desc = `ADC A, (${c.source})`
        break
      case 'indexed':
        desc = `ADC A, (${c.source}+d)`
        break
      case 'register':
      default:
        desc = `ADC A, ${c.source}`
        break
    }
    describe(desc, function() {
      makeMath8Test('add with C == 1 resulting in carry', 'ADC', c.source, c.mode, c.offset, 0x81, 0x81, 0x03, c.opcodes, c.length, {C: true, N: false}, ["PC", "A"], {C: true})
      makeMath8Test('add with C == 0 resulting in carry', 'ADC', c.source, c.mode, c.offset, 0x81, 0x81, 0x02, c.opcodes, c.length, {C: true, N: false}, ["PC", "A"], {C: false})
      if(c.source !== 'A') {
        makeMath8Test('add with C == 1 resulting in zero', 'ADC', c.source, c.mode, c.offset, 0x80, 0x7F, 0x00, c.opcodes, c.length, {Z: true, N: false}, ["PC", "A"], {C: true})
      }
      makeMath8Test('add with C == 0 resulting in zero', 'ADC', c.source, c.mode, c.offset, 0x00, 0x00, 0x00, c.opcodes, c.length, {Z: true, N: false}, ["PC", "A"], {C: false})
      makeMath8Test('add with C == 1 resulting in overflow', 'ADC', c.source, c.mode, c.offset, 0x88, 0x88, 0x11, c.opcodes, c.length, {P: true, N: false}, ["PC", "A"], {C: true})
      makeMath8Test('add with C == 0 resulting in overflow', 'ADC', c.source, c.mode, c.offset, 0x88, 0x88, 0x10, c.opcodes, c.length, {P: true, N: false}, ["PC", "A"], {C: false})
    })
  }

  // ADC A, n
  describe('ADC A, n', function() {
    makeMath8Test('add with C == 1 resulting in carry', 'ADC', null, 'immediate', 1, 0x81, 0x81, 0x03, [0xCE, 0x81], 2, {C: true, N: false}, ["PC", "A"], {C: true})
    makeMath8Test('add with C == 0 resulting in carry', 'ADC', null, 'immediate', 1, 0x81, 0x81, 0x02, [0xCE, 0x81], 2, {C: true, N: false}, ["PC", "A"], {C: false})
    makeMath8Test('add with C == 1 resulting in zero', 'ADC', null, 'immediate', 1, 0x80, 0x7F, 0x00, [0xCE, 0x7F], 2, {Z: true, N: false}, ["PC", "A"], {C: true})
    makeMath8Test('add with C == 0 resulting in zero', 'ADC', null, 'immediate', 1, 0x00, 0x00, 0x00, [0xCE, 0x00], 2, {Z: true, N: false}, ["PC", "A"], {C: false})
    makeMath8Test('add with C == 1 resulting in overflow', 'ADC', null, 'immediate', 1, 0x88, 0x88, 0x11, [0xCE, 0x88], 2, {P: true, N: false}, ["PC", "A"], {C: true})
    makeMath8Test('add with C == 0 resulting in overflow', 'ADC', null, 'immediate', 1, 0x88, 0x88, 0x10, [0xCE, 0x88], 2, {P: true, N: false}, ["PC", "A"], {C: false})
  })

  const combinations16bit = [
    { source: 'BC', opcodes: [0xED, 0x4A], length: 2 },
    { source: 'DE', opcodes: [0xED, 0x5A], length: 2 },
    { source: 'HL', opcodes: [0xED, 0x6A], length: 2 },
    { source: 'SP', opcodes: [0xED, 0x7A], length: 2 },
  ]

  for(let i = 0; i < combinations16bit.length; i += 1) {
    const c = combinations16bit[i]
    describe.skip(`ADC HL, ${c.source}`, function() {
      makeMath16Test('add with C == 1 resulting in carry', 'ADC', 'HL', c.source, 0x8181, 0x8181, 0x0303, c.opcodes, c.length, {C: true, N: false}, ["PC", "HL"], {C: true})
      makeMath16Test('add with C == 0 resulting in carry', 'ADC', 'HL', c.source, 0x8181, 0x8181, 0x0302, c.opcodes, c.length, {C: true, N: false}, ["PC", "HL"], {C: false})
      if(c.source !== 'HL') {
        makeMath16Test('add with C == 1 resulting in zero', 'ADC', 'HL', c.source, 0x8000, 0x7FFF, 0x0000, c.opcodes, c.length, {Z: true, N: false}, ["PC", "HL"], {C: true})
      }
      makeMath16Test('add with C == 0 resulting in zero', 'ADC', 'HL', c.source, 0x0000, 0x0000, 0x0000, c.opcodes, c.length, {Z: true, N: false}, ["PC", "HL"], {C: false})
      makeMath16Test('add with C == 1 resulting in overflow', 'ADC', 'HL', c.source, 0x8888, 0x8888, 0x1111, c.opcodes, c.length, {P: true, N: false}, ["PC", "HL"], {C: true})
      makeMath16Test('add with C == 0 resulting in overflow', 'ADC', 'HL', c.source, 0x8888, 0x8888, 0x1110, c.opcodes, c.length, {P: true, N: false}, ["PC", "HL"], {C: false})
    })
  }

})
