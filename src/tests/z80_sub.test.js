import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

import {shouldNotAlterFlags, selectRegs, shouldNotAffectRegisters} from './helpers.js'

function makeSUBA_rTests(regA, opcodes, length) {
  describe(`SUB A, ${regA}`, function() {
    beforeEach(function() {
      const code = new Uint8Array(opcodes)
      this.mmu.copyFrom(code, 0)
      this.z80.reg16[this.z80.regOffsets16.PC] = 0
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
    })
    describe('Subtract resulting in carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x00
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x01
        this.initReg8.set(this.z80.reg8)
        this.z80.stepExecution()
      })
      it('should set result in A to FFH', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0xFF,
          'A === FFH')
      })
      it(`should advance PC by ${length}`, function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + length,
          `PC === PC + ${length}`)
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      it('should set the sign flag', function() {
        assert.equal(this.z80.flags.S, true, 'sign flag set')
      })
      it('should set the add/sub flag', function() {
        assert.equal(this.z80.flags.N, true, 'add/sub flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Subtract resulting in no carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x02
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x01
        this.initReg8.set(this.z80.reg8)
        this.z80.stepExecution()
      })
      it('should set result in A to 01H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x01,
          'A === 01H')
      })
      it('should reset the carry flag', function() {
        assert.equal(this.z80.flags.C, false, 'carry flag reset')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A", regA]))
    })
    describe('Subtract resulting in zero', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x01
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x01
        this.initReg8.set(this.z80.reg8)
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
    describe('Subtract resulting in overflow', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x80
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x10
        this.initReg8.set(this.z80.reg8)
        this.z80.stepExecution()
      })
      it('should set result in A to 70H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x70,
          'A === 70H')
      })
      it('should set the overflow flag', function() {
        assert.equal(this.z80.flags.P, true, 'overflow flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Subtract result in no overflow', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x20
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x10
        this.initReg8.set(this.z80.reg8)
        this.z80.stepExecution()
      })
      it('should set result in A to 10H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x10,
          'A === 10H')
      })
      it('should reset the overflow flag', function() {
        assert.equal(this.z80.flags.P, false, 'overflow flag reset')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A", regA]))
    })
  })
}

