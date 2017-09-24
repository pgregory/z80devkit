import Z80 from '../z80.js'
import MMU from '../mmu.js'

import assert from 'assert'

describe('LD', function() {
  describe('LD A,n', function() {
    let mmu
    let z80
    let initFlags
    beforeEach(function() {
      mmu = new MMU()
      z80 = new Z80(mmu)
      mmu.writeByte(0, 0x3e)
      mmu.writeByte(1, 0x77)
      // Record the flag state
      initFlags = Object.assign({}, z80.flags)
      z80.reg16[z80.regOffsets16.PC] = 0
      z80.stepExecution()
    })

    it('should set the register value', function() {
      assert.equal(0x77, z80.reg8[z80.regOffsets8.A])
    })
    it('should truncate out of range values', function() {
      z80.mmu.writeByte(1, 0xBBB)
      z80.reg16[z80.regOffsets16.PC] = 0
      z80.stepExecution()
      assert.equal(0xBB, z80.reg8[z80.regOffsets8.A])
    })
    it('should not modify the flags at all', function() {
      assert.equal(initFlags.S, z80.flags.S)
      assert.equal(initFlags.Z, z80.flags.Z)
      assert.equal(initFlags.Y, z80.flags.Y)
      assert.equal(initFlags.H, z80.flags.H)
      assert.equal(initFlags.X, z80.flags.X)
      assert.equal(initFlags.P, z80.flags.P)
      assert.equal(initFlags.N, z80.flags.N)
      assert.equal(initFlags.C, z80.flags.C)
    })
  })
})
