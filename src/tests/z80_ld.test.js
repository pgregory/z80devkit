import Z80 from '../z80.js'
import MMU from '../mmu.js'

import assert from 'assert'

const shouldNotAlterFlags = function() {
  it('should not alter flags', function() {
    assert.equal(this.initFlags.S, this.z80.flags.S)
    assert.equal(this.initFlags.Z, this.z80.flags.Z)
    assert.equal(this.initFlags.Y, this.z80.flags.Y)
    assert.equal(this.initFlags.H, this.z80.flags.H)
    assert.equal(this.initFlags.X, this.z80.flags.X)
    assert.equal(this.initFlags.P, this.z80.flags.P)
    assert.equal(this.initFlags.N, this.z80.flags.N)
    assert.equal(this.initFlags.C, this.z80.flags.C)
  })
}

describe('LD', function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
  })

  describe('LD r,A', function() {

    beforeEach(function() {
      this.z80.reg16[this.z80.regOffsets16.PC] = 0
      this.z80.reg8[this.z80.regOffsets8.A] = 0x12
      this.initFlags = Object.assign({}, this.z80.flags)
    })
    describe('LD B,A', function() {
      beforeEach(function() {
        const code = new Uint8Array([
          0x47,
        ])
        this.mmu.copyFrom(code, 0)
        this.z80.stepExecution()
      })
      it('should set register B to the value of A', function() {
        assert.equal(0x12, this.z80.reg8[this.z80.regOffsets8.B])
      })
      shouldNotAlterFlags()
    })
    describe('LD C,A', function() {
      beforeEach(function() {
        const code = new Uint8Array([
          0x4F,
        ])
        this.mmu.copyFrom(code, 0)
        this.z80.stepExecution()
      })
      it('should set register C to the value of A', function() {
        assert.equal(0x12, this.z80.reg8[this.z80.regOffsets8.C])
      })
      shouldNotAlterFlags()
    })
    describe('LD D,A', function() {
      beforeEach(function() {
        const code = new Uint8Array([
          0x57,
        ])
        this.mmu.copyFrom(code, 0)
        this.z80.stepExecution()
      })
      it('should set register D to the value of A', function() {
        assert.equal(0x12, this.z80.reg8[this.z80.regOffsets8.D])
      })
      shouldNotAlterFlags()
    })
    describe('LD E,A', function() {
      beforeEach(function() {
        const code = new Uint8Array([
          0x5F,
        ])
        this.mmu.copyFrom(code, 0)
        this.z80.stepExecution()
      })
      it('should set register E to the value of A', function() {
        assert.equal(0x12, this.z80.reg8[this.z80.regOffsets8.E])
      })
      shouldNotAlterFlags()
    })
    describe('LD H,A', function() {
      beforeEach(function() {
        const code = new Uint8Array([
          0x67,
        ])
        this.mmu.copyFrom(code, 0)
        this.z80.stepExecution()
      })
      it('should set register H to the value of A', function() {
        assert.equal(0x12, this.z80.reg8[this.z80.regOffsets8.H])
      })
      shouldNotAlterFlags()
    })
    describe('LD L,A', function() {
      beforeEach(function() {
        const code = new Uint8Array([
          0x6F,
        ])
        this.mmu.copyFrom(code, 0)
        this.z80.stepExecution()
      })
      it('should set register L to the value of A', function() {
        assert.equal(0x12, this.z80.reg8[this.z80.regOffsets8.L])
      })
      shouldNotAlterFlags()
    })
    describe('LD A,A', function() {
      beforeEach(function() {
        const code = new Uint8Array([
          0x7F,
        ])
        this.mmu.copyFrom(code, 0)
        this.z80.stepExecution()
      })
      it('should set register A to the value of A', function() {
        assert.equal(0x12, this.z80.reg8[this.z80.regOffsets8.A])
      })
      shouldNotAlterFlags()
    })
  })
})
