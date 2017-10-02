import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

import {makeMath8Test, makeMath16Test} from './math.js'


describe('INC', function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
    this.cleanRegs = {}
  })

  // INC [A,B,C,D,E,H,L,IHh,IXl,IYh,IYl,(HL),(IX+d),(IY+d)]
  const combinations8bit = [
    { dest: 'A', mode: 'register', offset: 0, opcodes: [0x3C], length: 1 },
    { dest: 'B', mode: 'register', offset: 0, opcodes: [0x04], length: 1 },
    { dest: 'C', mode: 'register', offset: 0, opcodes: [0x0C], length: 1 },
    { dest: 'D', mode: 'register', offset: 0, opcodes: [0x14], length: 1 },
    { dest: 'E', mode: 'register', offset: 0, opcodes: [0x1C], length: 1 },
    { dest: 'H', mode: 'register', offset: 0, opcodes: [0x24], length: 1 },
    { dest: 'L', mode: 'register', offset: 0, opcodes: [0x2C], length: 1 },
    { dest: 'IXh', mode: 'register', offset: 0, opcodes: [0xDD, 0x24], length: 2 },
    { dest: 'IXl', mode: 'register', offset: 0, opcodes: [0xDD, 0x2C], length: 2 },
    { dest: 'IYh', mode: 'register', offset: 0, opcodes: [0xFD, 0x24], length: 2 },
    { dest: 'IYl', mode: 'register', offset: 0, opcodes: [0xFD, 0x2C], length: 2 },
    { dest: 'HL', mode: 'register indirect', offset: 0, opcodes: [0x34], length: 1 },
    { dest: 'IX', mode: 'indexed', offset: 1, opcodes: [0xDD, 0x34, 0x01], length: 3 },
    { dest: 'IY', mode: 'indexed', offset: 1, opcodes: [0xFD, 0x34, 0x01], length: 3 },
  ]
  for(let i = 0; i < combinations8bit.length; i += 1) {
    const c = combinations8bit[i]
    let desc = ''
    switch(c.mode) {
      case 'register indirect':
        desc = `INC (${c.dest})`
        break
      case 'indexed':
        desc = `INC (${c.dest}+d)`
        break
      case 'register':
      default:
        desc = `INC ${c.dest}`
        break
    }
    describe(desc, function() {
      makeMath8Test('increment resulting in zero', 'INC', c.dest, c.mode, c.dest, c.mode, c.offset, 0xFF, 0xFF, 0x00, c.opcodes, c.length, {Z: true, N: false}, ["PC", c.dest])
      makeMath8Test('increment resulting in overflow', 'INC', c.dest, c.mode, c.dest, c.mode, c.offset, 0x7F, 0x7F, 0x80, c.opcodes, c.length, {P: true, N: false}, ["PC", c.dest])
      makeMath8Test('increment resulting in sign', 'INC', c.dest, c.mode, c.dest, c.mode, c.offset, 0x7F, 0x7F, 0x80, c.opcodes, c.length, {S: true, N: false}, ["PC", c.dest])
      makeMath8Test('increment resulting in half carry', 'INC', c.dest, c.mode, c.dest, c.mode, c.offset, 0x7F, 0x7F, 0x80, c.opcodes, c.length, {H: true, N: false}, ["PC", c.dest])
    })
  }

  // INC [BC,DE,HL,IX,IY,SP]
  const combinations16bit = [
    { dest: 'BC', opcodes: [0x03], length: 1 },
    { dest: 'DE', opcodes: [0x13], length: 1 },
    { dest: 'HL', opcodes: [0x23], length: 1 },
    { dest: 'IX', opcodes: [0xDD, 0x23], length: 2 },
    { dest: 'IY', opcodes: [0xFD, 0x23], length: 2 },
    { dest: 'SP', opcodes: [0x33], length: 1 },
  ]

  for(let i = 0; i < combinations16bit.length; i += 1) {
    const c = combinations16bit[i]
    describe(`INC ${c.dest}`, function() {
      makeMath16Test('increment resulting in zero', 'INC', c.dest, c.dest, 0xFFFF, 0xFFFF, 0x0000, c.opcodes, c.length, {}, ["PC", c.dest])
      makeMath16Test('increment resulting in overflow', 'INC', c.dest, c.dest, 0x7FFF, 0x7FFF, 0x8000, c.opcodes, c.length, {}, ["PC", c.dest])
      makeMath16Test('increment resulting in sign', 'INC', c.dest, c.dest, 0x7FFF, 0x7FFF, 0x8000, c.opcodes, c.length, {}, ["PC", c.dest])
      makeMath16Test('increment resulting in half carry', 'INC', c.dest, c.dest, 0x7FFF, 0x7FFF, 0x8000, c.opcodes, c.length, {}, ["PC", c.dest])
    })
  }

})
