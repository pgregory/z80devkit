import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

const shouldNotAlterFlags = function() {
  it('should not alter flags', function() {
    assert.equal(this.z80.flags.S, this.initFlags.S, 'S unchanged')
    assert.equal(this.z80.flags.Z, this.initFlags.Z, 'Z unchanged')
    assert.equal(this.z80.flags.Y, this.initFlags.Y, 'Y unchanged')
    assert.equal(this.z80.flags.H, this.initFlags.H, 'H unchanged')
    assert.equal(this.z80.flags.X, this.initFlags.X, 'X unchanged')
    assert.equal(this.z80.flags.P, this.initFlags.P, 'P unchanged')
    assert.equal(this.z80.flags.N, this.initFlags.N, 'N unchanged')
    assert.equal(this.z80.flags.C, this.initFlags.C, 'C unchanged')
  })
}

const allRegs = { 
  'A': ['AF'], 
  'F': ['AF'], 
  'B': ['BC'], 
  'C': ['BC'], 
  'D': ['DE'], 
  'E': ['DE'], 
  'H': ['HL'], 
  'L': ['HL'],
  'A_': ['AF_'], 
  'F_': ['AF_'], 
  'B_': ['BC_'], 
  'C_': ['BC_'], 
  'D_': ['DE_'], 
  'E_': ['DE_'], 
  'H_': ['HL_'], 
  'L_': ['HL_'], 
  'IXh': ['IX'], 
  'IXl': ['IX'], 
  'IYh': ['IY'], 
  'IYl': ['IY'], 
  'I': ['IR'], 
  'R': ['IR'], 
  'AF': ['A', 'F'], 
  'BC': ['B', 'C'], 
  'DE': ['D', 'E'], 
  'HL': ['H', 'L'], 
  'AF_': ['A_', 'F_'], 
  'BC_': ['B_', 'C_'], 
  'DE_': ['D_', 'E_'], 
  'HL_': ['H_', 'L_'], 
  'IX': ['IXh', 'IXl'], 
  'IY': ['IYh', 'IYl'], 
  'IR': ['I', 'R'], 
  'SP': [], 
  'PC': [],
}

const shouldNotAffectRegisters = function(registers) {
  let regString = Object.getOwnPropertyNames(registers).join(', ')
  it(`should leave registers [${regString}]`, function() {
    Object.getOwnPropertyNames(registers).forEach(
      (val) => {
        if(val in this.z80.regOffsets8) {
          assert.equal(this.z80.reg8[this.z80.regOffsets8[val]], this.initReg8[this.z80.regOffsets8[val]],
            `${val} unchanged`)
        } else if(val in this.z80.regOffsets16) {
          assert.equal(this.z80.reg16[this.z80.regOffsets16[val]], this.initReg16[this.z80.regOffsets16[val]],
            `${val} unchanged`)
        }
      }
    )
  })
}

function makeLDr_rTests(regA, regB, opcodes, length) {
  describe(`LD ${regA}, ${regB}`, function() {
    beforeEach(function() {
      const code = new Uint8Array(opcodes)
      this.mmu.copyFrom(code, 0)
      this.z80.reg16[this.z80.regOffsets16.PC] = 0
      this.z80.reg8[this.z80.regOffsets8[regB]] = 0x12
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
      // Now execute the instruction
      this.z80.stepExecution()
    })
    it(`should set register ${regA} to the value of ${regB}`, function() {
      assert.equal(this.z80.reg8[this.z80.regOffsets8[regA]], 0x12,
        `${regA} === 0x12`)
    })
    it(`should advance PC by 1`, function() {
      assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + length,
        `PC === PC + ${length}`)
    })
    shouldNotAlterFlags()
    const cleanRegs = Object.assign({}, allRegs)
    delete cleanRegs[regA]
    delete cleanRegs["PC"]
    if(allRegs[regA].length > 0) {
      for(let o in allRegs[regA]) {
        delete cleanRegs[allRegs[regA][o]]
      }
    }
    shouldNotAffectRegisters(cleanRegs)
  })
}

