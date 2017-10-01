import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

import {makeMath8Test, makeMath16Test} from './math.js'
import {shouldNotAlterFlags, selectRegs, shouldNotAffectRegisters} from './helpers.js'


describe('ADD', function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
    this.cleanRegs = {}
  })

  // ADD A, [B,C,D,E,H,L]
  const regs = {
    B: 0x0,
    C: 0x1,
    D: 0x2,
    E: 0x3,
    H: 0x4,
    L: 0x5,
  }
  Object.getOwnPropertyNames(regs).forEach(
    (val) => {
      const opcode = 0x80 | (regs[val])
      describe(`ADD A, ${val}`, function() {
        makeMath8Test('add resulting in carry', 'ADD', val, 'register', 0, 0x81, 0x80, 0x01, [opcode], 1, {C: true, N: false}, ["PC", "A"])
        makeMath8Test('add resulting in no carry', 'ADD', val, 'register', 0, 0x21, 0x20, 0x41, [opcode], 1, {C: false, N: false}, ["PC", "A"])
        makeMath8Test('add resulting in zero', 'ADD', val, 'register', 0, 0x00, 0x00, 0x00, [opcode], 1, {Z: true, N: false}, ["PC", "A"])
        makeMath8Test('add resulting in zero and carry', 'ADD', val, 'register', 0, 0x80, 0x80, 0x00, [opcode], 1, {C: true, Z: true, N: false}, ["PC", "A"])
        makeMath8Test('add resulting in overflow', 'ADD', val, 'register', 0, 0x78, 0x69, 0xE1, [opcode], 1, {P: true, N: false}, ["PC", "A"])
        makeMath8Test('add resulting in no overflow', 'ADD', val, 'register', 0, 0x78, 0x88, 0x00, [opcode], 1, {P: false, N: false}, ["PC", "A"])
      })
    }
  )

  // ADD A, [IXh, IXl, IYh, IYl]
  const regs2 = {
    IXh: [0xDD, 0x84],
    IXl: [0xDD, 0x85],
    IYh: [0xFD, 0x84],
    IYl: [0xFD, 0x85],
  }
  Object.getOwnPropertyNames(regs2).forEach(
    (val) => {
      const opcodes = regs2[val]
      describe(`ADD A, ${val}`, function() {
        makeMath8Test('add resulting in carry', 'ADD', val, 'register', 0, 0x81, 0x80, 0x01, opcodes, 2, {C: true, N: false}, ["PC", "A"])
        makeMath8Test('add resulting in no carry', 'ADD', val, 'register', 0, 0x21, 0x20, 0x41, opcodes, 2, {C: false, N: false}, ["PC", "A"])
        makeMath8Test('add resulting in zero', 'ADD', val, 'register', 0, 0x00, 0x00, 0x00, opcodes, 2, {Z: true, N: false}, ["PC", "A"])
        makeMath8Test('add resulting in zero and carry', 'ADD', val, 'register', 0, 0x80, 0x80, 0x00, opcodes, 2, {C: true, Z: true, N: false}, ["PC", "A"])
        makeMath8Test('add resulting in overflow', 'ADD', val, 'register', 0, 0x78, 0x69, 0xE1, opcodes, 2, {P: true, N: false}, ["PC", "A"])
        makeMath8Test('add resulting in no overflow', 'ADD', val, 'register', 0, 0x78, 0x88, 0x00, opcodes, 2, {P: false, N: false}, ["PC", "A"])
      })
    }
  )

  // ADD A,A
  describe('ADD A, A', function() {
    makeMath8Test('add resulting in carry and overflow', 'ADD', 'A', 'register', 0, 0x81, 0x81, 0x02, [0x87], 1, {C: true, P: true, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in no carry or overflow', 'ADD', 'A', 'register', 0, 0x21, 0x21, 0x42, [0x87], 1, {C: false, P: false, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in zero with no carry', 'ADD', 'A', 'register', 0, 0x00, 0x00, 0x00, [0x87], 1, {C: false, Z: true, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in zero and carry', 'ADD', 'A', 'register', 0, 0x80, 0x80, 0x00, [0x87], 1, {C: true, Z: true, N: false}, ["PC", "A"])
  })

  // ADD A, (HL)
  describe('ADD A, (HL)', function() {
    makeMath8Test('add resulting in carry', 'ADD', 'HL', 'register indirect', 0, 0x81, 0x80, 0x01, [0x86], 1, {C: true, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in no carry', 'ADD', 'HL', 'register indirect', 0, 0x21, 0x20, 0x41, [0x86], 1, {C: false, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in zero', 'ADD', 'HL', 'register indirect', 0, 0x00, 0x00, 0x00, [0x86], 1, {Z: true, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in zero and carry', 'ADD', 'HL', 'register indirect', 0, 0x80, 0x80, 0x00, [0x86], 1, {C: true, Z: true, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in overflow', 'ADD', 'HL', 'register indirect', 0, 0x78, 0x69, 0xE1, [0x86], 1, {P: true, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in no overflow', 'ADD', 'HL', 'register indirect', 0, 0x78, 0x88, 0x00, [0x86], 1, {P: false, N: false}, ["PC", "A"])
  })
  
  // ADD A, n 
  describe('ADD A, n', function() {
    makeMath8Test('add resulting in carry', 'ADD', null, 'immediate', 1, 0x81, 0x80, 0x01, [0xC6, 0x80], 2, {C: true, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in no carry', 'ADD', null, 'immediate', 1, 0x21, 0x20, 0x41, [0xC6, 0x20], 2, {C: false, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in zero', 'ADD', null, 'immediate', 1, 0x00, 0x00, 0x00, [0xC6, 0x00], 2, {Z: true, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in zero and carry', 'ADD', null, 'immediate', 1, 0x80, 0x80, 0x00, [0xC6, 0x80], 2, {C: true, Z: true, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in overflow', 'ADD', null, 'immediate', 1, 0x78, 0x69, 0xE1, [0xC6, 0x69], 2, {P: true, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in no overflow', 'ADD', null, 'immediate', 1, 0x78, 0x88, 0x00, [0xC6, 0x88], 2, {P: false, N: false}, ["PC", "A"])
  })

  // ADD A, (IX+d)
  describe('ADD A, (IX+d)', function() {
    makeMath8Test('add resulting in carry', 'ADD', 'IX', 'indexed', 1, 0x81, 0x80, 0x01, [0xDD, 0x86, 0x1], 3, {C: true, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in no carry', 'ADD', 'IX', 'indexed', 1, 0x21, 0x20, 0x41, [0xDD, 0x86, 0x1], 3, {C: false, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in zero', 'ADD', 'IX', 'indexed', 1, 0x00, 0x00, 0x00, [0xDD, 0x86, 0x1], 3, {Z: true, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in zero and carry', 'ADD', 'IX', 'indexed', 1, 0x80, 0x80, 0x00, [0xDD, 0x86, 0x1], 3, {C: true, Z: true, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in overflow', 'ADD', 'IX', 'indexed', 1, 0x78, 0x69, 0xE1, [0xDD, 0x86, 0x1], 3, {P: true, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in no overflow', 'ADD', 'IX', 'indexed', 1, 0x78, 0x88, 0x00, [0xDD, 0x86, 0x1], 3, {P: false, N: false}, ["PC", "A"])
  })
  
  // ADD A, (IY+d)
  describe('ADD A, (IY+d)', function() {
    makeMath8Test('add resulting in carry', 'ADD', 'IY', 'indexed', 1, 0x81, 0x80, 0x01, [0xFD, 0x86, 0x1], 3, {C: true, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in no carry', 'ADD', 'IY', 'indexed', 1, 0x21, 0x20, 0x41, [0xFD, 0x86, 0x1], 3, {C: false, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in zero', 'ADD', 'IY', 'indexed', 1, 0x00, 0x00, 0x00, [0xFD, 0x86, 0x1], 3, {Z: true, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in zero and carry', 'ADD', 'IY', 'indexed', 1, 0x80, 0x80, 0x00, [0xFD, 0x86, 0x1], 3, {C: true, Z: true, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in overflow', 'ADD', 'IY', 'indexed', 1, 0x78, 0x69, 0xE1, [0xFD, 0x86, 0x1], 3, {P: true, N: false}, ["PC", "A"])
    makeMath8Test('add resulting in no overflow', 'ADD', 'IY', 'indexed', 1, 0x78, 0x88, 0x00, [0xFD, 0x86, 0x1], 3, {P: false, N: false}, ["PC", "A"])
  })

  // ADD HL, [BC,DE,SP]
  const regs3 = {
    BC: [0x09],
    DE: [0x19],
    SP: [0x39],
  }
  Object.getOwnPropertyNames(regs3).forEach(
    (val) => {
      const opcodes = regs3[val]
      describe(`ADD HL, ${val}`, function() {
        makeMath16Test('addition resulting in carry', 'ADD', 'HL', val, 0x4343, 0xEEEE, 0x3231, opcodes, 1, {C: true, H: true, N: false}, ["PC", "HL"])
        makeMath16Test('addition resulting in no carry', 'ADD', 'HL', val, 0x4343, 0x1111, 0x5454, opcodes, 1, {C: false, H: false, N: false}, ["PC", "HL"])
      })
    }
  )

  // ADD HL, HL
  describe('ADD HL, HL', function() {
    makeMath16Test('addition resulting in carry', 'ADD', 'HL', 'HL', 0xA8A1, 0xA8A1, 0x5142, [0x29], 1, {C: true, H: true, N: false}, ["PC", "HL"])
    makeMath16Test('addition resulting in no carry', 'ADD', 'HL', 'HL', 0x4343, 0x4343, 0x8686, [0x29], 1, {C: false, H: false, N: false}, ["PC", "HL"])
  })

  // ADD IX, [BC,DE,SP]
  const regs4 = {
    BC: [0xDD, 0x09],
    DE: [0xDD, 0x19],
    SP: [0xDD, 0x39],
  }
  Object.getOwnPropertyNames(regs4).forEach(
    (val) => {
      const opcodes = regs4[val]
      describe(`ADD IX, ${val}`, function() {
        makeMath16Test('addition resulting in carry', 'ADD', 'IX', val, 0x4343, 0xEEEE, 0x3231, opcodes, 2, {C: true, H: true, N: false}, ["PC", "IX"])
        makeMath16Test('addition resulting in no carry', 'ADD', 'IX', val, 0x4343, 0x1111, 0x5454, opcodes, 2, {C: false, H: false, N: false}, ["PC", "IX"])
      })
    }
  )

  // ADD IX, IX
  describe('ADD IX, IX', function() {
    makeMath16Test('addition resulting in carry', 'ADD', 'IX', 'IX', 0xA8A1, 0xA8A1, 0x5142, [0xDD, 0x29], 2, {C: true, H: true, N: false}, ["PC", "IX"])
    makeMath16Test('addition resulting in no carry', 'ADD', 'IX', 'IX', 0x4343, 0x4343, 0x8686, [0xDD, 0x29], 2, {C: false, H: false, N: false}, ["PC", "IX"])
  })

  // ADD IY, [BC,DE,SP]
  const regs5 = {
    BC: [0xFD, 0x09],
    DE: [0xFD, 0x19],
    SP: [0xFD, 0x39],
  }
  Object.getOwnPropertyNames(regs5).forEach(
    (val) => {
      const opcodes = regs5[val]
      describe(`ADD IY, ${val}`, function() {
        makeMath16Test('addition resulting in carry', 'ADD', 'IY', val, 0x4343, 0xEEEE, 0x3231, opcodes, 2, {C: true, H: true, N: false}, ["PC", "IY"])
        makeMath16Test('addition resulting in no carry', 'ADD', 'IY', val, 0x4343, 0x1111, 0x5454, opcodes, 2, {C: false, H: false, N: false}, ["PC", "IY"])
      })
    }
  )

  // ADD IY, IY
  describe('ADD IY, IY', function() {
    makeMath16Test('addition resulting in carry', 'ADD', 'IY', 'IY', 0xA8A1, 0xA8A1, 0x5142, [0xFD, 0x29], 2, {C: true, H: true, N: false}, ["PC", "IY"])
    makeMath16Test('addition resulting in no carry', 'ADD', 'IY', 'IY', 0x4343, 0x4343, 0x8686, [0xFD, 0x29], 2, {C: false, H: false, N: false}, ["PC", "IY"])
  })

})
