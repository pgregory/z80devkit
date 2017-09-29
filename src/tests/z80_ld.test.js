import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

import {shouldNotAlterFlags, selectRegs, shouldNotAffectRegisters} from './helpers.js'

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
    it(`should advance PC by ${length}`, function() {
      assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + length,
        `PC === PC + ${length}`)
    })
    shouldNotAlterFlags()
    shouldNotAffectRegisters(selectRegs(["PC", regA]))
  })
}

function makeLDr_nTests(regA, val, opcodes, length) {
  describe(`LD ${regA}, ${('00' + val.toString(16)).substr(-2).toUpperCase()}H`, function() {
    beforeEach(function() {
      const code = new Uint8Array(opcodes)
      this.mmu.copyFrom(code, 0)
      this.z80.reg16[this.z80.regOffsets16.PC] = 0
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
      // Now execute the instruction
      this.z80.stepExecution()
    })
    it(`should set register ${regA} to ${('00' + val.toString(16)).substr(-2).toUpperCase()}H`, function() {
      assert.equal(this.z80.reg8[this.z80.regOffsets8[regA]], val,
        `${regA} === ${('00' + val.toString(16)).substr(-2).toUpperCase()}H`)
    })
    it(`should advance PC by ${length}`, function() {
      assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + length,
        `PC === PC + ${length}`)
    })
    shouldNotAlterFlags()
    shouldNotAffectRegisters(selectRegs(["PC", regA]))
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
    shouldNotAffectRegisters(selectRegs(["PC", regA]))
  })
}

function makeLDr_from_rrTests(regA, regB, offset, opcodes, length) {
  describe(`LD ${regA}, (${regB}${(offset !== 0)? '+' + offset : ''})`, function() {
    beforeEach(function() {
      const code = new Uint8Array(opcodes)
      this.mmu.copyFrom(code, 2)
      this.z80.reg16[this.z80.regOffsets16.PC] = 2
      this.z80.reg16[this.z80.regOffsets16[regB]] = 0 // Address to load from
      this.mmu.writeByte(0 + offset, 0x88) // The memory contents to load
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
      this.z80.stepExecution()
    })
    it(`should set register ${regA} to 88H`, function() {
      assert.equal(this.z80.reg8[this.z80.regOffsets8[regA]], 0x88,
        `${regA} === 88H`)
    })
    it(`should advance PC by ${length}`, function() {
      assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + length,
        `PC === PC + ${length}`)
    })
    shouldNotAlterFlags()
    shouldNotAffectRegisters(selectRegs(["PC", regA]))
  })
}


function makeLDto_rr_rTests(regA, regB, offset, opcodes, length) {
  describe(`LD (${regA}${(offset !== 0)? '+' + offset : ''}), ${regB}`, function() {
    beforeEach(function() {
      const code = new Uint8Array(opcodes)
      this.mmu.copyFrom(code, 2)
      this.z80.reg16[this.z80.regOffsets16.PC] = 2
      this.z80.reg16[this.z80.regOffsets16[regA]] = 0 // Address to load to
      this.z80.reg8[this.z80.regOffsets8[regB]] = 0x99
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
      this.z80.stepExecution()
    })
    it(`should set memory at ${regA}${(offset !== 0)? '+' + offset : ''} to 99H`, function() {
      assert.equal(this.mmu.readByte(0 + offset), 0x99,
        `${regA}${(offset !== 0)? '+' + offset : ''} === 99H`)
    })
    it(`should advance PC by ${length}`, function() {
      assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + length,
        `PC === PC + ${length}`)
    })
    shouldNotAlterFlags()
    shouldNotAffectRegisters(selectRegs(["PC"]))
  })
}