function makeLDrr_nnTests(regA, val, opcodes, length) {
  describe(`LD ${regA}, ${('000' + val.toString(16)).substr(-4).toUpperCase()}H`, function() {
    beforeEach(function() {
      const code = new Uint8Array(opcodes)
      this.mmu.copyFrom(code, 0)
      this.z80.reg16[this.z80.regOffsets16.PC] = 0
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
      this.z80.stepExecution()
    })
    it(`should set register ${regA} to ${('000' + val.toString(16)).substr(-4).toUpperCase()}H`, function() {
      assert.equal(this.z80.reg16[this.z80.regOffsets16[regA]], val,
        `${regA} === ${('000' + val.toString(16)).substr(-4).toUpperCase()}H`)
    })
    it(`should advance PC by ${length}`, function() {
      assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + length,
        `PC === PC + ${length}`)
    })
    shouldNotAlterFlags()
    const cleanRegs = Object.assign({}, allRegs)
    delete cleanRegs[regA]
    delete cleanRegs["PC"]
    if(allRegs[regA].length > 0) {
      for(let o in allRegs[regA]) {
        delete cleanRegs[allRegs[regA][o]]
      }
    }
    shouldNotAffectRegisters(cleanRegs)
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
            makeLDr_rTests(val, val2, [opcode], 1)
          }
        )
      }
    )

    makeLDr_rTests('A', 'I', [0xED, 0x57], 2)
    makeLDr_rTests('A', 'R', [0xED, 0x5F], 2)
    makeLDr_rTests('I', 'A', [0xED, 0x47], 2)
    makeLDr_rTests('R', 'A', [0xED, 0x4F], 2)

    Object.getOwnPropertyNames(regs).forEach(
      (val) => {
        if(val !== 'H' && val !== 'L') {
          // LD [A,B,C,D,E], [IX[h,l]/IY[h,l]]
          let opcode = 0x40 | (regs[val] << 3) | regs.H
          makeLDr_rTests(val, 'IXh', [0xDD, opcode], 2)
          makeLDr_rTests(val, 'IYh', [0xFD, opcode], 2)
          opcode = 0x40 | (regs[val] << 3) | regs.L
          makeLDr_rTests(val, 'IXl', [0xDD, opcode], 2)
          makeLDr_rTests(val, 'IYl', [0xFD, opcode], 2)

          // LD [IX[h,l]/IY[h,l]], [A,B,C,D,E]
          opcode = 0x40 | (regs.H << 3) | regs[val]
          makeLDr_rTests('IXh', val, [0xDD, opcode], 2)
          makeLDr_rTests('IYh', val, [0xFD, opcode], 2)
          opcode = 0x40 | (regs.L << 3) | (regs[val])
          makeLDr_rTests('IXl', val, [0xDD, opcode], 2)
          makeLDr_rTests('IYl', val, [0xFD, opcode], 2)
        }
      }
    )

    // LD [IXh, IXl], [IXh, IXl]
    makeLDr_rTests('IXh', 'IXh', [0xDD, 0x64], 2)
    makeLDr_rTests('IXh', 'IXl', [0xDD, 0x65], 2)
    makeLDr_rTests('IXl', 'IXh', [0xDD, 0x6C], 2)
    makeLDr_rTests('IXl', 'IXl', [0xDD, 0x6D], 2)
    makeLDr_rTests('IYh', 'IYh', [0xFD, 0x64], 2)
    makeLDr_rTests('IYh', 'IYl', [0xFD, 0x65], 2)
    makeLDr_rTests('IYl', 'IYh', [0xFD, 0x6C], 2)
    makeLDr_rTests('IYl', 'IYl', [0xFD, 0x6D], 2)

    // LD [BC,DE,HL,SP,IX,IY], nn
    makeLDrr_nnTests('BC', 0x1234, [0x01, 0x34, 0x12], 3)
    makeLDrr_nnTests('DE', 0x1234, [0x11, 0x34, 0x12], 3)
    makeLDrr_nnTests('HL', 0x1234, [0x21, 0x34, 0x12], 3)
    makeLDrr_nnTests('SP', 0x1234, [0x31, 0x34, 0x12], 3)
    makeLDrr_nnTests('IX', 0x1234, [0xDD, 0x21, 0x34, 0x12], 4)
    makeLDrr_nnTests('IY', 0x1234, [0xFD, 0x21, 0x34, 0x12], 4)

    describe('LD SP, HL', function() {
      beforeEach(function() {
        const code = new Uint8Array([0xF9])
        this.mmu.copyFrom(code, 0)
        this.z80.reg16[this.z80.regOffsets16.PC] = 0
        this.z80.reg16[this.z80.regOffsets16.HL] = 0x1234
        this.initFlags = Object.assign({}, this.z80.flags)
        this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
        this.initReg8 = new Uint8Array(this.initRegs)
        this.initReg16 = new Uint16Array(this.initRegs)
        this.initReg8.set(this.z80.reg8)
        this.z80.stepExecution()
      })
      it(`should set register SP to 1234H`, function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.HL], 0x1234,
          `SP === 1234H`)
      })
      it(`should advance PC by 1`, function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + 1,
          'PC === PC + 1')
      })
      shouldNotAlterFlags()
      const cleanRegs = Object.assign({}, allRegs)
      delete cleanRegs["SP"]
      delete cleanRegs["PC"]
      shouldNotAffectRegisters(cleanRegs)
    })
  })
})
