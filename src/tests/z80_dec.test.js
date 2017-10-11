import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

import {makeGenericTest, modeText} from './helpers.js'


describe('DEC', function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
    this.cleanRegs = {}
  })

  // DEC [A,B,C,D,E,H,L,IHh,IXl,IYh,IYl,(HL),(IX+d),(IY+d)]
  const combinations8bit = [
    { dest: 'A', mode: 'register', offset: 0, opcodes: [0x3D], length: 1 },
    { dest: 'B', mode: 'register', offset: 0, opcodes: [0x05], length: 1 },
    { dest: 'C', mode: 'register', offset: 0, opcodes: [0x0D], length: 1 },
    { dest: 'D', mode: 'register', offset: 0, opcodes: [0x15], length: 1 },
    { dest: 'E', mode: 'register', offset: 0, opcodes: [0x1D], length: 1 },
    { dest: 'H', mode: 'register', offset: 0, opcodes: [0x25], length: 1 },
    { dest: 'L', mode: 'register', offset: 0, opcodes: [0x2D], length: 1 },
    { dest: 'IXh', mode: 'register', offset: 0, opcodes: [0xDD, 0x25], length: 2 },
    { dest: 'IXl', mode: 'register', offset: 0, opcodes: [0xDD, 0x2D], length: 2 },
    { dest: 'IYh', mode: 'register', offset: 0, opcodes: [0xFD, 0x25], length: 2 },
    { dest: 'IYl', mode: 'register', offset: 0, opcodes: [0xFD, 0x2D], length: 2 },
    { dest: 'HL', mode: 'register indirect', offset: 0, opcodes: [0x35], length: 1 },
    { dest: 'IX', mode: 'indexed', offset: 1, opcodes: [0xDD, 0x35, 0x01], length: 3 },
    { dest: 'IY', mode: 'indexed', offset: 1, opcodes: [0xFD, 0x35, 0x01], length: 3 },
  ]
  for(let i = 0; i < combinations8bit.length; i += 1) {
    const c = combinations8bit[i]
    let desc = `DEC ${modeText(c.dest, c.mode)}`
    describe(desc, function() {
      makeGenericTest('decrement resulting in zero', 'DEC', c.dest, c.mode, c.dest, c.mode, c.offset, 0x01, 0x01, 0x00, c.opcodes, c.length, {Z: true, N: true}, ["PC", c.dest])
      makeGenericTest('decrement resulting in overflow', 'DEC', c.dest, c.mode, c.dest, c.mode, c.offset, 0x80, 0x80, 0x7F, c.opcodes, c.length, {P: true, N: true}, ["PC", c.dest])
      makeGenericTest('decrement resulting in sign', 'DEC', c.dest, c.mode, c.dest, c.mode, c.offset, 0x00, 0x00, 0xFF, c.opcodes, c.length, {S: true, N: true}, ["PC", c.dest])
      makeGenericTest('decrement resulting in half carry', 'DEC', c.dest, c.mode, c.dest, c.mode, c.offset, 0x10, 0x10, 0x0F, c.opcodes, c.length, {H: true, N: true}, ["PC", c.dest])
    })
  }

  // INC [BC,DE,HL,IX,IY,SP]
  const combinations16bit = [
    { dest: 'BC', opcodes: [0x0B], length: 1 },
    { dest: 'DE', opcodes: [0x1B], length: 1 },
    { dest: 'HL', opcodes: [0x2B], length: 1 },
    { dest: 'IX', opcodes: [0xDD, 0x2B], length: 2 },
    { dest: 'IY', opcodes: [0xFD, 0x2B], length: 2 },
    { dest: 'SP', opcodes: [0x3B], length: 1 },
  ]

  for(let i = 0; i < combinations16bit.length; i += 1) {
    const c = combinations16bit[i]
    describe(`INC ${c.dest}`, function() {
      makeGenericTest('decrement resulting in zero', 'DEC', c.dest, 'register16', c.dest, 'register16', 0, 0x0001, 0x0001, 0x0000, c.opcodes, c.length, {}, ["PC", c.dest])
      makeGenericTest('decrement resulting in non zero', 'DEC', c.dest, 'register16', c.dest, 'register16', 0, 0x0002, 0x0002, 0x0001, c.opcodes, c.length, {}, ["PC", c.dest])
    })
  }

})