function makeLDA_IRTests(regA, opcodes) {
  describe(`LD A,${regA}`, function() {
    beforeEach(function() {
      const code = new Uint8Array(opcodes)
      this.mmu.copyFrom(code, 0)
      this.z80.reg16[this.z80.regOffsets16.PC] = 0
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
    })
    describe('Basic operation', function() {
      beforeEach(function() {
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x12
        this.initReg8.set(this.z80.reg8)
        this.z80.stepExecution()
      })
      it(`should set register A to the value of ${regA}`, function() {
        assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x12,
          'A === 0x12')
      })
      it('should advance PC by 2', function() {
        assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + 2,
          'PC === PC + 2')
      })
      shouldNotAffectRegisters(selectRegs(["PC", "A"]))
    })

    describe('Non-negative result', function() {
      it('should only affect the right flags', function() {
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x12
        this.z80.flags.S = true
        this.z80.flags.Z = true
        this.z80.flags.H = true
        this.z80.flags.N = true
        this.z80.stepExecution()
        assert.equal(this.z80.flags.S, false, 'S false')
        assert.equal(this.z80.flags.Z, false, 'Z false')
        assert.equal(this.z80.flags.Y, this.initFlags.Y, 'Y unchanged')
        assert.equal(this.z80.flags.H, false, 'H false')
        assert.equal(this.z80.flags.X, this.initFlags.X, 'X unchanged')
        // TOOD: assert.equal(this.z80.flags.P, false, 'P FFI')
        assert.equal(this.z80.flags.N, false, 'N false')
        assert.equal(this.z80.flags.C, this.initFlags.C, 'C unchanged')
      })
    })
    describe('Negative result', function() {
      it('should only affect the right flags', function() {
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0xFF
        this.z80.flags.S = false
        this.z80.flags.Z = true
        this.z80.flags.H = true
        this.z80.flags.N = true
        this.z80.stepExecution()
        assert.equal(this.z80.flags.S, true, 'S true')
        assert.equal(this.z80.flags.Z, false, 'Z false')
        assert.equal(this.z80.flags.Y, this.initFlags.Y, 'Y unchanged')
        assert.equal(this.z80.flags.H, false, 'H false')
        assert.equal(this.z80.flags.X, this.initFlags.X, 'X unchanged')
        // TOOD: assert.equal(this.z80.flags.P, false, 'P FFI')
        assert.equal(this.z80.flags.N, false, 'N false')
        assert.equal(this.z80.flags.C, this.initFlags.C, 'C unchanged')
      })
    })
    describe('Non-zero result', function() {
      it('should only affect the right flags', function() {
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x33
        this.z80.flags.S = true
        this.z80.flags.Z = true
        this.z80.flags.H = true
        this.z80.flags.N = true
        this.z80.stepExecution()
        assert.equal(this.z80.flags.S, false, 'S false')
        assert.equal(this.z80.flags.Z, false, 'Z false')
        assert.equal(this.z80.flags.Y, this.initFlags.Y, 'Y unchanged')
        assert.equal(this.z80.flags.H, false, 'H false')
        assert.equal(this.z80.flags.X, this.initFlags.X, 'X unchanged')
        // TOOD: assert.equal(this.z80.flags.P, false, 'P FFI')
        assert.equal(this.z80.flags.N, false, 'N false')
        assert.equal(this.z80.flags.C, this.initFlags.C, 'C unchanged')
      })
    })
    describe('Zero result', function() {
      it('should only affect the right flags', function() {
        this.z80.reg8[this.z80.regOffsets8[regA]] = 0x00
        this.z80.flags.S = true
        this.z80.flags.Z = false
        this.z80.flags.H = true
        this.z80.flags.N = true
        this.z80.stepExecution()
        assert.equal(this.z80.flags.S, false, 'S false')
        assert.equal(this.z80.flags.Z, true, 'Z true')
        assert.equal(this.z80.flags.Y, this.initFlags.Y, 'Y unchanged')
        assert.equal(this.z80.flags.H, false, 'H false')
        assert.equal(this.z80.flags.X, this.initFlags.X, 'X unchanged')
        // TOOD: assert.equal(this.z80.flags.P, false, 'P FFI')
        assert.equal(this.z80.flags.N, false, 'N false')
        assert.equal(this.z80.flags.C, this.initFlags.C, 'C unchanged')
      })
    })
  })
}

