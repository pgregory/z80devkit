import Z80 from '../z80.js'
import MMU from '../mmu.js'

import { assert } from 'chai'

import {makeGenericTest, modeText} from './helpers.js'

describe("LD", function() {
  beforeEach(function() {
    this.mmu = new MMU()
    this.z80 = new Z80(this.mmu)
    this.cleanRegs = {}
  })
  describe('LD r,r', function() {
    const combinations8bit = [
      { dest: 'A', destmode: 'register', source: 'A', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x7<<3) | 0x07], length: 1 },
      { dest: 'A', destmode: 'register', source: 'B', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x7<<3) | 0x00], length: 1 },
      { dest: 'A', destmode: 'register', source: 'C', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x7<<3) | 0x01], length: 1 },
      { dest: 'A', destmode: 'register', source: 'D', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x7<<3) | 0x02], length: 1 },
      { dest: 'A', destmode: 'register', source: 'E', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x7<<3) | 0x03], length: 1 },
      { dest: 'A', destmode: 'register', source: 'H', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x7<<3) | 0x04], length: 1 },
      { dest: 'A', destmode: 'register', source: 'L', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x7<<3) | 0x05], length: 1 },
      { dest: 'A', destmode: 'register', source: 'IXh', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x7<<3) | 0x04], length: 2 },
      { dest: 'A', destmode: 'register', source: 'IXl', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x7<<3) | 0x05], length: 2 },
      { dest: 'A', destmode: 'register', source: 'IYh', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x7<<3) | 0x04], length: 2 },
      { dest: 'A', destmode: 'register', source: 'IYl', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x7<<3) | 0x05], length: 2 },
      { dest: 'A', destmode: 'register', source: 'BC', sourcemode: 'register indirect', offset: 0, opcodes: [0x0A], length: 1 },
      { dest: 'A', destmode: 'register', source: 'DE', sourcemode: 'register indirect', offset: 0, opcodes: [0x1A], length: 1 },
      { dest: 'A', destmode: 'register', source: 'HL', sourcemode: 'register indirect', offset: 0, opcodes: [0x40 | (0x7<<3) | 0x6], length: 1 },
      { dest: 'A', destmode: 'register', source: 'IX', sourcemode: 'indexed', offset: 1, opcodes: [0xDD, 0x40 | (0x7<<3) | 0x6, 0x01], length: 3 },
      { dest: 'A', destmode: 'register', source: 'IY', sourcemode: 'indexed', offset: 1, opcodes: [0xFD, 0x40 | (0x7<<3) | 0x6, 0x01], length: 3 },
      { dest: 'A', destmode: 'register', source: null, sourcemode: 'immediate', offset: 0, opcodes: [(0x7<<3) | 0x6], length: 2 },
      { dest: 'A', destmode: 'register', source: null, sourcemode: 'extended', offset: 0, opcodes: [0x3A], length: 3 },

      { dest: 'B', destmode: 'register', source: 'A', sourcemode: 'register', offset: 0, opcodes: [0x40 | 0x07], length: 1 },
      { dest: 'B', destmode: 'register', source: 'B', sourcemode: 'register', offset: 0, opcodes: [0x40 | 0x00], length: 1 },
      { dest: 'B', destmode: 'register', source: 'C', sourcemode: 'register', offset: 0, opcodes: [0x40 | 0x01], length: 1 },
      { dest: 'B', destmode: 'register', source: 'D', sourcemode: 'register', offset: 0, opcodes: [0x40 | 0x02], length: 1 },
      { dest: 'B', destmode: 'register', source: 'E', sourcemode: 'register', offset: 0, opcodes: [0x40 | 0x03], length: 1 },
      { dest: 'B', destmode: 'register', source: 'H', sourcemode: 'register', offset: 0, opcodes: [0x40 | 0x04], length: 1 },
      { dest: 'B', destmode: 'register', source: 'L', sourcemode: 'register', offset: 0, opcodes: [0x40 | 0x05], length: 1 },
      { dest: 'B', destmode: 'register', source: 'IXh', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | 0x04], length: 2 },
      { dest: 'B', destmode: 'register', source: 'IXl', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | 0x05], length: 2 },
      { dest: 'B', destmode: 'register', source: 'IYh', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | 0x04], length: 2 },
      { dest: 'B', destmode: 'register', source: 'IYl', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | 0x05], length: 2 },
      { dest: 'B', destmode: 'register', source: 'HL', sourcemode: 'register indirect', offset: 0, opcodes: [0x40 | 0x6], length: 1 },
      { dest: 'B', destmode: 'register', source: 'IX', sourcemode: 'indexed', offset: 1, opcodes: [0xDD, 0x40 | 0x6, 0x01], length: 3 },
      { dest: 'B', destmode: 'register', source: 'IY', sourcemode: 'indexed', offset: 1, opcodes: [0xFD, 0x40 | 0x6, 0x01], length: 3 },
      { dest: 'B', destmode: 'register', source: null, sourcemode: 'immediate', offset: 0, opcodes: [0x6], length: 2 },

      { dest: 'C', destmode: 'register', source: 'A', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x1<<3) | 0x07], length: 1 },
      { dest: 'C', destmode: 'register', source: 'B', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x1<<3) | 0x00], length: 1 },
      { dest: 'C', destmode: 'register', source: 'C', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x1<<3) | 0x01], length: 1 },
      { dest: 'C', destmode: 'register', source: 'D', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x1<<3) | 0x02], length: 1 },
      { dest: 'C', destmode: 'register', source: 'E', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x1<<3) | 0x03], length: 1 },
      { dest: 'C', destmode: 'register', source: 'H', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x1<<3) | 0x04], length: 1 },
      { dest: 'C', destmode: 'register', source: 'L', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x1<<3) | 0x05], length: 1 },
      { dest: 'C', destmode: 'register', source: 'IXh', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x1<<3) | 0x04], length: 2 },
      { dest: 'C', destmode: 'register', source: 'IXl', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x1<<3) | 0x05], length: 2 },
      { dest: 'C', destmode: 'register', source: 'IYh', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x1<<3) | 0x04], length: 2 },
      { dest: 'C', destmode: 'register', source: 'IYl', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x1<<3) | 0x05], length: 2 },
      { dest: 'C', destmode: 'register', source: 'HL', sourcemode: 'register indirect', offset: 0, opcodes: [0x40 | (0x1<<3) | 0x6], length: 1 },
      { dest: 'C', destmode: 'register', source: 'IX', sourcemode: 'indexed', offset: 1, opcodes: [0xDD, 0x40 | (0x1<<3) | 0x6, 0x01], length: 3 },
      { dest: 'C', destmode: 'register', source: 'IY', sourcemode: 'indexed', offset: 1, opcodes: [0xFD, 0x40 | (0x1<<3) | 0x6, 0x01], length: 3 },
      { dest: 'C', destmode: 'register', source: null, sourcemode: 'immediate', offset: 0, opcodes: [(0x1<<3) | 0x6], length: 2 },

      { dest: 'D', destmode: 'register', source: 'A', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x2<<3) | 0x07], length: 1 },
      { dest: 'D', destmode: 'register', source: 'B', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x2<<3) | 0x00], length: 1 },
      { dest: 'D', destmode: 'register', source: 'C', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x2<<3) | 0x01], length: 1 },
      { dest: 'D', destmode: 'register', source: 'D', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x2<<3) | 0x02], length: 1 },
      { dest: 'D', destmode: 'register', source: 'E', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x2<<3) | 0x03], length: 1 },
      { dest: 'D', destmode: 'register', source: 'H', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x2<<3) | 0x04], length: 1 },
      { dest: 'D', destmode: 'register', source: 'L', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x2<<3) | 0x05], length: 1 },
      { dest: 'D', destmode: 'register', source: 'IXh', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x2<<3) | 0x04], length: 2 },
      { dest: 'D', destmode: 'register', source: 'IXl', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x2<<3) | 0x05], length: 2 },
      { dest: 'D', destmode: 'register', source: 'IYh', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x2<<3) | 0x04], length: 2 },
      { dest: 'D', destmode: 'register', source: 'IYl', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x2<<3) | 0x05], length: 2 },
      { dest: 'D', destmode: 'register', source: 'HL', sourcemode: 'register indirect', offset: 0, opcodes: [0x40 | (0x2<<3) | 0x6], length: 1 },
      { dest: 'D', destmode: 'register', source: 'IX', sourcemode: 'indexed', offset: 1, opcodes: [0xDD, 0x40 | (0x2<<3) | 0x6, 0x01], length: 3 },
      { dest: 'D', destmode: 'register', source: 'IY', sourcemode: 'indexed', offset: 1, opcodes: [0xFD, 0x40 | (0x2<<3) | 0x6, 0x01], length: 3 },
      { dest: 'D', destmode: 'register', source: null, sourcemode: 'immediate', offset: 0, opcodes: [(0x2<<3) | 0x6], length: 2 },

      { dest: 'E', destmode: 'register', source: 'A', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x3<<3) | 0x07], length: 1 },
      { dest: 'E', destmode: 'register', source: 'B', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x3<<3) | 0x00], length: 1 },
      { dest: 'E', destmode: 'register', source: 'C', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x3<<3) | 0x01], length: 1 },
      { dest: 'E', destmode: 'register', source: 'D', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x3<<3) | 0x02], length: 1 },
      { dest: 'E', destmode: 'register', source: 'E', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x3<<3) | 0x03], length: 1 },
      { dest: 'E', destmode: 'register', source: 'H', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x3<<3) | 0x04], length: 1 },
      { dest: 'E', destmode: 'register', source: 'L', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x3<<3) | 0x05], length: 1 },
      { dest: 'E', destmode: 'register', source: 'IXh', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x3<<3) | 0x04], length: 2 },
      { dest: 'E', destmode: 'register', source: 'IXl', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x3<<3) | 0x05], length: 2 },
      { dest: 'E', destmode: 'register', source: 'IYh', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x3<<3) | 0x04], length: 2 },
      { dest: 'E', destmode: 'register', source: 'IYl', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x3<<3) | 0x05], length: 2 },
      { dest: 'E', destmode: 'register', source: 'HL', sourcemode: 'register indirect', offset: 0, opcodes: [0x40 | (0x3<<3) | 0x6], length: 1 },
      { dest: 'E', destmode: 'register', source: 'IX', sourcemode: 'indexed', offset: 1, opcodes: [0xDD, 0x40 | (0x3<<3) | 0x6, 0x01], length: 3 },
      { dest: 'E', destmode: 'register', source: 'IY', sourcemode: 'indexed', offset: 1, opcodes: [0xFD, 0x40 | (0x3<<3) | 0x6, 0x01], length: 3 },
      { dest: 'E', destmode: 'register', source: null, sourcemode: 'immediate', offset: 0, opcodes: [(0x3<<3) | 0x6], length: 2 },

      { dest: 'H', destmode: 'register', source: 'A', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x4<<3) | 0x07], length: 1 },
      { dest: 'H', destmode: 'register', source: 'B', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x4<<3) | 0x00], length: 1 },
      { dest: 'H', destmode: 'register', source: 'C', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x4<<3) | 0x01], length: 1 },
      { dest: 'H', destmode: 'register', source: 'D', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x4<<3) | 0x02], length: 1 },
      { dest: 'H', destmode: 'register', source: 'E', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x4<<3) | 0x03], length: 1 },
      { dest: 'H', destmode: 'register', source: 'H', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x4<<3) | 0x04], length: 1 },
      { dest: 'H', destmode: 'register', source: 'L', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x4<<3) | 0x05], length: 1 },
      { dest: 'H', destmode: 'register', source: 'HL', sourcemode: 'register indirect', offset: 0, opcodes: [0x40 | (0x4<<3) | 0x6], length: 1 },
      { dest: 'H', destmode: 'register', source: 'IX', sourcemode: 'indexed', offset: 1, opcodes: [0xDD, 0x40 | (0x4<<3) | 0x6, 0x01], length: 3 },
      { dest: 'H', destmode: 'register', source: 'IY', sourcemode: 'indexed', offset: 1, opcodes: [0xFD, 0x40 | (0x4<<3) | 0x6, 0x01], length: 3 },
      { dest: 'H', destmode: 'register', source: null, sourcemode: 'immediate', offset: 0, opcodes: [(0x4<<3) | 0x6], length: 2 },

      { dest: 'L', destmode: 'register', source: 'A', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x5<<3) | 0x07], length: 1 },
      { dest: 'L', destmode: 'register', source: 'B', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x5<<3) | 0x00], length: 1 },
      { dest: 'L', destmode: 'register', source: 'C', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x5<<3) | 0x01], length: 1 },
      { dest: 'L', destmode: 'register', source: 'D', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x5<<3) | 0x02], length: 1 },
      { dest: 'L', destmode: 'register', source: 'E', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x5<<3) | 0x03], length: 1 },
      { dest: 'L', destmode: 'register', source: 'H', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x5<<3) | 0x04], length: 1 },
      { dest: 'L', destmode: 'register', source: 'L', sourcemode: 'register', offset: 0, opcodes: [0x40 | (0x5<<3) | 0x05], length: 1 },
      { dest: 'L', destmode: 'register', source: 'HL', sourcemode: 'register indirect', offset: 0, opcodes: [0x40 | (0x5<<3) | 0x6], length: 1 },
      { dest: 'L', destmode: 'register', source: 'IX', sourcemode: 'indexed', offset: 1, opcodes: [0xDD, 0x40 | (0x5<<3) | 0x6, 0x01], length: 3 },
      { dest: 'L', destmode: 'register', source: 'IY', sourcemode: 'indexed', offset: 1, opcodes: [0xFD, 0x40 | (0x5<<3) | 0x6, 0x01], length: 3 },
      { dest: 'L', destmode: 'register', source: null, sourcemode: 'immediate', offset: 0, opcodes: [(0x5<<3) | 0x6], length: 2 },


      { dest: 'IXh', destmode: 'register', source: 'A', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x4<<3) | 0x07], length: 2 },
      { dest: 'IXh', destmode: 'register', source: 'B', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x4<<3) | 0x00], length: 2 },
      { dest: 'IXh', destmode: 'register', source: 'C', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x4<<3) | 0x01], length: 2 },
      { dest: 'IXh', destmode: 'register', source: 'D', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x4<<3) | 0x02], length: 2 },
      { dest: 'IXh', destmode: 'register', source: 'E', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x4<<3) | 0x03], length: 2 },
      { dest: 'IXh', destmode: 'register', source: 'IXh', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x4<<3) | 0x04], length: 2 },
      { dest: 'IXh', destmode: 'register', source: 'IXl', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x4<<3) | 0x05], length: 2 },
      { dest: 'IXh', destmode: 'register', source: null, sourcemode: 'immediate', offset: 0, opcodes: [0xDD, (0x4<<3) | 0x6], length: 3 },

      { dest: 'IXl', destmode: 'register', source: 'A', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x5<<3) | 0x07], length: 2 },
      { dest: 'IXl', destmode: 'register', source: 'B', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x5<<3) | 0x00], length: 2 },
      { dest: 'IXl', destmode: 'register', source: 'C', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x5<<3) | 0x01], length: 2 },
      { dest: 'IXl', destmode: 'register', source: 'D', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x5<<3) | 0x02], length: 2 },
      { dest: 'IXl', destmode: 'register', source: 'E', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x5<<3) | 0x03], length: 2 },
      { dest: 'IXl', destmode: 'register', source: 'IXh', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x5<<3) | 0x04], length: 2 },
      { dest: 'IXl', destmode: 'register', source: 'IXl', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x40 | (0x5<<3) | 0x05], length: 2 },
      { dest: 'IXl', destmode: 'register', source: null, sourcemode: 'immediate', offset: 0, opcodes: [0xDD, (0x5<<3) | 0x6], length: 3 },

      { dest: 'IYh', destmode: 'register', source: 'A', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x4<<3) | 0x07], length: 2 },
      { dest: 'IYh', destmode: 'register', source: 'B', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x4<<3) | 0x00], length: 2 },
      { dest: 'IYh', destmode: 'register', source: 'C', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x4<<3) | 0x01], length: 2 },
      { dest: 'IYh', destmode: 'register', source: 'D', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x4<<3) | 0x02], length: 2 },
      { dest: 'IYh', destmode: 'register', source: 'E', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x4<<3) | 0x03], length: 2 },
      { dest: 'IYh', destmode: 'register', source: 'IYh', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x4<<3) | 0x04], length: 2 },
      { dest: 'IYh', destmode: 'register', source: 'IYl', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x4<<3) | 0x05], length: 2 },
      { dest: 'IYh', destmode: 'register', source: null, sourcemode: 'immediate', offset: 0, opcodes: [0xFD, (0x4<<3) | 0x6], length: 3 },

      { dest: 'IYl', destmode: 'register', source: 'A', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x5<<3) | 0x07], length: 2 },
      { dest: 'IYl', destmode: 'register', source: 'B', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x5<<3) | 0x00], length: 2 },
      { dest: 'IYl', destmode: 'register', source: 'C', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x5<<3) | 0x01], length: 2 },
      { dest: 'IYl', destmode: 'register', source: 'D', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x5<<3) | 0x02], length: 2 },
      { dest: 'IYl', destmode: 'register', source: 'E', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x5<<3) | 0x03], length: 2 },
      { dest: 'IYl', destmode: 'register', source: 'IYh', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x5<<3) | 0x04], length: 2 },
      { dest: 'IYl', destmode: 'register', source: 'IYl', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x40 | (0x5<<3) | 0x05], length: 2 },
      { dest: 'IYl', destmode: 'register', source: null, sourcemode: 'immediate', offset: 0, opcodes: [0xFD, (0x5<<3) | 0x6], length: 3 },

      { dest: 'I', destmode: 'register', source: 'A', sourcemode: 'register', offset: 0, opcodes: [0xED, 0x47], length: 2 },
      { dest: 'R', destmode: 'register', source: 'A', sourcemode: 'register', offset: 0, opcodes: [0xED, 0x4F], length: 2 },

      { dest: 'BC', destmode: 'register indirect', source: 'A', sourcemode: 'register', offset: 0, opcodes: [0x02], length: 1 },
      { dest: 'DE', destmode: 'register indirect', source: 'A', sourcemode: 'register', offset: 0, opcodes: [0x12], length: 1 },

      { dest: 'HL', destmode: 'register indirect', source: 'A', sourcemode: 'register', offset: 0, opcodes: [0x77], length: 1 },
      { dest: 'HL', destmode: 'register indirect', source: 'B', sourcemode: 'register', offset: 0, opcodes: [0x70], length: 1 },
      { dest: 'HL', destmode: 'register indirect', source: 'C', sourcemode: 'register', offset: 0, opcodes: [0x71], length: 1 },
      { dest: 'HL', destmode: 'register indirect', source: 'D', sourcemode: 'register', offset: 0, opcodes: [0x72], length: 1 },
      { dest: 'HL', destmode: 'register indirect', source: 'E', sourcemode: 'register', offset: 0, opcodes: [0x73], length: 1 },
      { dest: 'HL', destmode: 'register indirect', source: 'H', sourcemode: 'register', offset: 0, opcodes: [0x74], length: 1 },
      { dest: 'HL', destmode: 'register indirect', source: 'L', sourcemode: 'register', offset: 0, opcodes: [0x75], length: 1 },

      { dest: 'IX', destmode: 'indexed', source: 'A', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x77], length: 3 },
      { dest: 'IX', destmode: 'indexed', source: 'B', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x70], length: 3 },
      { dest: 'IX', destmode: 'indexed', source: 'C', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x71], length: 3 },
      { dest: 'IX', destmode: 'indexed', source: 'D', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x72], length: 3 },
      { dest: 'IX', destmode: 'indexed', source: 'E', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x73], length: 3 },
      { dest: 'IX', destmode: 'indexed', source: 'H', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x74], length: 3 },
      { dest: 'IX', destmode: 'indexed', source: 'L', sourcemode: 'register', offset: 0, opcodes: [0xDD, 0x75], length: 3 },

      { dest: 'IY', destmode: 'indexed', source: 'A', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x77], length: 3 },
      { dest: 'IY', destmode: 'indexed', source: 'B', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x70], length: 3 },
      { dest: 'IY', destmode: 'indexed', source: 'C', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x71], length: 3 },
      { dest: 'IY', destmode: 'indexed', source: 'D', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x72], length: 3 },
      { dest: 'IY', destmode: 'indexed', source: 'E', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x73], length: 3 },
      { dest: 'IY', destmode: 'indexed', source: 'H', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x74], length: 3 },
      { dest: 'IY', destmode: 'indexed', source: 'L', sourcemode: 'register', offset: 0, opcodes: [0xFD, 0x75], length: 3 },

      { dest: null, destmode: 'extended', source: 'A', sourcemode: 'register', offset: 0, opcodes: [0x32], length: 3 },
    ]

    for(let i = 0; i < combinations8bit.length; i += 1) {
      const c = combinations8bit[i]
      let desc = `LD ${modeText(c.dest, c.destmode)}, ${modeText(c.source, c.sourcemode)}`
      makeGenericTest(desc, 'LD', c.dest, c.destmode, c.source, c.sourcemode, c.offset, 0x00, 0x80, 0x80, c.opcodes, c.length, null, ["PC", c.dest])
    }

    const combinations16bit = [
      { dest: 'BC', destmode: 'register16', source: null, sourcemode: 'immediate16', offset: 0, opcodes: [0x01], length: 3 },
      { dest: 'DE', destmode: 'register16', source: null, sourcemode: 'immediate16', offset: 0, opcodes: [0x11], length: 3 },
      { dest: 'HL', destmode: 'register16', source: null, sourcemode: 'immediate16', offset: 0, opcodes: [0x21], length: 3 },
      { dest: 'SP', destmode: 'register16', source: null, sourcemode: 'immediate16', offset: 0, opcodes: [0x31], length: 3 },
      { dest: 'IX', destmode: 'register16', source: null, sourcemode: 'immediate16', offset: 0, opcodes: [0xDD, 0x21], length: 4 },
      { dest: 'IY', destmode: 'register16', source: null, sourcemode: 'immediate16', offset: 0, opcodes: [0xFD, 0x21], length: 4 },

      { dest: 'BC', destmode: 'register16', source: null, sourcemode: 'extended16', offset: 0, opcodes: [0xED, 0x4B], length: 4 },
      { dest: 'DE', destmode: 'register16', source: null, sourcemode: 'extended16', offset: 0, opcodes: [0xED, 0x5B], length: 4 },
      { dest: 'HL', destmode: 'register16', source: null, sourcemode: 'extended16', offset: 0, opcodes: [0x2A], length: 3 },
      { dest: 'SP', destmode: 'register16', source: null, sourcemode: 'extended16', offset: 0, opcodes: [0xED, 0x7B], length: 4 },
      { dest: 'IX', destmode: 'register16', source: null, sourcemode: 'extended16', offset: 0, opcodes: [0xDD, 0x2A], length: 4 },
      { dest: 'IY', destmode: 'register16', source: null, sourcemode: 'extended16', offset: 0, opcodes: [0xFD, 0x2A], length: 4 },

      { dest: 'SP', destmode: 'register16', source: 'HL', sourcemode: 'register16', offset: 0, opcodes: [0xF9], length: 1 },
      { dest: 'SP', destmode: 'register16', source: 'IX', sourcemode: 'register16', offset: 0, opcodes: [0xDD, 0xF9], length: 2 },
      { dest: 'SP', destmode: 'register16', source: 'IY', sourcemode: 'register16', offset: 0, opcodes: [0xFD, 0xF9], length: 2 },

      { dest: null, destmode: 'extended16', source: 'HL', sourcemode: 'register16', offset: 0, opcodes: [0x22], length: 3 },

      { dest: null, destmode: 'extended16', source: 'BC', sourcemode: 'register16', offset: 0, opcodes: [0xED, 0x43], length: 4 },
      { dest: null, destmode: 'extended16', source: 'DE', sourcemode: 'register16', offset: 0, opcodes: [0xED, 0x53], length: 4 },
      { dest: null, destmode: 'extended16', source: 'SP', sourcemode: 'register16', offset: 0, opcodes: [0xED, 0x73], length: 4 },

      { dest: null, destmode: 'extended16', source: 'IX', sourcemode: 'register16', offset: 0, opcodes: [0xDD, 0x22], length: 4 },
      { dest: null, destmode: 'extended16', source: 'IY', sourcemode: 'register16', offset: 0, opcodes: [0xFD, 0x22], length: 4 },
    ]

    for(let i = 0; i < combinations16bit.length; i += 1) {
      const c = combinations16bit[i]
      let desc = `LD ${modeText(c.dest, c.destmode)}, ${modeText(c.source, c.sourcemode)}`
      makeGenericTest(desc, 'LD', c.dest, c.destmode, c.source, c.sourcemode, c.offset, 0x00, 0x8081, 0x8081, c.opcodes, c.length, null, ["PC", c.dest])
    }

    const specialCombinations = [
      { dest: 'A', destmode: 'register', source: 'I', sourcemode: 'register', offset: 0, opcodes: [0xED, 0x57], length: 2 },
      { dest: 'A', destmode: 'register', source: 'R', sourcemode: 'register', offset: 0, opcodes: [0xED, 0x5F], length: 2 },
    ]
    for(let i = 0; i < specialCombinations.length; i += 1) {
      const c = specialCombinations[i]
      let desc = `LD ${modeText(c.dest, c.destmode)}, ${modeText(c.source, c.sourcemode)}`
      makeGenericTest(desc, 'LD', c.dest, c.destmode, c.source, c.sourcemode, c.offset, 0x00, 0x80, 0x80, c.opcodes, c.length, {S: true, H: false, N: false}, ["PC", c.dest])
      makeGenericTest(desc, 'LD', c.dest, c.destmode, c.source, c.sourcemode, c.offset, 0x00, 0x00, 0x00, c.opcodes, c.length, {S: false, Z: true, H: false, N: false}, ["PC", c.dest])
    }

  })
})
