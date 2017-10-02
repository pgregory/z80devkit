import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

import {makeMath8Test} from './math.js'

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
  ]
  for(let i = 0; i < combinations8bit.length; i += 1) {
    const c = combinations8bit[i]
    let desc = ''
    switch(c.mode) {
      case 'register indirect':
        desc = `SUB A, (${c.source})`
        break
      case 'indexed':
        desc = `SUB A, (${c.source}+d)`
        break
      case 'register':
      default:
        desc = `SUB A, ${c.source}`
        break
    }
    describe(desc, function() {
      makeMath8Test('subtract resulting in carry', 'SUB', 'A', 'register', c.source, c.mode, c.offset, 0x00, 0x01, 0xFF, c.opcodes, c.length, {C: true, S: true, N: true}, ["PC", "A"])
      makeMath8Test('subtract resulting in no carry', 'SUB', 'A', 'register', c.source, c.mode, c.offset, 0x02, 0x01, 0x01, c.opcodes, c.length, {C: false, N: true}, ["PC", "A"])
      makeMath8Test('subtract resulting in zero', 'SUB', 'A', 'register', c.source, c.mode, c.offset, 0x01, 0x01, 0x00, c.opcodes, c.length, {Z: true, N: true}, ["PC", "A"])
      makeMath8Test('subtract resulting in overflow', 'SUB', 'A', 'register', c.source, c.mode, c.offset, 0x80, 0x10, 0x70, c.opcodes, c.length, {P: true, N: true}, ["PC", "A"])
    })
  }
  
  // SUB A,A
  describe(`SUB A, A`, function() {
    makeMath8Test('subtract resulting in zero', 'SUB', 'A', 'register', 'A', 'register', 0, 0x81, 0x81, 0x00, [0x97], 1, {Z: true, N: true}, ["PC", "A"])
  })


  // SUB A, n 
  describe('SUB A, n', function() {
    makeMath8Test('subtract resulting in carry', 'SUB', 'A', 'register', null, 'immediate', 1, 0x00, 0x01, 0xFF, [0xD6, 0x01], 2, {C: true, S: true, N: true}, ["PC", "A"])
    makeMath8Test('subtract resulting in no carry', 'SUB', 'A', 'register', null, 'immediate', 1, 0x02, 0x01, 0x01, [0xD6, 0x01], 2, {C: false, N: true}, ["PC", "A"])
    makeMath8Test('subtract resulting in zero', 'SUB', 'A', 'register', null, 'immediate', 1, 0x01, 0x01, 0x00, [0xD6, 0x01], 2, {Z: true, N: true}, ["PC", "A"])
    makeMath8Test('subtract resulting in overflow', 'SUB', 'A', 'register', null, 'immediate', 1, 0x80, 0x10, 0x70, [0xD6, 0x10], 2, {P: true, N: true}, ["PC", "A"])
  })

})
