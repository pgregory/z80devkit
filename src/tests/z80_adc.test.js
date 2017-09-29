import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

import {shouldNotAlterFlags, selectRegs, shouldNotAffectRegisters} from './helpers.js'

function makeADCA_rTests(regA, opcodes, length) {
  describe(`ADC A, ${regA}`, function() {
    beforeEach(function() {
      const code = new Uint8Array(opcodes)
      this.mmu.copyFrom(code, 0)
      this.z80.reg16[this.z80.regOffsets16.PC] = 0
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
    })
    describe('Addition with carry, resulting in carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x81
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x80
        this.z80.flags.C = true
        this.z80.stepExecution()
      })
      it('should set result in A to 02H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x02,
          'A === 02H')
      })
      it(`should advance PC by ${length}`, function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + length,
          `PC === PC + ${length}`)
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A", regA]))
    })
    describe('Addition with no carry, resulting in carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x81
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x80
        this.z80.flags.C = false
        this.z80.stepExecution()
      })
      it('should set result in A to 01H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x01,
          'A === 01H')
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A", regA]))
    })
    describe('Addition with no carry, resulting in zero and no carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x00
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x00
        this.z80.flags.C = false
        this.z80.stepExecution()
      })
      it('should set result in A to 00H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x00,
          'A === 00H')
      })
      it('should reset the carry flag', function() {
        assert.equal(this.z80.flags.C, false, 'carry flag reset')
      })
      it('should set the zero flag', function() {
        assert.equal(this.z80.flags.Z, true, 'zero flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A", regA]))
    })
    describe('Addition with carry, resutling in overflow', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x78
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x69
        this.z80.flags.C = true
        this.z80.stepExecution()
      })
      it('should set result in A to E2H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0xE2,
          'A === E2H')
      })
      it('should set the overflow flag', function() {
        assert.equal(this.z80.flags.P, true, 'overflow flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A", regA]))
    })
    describe('Addition without carry, resulting in overflow', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x78
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x88
        this.z80.flags.C = false
        this.z80.stepExecution()
      })
      it('should set result in A to 00H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x00,
          'A === 00H')
      })
      it('should reset the overflow flag', function() {
        assert.equal(this.z80.flags.P, false, 'overflow flag reset')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A", regA]))
    })
  })
}

function makeADDrr_rrTests(regA, regB, opcodes, length) {
  describe(`ADD ${regA}, ${regB}`, function() {
    beforeEach(function() {
      const code = new Uint8Array(opcodes)
      this.mmu.copyFrom(code, 2)
      this.z80.reg16[this.z80.regOffsets16.PC] = 2
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
    })
    describe('Addition with carry', function() {
      beforeEach(function() {
        this.z80.reg16[this.z80.regOffsets16[regA]] = 0x4343
        this.z80.reg16[this.z80.regOffsets16[regB]] = 0xEEEE
        this.initReg8.set(this.z80.reg8)
        this.z80.stepExecution()
      })
      it(`should set result in ${regA} to 3231H`, function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16[regA]], 0x3231,
          `${regA} === 3231H`)
      })
      it(`should advance PC by ${length}`, function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + length,
          `PC === PC + ${length}`)
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      it('should set the half carry flag', function() {
        assert.equal(this.z80.flags.H, true, 'half carry flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", regA]))
    })
    describe('Addition with no carry', function() {
      beforeEach(function() {
        this.z80.reg16[this.z80.regOffsets16[regA]] = 0x4343
        this.z80.reg16[this.z80.regOffsets16[regB]] = 0x1111
        this.initReg8.set(this.z80.reg8)
        this.z80.stepExecution()
      })
      it(`should set result in ${regA} to 5454H`, function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16[regA]], 0x5454,
          `${regA} === 5454H`)
      })
      it('should reset the carry flag', function() {
        assert.equal(this.z80.flags.C, false, 'carry flag reset')
      })
      it('should reset the half carry flag', function() {
        assert.equal(this.z80.flags.C, false, 'carry flag reset')
      })
      shouldNotAffectRegisters(selectRegs(["PC", regA]))
    })
  })
}

describe('ADC', function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
    this.cleanRegs = {}
  })

  // ADC A, [B,C,D,E,H,L]
  describe('ADD A,r', function() {
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
        // ADD A, [B,C,D,E,H,L]
        const opcode = 0x80 | (regs[val]) | 0x8
        makeADCA_rTests(val, [opcode], 1)
      }
    )
    
    makeADCA_rTests('IXh', [0xDD, 0x8C], 2)
    makeADCA_rTests('IXl', [0xDD, 0x8D], 2)
    makeADCA_rTests('IYh', [0xFD, 0x8C], 2)
    makeADCA_rTests('IYl', [0xFD, 0x8D], 2)
  })

})
