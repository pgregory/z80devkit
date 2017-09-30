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
    describe('Add with C == 1, resulting in carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x81
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x81
        this.z80.flags.C = true
        this.z80.stepExecution()
      })
      it('should set result in A to 03H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x03,
          'A === 03H')
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
    describe('Add with C == 0, resulting in carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x81
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x81
        this.z80.flags.C = false
        this.z80.stepExecution()
      })
      it('should set result in A to 02H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x02,
          'A === 02H')
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A", regA]))
    })
    describe('Add with C == 0, resulting in zero', function() {
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
      it('should set the zero flag', function() {
        assert.equal(this.z80.flags.Z, true, 'zero flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A", regA]))
    })
    // Impossible to do ADC A,A with carry and result in zero
    if(regA !== "A") {
      describe('Add with C == 1, resulting in zero', function() {
        beforeEach(function() {
          this.z80.reg8[this.z80.regOffsets8.A] = 0x80
          this.z80.reg8[this.z80.regOffsets8[regA]] = 0x7F
          this.z80.flags.C = true
          this.z80.stepExecution()
        })
        it('should set result in A to 00H', function() {
          assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x00,
            'A === 00H')
        })
        it('should set the zero flag', function() {
          assert.equal(this.z80.flags.Z, true, 'zero flag set')
        })
        shouldNotAffectRegisters(selectRegs(["PC", "A", regA]))
      })
    }
    describe('Add with C == 0, resulting in overflow', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x88
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x88
        this.z80.flags.C = false
        this.z80.stepExecution()
      })
      it('should set result in A to 10H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x10,
          'A === 10H')
      })
      it('should set the overflow flag', function() {
        assert.equal(this.z80.flags.P, true, 'overflow flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A", regA]))
    })
    describe('Add with C == 1, resulting in overflow', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x88
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x88
        this.z80.flags.C = true
        this.z80.stepExecution()
      })
      it('should set result in A to 11H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x11,
          'A === 11H')
      })
      it('should set the overflow flag', function() {
        assert.equal(this.z80.flags.P, true, 'overflow flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A", regA]))
    })
  })
}

function makeADCA_rrTests(regA, offset, opcodes, length) {
  describe(`ADC A, (${regA}${(regA !== 'HL')? '+d': ''})`, function() {
    beforeEach(function() {
      const code = new Uint8Array(opcodes)
      this.mmu.copyFrom(code, 2)
      this.z80.reg16[this.z80.regOffsets16.PC] = 2
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
    })
    describe('Add with C == 1, resulting in carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x81
        this.z80.reg16[this.z80.regOffsets16[regA]] = 0x0000
        this.mmu.writeByte(offset, 0x81)
        this.z80.flags.C = true
        this.z80.stepExecution()
      })
      it('should set result in A to 03H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x03,
          'A === 03H')
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
    describe('Add with C == 0, resulting in carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x81
        this.z80.reg16[this.z80.regOffsets16[regA]] = 0x0000
        this.mmu.writeByte(offset, 0x81)
        this.z80.flags.C = false
        this.z80.stepExecution()
      })
      it('should set result in A to 02H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x02,
          'A === 02H')
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A", regA]))
    })
    describe('Add with C == 0, resulting in zero', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x00
        this.z80.reg16[this.z80.regOffsets16[regA]] = 0x0000
        this.mmu.writeByte(offset, 0x00)
        this.z80.flags.C = false
        this.z80.stepExecution()
      })
      it('should set result in A to 00H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x00,
          'A === 00H')
      })
      it('should set the zero flag', function() {
        assert.equal(this.z80.flags.Z, true, 'zero flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A", regA]))
    })
    describe('Add with C == 1, resulting in zero', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x80
        this.z80.reg16[this.z80.regOffsets16[regA]] = 0x0000
        this.mmu.writeByte(offset, 0x7F)
        this.z80.flags.C = true
        this.z80.stepExecution()
      })
      it('should set result in A to 00H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x00,
          'A === 00H')
      })
      it('should set the zero flag', function() {
        assert.equal(this.z80.flags.Z, true, 'zero flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A", regA]))
    })
    describe('Add with C == 0, resulting in overflow', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x88
        this.z80.reg16[this.z80.regOffsets16[regA]] = 0x0000
        this.mmu.writeByte(offset, 0x88)
        this.z80.flags.C = false
        this.z80.stepExecution()
      })
      it('should set result in A to 10H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x10,
          'A === 10H')
      })
      it('should set the overflow flag', function() {
        assert.equal(this.z80.flags.P, true, 'overflow flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A", regA]))
    })
    describe('Add with C == 1, resulting in overflow', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x88
        this.z80.reg16[this.z80.regOffsets16[regA]] = 0x0000
        this.mmu.writeByte(offset, 0x88)
        this.z80.flags.C = true
        this.z80.stepExecution()
      })
      it('should set result in A to 11H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x11,
          'A === 11H')
      })
      it('should set the overflow flag', function() {
        assert.equal(this.z80.flags.P, true, 'overflow flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A", regA]))
    })
  })
}