describe('SUB', function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
    this.cleanRegs = {}
  })

  // SUB A, [B,C,D,E,H,L]
  describe('SUB A,r', function() {
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
        // SUB A, [B,C,D,E,H,L]
        const opcode = 0x90 | (regs[val])
        makeSUBA_rTests(val, [opcode], 1)
      }
    )
  })

  // Special case SUB A,A
  describe('SUB A, A', function() {
    beforeEach(function() {
      const code = new Uint8Array([0x97])
      this.mmu.copyFrom(code, 0)
      this.z80.reg16[this.z80.regOffsets16.PC] = 0
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
    })
    describe('Subtract result in zero', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x81
        this.z80.stepExecution()
      })
      it('should set result in A to 00H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x00,
          'A === 00H')
      })
      it('should advance PC by 1', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + 1,
          'PC === PC + 1')
      })
      it('should set the zero flag', function() {
        assert.equal(this.z80.flags.Z, true, 'zero flag set')
      })
      it('should set the add/sub flag', function() {
        assert.equal(this.z80.flags.N, true, 'add/sub flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
  }) 


  // SUB A, (HL)
  describe('SUB A, (HL)', function() {
    beforeEach(function() {
      const code = new Uint8Array([0x96])
      this.mmu.copyFrom(code, 2)
      this.z80.reg16[this.z80.regOffsets16.PC] = 2
      this.z80.reg16[this.z80.regOffsets16.HL] = 0x0001
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
    })
    describe('Subtract resulting in carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x00
        this.mmu.writeByte(0x0001, 0x01)
        this.z80.stepExecution()
      })
      it('should set result in A to FFH', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0xFF,
          'A === FFH')
      })
      it('should advance PC by 1', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + 1,
          'PC === PC + 1')
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      it('should set the sign flag', function() {
        assert.equal(this.z80.flags.S, true, 'sign flag set')
      })
      it('should set the add/sub flag', function() {
        assert.equal(this.z80.flags.N, true, 'add/sub flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Subtract resulting in no carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x02
        this.mmu.writeByte(0x0001, 0x01)
        this.initReg8.set(this.z80.reg8)
        this.z80.stepExecution()
      })
      it('should set result in A to 01H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x01,
          'A === 01H')
      })
      it('should reset the carry flag', function() {
        assert.equal(this.z80.flags.C, false, 'carry flag reset')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Subtract resulting in zero', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x01
        this.mmu.writeByte(0x0001, 0x01)
        this.initReg8.set(this.z80.reg8)
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
    describe('Subtract resulting in overflow', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x80
        this.mmu.writeByte(0x0001, 0x10)
        this.initReg8.set(this.z80.reg8)
        this.z80.stepExecution()
      })
      it('should set result in A to 70H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x70,
          'A === 70H')
      })
      it('should set the overflow flag', function() {
        assert.equal(this.z80.flags.P, true, 'overflow flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Subtract result in no overflow', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x20
        this.mmu.writeByte(0x0001, 0x10)
        this.initReg8.set(this.z80.reg8)
        this.z80.stepExecution()
      })
      it('should set result in A to 10H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x10,
          'A === 10H')
      })
      it('should reset the overflow flag', function() {
        assert.equal(this.z80.flags.P, false, 'overflow flag reset')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
  })


  // SUB A, (IX+d)
  /*describe('ADD A, (IX+d)', function() {
    beforeEach(function() {
      const code = new Uint8Array([0xDD, 0x86, 0x01])
      this.mmu.copyFrom(code, 2)
      this.z80.reg16[this.z80.regOffsets16.PC] = 2
      this.z80.reg16[this.z80.regOffsets16.IX] = 0
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
    })
    describe('Addition with carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x81
        this.mmu.writeByte(1, 0x80)
        this.z80.stepExecution()
      })
      it('should set result in A to 01H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x01,
          'A === 01H')
      })
      it('should advance PC by 3', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + 3,
          'PC === PC + 3')
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Addition with no carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x21
        this.mmu.writeByte(1, 0x20)
        this.z80.stepExecution()
      })
      it('should set result in A to 41H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x41,
          'A === 41H')
      })
      it('should reset the carry flag', function() {
        assert.equal(this.z80.flags.C, false, 'carry flag reset')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Addition with zero result, no carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x00
        this.mmu.writeByte(1, 0x00)
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
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Addition with zero result, and carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x80
        this.mmu.writeByte(1, 0x80)
        this.z80.stepExecution()
      })
      it('should set result in A to 00H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x00,
          'A === 00H')
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      it('should set the zero flag', function() {
        assert.equal(this.z80.flags.Z, true, 'zero flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Addition with overflow', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x78
        this.mmu.writeByte(1, 0x69)
        this.z80.stepExecution()
      })
      it('should set result in A to E1H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0xE1,
          'A === E1H')
      })
      it('should set the overflow flag', function() {
        assert.equal(this.z80.flags.P, true, 'overflow flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Addition with no overflow', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x78
        this.mmu.writeByte(1, 0x88)
        this.z80.stepExecution()
      })
      it('should set result in A to 00H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x00,
          'A === 00H')
      })
      it('should reset the overflow flag', function() {
        assert.equal(this.z80.flags.P, false, 'overflow flag reset')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
  }) */


  // SUB A, (IY+d)
  /*describe('ADD A, (IX+d)', function() {
    beforeEach(function() {
      const code = new Uint8Array([0xFD, 0x86, 0x01])
      this.mmu.copyFrom(code, 2)
      this.z80.reg16[this.z80.regOffsets16.PC] = 2
      this.z80.reg16[this.z80.regOffsets16.IY] = 0
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
    })
    describe('Addition with carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x81
        this.mmu.writeByte(1, 0x80)
        this.z80.stepExecution()
      })
      it('should set result in A to 01H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x01,
          'A === 01H')
      })
      it('should advance PC by 3', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + 3,
          'PC === PC + 3')
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Addition with no carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x21
        this.mmu.writeByte(1, 0x20)
        this.z80.stepExecution()
      })
      it('should set result in A to 41H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x41,
          'A === 41H')
      })
      it('should reset the carry flag', function() {
        assert.equal(this.z80.flags.C, false, 'carry flag reset')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Addition with zero result, no carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x00
        this.mmu.writeByte(1, 0x00)
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
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Addition with zero result, and carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x80
        this.mmu.writeByte(1, 0x80)
        this.z80.stepExecution()
      })
      it('should set result in A to 00H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x00,
          'A === 00H')
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      it('should set the zero flag', function() {
        assert.equal(this.z80.flags.Z, true, 'zero flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Addition with overflow', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x78
        this.mmu.writeByte(1, 0x69)
        this.z80.stepExecution()
      })
      it('should set result in A to E1H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0xE1,
          'A === E1H')
      })
      it('should set the overflow flag', function() {
        assert.equal(this.z80.flags.P, true, 'overflow flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Addition with no overflow', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x78
        this.mmu.writeByte(1, 0x88)
        this.z80.stepExecution()
      })
      it('should set result in A to 00H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x00,
          'A === 00H')
      })
      it('should reset the overflow flag', function() {
        assert.equal(this.z80.flags.P, false, 'overflow flag reset')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
  }) */


  // ADD A, n
  /*describe('ADD A, n', function() {
    beforeEach(function() {
      this.z80.reg16[this.z80.regOffsets16.PC] = 2
      this.z80.reg16[this.z80.regOffsets16.IY] = 0
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
    })
    describe('Addition with carry', function() {
      beforeEach(function() {
        const code = new Uint8Array([0xC6, 0x80])
        this.mmu.copyFrom(code, 2)
        this.z80.reg8[this.z80.regOffsets8.A] = 0x81
        this.z80.stepExecution()
      })
      it('should set result in A to 01H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x01,
          'A === 01H')
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
    describe('Addition with no carry', function() {
      beforeEach(function() {
        const code = new Uint8Array([0xC6, 0x20])
        this.mmu.copyFrom(code, 2)
        this.z80.reg8[this.z80.regOffsets8.A] = 0x21
        this.z80.stepExecution()
      })
      it('should set result in A to 41H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x41,
          'A === 41H')
      })
      it('should reset the carry flag', function() {
        assert.equal(this.z80.flags.C, false, 'carry flag reset')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Addition with zero result, no carry', function() {
      beforeEach(function() {
        const code = new Uint8Array([0xC6, 0x00])
        this.mmu.copyFrom(code, 2)
        this.z80.reg8[this.z80.regOffsets8.A] = 0x00
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
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Addition with zero result, and carry', function() {
      beforeEach(function() {
        const code = new Uint8Array([0xC6, 0x80])
        this.mmu.copyFrom(code, 2)
        this.z80.reg8[this.z80.regOffsets8.A] = 0x80
        this.z80.stepExecution()
      })
      it('should set result in A to 00H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x00,
          'A === 00H')
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      it('should set the zero flag', function() {
        assert.equal(this.z80.flags.Z, true, 'zero flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Addition with overflow', function() {
      beforeEach(function() {
        const code = new Uint8Array([0xC6, 0x69])
        this.mmu.copyFrom(code, 2)
        this.z80.reg8[this.z80.regOffsets8.A] = 0x78
        this.z80.stepExecution()
      })
      it('should set result in A to E1H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0xE1,
          'A === E1H')
      })
      it('should set the overflow flag', function() {
        assert.equal(this.z80.flags.P, true, 'overflow flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Addition with no overflow', function() {
      beforeEach(function() {
        const code = new Uint8Array([0xC6, 0x88])
        this.mmu.copyFrom(code, 2)
        this.z80.reg8[this.z80.regOffsets8.A] = 0x78
        this.z80.stepExecution()
      })
      it('should set result in A to 00H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x00,
          'A === 00H')
      })
      it('should reset the overflow flag', function() {
        assert.equal(this.z80.flags.P, false, 'overflow flag reset')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
  }) */
})
