import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

import {makeGenericTest} from './helpers.js'

describe('PUSH', function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
    this.cleanRegs = {}
  })
  // PUSH [AF,BC,DE,HL]
  const combinations = [
    { source: 'AF', opcodes: [0xF5] },
    { source: 'BC', opcodes: [0xC5] },
    { source: 'DE', opcodes: [0xD5] },
    { source: 'HL', opcodes: [0xE5] },
  ]
  for(let i = 0; i < combinations.length; i += 1) {
    const c = combinations[i]
    let desc = `PUSH ${c.source}`
    describe(desc, function() {
      makeGenericTest('result in no carry', 'PUSH', c.source, 'register16', null, null, 0, 0x4040, 0x00, null, c.opcodes, 1, {}, {PC: false, SP: 0x4000-2}, null, {SP: 0x4000}, null, null, [0x40, 0x40])
    }) 
  }
})


