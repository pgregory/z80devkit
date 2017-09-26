import Z80 from '../z80.js'
import MMU from '../mmu.js'

import assert from 'assert'

const shouldNotAlterFlags = function() {
  it('should not alter flags', function() {
    assert.equal(this.initFlags.S, this.z80.flags.S)
    assert.equal(this.initFlags.Z, this.z80.flags.Z)
    assert.equal(this.initFlags.Y, this.z80.flags.Y)
    assert.equal(this.initFlags.H, this.z80.flags.H)
    assert.equal(this.initFlags.X, this.z80.flags.X)
    assert.equal(this.initFlags.P, this.z80.flags.P)
    assert.equal(this.initFlags.N, this.z80.flags.N)
    assert.equal(this.initFlags.C, this.z80.flags.C)
  })
}

function makeLDr_rTests(regA, regB, opcodes) {
  describe(`LD ${regA}, ${regB}`, function() {
    beforeEach(function() {
      const code = new Uint8Array(opcodes)
      this.mmu.copyFrom(code, 0)
      this.z80.reg16[this.z80.regOffsets16.PC] = 0
      this.z80.reg8[this.z80.regOffsets8[regB]] = 0x12
      this.initFlags = Object.assign({}, this.z80.flags)
      this.z80.stepExecution()
    })
    it(`should set register ${regA} to the value of ${regB}`, function() {
      assert.equal(0x12, this.z80.reg8[this.z80.regOffsets8[regA]])
    })
    shouldNotAlterFlags()
  })
}

function makeLDrr_nnTests(regA, val, opcodes) {
  describe(`LD ${regA}, ${('000' + val.toString(16)).substr(-4).toUpperCase()}H`, function() {
    beforeEach(function() {
      const code = new Uint8Array(opcodes)
      this.mmu.copyFrom(code, 0)
      this.z80.reg16[this.z80.regOffsets16.PC] = 0
      this.initFlags = Object.assign({}, this.z80.flags)
      this.z80.stepExecution()
    })
    it(`should set register ${regA} to ${('000' + val.toString(16)).substr(-4).toUpperCase()}H`, function() {
      assert.equal(val, this.z80.reg16[this.z80.regOffsets16[regA]])
    })
    shouldNotAlterFlags()
  })
}

describe('LD', function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
  })

  describe('LD r,r', function() {
    const regs = {
      A: 0x7,
      B: 0x0,
      C: 0x1,
      D: 0x2,
      E: 0x3,
      H: 0x4,
      L: 0x5,
    }

    Object.getOwnPropertyNames(regs).forEach(
      (val) => {
        Object.getOwnPropertyNames(regs).forEach(
          (val2) => {
            // LD [A,B,C,D,E,H,L], [A,B,C,D,E,H,L]
            const opcode = 0x40 | (regs[val] << 3) | (regs[val2])
            makeLDr_rTests(val, val2, [opcode])
          }
        )
      }
    )

    makeLDr_rTests('A', 'I', [0xED, 0x57])
    makeLDr_rTests('A', 'R', [0xED, 0x5F])
    makeLDr_rTests('I', 'A', [0xED, 0x47])
    makeLDr_rTests('R', 'A', [0xED, 0x4F])

    Object.getOwnPropertyNames(regs).forEach(
      (val) => {
        if(val !== 'H' && val !== 'L') {
          // LD [A,B,C,D,E], [IX[h,l]/IY[h,l]]
          let opcode = 0x40 | (regs[val] << 3) | regs.H
          makeLDr_rTests(val, 'IXh', [0xDD, opcode])
          makeLDr_rTests(val, 'IYh', [0xFD, opcode])
          opcode = 0x40 | (regs[val] << 3) | regs.L
          makeLDr_rTests(val, 'IXl', [0xDD, opcode])
          makeLDr_rTests(val, 'IYl', [0xFD, opcode])

          // LD [IX[h,l]/IY[h,l]], [A,B,C,D,E]
          opcode = 0x40 | (regs.H << 3) | regs[val]
          makeLDr_rTests('IXh', val, [0xDD, opcode])
          makeLDr_rTests('IYh', val, [0xFD, opcode])
          opcode = 0x40 | (regs.L << 3) | (regs[val])
          makeLDr_rTests('IXl', val, [0xDD, opcode])
          makeLDr_rTests('IYl', val, [0xFD, opcode])
        }
      }
    )

    // LD [IXh, IXl], [IXh, IXl]
    makeLDr_rTests('IXh', 'IXh', [0xDD, 0x64])
    makeLDr_rTests('IXh', 'IXl', [0xDD, 0x65])
    makeLDr_rTests('IXl', 'IXh', [0xDD, 0x6C])
    makeLDr_rTests('IXl', 'IXl', [0xDD, 0x6D])
    makeLDr_rTests('IYh', 'IYh', [0xFD, 0x64])
    makeLDr_rTests('IYh', 'IYl', [0xFD, 0x65])
    makeLDr_rTests('IYl', 'IYh', [0xFD, 0x6C])
    makeLDr_rTests('IYl', 'IYl', [0xFD, 0x6D])

    // LD [BC,DE,HL,SP,IX,IY], nn
    makeLDrr_nnTests('BC', 0x1234, [0x01, 0x34, 0x12])
    makeLDrr_nnTests('DE', 0x1234, [0x11, 0x34, 0x12])
    makeLDrr_nnTests('HL', 0x1234, [0x21, 0x34, 0x12])
    makeLDrr_nnTests('SP', 0x1234, [0x31, 0x34, 0x12])
    makeLDrr_nnTests('IX', 0x1234, [0xDD, 0x21, 0x34, 0x12])
    makeLDrr_nnTests('IY', 0x1234, [0xFD, 0x21, 0x34, 0x12])
  })
})
