import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

import {makeMath8Test} from './math.js'
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
})

// OLD

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
      it('should reset the add/sub flag', function() {
        assert.equal(this.z80.flags.N, false, 'add/sub flag reset')
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

describe('ADD16', function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
    this.cleanRegs = {}
  })

  // ADD HL, [BC,DE,HL,SP]
  makeADDrr_rrTests('HL', 'BC', [0x09], 1)
  makeADDrr_rrTests('HL', 'DE', [0x19], 1)
  makeADDrr_rrTests('HL', 'SP', [0x39], 1)

  // Special case for ADD HL, HL
  describe('ADD HL, HL', function() {
    beforeEach(function() {
      const code = new Uint8Array([0x29])
      this.mmu.copyFrom(code, 2)
      this.z80.reg16[this.z80.regOffsets16.PC] = 2
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
    })
    describe('Addition with carry', function() {
      beforeEach(function() {
        this.z80.reg16[this.z80.regOffsets16.HL] = 0xA8A1
        this.initReg8.set(this.z80.reg8)
        this.z80.stepExecution()
      })
      it('should set result in HL to 5142H', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.HL], 0x5142,
          'HL === 5142H')
      })
      it('should advance PC by 1', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + 1,
          'PC === PC + 1')
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      it('should set the half carry flag', function() {
        assert.equal(this.z80.flags.H, true, 'half carry flag set')
      })
      it('should reset the add/sub flag', function() {
        assert.equal(this.z80.flags.N, false, 'add/sub flag reset')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "HL"]))
    })
    describe('Addition with no carry', function() {
      beforeEach(function() {
        this.z80.reg16[this.z80.regOffsets16.HL] = 0x4343
        this.initReg8.set(this.z80.reg8)
        this.z80.stepExecution()
      })
      it('should set result in HL to 8686H', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.HL], 0x8686,
          'HL === 8686H')
      })
      it('should reset the carry flag', function() {
        assert.equal(this.z80.flags.C, false, 'carry flag reset')
      })
      it('should reset the half carry flag', function() {
        assert.equal(this.z80.flags.C, false, 'carry flag reset')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "HL"]))
    })
  })

  // ADD IX, [BC,DE,SP]
  makeADDrr_rrTests('IX', 'BC', [0xDD, 0x09], 2)
  makeADDrr_rrTests('IX', 'DE', [0xDD, 0x19], 2)
  makeADDrr_rrTests('IX', 'SP', [0xDD, 0x39], 2)

  // Special case for ADD IX, IX
  describe('ADD IX, IX', function() {
    beforeEach(function() {
      const code = new Uint8Array([0xDD, 0x29])
      this.mmu.copyFrom(code, 2)
      this.z80.reg16[this.z80.regOffsets16.PC] = 2
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
    })
    describe('Addition with carry', function() {
      beforeEach(function() {
        this.z80.reg16[this.z80.regOffsets16.IX] = 0xA8A1
        this.initReg8.set(this.z80.reg8)
        this.z80.stepExecution()
      })
      it('should set result in IX to 5142H', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.IX], 0x5142,
          'IX === 5142H')
      })
      it('should advance PC by 2', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + 2,
          'PC === PC + 2')
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      it('should set the half carry flag', function() {
        assert.equal(this.z80.flags.H, true, 'half carry flag set')
      })
      it('should reset the add/sub flag', function() {
        assert.equal(this.z80.flags.N, false, 'add/sub flag reset')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "IX"]))
    })
    describe('Addition with no carry', function() {
      beforeEach(function() {
        this.z80.reg16[this.z80.regOffsets16.IX] = 0x4343
        this.initReg8.set(this.z80.reg8)
        this.z80.stepExecution()
      })
      it('should set result in IX to 8686H', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.IX], 0x8686,
          'IX === 8686H')
      })
      it('should reset the carry flag', function() {
        assert.equal(this.z80.flags.C, false, 'carry flag reset')
      })
      it('should reset the half carry flag', function() {
        assert.equal(this.z80.flags.C, false, 'carry flag reset')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "IX"]))
    })
  })
  
  // ADD IY, [BC,DE,SP]
  makeADDrr_rrTests('IY', 'BC', [0xFD, 0x09], 2)
  makeADDrr_rrTests('IY', 'DE', [0xFD, 0x19], 2)
  makeADDrr_rrTests('IY', 'SP', [0xFD, 0x39], 2)

  // Special case for ADD IY, IY
  describe('ADD IY, IY', function() {
    beforeEach(function() {
      const code = new Uint8Array([0xFD, 0x29])
      this.mmu.copyFrom(code, 2)
      this.z80.reg16[this.z80.regOffsets16.PC] = 2
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
    })
    describe('Addition with carry', function() {
      beforeEach(function() {
        this.z80.reg16[this.z80.regOffsets16.IY] = 0xA8A1
        this.initReg8.set(this.z80.reg8)
        this.z80.stepExecution()
      })
      it('should set result in IY to 5142H', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.IY], 0x5142,
          'IY === 5142H')
      })
      it('should advance PC by 2', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + 2,
          'PC === PC + 2')
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      it('should set the half carry flag', function() {
        assert.equal(this.z80.flags.H, true, 'half carry flag set')
      })
      it('should reset the add/sub flag', function() {
        assert.equal(this.z80.flags.N, false, 'add/sub flag reset')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "IY"]))
    })
    describe('Addition with no carry', function() {
      beforeEach(function() {
        this.z80.reg16[this.z80.regOffsets16.IY] = 0x4343
        this.initReg8.set(this.z80.reg8)
        this.z80.stepExecution()
      })
      it('should set result in IY to 8686H', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.IY], 0x8686,
          'IY === 8686H')
      })
      it('should reset the carry flag', function() {
        assert.equal(this.z80.flags.C, false, 'carry flag reset')
      })
      it('should reset the half carry flag', function() {
        assert.equal(this.z80.flags.C, false, 'carry flag reset')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "IY"]))
    })
  })
})
