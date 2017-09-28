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

function selectRegs(regs) {
  let cleanRegs = Object.assign({}, allRegs)
  for(let i = 0; i < regs.length; i += 1) {
    const reg = regs[i]
    delete cleanRegs[reg]
    if(allRegs[reg].length > 0) {
      for(let o in allRegs[reg]) {
        delete cleanRegs[allRegs[reg][o]]
      }
    }
  }
  return cleanRegs
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

function makeADDA_rTests(regA, opcodes, length) {
  describe(`ADD A, ${regA}`, function() {
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
    describe('Addition with carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x81
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x80
        this.z80.stepExecution()
      })
      it('should set result in A to 01H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x01,
          'A === 01H')
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
    describe('Addition with no carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x21
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x20
        this.z80.stepExecution()
      })
      it('should set result in A to 41H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x41,
          'A === 41H')
      })
      it('should reset the carry flag', function() {
        assert.equal(this.z80.flags.C, false, 'carry flag reset')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A", regA]))
    })
    describe('Addition with zero result, no carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x00
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x00
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
    describe('Addition with zero result, and carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x80
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x80
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
      shouldNotAffectRegisters(selectRegs(["PC", "A", regA]))
    })
    describe('Addition with overflow', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x78
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x69
        this.z80.stepExecution()
      })
      it('should set result in A to E1H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0xE1,
          'A === E1H')
      })
      it('should set the overflow flag', function() {
        assert.equal(this.z80.flags.P, true, 'overflow flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A", regA]))
    })
    describe('Addition with no overflow', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x78
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x88
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

describe('ADD', function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
    this.cleanRegs = {}
  })

  // ADD A, [B,C,D,E,H,L]
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
        const opcode = 0x80 | (regs[val])
        makeADDA_rTests(val, [opcode], 1)
      }
    )
    
    makeADDA_rTests('IXh', [0xDD, 0x84], 2)
    makeADDA_rTests('IXl', [0xDD, 0x85], 2)
    makeADDA_rTests('IYh', [0xFD, 0x84], 2)
    makeADDA_rTests('IYl', [0xFD, 0x85], 2)
  })

  // Special case ADD A,A
  describe('ADD A, A', function() {
    beforeEach(function() {
      const code = new Uint8Array([0x87])
      this.mmu.copyFrom(code, 0)
      this.z80.reg16[this.z80.regOffsets16.PC] = 0
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
    })
    describe('Addition with carry and overflow', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x81
        this.z80.stepExecution()
      })
      it('should set result in A to 02H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x02,
          'A === 02H')
      })
      it('should advance PC by 1', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + 1,
          'PC === PC + 1')
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      it('should set the overflow flag', function() {
        assert.equal(this.z80.flags.P, true, 'overflow flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Addition with no carry or overflow', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x21
        this.z80.stepExecution()
      })
      it('should set result in A to 42H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x42,
          'A === 42H')
      })
      it('should advance PC by 1', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + 1,
          'PC === PC + 1')
      })
      it('should reset the carry flag', function() {
        assert.equal(this.z80.flags.C, false, 'carry flag reset')
      })
      it('should reset the overflow flag', function() {
        assert.equal(this.z80.flags.P, false, 'overflow flag reset')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Addition with zero result, no carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x00
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
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      it('should set the zero flag', function() {
        assert.equal(this.z80.flags.Z, true, 'zero flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
  })


  // ADD A, (HL)
  describe('ADD A, (HL)', function() {
    beforeEach(function() {
      const code = new Uint8Array([0x86])
      this.mmu.copyFrom(code, 2)
      this.z80.reg16[this.z80.regOffsets16.PC] = 2
      this.z80.reg16[this.z80.regOffsets16.HL] = 0
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
    })
    describe('Addition with carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x81
        this.mmu.writeByte(0, 0x80)
        this.z80.stepExecution()
      })
      it('should set result in A to 01H', function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x01,
          'A === 01H')
      })
      it('should advance PC by 1', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + 1,
          'PC === PC + 1')
      })
      it('should set the carry flag', function() {
        assert.equal(this.z80.flags.C, true, 'carry flag set')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })
    describe('Addition with no carry', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8.A] = 0x21
        this.mmu.writeByte(0, 0x20)
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
        this.mmu.writeByte(0, 0x00)
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
        this.mmu.writeByte(0, 0x80)
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
        this.mmu.writeByte(0, 0x69)
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
        this.mmu.writeByte(0, 0x88)
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
  })


  // ADD A, (IX+d)
  describe('ADD A, (IX+d)', function() {
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
  })


  // ADD A, (IY+d)
  describe('ADD A, (IX+d)', function() {
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
  })


  // ADD A, n
  describe('ADD A, n', function() {
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
})
