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
      const opcode = 0x90 | (regs[val])
      describe(`SUB A, ${val}`, function() {
        makeMath8Test('subtract resulting in carry', 'SUB', val, 'register', 0, 0x00, 0x01, 0xFF, [opcode], 1, {C: true, S: true, N: true}, ["PC", "A"])
        makeMath8Test('subtract resulting in no carry', 'SUB', val, 'register', 0, 0x02, 0x01, 0x01, [opcode], 1, {C: false, N: true}, ["PC", "A"])
        makeMath8Test('subtract resulting in zero', 'SUB', val, 'register', 0, 0x01, 0x01, 0x00, [opcode], 1, {Z: true, N: true}, ["PC", "A"])
        makeMath8Test('subtract resulting in overflow', 'SUB', val, 'register', 0, 0x80, 0x10, 0x70, [opcode], 1, {P: true, N: true}, ["PC", "A"])
      })
    }
  )
  // SUB A,A
  describe(`SUB A, A`, function() {
    makeMath8Test('subtract resulting in zero', 'SUB', 'A', 'register', 0, 0x81, 0x81, 0x00, [0x97], 1, {Z: true, N: true}, ["PC", "A"])
  })

  // SUB A, (HL)
  describe('SUB A, (HL)', function() {
    makeMath8Test('subtract resulting in carry', 'SUB', 'HL', 'register indirect', 0, 0x00, 0x01, 0xFF, [0x96], 1, {C: true, S: true, N: true}, ["PC", "A"])
    makeMath8Test('subtract resulting in no carry', 'SUB', 'HL', 'register indirect', 0, 0x02, 0x01, 0x01, [0x96], 1, {C: false, N: true}, ["PC", "A"])
    makeMath8Test('subtract resulting in zero', 'SUB', 'HL', 'register indirect', 0, 0x01, 0x01, 0x00, [0x96], 1, {Z: true, N: true}, ["PC", "A"])
    makeMath8Test('subtract resulting in overflow', 'SUB', 'HL', 'register indirect', 0, 0x80, 0x10, 0x70, [0x96], 1, {P: true, N: true}, ["PC", "A"])
  })

  // SUB A, n 
  describe('SUB A, n', function() {
    makeMath8Test('subtract resulting in carry', 'SUB', null, 'immediate', 1, 0x00, 0x01, 0xFF, [0xD6, 0x01], 2, {C: true, S: true, N: true}, ["PC", "A"])
    makeMath8Test('subtract resulting in no carry', 'SUB', null, 'immediate', 1, 0x02, 0x01, 0x01, [0xD6, 0x01], 2, {C: false, N: true}, ["PC", "A"])
    makeMath8Test('subtract resulting in zero', 'SUB', null, 'immediate', 1, 0x01, 0x01, 0x00, [0xD6, 0x01], 2, {Z: true, N: true}, ["PC", "A"])
    makeMath8Test('subtract resulting in overflow', 'SUB', null, 'immediate', 1, 0x80, 0x10, 0x70, [0xD6, 0x10], 2, {P: true, N: true}, ["PC", "A"])
  })

  // SUB A, (IX+d)
  describe('SUB A, (IX+d)', function() {
    makeMath8Test('subtract resulting in carry', 'SUB', 'IX', 'indexed', 1, 0x00, 0x01, 0xFF, [0xDD, 0x96, 0x1], 3, {C: true, S: true, N: true}, ["PC", "A"])
    makeMath8Test('subtract resulting in no carry', 'SUB', 'IX', 'indexed', 1, 0x02, 0x01, 0x01, [0xDD, 0x96, 0x1], 3, {C: false, N: true}, ["PC", "A"])
    makeMath8Test('subtract resulting in zero', 'SUB', 'IX', 'indexed', 1, 0x01, 0x01, 0x00, [0xDD, 0x96, 0x1], 3, {Z: true, N: true}, ["PC", "A"])
    makeMath8Test('subtract resulting in overflow', 'SUB', 'IX', 'indexed', 1, 0x80, 0x10, 0x70, [0xDD, 0x96, 0x1], 3, {P: true, N: true}, ["PC", "A"])
  })

  // SUB A, (IY+d)
  describe('SUB A, (IY+d)', function() {
    makeMath8Test('subtract resulting in carry', 'SUB', 'IY', 'indexed', 1, 0x00, 0x01, 0xFF, [0xFD, 0x96, 0x1], 3, {C: true, S: true, N: true}, ["PC", "A"])
    makeMath8Test('subtract resulting in no carry', 'SUB', 'IY', 'indexed', 1, 0x02, 0x01, 0x01, [0xFD, 0x96, 0x1], 3, {C: false, N: true}, ["PC", "A"])
    makeMath8Test('subtract resulting in zero', 'SUB', 'IY', 'indexed', 1, 0x01, 0x01, 0x00, [0xFD, 0x96, 0x1], 3, {Z: true, N: true}, ["PC", "A"])
    makeMath8Test('subtract resulting in overflow', 'SUB', 'IY', 'indexed', 1, 0x80, 0x10, 0x70, [0xFD, 0x96, 0x1], 3, {P: true, N: true}, ["PC", "A"])
  })
})
