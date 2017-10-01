import {assert} from 'chai'

import {shouldNotAlterFlags, selectRegs, shouldNotAffectRegisters} from './helpers.js'

function makeMath8Test(desc, op, source, mode, offset, valA, valB, expected, opcodes, length, flags, registersAffected) {
  describe(desc, function() {
    beforeEach(function() {
      const code = new Uint8Array(opcodes)
      this.mmu.copyFrom(code, 2)
      this.z80.reg16[this.z80.regOffsets16.PC] = 2
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.z80.reg8[this.z80.regOffsets8.A] = valA
      switch(mode) {
        case 'register':
          this.z80.reg8[this.z80.regOffsets8[source]] = valB
          break
        case 'register indirect':
          this.z80.reg16[this.z80.regOffsets16[source]] = 0x0000
          this.mmu.writeByte(0x0000, valB)
          break
        case 'indexed':
          this.z80.reg16[this.z80.regOffsets16[source]] = 0x0000
          this.mmu.writeByte(offset, valB)
          break
        case 'immediate':
        default:
          break
      }
      this.initReg8.set(this.z80.reg8)
      this.z80.stepExecution()
    })
    // Check result
    it(`should set the expected result ${expected}`, function() {
      assert.equal(this.z80.reg8[this.z80.regOffsets8.A], expected, `A === ${expected}`)
    })
    // Check PC is updated appropriately.
    it(`should advance PC by ${length}`, function() {
      assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + length,
        `PC === PC + ${length}`)
    })
    if(flags) {
      Object.getOwnPropertyNames(flags).forEach(
        (val) => {
          it(`should set the flag ${val} to ${(flags[val])? '1' : '0'}`, function() {
            assert.equal(this.z80.flags[val], flags[val], `flag ${val} state should be ${flags[val]}`)
          })
        }
      )
    }
    shouldNotAffectRegisters(selectRegs(registersAffected))
  })
}

function makeMath16Test(desc, op, dest, source, valA, valB, expected, opcodes, length, flags, registersAffected) {
  describe(desc, function() {
    beforeEach(function() {
      const code = new Uint8Array(opcodes)
      this.mmu.copyFrom(code, 2)
      this.z80.reg16[this.z80.regOffsets16.PC] = 2
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      this.z80.reg16[this.z80.regOffsets16[dest]] = valA
      this.z80.reg16[this.z80.regOffsets16[source]] = valB
      this.initReg8.set(this.z80.reg8)
      this.z80.stepExecution()
    })
    // Check result
    it(`should set the expected result ${expected}`, function() {
      assert.equal(this.z80.reg16[this.z80.regOffsets16[dest]], expected, `${dest} === ${expected}`)
    })
    // Check PC is updated appropriately.
    it(`should advance PC by ${length}`, function() {
      assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + length,
        `PC === PC + ${length}`)
    })
    if(flags) {
      Object.getOwnPropertyNames(flags).forEach(
        (val) => {
          it(`should set the flag ${val} to ${(flags[val])? '1' : '0'}`, function() {
            assert.equal(this.z80.flags[val], flags[val], `flag ${val} state should be ${flags[val]}`)
          })
        }
      )
    }
    shouldNotAffectRegisters(selectRegs(registersAffected))
  })
}


export {
  makeMath8Test,
  makeMath16Test,
}
