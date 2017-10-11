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

const checkFlags = function(flags) {
  if(flags) {
    Object.getOwnPropertyNames(flags).forEach(
      (val) => {
        it(`should set the flag ${val} to ${(flags[val])? '1' : '0'}`, function() {
          assert.equal(this.z80.flags[val], flags[val], `flag ${val} state should be ${flags[val]}`)
        })
      }
    )
  }
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
    if(reg && allRegs[reg].length > 0) {
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

function makeGenericTest(desc, op, dest, destmode, source, sourcemode, offset, valA, valB, expected, opcodes, length, flags, registersAffected, initFlags, initRegs) {
  describe(desc, function() {
    beforeEach(function() {
      const code = new Uint8Array(opcodes)
      this.mmu.copyFrom(code, 2)
      this.z80.reg16[this.z80.regOffsets16.PC] = 2
      if(initFlags) {
        Object.getOwnPropertyNames(initFlags).forEach(
          (val) => {
            this.z80.flags[val] = initFlags[val]
          }
        )
      }
      this.initFlags = Object.assign({}, this.z80.flags)
      this.initRegs = new ArrayBuffer(this.z80.registers.byteLength)
      this.initReg8 = new Uint8Array(this.initRegs)
      this.initReg16 = new Uint16Array(this.initRegs)
      switch(destmode) {
        case 'register':
        case 'register8':
          this.z80.reg8[this.z80.regOffsets8[dest]] = valA
          break
        case 'register16':
          this.z80.reg16[this.z80.regOffsets16[dest]] = valA
          break
        case 'register indirect':
          this.z80.reg16[this.z80.regOffsets16[dest]] = 0x0000
          this.mmu.writeByte(0x0000, valA)
          break
        case 'indexed':
          this.z80.reg16[this.z80.regOffsets16[dest]] = 0x0000
          this.mmu.writeByte(offset, valA)
          break
        case 'extended':
        case 'extended8':
          this.mmu.writeByte(offset, valA)
          // Set the bytes after the opcodes to the specified address
          this.mmu.writeWord(2 + opcodes.length + offset, 0x0000)
          break
        case 'extended16':
          this.mmu.writeWord(offset, valA)
          // Set the bytes after the opcodes to the specified address
          this.mmu.writeWord(2 + opcodes.length + offset, 0x0000)
          break
        case 'immediate':
        case 'immediate8':
          // Set the byte after the opcodes to the specified valA
          this.mmu.writeByte(2 + opcodes.length + offset, valA)
          break;
        case 'immediate16':
          // Set the bytes after the opcodes to the specified valA
          this.mmu.writeWord(2 + opcodes.length + offset, valA)
          break;
        default:
          break
      }
      switch(sourcemode) {
        case 'register':
        case 'register8':
          this.z80.reg8[this.z80.regOffsets8[source]] = valB
          break
        case 'register16':
          this.z80.reg16[this.z80.regOffsets16[source]] = valB
          break
        case 'register indirect':
          this.z80.reg16[this.z80.regOffsets16[source]] = 0x0000
          this.mmu.writeByte(0x0000, valB)
          break
        case 'indexed':
          this.z80.reg16[this.z80.regOffsets16[source]] = 0x0000
          this.mmu.writeByte(offset, valB)
          break
        case 'extended':
        case 'extended8':
          this.mmu.writeByte(offset, valB)
          // Set the bytes after the opcodes to the specified address
          this.mmu.writeWord(2 + opcodes.length + offset, 0x0000)
          break
        case 'extended16':
          this.mmu.writeWord(offset, valB)
          // Set the bytes after the opcodes to the specified address
          this.mmu.writeWord(2 + opcodes.length + offset, 0x0000)
          break
        case 'immediate':
        case 'immediate8':
          // Set the byte after the opcodes to the specified valB
          this.mmu.writeByte(2 + opcodes.length + offset, valB)
          break;
        case 'immediate16':
          // Set the byte after the opcodes to the specified valB
          this.mmu.writeWord(2 + opcodes.length + offset, valB)
          break;
        default:
          break
      }
      this.initReg8.set(this.z80.reg8)
      this.z80.stepExecution()
    })
    // Check result
    it(`should set the expected result ${expected}`, function() {
      switch(destmode) {
        case 'register':
        case 'register8':
          assert.equal(this.z80.reg8[this.z80.regOffsets8[dest]], expected, `${dest} === ${expected}`)
          break
        case 'register16':
          assert.equal(this.z80.reg16[this.z80.regOffsets16[dest]], expected, `${dest} === ${expected}`)
          break
        case 'register indirect':
          {
            const addr = this.z80.reg16[this.z80.regOffsets16[dest]]
            const val = this.mmu.readByte(addr)
            assert.equal(val, expected, `(${dest}) === ${expected}`)
          }
          break
        case 'indexed':
          {
            const addr = this.z80.reg16[this.z80.regOffsets16[dest]]
            const val = this.mmu.readByte(addr + offset)
            assert.equal(val, expected, `(${dest}) === ${expected}`)
          }
          break
        case 'extended':
        case 'extended8':
          {
            const addr = 0x0000 
            const val = this.mmu.readByte(addr + offset)
            assert.equal(val, expected, `(0x0000) === ${expected}`)
          }
          break
        case 'extended16':
          {
            const addr = 0x0000 
            const val = this.mmu.readWord(addr + offset)
            assert.equal(val, expected, `(0x0000) === ${expected}`)
          }
          break
        default:
          break
      }     
    })
    // Check PC is updated appropriately.
    it(`should advance PC by ${length}`, function() {
      assert.equal(this.z80.reg16[this.z80.regOffsets16.PC], this.initReg16[this.z80.regOffsets16.PC] + length,
        `PC === PC + ${length}`)
    })
    if(flags) {
      checkFlags(flags)
    } else {
      shouldNotAlterFlags()
    }
    shouldNotAffectRegisters(selectRegs(registersAffected))
  })
}


function modeText(operand, mode) {
  switch(mode) {
    case 'register indirect':
      return `(${operand})`
      break
    case 'indexed':
      return `(${operand}+d)`
      break
    case 'immediate':
    case 'immediate8':
      return 'n'
      break
    case 'immediate16':
      return 'nn'
      break
    case 'register':
    case 'register8':
    case 'register16':
    default:
      return `${operand}`
      break
  }
}

export { 
  shouldNotAlterFlags,
  selectRegs,
  shouldNotAffectRegisters,
  checkFlags,
  makeGenericTest,
  modeText,
}