function makeLDrr_from_nnTests(regA, address, opcodes, length) {
  describe(`LD ${regA}, (${('0000' + address.toString(16)).substr(-4).toUpperCase()}H)`, function() {
    beforeEach(function() {
      const code = new Uint8Array(opcodes)
      this.mmu.copyFrom(code, address + 2)
      this.z80.reg16[this.z80.regOffsets16.PC] = address + 2
      this.mmu.writeWord(address, 0x77AA) // The memory contents to load
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
      this.z80.stepExecution()
    })
    it(`should set register ${regA} to AAAAH`, function() {
      assert.equal(this.z80.reg16[this.z80.regOffsets16[regA]], 0x77AA,
        `${regA} === 77AAH`)
    })
    it(`should advance PC by ${length}`, function() {
      assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + length,
        `PC === PC + ${length}`)
    })
    shouldNotAlterFlags()
    shouldNotAffectRegisters(selectRegs(["PC", regA]))
  })
}

function makeLDto_nn_rrTests(regA, address, opcodes, length) {
  describe(`LD (${('0000' + address.toString(16)).substr(-4).toUpperCase()}H), ${regA}`, function() {
    beforeEach(function() {
      const code = new Uint8Array(opcodes)
      this.mmu.copyFrom(code, address + 2)
      this.z80.reg16[this.z80.regOffsets16.PC] = address + 2
      this.z80.reg16[this.z80.regOffsets16[regA]] = 0x55BB
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
      this.z80.stepExecution()
    })
    it(`should set memory at ${regA} to 55BBH`, function() {
      assert.equal(this.mmu.readWord(address), 0x55BB,
        `(${('0000' + address.toString(16)).substr(-4).toUpperCase()}H) === 55BBH`)
    })
    it(`should advance PC by ${length}`, function() {
      assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + length,
        `PC === PC + ${length}`)
    })
    shouldNotAlterFlags()
    shouldNotAffectRegisters(selectRegs(["PC", regA]))
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

    makeLDA_IRTests('I', [0xED, 0x57])
    makeLDA_IRTests('R', [0xED, 0x5F])

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
      shouldNotAffectRegisters(selectRegs(["PC", "SP"]))
    })
  })

  // LD [A,B,C,D,E,H,L], ([BC,DE,HL])
  makeLDr_from_rrTests('A', 'BC', 0, [0x0A], 1)
  makeLDr_from_rrTests('A', 'DE', 0, [0x1A], 1)
  makeLDr_from_rrTests('A', 'HL', 0, [0x7E], 1)
  makeLDr_from_rrTests('B', 'HL', 0, [0x46], 1)
  makeLDr_from_rrTests('C', 'HL', 0, [0x4E], 1)
  makeLDr_from_rrTests('D', 'HL', 0, [0x56], 1)
  makeLDr_from_rrTests('E', 'HL', 0, [0x5E], 1)
  makeLDr_from_rrTests('H', 'HL', 0, [0x66], 1)
  makeLDr_from_rrTests('L', 'HL', 0, [0x6E], 1)

  // LD [A,B,C,D,E,H,L], (IX+d)
  makeLDr_from_rrTests('A', 'IX', 1, [0xDD, 0x7E, 0x01], 3)
  makeLDr_from_rrTests('B', 'IX', 1, [0xDD, 0x46, 0x01], 3)
  makeLDr_from_rrTests('C', 'IX', 1, [0xDD, 0x4E, 0x01], 3)
  makeLDr_from_rrTests('D', 'IX', 1, [0xDD, 0x56, 0x01], 3)
  makeLDr_from_rrTests('E', 'IX', 1, [0xDD, 0x5E, 0x01], 3)
  makeLDr_from_rrTests('H', 'IX', 1, [0xDD, 0x66, 0x01], 3)
  makeLDr_from_rrTests('L', 'IX', 1, [0xDD, 0x6E, 0x01], 3)

  // LD [A,B,C,D,E,H,L], (IX+d)
  makeLDr_from_rrTests('A', 'IY', 1, [0xFD, 0x7E, 0x01], 3)
  makeLDr_from_rrTests('B', 'IY', 1, [0xFD, 0x46, 0x01], 3)
  makeLDr_from_rrTests('C', 'IY', 1, [0xFD, 0x4E, 0x01], 3)
  makeLDr_from_rrTests('D', 'IY', 1, [0xFD, 0x56, 0x01], 3)
  makeLDr_from_rrTests('E', 'IY', 1, [0xFD, 0x5E, 0x01], 3)
  makeLDr_from_rrTests('H', 'IY', 1, [0xFD, 0x66, 0x01], 3)
  makeLDr_from_rrTests('L', 'IY', 1, [0xFD, 0x6E, 0x01], 3)

  makeLDr_nTests('A', 0x55, [0x3E, 0x55], 2)
  makeLDr_nTests('B', 0x55, [0x06, 0x55], 2)
  makeLDr_nTests('C', 0x55, [0x0E, 0x55], 2)
  makeLDr_nTests('D', 0x55, [0x16, 0x55], 2)
  makeLDr_nTests('E', 0x55, [0x1E, 0x55], 2)
  makeLDr_nTests('H', 0x55, [0x26, 0x55], 2)
  makeLDr_nTests('L', 0x55, [0x2E, 0x55], 2)
  makeLDr_nTests('IXh', 0x55, [0xDD, 0x26, 0x55], 3)
  makeLDr_nTests('IXl', 0x55, [0xDD, 0x2E, 0x55], 3)
  makeLDr_nTests('IYh', 0x55, [0xFD, 0x26, 0x55], 3)
  makeLDr_nTests('IYl', 0x55, [0xFD, 0x2E, 0x55], 3)

  // LD ([BC,DE,HL,IX+d,IY+d]), [A,B,C,D,E,H,L]
  makeLDto_rr_rTests('BC', 'A', 0, [0x02], 1)
  makeLDto_rr_rTests('DE', 'A', 0, [0x12], 1)
  makeLDto_rr_rTests('HL', 'A', 0, [0x77], 1)
  makeLDto_rr_rTests('HL', 'B', 0, [0x70], 1)
  makeLDto_rr_rTests('HL', 'C', 0, [0x71], 1)
  makeLDto_rr_rTests('HL', 'D', 0, [0x72], 1)
  makeLDto_rr_rTests('HL', 'E', 0, [0x73], 1)
  makeLDto_rr_rTests('IX', 'A', 1, [0xDD, 0x77, 0x01], 3)
  makeLDto_rr_rTests('IX', 'B', 1, [0xDD, 0x70, 0x01], 3)
  makeLDto_rr_rTests('IX', 'C', 1, [0xDD, 0x71, 0x01], 3)
  makeLDto_rr_rTests('IX', 'D', 1, [0xDD, 0x72, 0x01], 3)
  makeLDto_rr_rTests('IX', 'E', 1, [0xDD, 0x73, 0x01], 3)
  makeLDto_rr_rTests('IX', 'H', 1, [0xDD, 0x74, 0x01], 3)
  makeLDto_rr_rTests('IX', 'L', 1, [0xDD, 0x75, 0x01], 3)
  makeLDto_rr_rTests('IY', 'A', 1, [0xFD, 0x77, 0x01], 3)
  makeLDto_rr_rTests('IY', 'B', 1, [0xFD, 0x70, 0x01], 3)
  makeLDto_rr_rTests('IY', 'C', 1, [0xFD, 0x71, 0x01], 3)
  makeLDto_rr_rTests('IY', 'D', 1, [0xFD, 0x72, 0x01], 3)
  makeLDto_rr_rTests('IY', 'E', 1, [0xFD, 0x73, 0x01], 3)
  makeLDto_rr_rTests('IY', 'H', 1, [0xFD, 0x74, 0x01], 3)
  makeLDto_rr_rTests('IY', 'L', 1, [0xFD, 0x75, 0x01], 3)

  // Special cases for LD (HL),H and LD (HL),L
  describe('LD (HL),H', function() {
    beforeEach(function() {
      const code = new Uint8Array([0x74])
      this.mmu.copyFrom(code, 0x700)
      this.z80.reg16[this.z80.regOffsets16.PC] = 0x700
      this.z80.reg16[this.z80.regOffsets16.HL] = 0x500
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
      this.z80.stepExecution()
    })
    it('should set memory at (HL) to 05H', function() {
      assert.equal(this.mmu.readByte(0x500), 0x05,
        '(HL) === 05H')
    })
    it('should advance PC by 1', function() {
      assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + 1,
        'PC === PC + 1')
    })
    shouldNotAlterFlags()
    shouldNotAffectRegisters(selectRegs(["PC"]))
  })

  describe('LD (HL),L', function() {
    beforeEach(function() {
      const code = new Uint8Array([0x75])
      this.mmu.copyFrom(code, 0x700)
      this.z80.reg16[this.z80.regOffsets16.PC] = 0x700
      this.z80.reg16[this.z80.regOffsets16.HL] = 0x505
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
      this.z80.stepExecution()
    })
    it('should set memory at (HL) to 05H', function() {
      assert.equal(this.mmu.readByte(0x505), 0x05,
        '(HL) === 05H')
    })
    it('should advance PC by 1', function() {
      assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + 1,
        'PC === PC + 1')
    })
    shouldNotAlterFlags()
    shouldNotAffectRegisters(selectRegs(["PC"]))
  })

  // LD [BC,DE,HL,SP,IX,IY], (NN)
  makeLDrr_from_nnTests('BC', 0x0002, [0xED, 0x4B, 0x02, 0x00], 4)
  makeLDrr_from_nnTests('DE', 0x0002, [0xED, 0x5B, 0x02, 0x00], 4)
  makeLDrr_from_nnTests('HL', 0x0002, [0xED, 0x6B, 0x02, 0x00], 4)
  makeLDrr_from_nnTests('SP', 0x0002, [0xED, 0x7B, 0x02, 0x00], 4)
  makeLDrr_from_nnTests('IX', 0x0002, [0xDD, 0x2A, 0x02, 0x00], 4)
  makeLDrr_from_nnTests('IY', 0x0002, [0xFD, 0x2A, 0x02, 0x00], 4)

  // LD (NN), [BC,DE,HL,SP,IX,IY]
  makeLDto_nn_rrTests('BC', 0x0002, [0xED, 0x43, 0x02, 0x00], 4)
  makeLDto_nn_rrTests('DE', 0x0002, [0xED, 0x53, 0x02, 0x00], 4)
  makeLDto_nn_rrTests('HL', 0x0002, [0x22, 0x02, 0x00], 3)
  makeLDto_nn_rrTests('HL', 0x0002, [0xED, 0x63, 0x02, 0x00], 4)
  makeLDto_nn_rrTests('SP', 0x0002, [0xED, 0x73, 0x02, 0x00], 4)
  makeLDto_nn_rrTests('IX', 0x0002, [0xDD, 0x22, 0x02, 0x00], 4)
  makeLDto_nn_rrTests('IY', 0x0002, [0xFD, 0x22, 0x02, 0x00], 4)

  // LD (NN), A
  describe('LD (NN), A', function() {
    beforeEach(function() {
      const code = new Uint8Array([0x32, 0x00, 0x05])
      this.mmu.copyFrom(code, 0x700)
      this.z80.reg16[this.z80.regOffsets16.PC] = 0x700 
      this.z80.reg8[this.z80.regOffsets8.A] = 0x75
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
      this.z80.stepExecution()
    })
    it('should set memory at 0500H to 75H', function() {
      assert.equal(this.mmu.readByte(0x500), 0x75,
        '(0500H) === 75H')
    })
    it('should advance PC by 3', function() {
      assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + 3,
        'PC === PC + 3')
    })
    shouldNotAlterFlags()
    shouldNotAffectRegisters(selectRegs(["PC"]))
  })

  // LD A, (NN)
  describe('LD A, (NN)', function() {
    beforeEach(function() {
      const code = new Uint8Array([0x3A, 0x00, 0x05])
      this.mmu.copyFrom(code, 0x700)
      this.z80.reg16[this.z80.regOffsets16.PC] = 0x700 
      this.mmu.writeByte(0x500, 0x57)
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.initReg8.set(this.z80.reg8)
      this.z80.stepExecution()
    })
    it('should set register A to 57H', function() {
      assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x57,
        'A === 57H')
    })
    it('should advance PC by 3', function() {
      assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + 3,
        'PC === PC + 3')
    })
    shouldNotAlterFlags()
    shouldNotAffectRegisters(selectRegs(["PC", "A"]))
  })

})
