import Z80 from '../z80.js'
import MMU from '../mmu.js'

import assert from 'assert'

function checkFlags(init, current) {
  assert.equal(init.S, current.S)
  assert.equal(init.Z, current.Z)
  assert.equal(init.Y, current.Y)
  assert.equal(init.H, current.H)
  assert.equal(init.X, current.X)
  assert.equal(init.P, current.P)
  assert.equal(init.N, current.N)
  assert.equal(init.C, current.C)
}

describe('LD', function() {
  let mmu
  let z80
  let initFlags
  beforeEach(function() {
    mmu = new MMU()
    z80 = new Z80(mmu)
    initFlags = Object.assign({}, z80.flags)
  })

  describe('LD B,A', function() {
    beforeEach(function() {
      const code = new Uint8Array([
        0x47,
      ])
      mmu.copyFrom(code, 0)
      z80.reg16[z80.regOffsets16.PC] = 0
      z80.reg8[z80.regOffsets8.A] = 0x12
      z80.stepExecution()
    })
    it('should set register B to the value of A', function() {
      assert.equal(0x12, z80.reg8[z80.regOffsets8.B])
    })
    it('should leave the flags untouched', function() {
      checkFlags(initFlags, z80.flags)
    })
  })
})