function makeADCHL_rrTests(regA, opcodes, length) {
  describe(`ADC HL, ${regA}`, function() {
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
    describe('Add with C == 1, resulting in carry', function() {
      beforeEach(function() {
        this.z80.reg16[this.z80.regOffsets16.HL] = 0x8181
        this.z80.reg16[this.z80.regOffsets16[regA]] = 0x8181
        this.z80.flags.C = true
        this.z80.stepExecution()
      })
      it('should set result in HL 0303H', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.HL], 0x0303,
          'HL === 0303H')
      })
      it(`should advance PC by ${length}`, function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + length,
          `PC === PC + ${length}`)
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "HL", regA]))
    })
    describe('Add with C == 0, resulting in carry', function() {
      beforeEach(function() {
        this.z80.reg16[this.z80.regOffsets16.HL] = 0x8181
        this.z80.reg16[this.z80.regOffsets16[regA]] = 0x8181
        this.z80.flags.C = false
        this.z80.stepExecution()
      })
      it('should set result in HL to 0302H', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.HL], 0x0302,
          'HL === 0302H')
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "HL", regA]))
    })
    describe('Add with C == 0, resulting in zero', function() {
      beforeEach(function() {
        this.z80.reg16[this.z80.regOffsets16.HL] = 0x0000
        this.z80.reg16[this.z80.regOffsets16[regA]] = 0x0000
        this.z80.flags.C = false
        this.z80.stepExecution()
      })
      it('should set result in HL to 0000H', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.HL], 0x0000,
          'HL === 0000H')
      })
      it('should set the zero flag', function() {
        assert.equal(this.z80.flags.Z, true, 'zero flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "HL", regA]))
    })
    // Impossible to do ADC HL,HL with carry and result in zero
    if(regA !== "HL") {
      describe('Add with C == 1, resulting in zero', function() {
        beforeEach(function() {
          this.z80.reg16[this.z80.regOffsets16.HL] = 0x8000
          this.z80.reg16[this.z80.regOffsets16[regA]] = 0x7FFF
          this.z80.flags.C = true
          this.z80.stepExecution()
        })
        it('should set result in HL to 0000H', function() {
          assert.equal(this.z80.reg16[this.z80.regOffsets16.HL], 0x0000,
            'HL === 0000H')
        })
        it('should set the zero flag', function() {
          assert.equal(this.z80.flags.Z, true, 'zero flag set')
        })
        shouldNotAffectRegisters(selectRegs(["PC", "HL", regA]))
      })
    }
    describe('Add with C == 0, resulting in overflow', function() {
      beforeEach(function() {
        this.z80.reg16[this.z80.regOffsets16.HL] = 0x8888
        this.z80.reg16[this.z80.regOffsets16[regA]] = 0x8888
        this.z80.flags.C = false
        this.z80.stepExecution()
      })
      it('should set result in HL to 1110H', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.HL], 0x1110,
          'HL === 1110H')
      })
      it('should set the overflow flag', function() {
        assert.equal(this.z80.flags.P, true, 'overflow flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "HL", regA]))
    })
    describe('Add with C == 1, resulting in overflow', function() {
      beforeEach(function() {
        this.z80.reg16[this.z80.regOffsets16.HL] = 0x8888
        this.z80.reg16[this.z80.regOffsets16[regA]] = 0x8888
        this.z80.flags.C = true
        this.z80.stepExecution()
      })
      it('should set result in HL to 1111H', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.HL], 0x1111,
          'HL === 1111H')
      })
      it('should set the overflow flag', function() {
        assert.equal(this.z80.flags.P, true, 'overflow flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "HL", regA]))
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
  describe('ADC A,r', function() {
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

  // ADD A, [(HL),(IX+d),(IY+d)]
  makeADCA_rrTests('HL', 0x00, [0x8E], 1)
  makeADCA_rrTests('IX', 0x01, [0xDD, 0x8E, 0x01], 3)
  makeADCA_rrTests('IY', 0x01, [0xFD, 0x8E, 0x01], 3)


  // ADD A, n
  describe('ADC A, n', function() {
    beforeEach(function() {
      const code = new Uint8Array([0xCE])
      this.mmu.copyFrom(code, 0)
      this.z80.reg16[this.z80.regOffsets16.PC] = 0
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
    })
    describe('Add with C == 1, resulting in carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x81
        this.mmu.writeByte(0x0001, 0x81)
        this.z80.flags.C = true
        this.z80.stepExecution()
      })
      it('should set result in A to 03H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x03,
          'A === 03H')
      })
      it('should advance PC by 2', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + 2,
          'PC === PC + 2')
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Add with C == 0, resulting in carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x81
        this.mmu.writeByte(0x0001, 0x81)
        this.z80.flags.C = false
        this.z80.stepExecution()
      })
      it('should set result in A to 02H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x02,
          'A === 02H')
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Add with C == 0, resulting in zero', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x00
        this.mmu.writeByte(0x0001, 0x00)
        this.z80.flags.C = false
        this.z80.stepExecution()
      })
      it('should set result in A to 00H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x00,
          'A === 00H')
      })
      it('should set the zero flag', function() {
        assert.equal(this.z80.flags.Z, true, 'zero flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Add with C == 1, resulting in zero', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x80
        this.mmu.writeByte(0x0001, 0x7F)
        this.z80.flags.C = true
        this.z80.stepExecution()
      })
      it('should set result in A to 00H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x00,
          'A === 00H')
      })
      it('should set the zero flag', function() {
        assert.equal(this.z80.flags.Z, true, 'zero flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Add with C == 0, resulting in overflow', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x88
        this.mmu.writeByte(0x0001, 0x88)
        this.z80.flags.C = false
        this.z80.stepExecution()
      })
      it('should set result in A to 10H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x10,
          'A === 10H')
      })
      it('should set the overflow flag', function() {
        assert.equal(this.z80.flags.P, true, 'overflow flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Add with C == 1, resulting in overflow', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x88
        this.mmu.writeByte(0x0001, 0x88)
        this.z80.flags.C = true
        this.z80.stepExecution()
      })
      it('should set result in A to 11H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x11,
          'A === 11H')
      })
      it('should set the overflow flag', function() {
        assert.equal(this.z80.flags.P, true, 'overflow flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
  })

  // ADC HL, [BC,DE,HL,SP]
  makeADCHL_rrTests('BC', [0xED, 0x4A], 2)
  makeADCHL_rrTests('DE', [0xED, 0x5A], 2)
  makeADCHL_rrTests('DE', [0xED, 0x6A], 2)
  makeADCHL_rrTests('SP', [0xED, 0x7A], 2)
})
