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

export { 
  shouldNotAlterFlags,
  selectRegs,
  shouldNotAffectRegisters,
}
