import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

import {shouldNotAlterFlags, selectRegs, shouldNotAffectRegisters} from './helpers.js'

describe('RLCA', function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
    this.cleanRegs = {}
    const code = new Uint8Array([0x07])
    this.mmu.copyFrom(code, 0)
    this.z80.reg16[this.z80.regOffsets16.PC] = 0
    this.initFlags = Object.assign({}, this.z80.flags)
    this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
    this.initReg8 = new Uint8Array(this.initRegs)
    this.initReg16 = new Uint16Array(this.initRegs)
  })
  describe('result in carry', function() {
    beforeEach(function() {
      this.z80.reg8[this.z80.regOffsets8.A] = 0x80
      this.z80.stepExecution()
    })
    it('should set the expected result', function() {
      assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x01, 'A == 0x01')
    })
    it('should advance the PC by 1', function() {
      assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + 1, 'PC = PC + 1')
    })
    it('should set the carry flag', function() {
      assert.equal(this.z80.flags.C, true, 'C is true')
    })
    it('should reset the N flag', function() {
      assert.equal(this.z80.flags.N, false, 'C is true')
    })
    it('should reset the H flag', function() {
      assert.equal(this.z80.flags.H, false, 'C is true')
    })
    it('should not affect registers', function() {
      shouldNotAffectRegisters(["PC", "A"])
    })
  })

  describe('result in no carry', function() {
    beforeEach(function() {
      this.z80.reg8[this.z80.regOffsets8.A] = 0x40
      this.z80.stepExecution()
    })
    it('should set the expected result', function() {
      assert.equal(this.z80.reg8[this.z80.regOffsets8.A], 0x80, 'A == 0x80')
    })
    it('should advance the PC by 1', function() {
      assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + 1, 'PC = PC + 1')
    })
    it('should reset the carry flag', function() {
      assert.equal(this.z80.flags.C, false, 'C is false')
    })
    it('should reset the N flag', function() {
      assert.equal(this.z80.flags.N, false, 'C is true')
    })
    it('should reset the H flag', function() {
      assert.equal(this.z80.flags.H, false, 'C is true')
    })
    it('should not affect registers', function() {
      shouldNotAffectRegisters(["PC", "A"])
    })
  })
})
