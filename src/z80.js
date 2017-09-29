import {hexByte} from './utilities.js'

// Macros for common flag update modes

DEFINE_MACRO(PUSH_WORD, (z80, value) => {
  let sp = z80.reg16[z80.regOffsets16.SP]
  sp--
  z80.mmu.writeByte(sp, (value >> 8))
  sp--
  z80.mmu.writeByte(sp, (value & 0xFF))
  z80.reg16[z80.regOffsets16.SP] = sp
})

DEFINE_MACRO(POP_WORD, (z80) => {
  let sp = z80.reg16[z80.regOffsets16.SP]
  const vl = z80.mmu.readByte(sp)
  sp++
  const vh = z80.mmu.readByte(sp)
  sp++
  z80.reg16[z80.regOffsets16.SP] = sp
  return (vh << 8) | vl
})

DEFINE_MACRO(FLAGS_XY_A, (z80, a) => {
  z80.flags.Y = ((a & 0x20) !== 0)
  z80.flags.X = ((a & 0x08) !== 0)
})

DEFINE_MACRO(FLAGS_MMMV0M, (z80, a, b, r) => {
  z80.flags.S = ((r & 0x80) !== 0)
  z80.flags.Z = !(r & 0xFF)
  z80.flags.H = ((((a & 0xF) + (b & 0xF)) & 0x10) !== 0)
  z80.flags.P = (((a & 0x80) === (b & 0x80)) && ((a & 0x80) !== (r & 0x80)))
  z80.flags.N = false
  z80.flags.C = (r > 255)
  FLAGS_XY_A(z80, r)
})

DEFINE_MACRO(FLAGS_MMMV0N, (z80, a, b, r) => {
  z80.flags.S = ((r & 0x80) !== 0)
  z80.flags.Z = !(r & 0xFF)
  z80.flags.H = ((((a & 0xF) + (b & 0xF)) & 0x10) !== 0)
  z80.flags.P = (((a & 0x80) === (b & 0x80)) && ((a & 0x80) !== (r & 0x80)))
  z80.flags.N = false
  FLAGS_XY_A(z80, r)
})

DEFINE_MACRO(FLAGS_MMMV1M, (z80, a, b, r) => {
  z80.flags.S = ((r & 0x80) !== 0)
  z80.flags.Z = !(r & 0xFF)
  z80.flags.H = ((((a & 0xF) + (b & 0xF)) & 0x10) !== 0)
  z80.flags.P = (((a & 0x80) === (b & 0x80)) && ((a & 0x80) !== (r & 0x80)))
  z80.flags.N = true
  z80.flags.C = (r > 255)
  FLAGS_XY_A(z80, r)
})

DEFINE_MACRO(FLAGS_MMMV1N, (z80, a, b, r) => {
  z80.flags.S = ((r & 0x80) !== 0)
  z80.flags.Z = !(r & 0xFF)
  z80.flags.H = ((((a & 0xF) + (b & 0xF)) & 0x10) !== 0)
  z80.flags.P = (((a & 0x80) === (b & 0x80)) && ((a & 0x80) !== (r & 0x80)))
  z80.flags.N = true
  FLAGS_XY_A(z80, r)
})

DEFINE_MACRO(FLAGS_MMMP00, (z80, a, b, r) => {
  z80.flags.S = ((r & 0x80) !== 0)
  z80.flags.Z = !(r & 0xFF)
  z80.flags.H = ((((a & 0xF) + (b & 0xF)) & 0x10) !== 0)
  z80.flags.P = z80.getParity(r)
  z80.flags.N = false
  z80.flags.C = false
  FLAGS_XY_A(z80, r)
})

DEFINE_MACRO(FLAGS_NN0N0M, (z80, a, b, r) => {
  //z80.flags.S = 
  //z80.flags.Z = 
  z80.flags.H = false
  //z80.flags.P = 
  z80.flags.N = false
  z80.flags.C = (r > 255)
  FLAGS_XY_A(z80, r)
})

DEFINE_MACRO(FLAGS_MM0P0M, (z80, a, b, r) => {
  z80.flags.S = ((r & 0x80) !== 0)
  z80.flags.Z = !(r & 0xFF)
  z80.flags.H = false
  z80.flags.P = z80.getParity(r)
  z80.flags.N = false
  z80.flags.C = (r > 255)
  FLAGS_XY_A(z80, r)
})

DEFINE_MACRO(JP_CC_NNNN, (z80, cond, length) => {
  const addr = z80.mmu.readWord(z80.reg16[z80.regOffsets16.PC] + 1)
  if(cond) {
    z80.reg16[z80.regOffsets16.PC] = addr
  } else {
    z80.reg16[z80.regOffsets16.PC] += length
  }
  return true
})

DEFINE_MACRO(LD_RR_NNNN, (z80, r) => {
  const nl = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1) 
  const nh = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 2) 
  // TODO: Is this construction right?
  z80.reg16[r] = (nh << 8) + nl
})

DEFINE_MACRO(LD_RR_FROM_NNNN, (z80, r) => {
  // Read address from opcode
  const nl = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1) 
  const nh = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 2) 
  const addr = (nh << 8) + nl
  // Read data from address
  const rl = z80.mmu.readByte(addr)
  const rh = z80.mmu.readByte(addr + 1)
  // TODO: Is this construction right?
  z80.reg16[r] = (rh << 8) + rl
})

DEFINE_MACRO(LD_TO_NNNN_R, (z80, r) => {
  // Read address from opcode
  const nl = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1) 
  const nh = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 2) 
  const addr = (nh << 8) + nl
  const value = z80.reg8[r]
  z80.mmu.writeByte(addr, value)
})

DEFINE_MACRO(LD_TO_NNNN_RR, (z80, r) => {
  // Read address from opcode
  const nl = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1) 
  const nh = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 2) 
  let addr = (nh << 8) + nl
  const value = z80.reg16[r]
  z80.mmu.writeByte(addr, value)
  addr = (addr + 1) & 0xFFFF
  z80.mmu.writeByte(addr, value >> 8)
})

DEFINE_MACRO(LD_R_NN, (z80, r) => {
  const n = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1)
  z80.reg8[r] = n
})

DEFINE_MACRO(LD_RR_RR, (z80, r, r2) => {
  z80.reg16[r] = z80.reg16[r2]
})

DEFINE_MACRO(LD_R_R, (z80, r, r2) => {
  z80.reg8[r] = z80.reg8[r2]
})

DEFINE_MACRO(LD_TO_RR_R, (z80, r, r2) => {
  const addr = z80.reg16[r]
  const val = z80.reg8[r2]
  z80.mmu.writeByte(addr, val)
})

DEFINE_MACRO(LD_TO_HL_R, (z80, r, r2) => {
  let addr = z80.reg16[r]
  addr += ADJUST_ADDRESS(z80)
  const val = z80.reg8[r2]
  z80.mmu.writeByte(addr, val)
})

DEFINE_MACRO(ADD_R_R, (z80, r, r2) => {
  const a = z80.reg8[r]
  const b = z80.reg8[r2]
  const res = a + b
  z80.reg8[r] = res
  FLAGS_MMMV0M(z80, a, b, res)
})

DEFINE_MACRO(ADD_RR_RR, (z80, r, r2) => {
  const a = z80.reg16[r]
  const b = z80.reg16[r2]
  const res = a + b
  z80.reg16[r] = res
  z80.flags.H = ((((a & 0xFFF) + (b & 0xFFF)) & 0x1000) !== 0)
  z80.flags.N = false
  z80.flags.C = (res > 0xFFFF)
  // TODO: XY Flags
})

DEFINE_MACRO(ADC_R_R, (z80, r, r2) => {
  const a = z80.reg8[r]
  const b = z80.reg8[r2]
  const res = a + b + ((z80.flags.C)? 1 : 0)
  z80.reg8[r] = res
  FLAGS_MMMV0M(z80, a, b, res)
})


DEFINE_MACRO(SUB_R_R, (z80, r, r2) => {
  const a = z80.reg8[r]
  const b = z80.reg8[r2]
  const res = a - b
  z80.reg8[r] = res
  FLAGS_MMMV1M(z80, a, b, res)
})

DEFINE_MACRO(SBC_R_R, (z80, r, r2) => {
  const a = z80.reg8[r]
  const b = z80.reg8[r2]
  const res = a - b - (z80.flags.C)? 1 : 0
  z80.reg8[r] = res
  FLAGS_MMMV1M(z80, a, b, res)
})

DEFINE_MACRO(SBC_RR_RR, (z80, r, r2) => {
  const a = z80.reg16[r]
  const b = z80.reg16[r2]
  const res = a - b - (z80.flags.C)? 1 : 0
  z80.reg16[r] = res
  FLAGS_MMMV1M(z80, a, b, res)
})

DEFINE_MACRO(AND_R, (z80, r) => {
  const a = z80.reg8[z80.regOffsets8.A]
  const b = z80.reg8[r]
  const res = a & b
  z80.reg8[z80.regOffsets8.A] = res
  FLAGS_MMMP00(z80, a, b, res)
})

DEFINE_MACRO(XOR_R, (z80, r) => {
  const a = z80.reg8[z80.regOffsets8.A]
  const b = z80.reg8[r]
  const res = a ^ b
  z80.reg8[z80.regOffsets8.A] = res
  FLAGS_MMMP00(z80, a, r, res)
})

DEFINE_MACRO(OR_R, (z80, r) => {
  const a = z80.reg8[z80.regOffsets8.A]
  const b = z80.reg8[r]
  const res = a | b
  z80.reg8[z80.regOffsets8.A] = res
  FLAGS_MMMP00(z80, a, r, res)
})

DEFINE_MACRO(INC_RR, (z80, r) => {
  z80.reg16[r] += 1
})

DEFINE_MACRO(DEC_RR, (z80, r) => {
  z80.reg16[r] -= 1
})

DEFINE_MACRO(INC_R, (z80, r) => {
  const a = z80.reg8[r]
  const res = a + 1
  z80.reg8[r] = res
  // TODO: Not sure what should be passed in as operand b here.
  FLAGS_MMMV0N(z80, a, a, res)
})

DEFINE_MACRO(DEC_R, (z80, r) => {
  const a = z80.reg8[r]
  const res = a - 1
  z80.reg8[r] = res
  // TODO: Not sure what should be passed in as operand b here.
  FLAGS_MMMV1N(z80, a, a, res)
})

DEFINE_MACRO(LD_R_FROM_RR, (z80, r, r2) => {
  const addr = z80.reg16[r2]
  z80.reg8[r] = z80.mmu.readByte(addr) 
})

DEFINE_MACRO(LD_R_FROM_HL, (z80, r, r2) => {
  let addr = z80.reg16[r2]
  addr += ADJUST_ADDRESS(z80)
  z80.reg8[r] = z80.mmu.readByte(addr) 
})

DEFINE_MACRO(INC_AT_RR, (z80, r) => {
  const addr = z80.reg16[r]
  const a = z80.mmu.readByte(addr)
  const res = a + 1
  z80.mmu.writeByte(addr, res)
  FLAGS_MMMV0N(z80, a, a, res)
})

DEFINE_MACRO(CP_R, (z80, r) => {
  const a = z80.reg8[z80.regOffsets8.A]
  const b = z80.reg8[r]
  const res = a - b
  FLAGS_MMMV1M(z80, a, b, res)
})

DEFINE_MACRO(CALL, (z80, length) => {
  // Read address from opcode
  let pc = z80.reg16[z80.regOffsets16.PC]
  const nl = z80.mmu.readByte(pc + 1) 
  const nh = z80.mmu.readByte(pc + 2) 
  let addr = (nh << 8) + nl
  pc += length
  PUSH_WORD(z80, pc)
  z80.reg16[z80.regOffsets16.PC] = addr
  return true
})

DEFINE_MACRO(CALL_CC, (z80, c, length) => {
  if(c) {
    return CALL(z80, length)
  }
})

DEFINE_MACRO(RET, (z80) => {
  // Pop return address from stack
  const addr = POP_WORD(z80)
  z80.reg16[z80.regOffsets16.PC] = addr
  return true
})

DEFINE_MACRO(RET_CC, (z80, c) => {
  if(c) {
    return RET(z80)
  }
})

DEFINE_MACRO(PUSH_RR, (z80, r) => {
  PUSH_WORD(z80, z80.reg16[r])
})

DEFINE_MACRO(POP_RR, (z80, r) => {
  z80.reg16[r] = POP_WORD(z80)
})

DEFINE_MACRO(RLC_R, (z80, r) => {
  const a = z80.reg8[z80.regOffsets8.A]
  const c = (a & 0x80) >> 7
  const res = (a << 1) | c
  z80.reg8[regOffsets8.A] = res
  // TODO: Not sure about the second operand
  FLAGS_MM0P0M(z80, a, a, res)
  z80.flags.C = c? true : false
})

DEFINE_MACRO(RRC_R, (z80, r) => {
  const a = z80.reg8[z80.regOffsets8.A]
  const c = (a & 0x01) << 8
  const res = (a >> 1) | c
  z80.reg8[regOffsets8.A] = res
  // TODO: Not sure about the second operand
  FLAGS_MM0P0M(z80, a, a, res)
  z80.flags.C = c? true : false
})

DEFINE_MACRO(RL_R, (z80, r) => {
  const a = z80.reg8[z80.regOffsets8.A]
  const c = (z80.flags.C)? 0x01 : 0x00
  const s = a & 0x80
  const res = (a << 1) | c
  z80.reg8[regOffsets8.A] = res
  // TODO: Not sure about the second operand
  FLAGS_MM0P0M(z80, a, a, res)
  z80.flags.C = s? true : false
})

DEFINE_MACRO(RR_R, (z80, r) => {
  const a = z80.reg8[z80.regOffsets8.A]
  const c = (z80.flags.C)? 0x80 : 0x00
  const s = a & 0x01
  const res = (a >> 1) | c
  z80.reg8[regOffsets8.A] = res
  // TODO: Not sure about the second operand
  FLAGS_MM0P0M(z80, a, a, res)
  z80.flags.C = s? true : false
})

DEFINE_MACRO(SLA_R, (z80, r) => {
  const a = z80.reg8[z80.regOffsets8.A]
  const s = a & 0x80
  const res = (a << 1)
  z80.reg8[regOffsets8.A] = res
  // TODO: Not sure about the second operand
  FLAGS_MM0P0M(z80, a, a, res)
  z80.flags.C = s? true : false
})

DEFINE_MACRO(SRA_R, (z80, r) => {
  const a = z80.reg8[z80.regOffsets8.A]
  const c = a & 0x01
  const s = a & 0x80
  const res = (a >> 1) | s
  z80.reg8[regOffsets8.A] = res
  // TODO: Not sure about the second operand
  FLAGS_MM0P0M(z80, a, a, res)
  z80.flags.C = c? true : false
})

DEFINE_MACRO(SLL_R, (z80, r) => {
  const a = z80.reg8[z80.regOffsets8.A]
  const s = a & 0x80
  const res = (a << 1) | 0x01
  z80.reg8[regOffsets8.A] = res
  // TODO: Not sure about the second operand
  FLAGS_MM0P0M(z80, a, a, res)
  z80.flags.C = s? true : false
})

DEFINE_MACRO(SRL_R, (z80, r) => {
  const a = z80.reg8[z80.regOffsets8.A]
  const c = a & 0x01
  const res = (a >> 1)
  z80.reg8[regOffsets8.A] = res
  // TODO: Not sure about the second operand
  FLAGS_MM0P0M(z80, a, a, res)
  z80.flags.C = c? true : false
})

DEFINE_MACRO(BIT_B_R, (z80, b, r) => {
  const res = z80.reg8[r] & (0x01 << b)
  z80.reg8[r] = res
  z80.flags.Z = res? true : false
  z80.flags.H = true
  z80.flags.N = false
})

DEFINE_MACRO(BIT_B_AT_RR, (z80, b, r) => {
  let addr = z80.reg16[r]
  addr += ADJUST_ADDRESS(z80)
  const res = z80.mmu.readByte(addr) & (0x01 << b)
  z80.mmu.writeByte(addr, res)
  z80.flags.Z = res? true : false
  z80.flags.H = true
  z80.flags.N = false
})

DEFINE_MACRO(RES_B_R, (z80, b, r) => {
  z80.reg8[r] &= (0xFF ^ (0x01 << b))
})

DEFINE_MACRO(RES_B_AT_RR, (z80, b, r) => {
  let addr = z80.reg16[r]
  addr += ADJUST_ADDRESS(z80)
  // TODO: is it right to do this in two operations, read and write?
  const val = z80.mmu.readByte(addr) & (0xFF ^ (0x01 << b))
  z80.mmu.writeByte(addr, res)
})

DEFINE_MACRO(SET_B_R, (z80, b, r) => {
  z80.reg8[r] |= (0x01 << b)
})

DEFINE_MACRO(SET_B_AT_RR, (z80, b, r) => {
  let addr = z80.reg16[r]
  addr += AJUST_ADDRESS(z80)
  // TODO: is it right to do this in two operations, read and write?
  const val = z80.mmu.readByte(addr) | (0x01 << b)
  z80.mmu.writeByte(addr, res)
})

DEFINE_MACRO(LDI, (z80) => {
  const source = z80.reg16[z80.regOffsets16.HL]
  const target = z80.reg16[z80.regOffsets16.DE]
  z80.mmu.writeWord(target, z80.mmu.readWord(source)) 
  z80.reg16[z80.regOffsets16.BC] -= 1
  z80.flags.H = false
  z80.flags.N = false
  z80.flags.P = (z80.reg16[z80.regOffsets16.BC] === 0)? false : true
})

DEFINE_MACRO(ADJUST_ADDRESS, (z80) => {
  // If we're in 0xDD or 0xFD mode, read a byte from the PC
  // and advance the PC, return the offset.
  if(z80.regOffsets16.HL_IX_IY !== z80.regOffsets16.HL) {
    const offset = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1)
    z80.reg16[z80.regOffsets16.PC] += 1
    return (offset & 0x80)? offset - 0x100 : offset
  }
  return 0
})

export default class Z80 {
  constructor(mmu) {
    this.mmu = mmu
    
    const z80 = this
    this.instructions = [
      /* 00 */ {
				name: "NOP",
				exec() {},
				length: 1
			 },
      /* 01 */ { 
        name: "LD BC,\\2\\1H", 
        exec() {
          LD_RR_NNNN(z80, z80.regOffsets16.BC)
        }, 
        length: 3 
      },
      /* 02 */ {
				name: "LD (BC),A",
				exec() {
          LD_TO_RR_R(z80, z80.regOffsets16.BC, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 03 */ {
				name: "INC BC",
				exec() {
          INC_RR(z80, z80.regOffsets16.BC)
				},
				length: 1
			 },
      /* 04 */ {
				name: "INC B",
				exec() {
          INC_R(z80, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 05 */ {
				name: "DEC B",
				exec() {
          DEC_R(z80, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 06 */ { 
        name: 'LD B,\\1H',
        exec() { 
          LD_R_NN(z80, z80.regOffsets8.B)
        }, 
        length: 2 
      },
      /* 07 */ {
				name: "RLCA",
				exec() {
          const a = z80.reg8[z80.regOffsets8.A]
          const res = (a << 1) | (a >> 7)
          z80.reg8[z80.regOffsets8.A] = res
          // TODO: Not sure about the second operand
          FLAGS_NN0N0M(z80, a, a, res)
				},
				length: 1
			 },
      /* 08 */ {
				name: "EX AF,AF'",
				exec() {
          const t = Object.assign({}, z80.flags)
          Object.assign(z80.flags, z80.altFlags)
          Object.assign(z80.altFlags, t)
          const a = z80.reg8[z80.regOffsets8.A]
          z80.reg8[z80.regOffsets8.A] = z80.reg8[z80.regOffsets8.A_]
          z80.reg8[z80.regOffsets8.A_] = a
				},
				length: 1
			 },
      /* 09 */ {
				name: "ADD HL,BC",
				exec() {
          ADD_RR_RR(z80, z80.regOffsets16.HL_IX_IY, z80.regOffsets16.BC)
				},
				length: 1
			 },
      /* 0A */ {
				name: "LD A,(BC)",
				exec() {
          LD_R_FROM_RR(z80, z80.regOffsets8.A, z80.regOffsets16.BC)
				},
				length: 1
			 },
      /* 0B */ {
				name: "DEC BC",
				exec() {
          DEC_RR(z80, z80.regOffsets16.BC)
				},
				length: 1
			 },
      /* 0C */ {
				name: "INC C",
				exec() {
          INC_R(z80, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 0D */ {
				name: "DEC C",
				exec() {
          DEC_R(z80, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 0E */ {
        name: "LD C,\\1H",
        exec() {
          LD_R_NN(z80, z80.regOffsets8.C)
        },
        length: 2
      },
      /* 0F */ {
				name: "RRCA",
				exec() {
          const a = z80.reg8[z80.regOffsets8.A]
          const res = (a >> 1) | (a << 7)
          z80.reg8[z80.regOffsets8.A] = res
          // TODO: Not sure about the second operand
          FLAGS_NN0N0M(z80, a, a, res)
				},
				length: 1
			 },
      /* 10 */ {
				name: "DJNZ \\1H",
				exec() {
          let b = z80.reg8[z80.regOffsets8.B]
          const offset = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1)
          b -= 1
          z80.reg8[z80.regOffsets8.B] = b 
          if(b !== 0) {
            let pc = z80.reg16[z80.regOffsets16.PC]
            pc += this.length
            pc += (offset & 0x80)? offset - 0x100 : offset
            z80.reg16[z80.regOffsets16.PC] = pc
            return true
          }
				},
				length: 2
			 },
      /* 11 */ {
        name: "LD DE,\\2\\1H",
        exec() {
          LD_RR_NNNN(z80, z80.regOffsets16.DE)
        },
        length: 3
      },
      /* 12 */ {
				name: "LD (DE),A",
				exec() {
          LD_TO_RR_R(z80, z80.regOffsets16.DE, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 13 */ {
				name: "INC DE",
				exec() {
          INC_RR(z80, z80.regOffsets16.DE)
				},
				length: 1
			 },
      /* 14 */ {
				name: "INC D",
				exec() {
          INC_R(z80, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 15 */ {
				name: "DEC D",
				exec() {
          DEC_R(z80, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 16 */ {
        name: "LD D,\\1H",
        exec() {
          LD_R_NN(z80, z80.regOffsets8.D)
        },
        length: 2
      },
      /* 17 */ {
				name: "RLA",
				exec() {
          let a = z80.reg8[z80.regOffsets8.A]
          let C = (a & 0x80)? true : false
          a = (a << 1) | ((z80.flags.C)? 0x01 : 0x00)
          z80.reg8[z80.regOffsets8.A] = a
          z80.flags.C = C
          z80.flags.H = false
          z80.flags.N = false
				},
				length: 1
			 },
      /* 18 */ {
				name: "JR \\1H",
				exec() {
          const offset = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1)
          let pc = z80.reg16[z80.regOffsets16.PC]
          pc += this.length
          pc += (offset & 0x80)? offset - 0x100 : offset
          z80.reg16[z80.regOffsets16.PC] = pc
          return true
				},
				length: 2
			 },
      /* 19 */ {
				name: "ADD HL,DE",
				exec() {
          ADD_RR_RR(z80, z80.regOffsets16.HL_IX_IY, z80.regOffsets16.DE)
				},
				length: 1
			 },
      /* 1A */ {
				name: "LD A,(DE)",
				exec() {
          LD_R_FROM_RR(z80, z80.regOffsets8.A, z80.regOffsets16.DE)
				},
				length: 1
			 },
      /* 1B */ {
				name: "DEC DE",
				exec() {
          DEC_RR(z80, z80.regOffsets16.DE)
				},
				length: 1
			 },
      /* 1C */ {
				name: "INC E",
				exec() {
          INC_R(z80, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 1D */ {
				name: "DEC E",
				exec() {
          DEC_R(z80, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 1E */ {
        name: "LD E,\\1H",
        exec() {
          LD_R_NN(z80, z80.regOffsets8.E)
        },
        length: 2
      },
      /* 1F */ {
				name: "RRA",
				exec() {
          let a = z80.reg8[z80.regOffsets8.A]
          let C = (a & 0x01)? true : false
          a = (a >> 1) | ((z80.flags.C)? 0x80 : 0x00)
          z80.reg8[z80.regOffsets8.A] = a
          z80.flags.C = C
          z80.flags.H = false
          z80.flags.N = false
				},
				length: 1
			 },
      /* 20 */ {
				name: "JR NZ,\\1H",
				exec() {
          if(!z80.flags.Z) {
            const offset = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1)
            let pc = z80.reg16[z80.regOffsets16.PC]
            pc += this.length
            pc += (offset & 0x80)? offset - 0x100 : offset
            z80.reg16[z80.regOffsets16.PC] = pc
            return true
          }
				},
				length: 2
			 },
      /* 21 */ {
        name: "LD HL,\\2\\1H",
        exec() {
          LD_RR_NNNN(z80, z80.regOffsets16.HL_IX_IY)
        },
        length: 3
      },
      /* 22 */ {
				name: "LD (\\2\\1H),HL",
				exec() {
          LD_TO_NNNN_RR(z80, z80.regOffsets16.HL_IX_IY)
				},
				length: 3
			 },
      /* 23 */ {
				name: "INC HL",
				exec() {
          INC_RR(z80, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 24 */ {
				name: "INC H",
				exec() {
          INC_R(z80, z80.regOffsets8.H_IXH_IYH)
				},
				length: 1
			 },
      /* 25 */ {
				name: "DEC H",
				exec() {
          DEC_R(z80, z80.regOffsets8.H_IXH_IYH)
				},
				length: 1
			 },
      /* 26 */ {
        name: "LD H,\\1H",
        exec() {
          LD_R_NN(z80, z80.regOffsets8.H_IXH_IYH)
        },
        length: 2
      },
      /* 27 */ {
				name: "DAA",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 28 */ {
				name: "JR Z,\\1H",
				exec() {
          if(z80.flags.Z) {
            const offset = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1)
            let pc = z80.reg16[z80.regOffsets16.PC]
            pc += this.length
            pc += (offset & 0x80)? offset - 0x100 : offset
            z80.reg16[z80.regOffsets16.PC] = pc
            return true
          }
				},
				length: 2
			 },
      /* 29 */ {
				name: "ADD HL,HL",
				exec() {
          ADD_RR_RR(z80, z80.regOffsets16.HL_IX_IY, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 2A */ {
        name: "LD HL,(\\2\\1H)",
        exec() {
          LD_RR_FROM_NNNN(z80, z80.regOffsets16.HL_IX_IY)
        },
        length: 3
      },
      /* 2B */ {
				name: "DEC HL",
				exec() {
          DEC_RR(z80, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 2C */ {
				name: "INC L",
				exec() {
          INC_R(z80, z80.regOffsets8.L_IXL_IYL)
				},
				length: 1
			 },
      /* 2D */ {
				name: "DEC L",
				exec() {
          DEC_R(z80, z80.regOffsets8.L_IXL_IYL)
				},
				length: 1
			 },
      /* 2E */ {
        name: "LD L,\\1H",
        exec() {
          LD_R_NN(z80, z80.regOffsets8.L_IXL_IYL)
        },
        length: 2
      },
      /* 2F */ {
				name: "CPL",
				exec() {
          z80.reg8[z80.regOffsets8.A] ^= 0xFF
          z80.flags.N = true
          z80.flags.H = true
          FLAGS_XY_A(z80, z80.reg8[z80.regOffsets8.A])
				},
				length: 1
			 },
      /* 30 */ {
				name: "JR NC,\\1H",
				exec() {
          if(!z80.flags.C) {
            const offset = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1)
            let pc = z80.reg16[z80.regOffsets16.PC]
            pc += this.length
            pc += (offset & 0x80)? offset - 0x100 : offset
            z80.reg16[z80.regOffsets16.PC] = pc
            return true
          }
				},
				length: 2
			 },
      /* 31 */ {
        name: "LD SP,\\2\\1H",
        exec() {
          LD_RR_NNNN(z80, z80.regOffsets16.SP)
        },
        length: 3
      },
      /* 32 */ {
				name: "LD (\\2\\1H),A",
				exec() {
          LD_TO_NNNN_R(z80, z80.regOffsets8.A)
				},
				length: 3
			 },
      /* 33 */ {
				name: "INC SP",
				exec() {
          INC_RR(z80, z80.regOffsets16.SP)
				},
				length: 1
			 },
      /* 34 */ {
				name: "INC (HL)",
				exec() {
          let addr = z80.reg16[z80.regOffsets16.HL_IX_IY]
          addr += ADJUST_ADDRESS(z80)
          const a = z80.mmu.readByte(addr)
          const res = a + 1
          z80.mmu.writeByte(addr, res)
          FLAGS_MMMV0N(z80, a, a, res)
				},
				length: 1
			 },
      /* 35 */ {
				name: "DEC (HL)",
				exec() {
          let addr = z80.reg16[z80.regOffsets16.HL_IX_IY]
          addr += ADJUST_ADDRESS(z80)
          const a = z80.mmu.readByte(addr)
          const res = a - 1
          z80.mmu.writeByte(addr, res)
          FLAGS_MMMV0N(z80, a, a, res)
				},
				length: 1
			 },
      /* 36 */ {
				name: "LD (HL),\\1H",
				exec() {
          let addr = z80.reg16[z80.regOffsets16.HL_IX_IY]
          addr += ADJUST_ADDRESS(z80)
          const n = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1)
          z80.mmu.writeByte(addr, n)
				},
				length: 2
			 },
      /* 37 */ {
				name: "SCF",
				exec() {
          z80.flags.C = true
          z80.flags.H = false
          z80.flags.N = false
				},
				length: 1
			 },
      /* 38 */ {
				name: "JR C,\\1H",
				exec() {
          if(z80.flags.C) {
            const offset = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1)
            let pc = z80.reg16[z80.regOffsets16.PC]
            pc += this.length
            pc += (offset & 0x80)? offset - 0x100 : offset
            z80.reg16[z80.regOffsets16.PC] = pc
            return true
          }
				},
				length: 2
			 },
      /* 39 */ {
				name: "ADD HL,SP",
				exec() {
          ADD_RR_RR(z80, z80.regOffsets16.HL_IX_IY, z80.regOffsets16.SP)
				},
				length: 1
			 },
      /* 3A */ {
				name: "LD A,(\\2\\1H)",
				exec() {
          const nl = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1)
          const nh = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 2)
          const val = z80.mmu.readByte((nh << 8) | nl)
          z80.reg8[z80.regOffsets8.A] = val
				},
				length: 3
			 },
      /* 3B */ {
				name: "DEC SP",
				exec() {
          DEC_RR(z80, z80.regOffsets16.SP)
				},
				length: 1
			 },
      /* 3C */ {
				name: "INC A",
				exec() {
          INC_R(z80, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 3D */ {
				name: "DEC A",
				exec() {
          DEC_R(z80, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 3E */ {
        name: "LD A,\\1H",
        exec() {
          const n1 = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1) 
          z80.reg8[z80.regOffsets8.A] = n1
        },
        length: 2
      },
      /* 3F */ {
				name: "CCF",
				exec() {
          z80.flags.C = !z80.flags.C
          z80.flags.H = !z80.flags.H
          z80.flags.N = false
				},
				length: 1
			 },
      /* 40 */ {
        name: "LD B,B",
        exec() {
          LD_R_R(z80, z80.regOffsets8.B, z80.regOffsets8.B)
        },
        length: 1
      },
      /* 41 */ {
        name: "LD B,C",
        exec() {
          LD_R_R(z80, z80.regOffsets8.B, z80.regOffsets8.C)
        },
        length: 1
      },
      /* 42 */ {
        name: "LD B,D",
        exec() {
          LD_R_R(z80, z80.regOffsets8.B, z80.regOffsets8.D)
        },
        length: 1
      },
      /* 43 */ {
        name: "LD B,E",
        exec() {
          LD_R_R(z80, z80.regOffsets8.B, z80.regOffsets8.E)
        },
        length: 1
      },
      /* 44 */ {
        name: "LD B,H",
        exec() {
          LD_R_R(z80, z80.regOffsets8.B, z80.regOffsets8.H_IXH_IYH)
        },
        length: 1
      },
      /* 45 */ {
        name: "LD B,L",
        exec() {
          LD_R_R(z80, z80.regOffsets8.B, z80.regOffsets8.L_IXL_IYL)
        },
        length: 1
      },
      /* 46 */ {
        name: "LD B,(HL)",
        exec() {
          LD_R_FROM_HL(z80, z80.regOffsets8.B, z80.regOffsets16.HL_IX_IY)
        },
        length: 1
      },
      /* 47 */ {
        name: "LD B,A",
        exec() {
          LD_R_R(z80, z80.regOffsets8.B, z80.regOffsets8.A)
        },
        length: 1
      },
      /* 48 */ {
        name: "LD C,B",
        exec() {
          LD_R_R(z80, z80.regOffsets8.C, z80.regOffsets8.B)
        },
        length: 1
      },
      /* 49 */ {
        name: "LD C,C",
        exec() {
          LD_R_R(z80, z80.regOffsets8.C, z80.regOffsets8.C)
        },
        length: 1
      },
      /* 4A */ {
        name: "LD C,D",
        exec() {
          LD_R_R(z80, z80.regOffsets8.C, z80.regOffsets8.D)
        },
        length: 1
      },
      /* 4B */ {
        name: "LD C,E",
        exec() {
          LD_R_R(z80, z80.regOffsets8.C, z80.regOffsets8.E)
        },
        length: 1
      },
      /* 4C */ {
        name: "LD C,H",
        exec() {
          LD_R_R(z80, z80.regOffsets8.C, z80.regOffsets8.H_IXH_IYH)
        },
        length: 1
      },
      /* 4D */ {
        name: "LD C,L",
        exec() {
          LD_R_R(z80, z80.regOffsets8.C, z80.regOffsets8.L_IXL_IYL)
        },
        length: 1
      },
      /* 4E */ {
				name: "LD C,(HL)",
				exec() {
          LD_R_FROM_HL(z80, z80.regOffsets8.C, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 4F */ {
        name: "LD C,A",
        exec() {
          LD_R_R(z80, z80.regOffsets8.C, z80.regOffsets8.A)
        },
        length: 1
      },
      /* 50 */ {
        name: "LD D,B",
        exec() {
          LD_R_R(z80, z80.regOffsets8.D, z80.regOffsets8.B)
        },
        length: 1
      },
      /* 51 */ {
        name: "LD D,C",
        exec() {
          LD_R_R(z80, z80.regOffsets8.D, z80.regOffsets8.C)
        },
        length: 1
      },
      /* 52 */ {
        name: "LD D,D",
        exec() {
          LD_R_R(z80, z80.regOffsets8.D, z80.regOffsets8.D)
        },
        length: 1
      },
      /* 53 */ {
        name: "LD D,E",
        exec() {
          LD_R_R(z80, z80.regOffsets8.D, z80.regOffsets8.E)
        },
        length: 1
      },
      /* 54 */ {
        name: "LD D,H",
        exec() {
          LD_R_R(z80, z80.regOffsets8.D, z80.regOffsets8.H_IXH_IYH)
        },
        length: 1
      },
      /* 55 */ {
        name: "LD D,L",
        exec() {
          LD_R_R(z80, z80.regOffsets8.D, z80.regOffsets8.L_IXL_IYL)
        },
        length: 1
      },
      /* 56 */ {
				name: "LD D,(HL)",
				exec() {
          LD_R_FROM_HL(z80, z80.regOffsets8.D, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 57 */ {
        name: "LD D,A",
        exec() {
          LD_R_R(z80, z80.regOffsets8.D, z80.regOffsets8.A)
        },
        length: 1
      },
      /* 58 */ {
        name: "LD E,B",
        exec() {
          LD_R_R(z80, z80.regOffsets8.E, z80.regOffsets8.B)
        },
        length: 1
      },
      /* 59 */ {
        name: "LD E,C",
        exec() {
          LD_R_R(z80, z80.regOffsets8.E, z80.regOffsets8.C)
        },
        length: 1
      },
      /* 5A */ {
        name: "LD E,D",
        exec() {
          LD_R_R(z80, z80.regOffsets8.E, z80.regOffsets8.D)
        },
        length: 1
      },
      /* 5B */ {
        name: "LD E,E",
        exec() {
          LD_R_R(z80, z80.regOffsets8.E, z80.regOffsets8.E)
        },
        length: 1
      },
      /* 5C */ {
        name: "LD E,H",
        exec() {
          LD_R_R(z80, z80.regOffsets8.E, z80.regOffsets8.H_IXH_IYH)
        },
        length: 1
      },
      /* 5D */ {
        name: "LD E,L",
        exec() {
          LD_R_R(z80, z80.regOffsets8.E, z80.regOffsets8.L_IXL_IYL)
        },
        length: 1
      },
      /* 5E */ {
				name: "LD E,(HL)",
				exec() {
          LD_R_FROM_HL(z80, z80.regOffsets8.E, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 5F */ {
        name: "LD E,A",
        exec() {
          LD_R_R(z80, z80.regOffsets8.E, z80.regOffsets8.A)
        },
        length: 1
      },
      /* 60 */ {
        name: "LD H,B",
        exec() {
          LD_R_R(z80, z80.regOffsets8.H_IXH_IYH, z80.regOffsets8.B)
        },
        length: 1
      },
      /* 61 */ {
        name: "LD H,C",
        exec() {
          LD_R_R(z80, z80.regOffsets8.H_IXH_IYH, z80.regOffsets8.C)
        },
        length: 1
      },
      /* 62 */ {
        name: "LD H,D",
        exec() {
          LD_R_R(z80, z80.regOffsets8.H_IXH_IYH, z80.regOffsets8.D)
        },
        length: 1
      },
      /* 63 */ {
        name: "LD H,E",
        exec() {
          LD_R_R(z80, z80.regOffsets8.H_IXH_IYH, z80.regOffsets8.E)
        },
        length: 1
      },
      /* 64 */ {
        name: "LD H,H",
        exec() {
          LD_R_R(z80, z80.regOffsets8.H_IXH_IYH, z80.regOffsets8.H_IXH_IYH)
        },
        length: 1
      },
      /* 65 */ {
        name: "LD H,L",
        exec() {
          LD_R_R(z80, z80.regOffsets8.H_IXH_IYH, z80.regOffsets8.L_IXL_IYL)
        },
        length: 1
      },
      /* 66 */ {
				name: "LD H,(HL)",
				exec() {
          LD_R_FROM_HL(z80, z80.regOffsets8.H, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 67 */ {
        name: "LD H,A",
        exec() {
          LD_R_R(z80, z80.regOffsets8.H_IXH_IYH, z80.regOffsets8.A)
        },
        length: 1
      },
      /* 68 */ {
        name: "LD L,B",
        exec() {
          LD_R_R(z80, z80.regOffsets8.L_IXL_IYL, z80.regOffsets8.B)
        },
        length: 1 },
      /* 69 */ {
        name: "LD L,C",
        exec() {
          LD_R_R(z80, z80.regOffsets8.L_IXL_IYL, z80.regOffsets8.C)
        },
        length: 1
      },
      /* 6A */ {
        name: "LD L,D",
        exec() {
          LD_R_R(z80, z80.regOffsets8.L_IXL_IYL, z80.regOffsets8.D)
        },
        length: 1
      },
      /* 6B */ {
        name: "LD L,E",
        exec() {
          LD_R_R(z80, z80.regOffsets8.L_IXL_IYL, z80.regOffsets8.E)
        },
        length: 1
      },
      /* 6C */ {
        name: "LD L,H",
        exec() {
          LD_R_R(z80, z80.regOffsets8.L_IXL_IYL, z80.regOffsets8.H_IXH_IYH)
        },
        length: 1
      },
      /* 6D */ {
        name: "LD L,L",
        exec() {
          LD_R_R(z80, z80.regOffsets8.L_IXL_IYL, z80.regOffsets8.L_IXL_IYL)
        },
        length: 1
      },
      /* 6E */ {
				name: "LD L,(HL)",
				exec() {
          LD_R_FROM_HL(z80, z80.regOffsets8.L, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 6F */ {
        name: "LD L,A",
        exec() {
          LD_R_R(z80, z80.regOffsets8.L_IXL_IYL, z80.regOffsets8.A)
        },
        length: 1
      },
      /* 70 */ {
				name: "LD (HL),B",
				exec() {
          LD_TO_HL_R(z80, z80.regOffsets16.HL_IX_IY, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 71 */ {
				name: "LD (HL),C",
				exec() {
          LD_TO_HL_R(z80, z80.regOffsets16.HL_IX_IY, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 72 */ {
				name: "LD (HL),D",
				exec() {
          LD_TO_HL_R(z80, z80.regOffsets16.HL_IX_IY, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 73 */ {
				name: "LD (HL),E",
				exec() {
          LD_TO_HL_R(z80, z80.regOffsets16.HL_IX_IY, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 74 */ {
				name: "LD (HL),H",
				exec() {
          LD_TO_HL_R(z80, z80.regOffsets16.HL_IX_IY, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* 75 */ {
				name: "LD (HL),L",
				exec() {
          LD_TO_HL_R(z80, z80.regOffsets16.HL_IX_IY, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* 76 */ {
				name: "HALT",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 77 */ {
				name: "LD (HL),A",
				exec() {
          LD_TO_HL_R(z80, z80.regOffsets16.HL_IX_IY, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 78 */ {
        name: "LD A,B",
        exec() {
          LD_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.B)
        },
        length: 1
      },
      /* 79 */ {
        name: "LD A,C",
        exec() {
          LD_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.C)
        },
        length: 1
      },
      /* 7A */ {
        name: "LD A,D",
        exec() {
          LD_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.D)
        },
        length: 1
      },
      /* 7B */ {
        name: "LD A,E",
        exec() {
          LD_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.E)
        },
        length: 1
      },
      /* 7C */ {
        name: "LD A,H",
        exec() {
          LD_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.H_IXH_IYH)
        },
        length: 1
      },
      /* 7D */ {
        name: "LD A,L",
        exec() {
          LD_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.L_IXL_IYL)
        },
        length: 1
      },
      /* 7E */ {
				name: "LD A,(HL)",
				exec() {
          LD_R_FROM_HL(z80, z80.regOffsets8.A, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 7F */ {
        name: "LD A,A",
        exec() {
          LD_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.A)
        },
        length: 1
      },
      /* 80 */ {
        name: "ADD A,B",
        exec() {
          ADD_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.B)
        },
        length: 1,
      },
      /* 81 */ {
        name: "ADD A,C",
        exec() {
          ADD_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.C)
        },
        length: 1 },
      /* 82 */ {
        name: "ADD A,D",
        exec() {
          ADD_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.D)
        },
        length: 1
      },
      /* 83 */ {
        name: "ADD A,E",
        exec() {
          ADD_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.E)
        },
        length: 1
      },
      /* 84 */ {
        name: "ADD A,H",
        exec() {
          ADD_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.H_IXH_IYH)
        },
        length: 1
      },
      /* 85 */ {
        name: "ADD A,L",
        exec() {
          ADD_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.L_IXL_IYL)
        },
        length: 1
      },
      /* 86 */ {
				name: "ADD A,(HL)",
				exec() {
          let addr = z80.reg16[z80.regOffsets16.HL_IX_IY]
          addr += ADJUST_ADDRESS(z80)
          const a = z80.reg8[z80.regOffsets8.A]
          const b = z80.mmu.readByte(addr)
          const res = a + b
          z80.reg8[z80.regOffsets8.A] = res
          FLAGS_MMMV0M(z80, a, b, res)
				},
				length: 1
			 },
      /* 87 */ {
        name: "ADD A,A",
        exec() {
          ADD_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.A)
        },
        length: 1
      },
      /* 88 */ {
        name: "ADC A,B",
        exec() {
          ADC_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.B)
        },
        length: 1
      },
      /* 89 */ {
        name: "ADC A,C",
        exec() {
          ADC_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.C)
        },
        length: 1
      },
      /* 8A */ {
        name: "ADC A,D",
        exec() {
          ADC_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.D)
        },
        length: 1
      },
      /* 8B */ {
        name: "ADC A,E",
        exec() {
          ADC_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.E)
        },
        length: 1
      },
      /* 8C */ {
        name: "ADC A,H",
        exec() {
          ADC_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.H_IXH_IYH)
        },
        length: 1
      },
      /* 8D */ {
        name: "ADC A,L",
        exec() {
          ADC_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.L_IXL_IYL)
        },
        length: 1
      },
      /* 8E */ {
				name: "ADC A,(HL)",
				exec() {
          let addr = z80.reg16[z80.regOffsets16.HL_IX_IY]
          addr += ADJUST_ADDRESS(z80)
          const a = z80.reg8[z80.regOffsets8.A]
          const b = z80.mmu.readByte(addr)
          const res = a + b + ((z80.flags.C)? 0x01 : 0x00)
          z80.reg8[z80.regOffsets8.A] = res
          FLAGS_MMMV0M(z80, a, b, res)
				},
				length: 1
			 },
      /* 8F */ {
        name: "ADC A,A",
        exec() {
          ADC_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.A)
        },
        length: 1
      },
      /* 90 */ {
        name: "SUB A,B",
        exec() {
          SUB_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.B)
        },
        length: 1
      },
      /* 91 */ {
        name: "SUB A,C",
        exec() {
          SUB_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.C)
        },
        length: 1
      },
      /* 92 */ {
        name: "SUB A,D",
        exec() {
          SUB_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.D)
        },
        length: 1
      },
      /* 93 */ {
        name: "SUB A,E",
        exec() {
          SUB_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.E)
        },
        length: 1
      },
      /* 94 */ {
        name: "SUB A,H",
        exec() {
          SUB_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.H_IXH_IYH)
        },
        length: 1
      },
      /* 95 */ {
        name: "SUB A,L",
        exec() {
          SUB_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.L_IXL_IYL)
        },
        length: 1
      },
      /* 96 */ {
				name: "SUB A,(HL)",
				exec() {
          let addr = z80.reg16[z80.regOffsets16.HL_IX_IY]
          addr += ADJUST_ADDRESS(z80)
          const a = z80.reg8[z80.regOffsets8.A]
          const b = z80.mmu.readByte(addr)
          const res = a - b
          z80.reg8[z80.regOffsets8.A] = res
          FLAGS_MMMV1M(z80, a, b, res)
				},
				length: 1
			 },
      /* 97 */ {
        name: "SUB A,A",
        exec() {
          SUB_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.A)
        },
        length: 1
      },
      /* 98 */ {
        name: "SBC A,B",
        exec() {
          SBC_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.B)
        },
        length: 1
      },
      /* 99 */ {
        name: "SBC A,C",
        exec() {
          SBC_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.C)
        },
        length: 1
      },
      /* 9A */ {
        name: "SBC A,D",
        exec() {
          SBC_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.D)
        },
        length: 1
      },
      /* 9B */ {
        name: "SBC A,E",
        exec() {
          SBC_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.E)
        },
        length: 1
      },
      /* 9C */ {
        name: "SBC A,H",
        exec() {
          SBC_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.H_IXH_IYH)
        },
        length: 1
      },
      /* 9D */ {
        name: "SBC A,L",
        exec() {
          SBC_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.L_IXL_IYL)
        },
        length: 1
      },
      /* 9E */ {
				name: "SBC A,(HL)",
				exec() {
          let addr = z80.reg16[z80.regOffsets16.HL_IX_IY]
          addr += ADJUST_ADDRESS(z80)
          const a = z80.reg8[z80.regOffsets8.A]
          const b = z80.mmu.readByte(addr)
          const res = a - b - (z80.flags.C)? 0x01 : 0x00
          z80.reg8[z80.regOffsets8.A] = res
          FLAGS_MMMV1M(z80, a, b, res)
				},
				length: 1
			 },
      /* 9F */ {
        name: "SBC A,A",
        exec() {
          SBC_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.A)
        },
        length: 1
      },
      /* A0 */ {
        name: "AND B",
        exec() {
          AND_R(z80, z80.regOffsets8.B)
        },
        length: 1
      },
      /* A1 */ {
        name: "AND C",
        exec() {
          AND_R(z80, z80.regOffsets8.C)
        },
        length: 1
      },
      /* A2 */ {
        name: "AND D",
        exec() {
          AND_R(z80, z80.regOffsets8.D)
        },
        length: 1
      },
      /* A3 */ {
        name: "AND E",
        exec() {
          AND_R(z80, z80.regOffsets8.E)
        },
        length: 1
      },
      /* A4 */ {
        name: "AND H",
        exec() {
          AND_R(z80, z80.regOffsets8.H_IXH_IYH)
        },
        length: 1
      },
      /* A5 */ {
        name: "AND L",
        exec() {
          AND_R(z80, z80.regOffsets8.L_IXL_IYL)
        },
        length: 1
      },
      /* A6 */ {
				name: "AND (HL)",
				exec() {
          const a = z80.reg8[z80.regOffsets8.A]
          let addr = z80.reg16[z80.regOffsets16.HL_IX_IY]
          addr += ADJUST_ADDRESS(z80)
          const b = z80.mmu.readByte(addr)
          const res = a & b
          z80.reg8[z80.regOffsets8.A] = res
          FLAGS_MMMP00(z80, a, b, res)
				},
				length: 1
			 },
      /* A7 */ {
        name: "AND A",
        exec() {
          AND_R(z80, z80.regOffsets8.A)
        },
        length: 1
      },
      /* A8 */ {
        name: "XOR B",
        exec() {
          XOR_R(z80, z80.regOffsets8.B)
        },
        length: 1
      },
      /* A9 */ {
        name: "XOR C",
        exec() {
          XOR_R(z80, z80.regOffsets8.C)
        },
        length: 1
      },
      /* AA */ {
        name: "XOR D",
        exec() {
          XOR_R(z80, z80.regOffsets8.D)
        },
        length: 1
      },
      /* AB */ {
        name: "XOR E",
        exec() {
          XOR_R(z80, z80.regOffsets8.E)
        },
        length: 1
      },
      /* AC */ {
        name: "XOR H",
        exec() {
          XOR_R(z80, z80.regOffsets8.H_IXH_IYH)
        },
        length: 1
      },
      /* AD */ {
				name: "XOR L",
				exec() {
          XOR_R(z80, z80.regOffsets8.L_IXL_IYL)
				},
				length: 1
			 },
      /* AE */ {
				name: "XOR (HL)",
				exec() {
          let addr = z80.reg16[z80.regOffsets16.HL_IX_IY]
          addr += ADJUST_ADDRESS(z80)
          const a = z80.reg8[z80.regOffsets8.A]
          const b = z80.mmu.readByte(addr)
          const res = a ^ b
          z80.reg8[z80.regOffsets8.A] = res
          FLAGS_MMMP00(z80, a, b, res)
				},
				length: 1
			 },
      /* AF */ {
				name: "XOR A",
				exec() {
          XOR_R(z80, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* B0 */ {
				name: "OR B",
				exec() {
          OR_R(z80, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* B1 */ {
				name: "OR C",
				exec() {
          OR_R(z80, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* B2 */ {
				name: "OR D",
				exec() {
          OR_R(z80, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* B3 */ {
				name: "OR E",
				exec() {
          OR_R(z80, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* B4 */ {
				name: "OR H",
				exec() {
          OR_R(z80, z80.regOffsets8.H_IXH_IYH)
				},
				length: 1
			 },
      /* B5 */ {
				name: "OR L",
				exec() {
          OR_R(z80, z80.regOffsets8.L_IXL_IYL)
				},
				length: 1
			 },
      /* B6 */ {
				name: "OR (HL)",
				exec() {
          let addr = z80.reg16[z80.regOffsets16.HL_IX_IY]
          addr += ADJUST_ADDRESS(z80)
          const a = z80.reg8[z80.regOffsets8.A]
          const b = z80.mmu.readByte(addr)
          const res = a | b
          z80.reg8[z80.regOffsets8.A] = res
          FLAGS_MMMP00(z80, a, b, res)
				},
				length: 1
			 },
      /* B7 */ {
				name: "OR A",
				exec() {
          OR_R(z80, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* B8 */ {
				name: "CP B",
				exec() {
          CP_R(z80, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* B9 */ {
				name: "CP C",
				exec() {
          CP_R(z80, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* BA */ {
				name: "CP D",
				exec() {
          CP_R(z80, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* BB */ {
				name: "CP E",
				exec() {
          CP_R(z80, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* BC */ {
				name: "CP H",
				exec() {
          CP_R(z80, z80.regOffsets8.H_IXH_IYH)
				},
				length: 1
			 },
      /* BD */ {
				name: "CP L",
				exec() {
          CP_R(z80, z80.regOffsets8.L_IXL_IYL)
				},
				length: 1
			 },
      /* BE */ {
				name: "CP (HL)",
				exec() {
          let addr = z80.reg16[z80.regOffsets16.HL_IX_IY]
          addr += ADJUST_ADDRESS(z80)
          const a = z80.reg8[z80.regOffsets8.A]
          const b = z80.mmu.readByte(addr)
          z80.reg8[z80.regOffsets8.A] = b
          FLAGS_MMMV1M(z80, a, b, b)
				},
				length: 1
			 },
      /* BF */ {
				name: "CP A",
				exec() {
          CP_R(z80, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* C0 */ {
				name: "RET NZ",
				exec() {
          RET_CC(z80, !z80.flags.Z)
				},
				length: 1
			 },
      /* C1 */ {
				name: "POP BC",
				exec() {
          POP_RR(z80, z80.regOffsets16.BC)
				},
				length: 1
			 },
      /* C2 */ {
				name: "JP NZ,\\2\\1H",
				exec() {
          return JP_CC_NNNN(z80, !z80.flags.Z, this.length)
				},
				length: 3
			 },
      /* C3 */ {
        name: "JP \\2\\1H",
        exec() {
          const addr = z80.mmu.readWord(z80.reg16[z80.regOffsets16.PC] + 1)
          z80.reg16[z80.regOffsets16.PC] = addr
          return true
        },
        length: 3
      },
      /* C4 */ {
				name: "CALL NZ,\\2\\1H",
				exec() {
          return CALL_CC(z80, !z80.flags.Z, this.length)
				},
				length: 3
			 },
      /* C5 */ {
				name: "PUSH BC",
				exec() {
          PUSH_RR(z80, z80.regOffsets16.BC)
				},
				length: 1
			 },
      /* C6 */ {
				name: "ADD A,\\1H",
				exec() {
          const a = z80.reg8[z80.regOffsets8.A]
          const b = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1)
          const res = a + b
          z80.reg8[z80.regOffsets8.A] = res
          FLAGS_MMMV0M(z80, a, b, res)
				},
				length: 2
			 },
      /* C7 */ {
				name: "RST 00H",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* C8 */ {
				name: "RET Z",
				exec() {
          RET_CC(z80, z80.flags.Z)
				},
				length: 1
			 },
      /* C9 */ {
				name: "RET",
				exec() {
          return RET(z80)
				},
				length: 1
			 },
      /* CA */ {
				name: "JP Z,\\2\\1H",
				exec() {
          return JP_CC_NNNN(z80, z80.flags.Z, this.length)
				},
				length: 3
			 },
      /* CB */ {
				name: "**** CB ****",
				exec() {
          // Read the instruction from the cb table and call that.
          const opcode = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1)
          z80.reg16[z80.regOffsets16.PC] += 1
          if(z80.cb_instructions[opcode] && z80.cb_instructions[opcode].unimplemented) {
            console.log(`Error: unimplemented opcode: 0xCB${opcode.toString(16)}`)
          }
          if(z80.cb_instructions[opcode] && !z80.cb_instructions[opcode].exec()) {
            z80.reg16[z80.regOffsets16.PC] += z80.cb_instructions[opcode].length
            return true
          }
				},
				length: 0
			 },
      /* CC */ {
				name: "CALL Z,\\2\\1H",
				exec() {
          return CALL_CC(z80, z80.flags.Z, this.length)
				},
				length: 3
			 },
      /* CD */ {
				name: "CALL \\2\\1H",
				exec() {
          return CALL(z80, this.length)
				},
				length: 3
			 },
      /* CE */ {
				name: "ADC A,\\1H",
				exec() {
          const a = z80.reg8[z80.regOffsets8.A]
          const b = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1)
          const res = a + b + ((z80.flags.C)? 0x01 : 0x00)
          z80.reg8[z80.regOffsets8.A] = res
          FLAGS_MMMV0M(z80, a, b, res)
				},
				length: 2
			 },
      /* CF */ {
				name: "RST 08H",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* D0 */ {
				name: "RET NC",
				exec() {
          return RET_CC(z80, !z80.flags.C)
				},
				length: 1
			 },
      /* D1 */ {
				name: "POP DE",
				exec() {
          POP_RR(z80, z80.regOffsets16.DE)
				},
				length: 1
			 },
      /* D2 */ {
        name: "JP NC,\\2\\1H",
        exec() {
          return JP_CC_NNNN(z80, !z80.flags.C, this.length)
        },
        length: 3
      },
      /* D3 */ {
				name: "OUT (\\1H),A",
				exec() {
				},
				unimplemented: true,
				length: 2
			 },
      /* D4 */ {
				name: "CALL NC,\\2\\1H",
				exec() {
          return CALL_CC(z80, !z80.flags.C, this.length)
				},
				length: 3
			 },
      /* D5 */ {
				name: "PUSH DE",
				exec() {
          PUSH_RR(z80, z80.regOffsets16.DE)
				},
				length: 1
			 },
      /* D6 */ {
				name: "SUB A,\\1H",
				exec() {
          const a = z80.reg8[z80.regOffsets8.A]
          const b = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1)
          const res = a - b
          z80.reg8[z80.regOffsets8.A] = res
          FLAGS_MMMV1M(z80, a, b, res)
				},
				length: 2
			 },
      /* D7 */ {
				name: "RST 10H",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* D8 */ {
				name: "RET C",
				exec() {
          return RET_CC(z80, z80.flags.C)
				},
				length: 1
			 },
      /* D9 */ {
				name: "EXX",
				exec() {
          let t = z80.reg16[z80.regOffsets16.BC]
          z80.reg16[z80.regOffsets16.BC] = z80.reg16[z80.regOffsets16.BC_]
          z80.reg16[z80.regOffsets16.BC_] = t
          t = z80.reg16[z80.regOffsets16.DE]
          z80.reg16[z80.regOffsets16.DE] = z80.reg16[z80.regOffsets16.DE_]
          z80.reg16[z80.regOffsets16.DE_] = t
          t = z80.reg16[z80.regOffsets16.HL]
          z80.reg16[z80.regOffsets16.HL] = z80.reg16[z80.regOffsets16.HL_]
          z80.reg16[z80.regOffsets16.HL_] = t
				},
				length: 1
			 },
      /* DA */ {
        name: "JP C,\\2\\1H",
        exec() {
          return JP_CC_NNNN(z80, z80.flags.C, this.length)
        },
        length: 3
      },
      /* DB */ {
				name: "IN A,(\\1H)",
				exec() {
				},
				unimplemented: true,
				length: 2
			 },
      /* DC */ {
				name: "CALL C,\\2\\1H",
				exec() {
          return CALL_CC(z80, z80.flags.C, this.length)
				},
				length: 3
			 },
      /* DD */ {
				name: "**** DD ****",
				exec() {
          // Toggle the indexes to make instructions read from 
          // IX instead of HL where appropriate.
          z80.regOffsets16.HL_IX_IY = z80.regOffsets16.IX
          z80.regOffsets8.H_IXH_IYH = z80.regOffsets8.IXh
          z80.regOffsets8.L_IXL_IYL = z80.regOffsets8.IXl
				},
				length: 1
			 },
      /* DE */ {
				name: "SBC A,\\1H",
				exec() {
          const a = z80.reg8[z80.regOffsets8.A]
          const b = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1)
          const res = a - b - (z80.flags.C)? 0x01 : 0x00
          z80.reg8[z80.regOffsets8.A] = res
          FLAGS_MMMV1M(z80, a, b, res)
				},
				length: 2
			 },
      /* DF */ {
				name: "RST 18H",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* E0 */ {
				name: "RET PO",
				exec() {
          return RET_CC(z80, !z80.flags.P)
				},
				length: 1
			 },
      /* E1 */ {
				name: "POP HL",
				exec() {
          POP_RR(z80, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* E2 */ {
				name: "JP PO,\\2\\1H",
				exec() {
          return JP_CC_NNNN(z80, !z80.flags.P, this.length)
				},
				length: 3
			 },
      /* E3 */ {
				name: "EX (SP),HL",
				exec() {
          const val = z80.reg16[z80.regOffsets16.HL_IX_IY]
          const addr = z80.reg16[z80.regOffsets16.SP]
          z80.mmu.writeByte(addr, val & 0xFF)
          z80.mmu.writeByte(addr + 1, val >> 8)
				},
				length: 1
			 },
      /* E4 */ {
				name: "CALL PO,\\2\\1H",
				exec() {
          CALL_CC(z80, !z80.flags.P, this.length)
				},
				length: 3
			 },
      /* E5 */ {
				name: "PUSH HL",
				exec() {
          PUSH_RR(z80, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* E6 */ {
				name: "AND \\1H",
				exec() {
          const a = z80.reg8[z80.regOffsets8.A]
          const b = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1)
          const res = a & b
          z80.reg8[z80.regOffsets8.A] = res
          FLAGS_MMMP00(z80, a, b, res)
				},
				length: 2
			 },
      /* E7 */ {
				name: "RST 20H",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* E8 */ {
				name: "RET PE",
				exec() {
          return RET_CC(z80, z80.flags.P)
				},
				length: 1
			 },
      /* E9 */ {
				name: "JP (HL)",
				exec() {
          const addr = z80.mmu.readWord(z80.reg16[z80.regOffsets16.HL_IX_IY])
          z80.reg16[z80.regOffsets16.PC] = addr
          return true
				},
				length: 1
			 },
      /* EA */ {
				name: "JP PE,\\2\\1H",
				exec() {
          return JP_CC_NNNN(z80, z80.flags.P, this.length)
				},
				length: 3
			 },
      /* EB */ {
				name: "EX DE,HL",
				exec() {
          const de = z80.reg16[z80.regOffsets16.DE]
          z80.reg16[z80.regOffsets16.DE] = z80.reg16[z80.regOffsets16.HL]
          z80.reg16[z80.regOffsets16.HL] = de
				},
				length: 1
			 },
      /* EC */ {
				name: "CALL PE,\\2\\1H",
				exec() {
          return CALL_CC(z80, z80.flags.P, this.length)
				},
				length: 3
			 },
      /* ED */ {
				name: "**** ED ****",
				exec() {
          // Read the instruction from the ed table and call that.
          const opcode = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1)
          z80.reg16[z80.regOffsets16.PC] += 1
          if(z80.ed_instructions[opcode] && z80.ed_instructions[opcode].unimplemented) {
            console.log(`Error: unimplemented opcode: 0xED${opcode.toString(16)}`)
          }
          if(z80.ed_instructions[opcode] && !z80.ed_instructions[opcode].exec()) {
            z80.reg16[z80.regOffsets16.PC] += z80.ed_instructions[opcode].length
            return true
          }
				},
				length: 1
			 },
      /* EE */ {
				name: "XOR \\1H",
				exec() {
          const a = z80.reg8[z80.regOffsets8.A]
          const b = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC])
          const res = a ^ b
          z80.reg8[z80.regOffsets8.A] = res
          FLAGS_MMMP00(z80, a, b, res)
				},
				length: 2
			 },
      /* EF */ {
				name: "RST 28H",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* F0 */ {
				name: "RET P",
				exec() {
          return RET_CC(z80, !z80.flags.S)
				},
				length: 1
			 },
      /* F1 */ {
				name: "POP AF",
				exec() {
          POP_RR(z80, z80.regOffsets16.AF)
          // TOOD: Need to read the "F" register out into the flags.
				},
				length: 1
			 },
      /* F2 */ {
				name: "JP P,\\2\\1H",
				exec() {
          return JP_CC_NNNN(z80, !z80.flags.S, this.length)
				},
				length: 3
			 },
      /* F3 */ {
				name: "DI",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* F4 */ {
				name: "CALL P,\\2\\1H",
				exec() {
          return CALL_CC(z80, !z80.flags.S, this.length)
				},
				length: 3
			 },
      /* F5 */ {
				name: "PUSH AF",
				exec() {
          // TODO: Need to read the flags into the "F" register
          PUSH_RR(z80, z80.regOffsets16.AF)
				},
				length: 1
			 },
      /* F6 */ {
				name: "OR \\1H",
				exec() {
          const a = z80.reg8[z80.regOffsets8.A]
          const b = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1)
          const res = a | b
          z80.reg8[z80.regOffsets8.A] = res
          FLAGS_MMMP00(z80, a, b, res)
				},
				length: 2
			 },
      /* F7 */ {
				name: "RST 30H",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* F8 */ {
				name: "RET M",
				exec() {
          return RET_CC(z80, z80.flags.S)
				},
				length: 1
			 },
      /* F9 */ {
        name: "LD SP,HL",
        exec() {
          LD_RR_RR(z80, z80.regOffsets16.SP, z80.regOffsets16.HL)
        },
        length: 1
      },
      /* FA */ {
				name: "JP M,\\2\\1H",
				exec() {
          return JP_CC_NNNN(z80, z80.flags.S, this.length)
				},
				length: 3
			 },
      /* FB */ {
				name: "EI",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* FC */ {
				name: "CALL M,\\2\\1H",
				exec() {
          return CALL_CC(z80, z80.flags.S, this.length)
				},
				length: 3
			 },
      /* FD */ {
				name: "**** FD ****",
				exec() {
          // Toggle the indexes to make instructions read from 
          // IY instead of HL where appropriate.
          z80.regOffsets16.HL_IX_IY = z80.regOffsets16.IY
          z80.regOffsets8.H_IXH_IYH = z80.regOffsets8.IYh
          z80.regOffsets8.L_IXL_IYL = z80.regOffsets8.IYl
				},
				length: 1
			 },
      /* FE */ {
				name: "CP \\1H",
				exec() {
          const a = z80.reg8[z80.regOffsets8.A]
          const b = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1)
          const res = a - b
          FLAGS_MMMV1M(z80, a, b, res)
				},
				length: 2
			 },
      /* FF */ {
				name: "RST 38H",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
    ]

    this.cb_instructions = [
      /* 00 */ {
				name: "RLC B",
				exec() {
          RLC_R(z80, z80.regOffsets.B)
				},
				length: 1
			 },
      /* 01 */ {
				name: "RLC C",
				exec() {
          RLC_R(z80, z80.regOffsets.C)
				},
				length: 1
			 },
      /* 02 */ {
				name: "RLC D",
				exec() {
          RLC_R(z80, z80.regOffsets.D)
				},
				length: 1
			 },
      /* 03 */ {
				name: "RLC E",
				exec() {
          RLC_R(z80, z80.regOffsets.E)
				},
				length: 1
			 },
      /* 04 */ {
				name: "RLC H",
				exec() {
          RLC_R(z80, z80.regOffsets.H)
				},
				length: 1
			 },
      /* 05 */ {
				name: "RLC L",
				exec() {
          RLC_R(z80, z80.regOffsets.L)
				},
				length: 1
			 },
      /* 06 */ {
				name: "RLC (HL)",
				exec() {
          let addr = z80.reg16[z80.regOffsets16.HL_IX_IY]
          addr += ADJUST_ADDRESS(z80)
          const a = z80.mmu.readByte(addr)
          const c = (a & 0x80) >> 7
          const res = (a << 1) | c
          z80.mmu.writeByte(addr, res)
          // TODO: Not sure about the second operand
          FLAGS_MM0P0M(z80, a, a, res)
          z80.flags.C = c? true : false
				},
				length: 1
			 },
      /* 07 */ {
				name: "RLC A",
				exec() {
          RLC_R(z80, z80.regOffsets.A)
				},
				length: 1
			 },
      /* 08 */ {
				name: "RRC B",
				exec() {
          RRC_R(z80, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 09 */ {
				name: "RRC C",
				exec() {
          RRC_R(z80, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 0A */ {
				name: "RRC D",
				exec() {
          RRC_R(z80, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 0B */ {
				name: "RRC E",
				exec() {
          RRC_R(z80, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 0C */ {
				name: "RRC H",
				exec() {
          RRC_R(z80, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* 0D */ {
				name: "RRC L",
				exec() {
          RRC_R(z80, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* 0E */ {
				name: "RRC (HL)",
				exec() {
          let addr = z80.reg16[z80.regOffsets16.HL_IX_IY]
          addr += ADJUST_ADDRESS(z80)
          const a = z80.mmu.readByte(addr)
          const c = (a & 0x01) << 8
          const res = (a >> 1) | c
          z80.mmu.writeByte(addr, res)
          // TODO: Not sure about the second operand
          FLAGS_MM0P0M(z80, a, a, res)
          z80.flags.C = c? true : false
				},
				length: 1
			 },
      /* 0F */ {
				name: "RRC A",
				exec() {
          RRC_R(z80, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 10 */ {
				name: "RL B",
				exec() {
          RL_R(z80, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 11 */ {
				name: "RL C",
				exec() {
          RL_R(z80, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 12 */ {
				name: "RL D",
				exec() {
          RL_R(z80, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 13 */ {
				name: "RL E",
				exec() {
          RL_R(z80, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 14 */ {
				name: "RL H",
				exec() {
          RL_R(z80, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* 15 */ {
				name: "RL L",
				exec() {
          RL_R(z80, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* 16 */ {
				name: "RL (HL)",
				exec() {
          let addr = z80.reg16[z80.regOffsets16.HL_IX_IY]
          addr += ADJUST_ADDRESS(z80)
          const a = z80.mmu.readByte(addr)
          const c = (z80.flags.C)? 0x01 : 0x00
          const s = a & 0x80
          const res = (a << 1) | c
          z80.mmu.writeByte(addr, res)
          // TODO: Not sure about the second operand
          FLAGS_MM0P0M(z80, a, a, res)
          z80.flags.C = s? true : false
				},
				length: 1
			 },
      /* 17 */ {
				name: "RL A",
				exec() {
          RL_R(z80, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 18 */ {
				name: "RR B",
				exec() {
          RR_R(z80, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 19 */ {
				name: "RR C",
				exec() {
          RR_R(z80, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 1A */ {
				name: "RR D",
				exec() {
          RR_R(z80, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 1B */ {
				name: "RR E",
				exec() {
          RR_R(z80, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 1C */ {
				name: "RR H",
				exec() {
          RR_R(z80, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* 1D */ {
				name: "RR L",
				exec() {
          RR_R(z80, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* 1E */ {
				name: "RR (HL)",
				exec() {
          let addr = z80.reg16[z80.regOffsets16.HL_IX_IY]
          addr += ADJUST_ADDRESS(z80)
          const a = z80.mmu.readByte(addr)
          const c = (z80.flags.C)? 0x80 : 0x00
          const s = a & 0x01
          const res = (a >> 1) | c
          z80.mmu.writeByte(addr, res)
          // TODO: Not sure about the second operand
          FLAGS_MM0P0M(z80, a, a, res)
          z80.flags.C = s? true : false
				},
				length: 1
			 },
      /* 1F */ {
				name: "RR A",
				exec() {
          RR_R(z80, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 20 */ {
				name: "SLA B",
				exec() {
          SLA_R(z80, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 21 */ {
				name: "SLA C",
				exec() {
          SLA_R(z80, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 22 */ {
				name: "SLA D",
				exec() {
          SLA_R(z80, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 23 */ {
				name: "SLA E",
				exec() {
          SLA_R(z80, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 24 */ {
				name: "SLA H",
				exec() {
          SLA_R(z80, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* 25 */ {
				name: "SLA L",
				exec() {
          SLA_R(z80, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* 26 */ {
				name: "SLA (HL)",
				exec() {
          let addr = z80.reg16[z80.regOffsets16.HL_IX_IY]
          addr += ADJUST_ADDRESS(z80)
          const a = z80.mmu.readByte(addr)
          const s = a & 0x80
          const res = (a << 1)
          z80.mmu.writeByte(addr, res)
          // TODO: Not sure about the second operand
          FLAGS_MM0P0M(z80, a, a, res)
          z80.flags.C = s? true : false
				},
				length: 1
			 },
      /* 27 */ {
				name: "SLA A",
				exec() {
          SLA_R(z80, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 28 */ {
				name: "SRA B",
				exec() {
          SRA_R(z80, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 29 */ {
				name: "SRA C",
				exec() {
          SRA_R(z80, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 2A */ {
				name: "SRA D",
				exec() {
          SRA_R(z80, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 2B */ {
				name: "SRA E",
				exec() {
          SRA_R(z80, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 2C */ {
				name: "SRA H",
				exec() {
          SRA_R(z80, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* 2D */ {
				name: "SRA L",
				exec() {
          SRA_R(z80, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* 2E */ {
				name: "SRA (HL)",
				exec() {
          let addr = z80.reg16[z80.regOffsets16.HL_IX_IY]
          addr += ADJUST_ADDRESS(z80)
          const a = z80.mmu.readByte(addr)
          const c = a & 0x01
          const s = a & 0x80
          const res = (a >> 1) | s
          z80.mmu.writeByte(addr, res)
          // TODO: Not sure about the second operand
          FLAGS_MM0P0M(z80, a, a, res)
          z80.flags.C = c? true : false
				},
				length: 1
			 },
      /* 2F */ {
				name: "SRA A",
				exec() {
          SRA_R(z80, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 30 */ {
				name: "SLL B",
				exec() {
          SLL_R(z80, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 31 */ {
				name: "SLL C",
				exec() {
          SLL_R(z80, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 32 */ {
				name: "SLL D",
				exec() {
          SLL_R(z80, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 33 */ {
				name: "SLL E",
				exec() {
          SLL_R(z80, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 34 */ {
				name: "SLL H",
				exec() {
          SLL_R(z80, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* 35 */ {
				name: "SLL L",
				exec() {
          SLL_R(z80, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* 36 */ {
				name: "SLL (HL)",
				exec() {
          let addr = z80.reg16[z80.regOffsets16.HL_IX_IY]
          addr += ADJUST_ADDRESS(z80)
          const a = z80.mmu.readByte(addr)
          const s = a & 0x80
          const res = (a << 1) | 0x01
          z80.mmu.writeByte(addr, res)
          // TODO: Not sure about the second operand
          FLAGS_MM0P0M(z80, a, a, res)
          z80.flags.C = s? true : false
				},
				length: 1
			 },
      /* 37 */ {
				name: "SLL A",
				exec() {
          SLL_R(z80, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 38 */ {
				name: "SRL B",
				exec() {
          SRL_R(z80, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 39 */ {
				name: "SRL C",
				exec() {
          SRL_R(z80, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 3A */ {
				name: "SRL D",
				exec() {
          SRL_R(z80, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 3B */ {
				name: "SRL E",
				exec() {
          SRL_R(z80, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 3C */ {
				name: "SRL H",
				exec() {
          SRL_R(z80, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* 3D */ {
				name: "SRL L",
				exec() {
          SRL_R(z80, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* 3E */ {
				name: "SRL (HL)",
				exec() {
          let addr = z80.reg16[z80.regOffsets16.HL_IX_IY]
          addr += ADJUST_ADDRESS(z80)
          const a = z80.mmu.readByte(addr)
          const c = a & 0x01
          const res = (a >> 1)
          z80.mmu.writeByte(addr, res)
          // TODO: Not sure about the second operand
          FLAGS_MM0P0M(z80, a, a, res)
          z80.flags.C = c? true : false
				},
				length: 1
			 },
      /* 3F */ {
				name: "SRL A",
				exec() {
          SRL_R(z80, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 40 */ {
				name: "BIT 0,B",
				exec() {
          BIT_B_R(z80, 0, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 41 */ {
				name: "BIT 0,C",
				exec() {
          BIT_B_R(z80, 0, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 42 */ {
				name: "BIT 0,D",
				exec() {
          BIT_B_R(z80, 0, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 43 */ {
				name: "BIT 0,E",
				exec() {
          BIT_B_R(z80, 0, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 44 */ {
				name: "BIT 0,H",
				exec() {
          BIT_B_R(z80, 0, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* 45 */ {
				name: "BIT 0,L",
				exec() {
          BIT_B_R(z80, 0, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* 46 */ {
				name: "BIT 0,(HL)",
				exec() {
          BIT_B_AT_RR(z80, 0, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 47 */ {
				name: "BIT 0,A",
				exec() {
          BIT_B_R(z80, 0, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 48 */ {
				name: "BIT 1,B",
				exec() {
          BIT_B_R(z80, 1, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 49 */ {
				name: "BIT 1,C",
				exec() {
          BIT_B_R(z80, 1, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 4A */ {
				name: "BIT 1,D",
				exec() {
          BIT_B_R(z80, 1, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 4B */ {
				name: "BIT 1,E",
				exec() {
          BIT_B_R(z80, 1, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 4C */ {
				name: "BIT 1,H",
				exec() {
          BIT_B_R(z80, 1, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* 4D */ {
				name: "BIT 1,L",
				exec() {
          BIT_B_R(z80, 1, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* 4E */ {
				name: "BIT 1,(HL)",
				exec() {
          BIT_B_AT_RR(z80, 1, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 4F */ {
				name: "BIT 1,A",
				exec() {
          BIT_B_R(z80, 1, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 50 */ {
				name: "BIT 2,B",
				exec() {
          BIT_B_R(z80, 2, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 51 */ {
				name: "BIT 2,C",
				exec() {
          BIT_B_R(z80, 2, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 52 */ {
				name: "BIT 2,D",
				exec() {
          BIT_B_R(z80, 2, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 53 */ {
				name: "BIT 2,E",
				exec() {
          BIT_B_R(z80, 2, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 54 */ {
				name: "BIT 2,H",
				exec() {
          BIT_B_R(z80, 2, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* 55 */ {
				name: "BIT 2,L",
				exec() {
          BIT_B_R(z80, 2, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* 56 */ {
				name: "BIT 2,(HL)",
				exec() {
          BIT_B_AT_RR(z80, 2, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 57 */ {
				name: "BIT 2,A",
				exec() {
          BIT_B_R(z80, 2, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 58 */ {
				name: "BIT 3,B",
				exec() {
          BIT_B_R(z80, 3, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 59 */ {
				name: "BIT 3,C",
				exec() {
          BIT_B_R(z80, 3, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 5A */ {
				name: "BIT 3,D",
				exec() {
          BIT_B_R(z80, 3, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 5B */ {
				name: "BIT 3,E",
				exec() {
          BIT_B_R(z80, 3, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 5C */ {
				name: "BIT 3,H",
				exec() {
          BIT_B_R(z80, 3, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* 5D */ {
				name: "BIT 3,L",
				exec() {
          BIT_B_R(z80, 3, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* 5E */ {
				name: "BIT 3,(HL)",
				exec() {
          BIT_B_AT_RR(z80, 3, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 5F */ {
				name: "BIT 3,A",
				exec() {
          BIT_B_R(z80, 3, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 60 */ {
				name: "BIT 4,B",
				exec() {
          BIT_B_R(z80, 4, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 61 */ {
				name: "BIT 4,C",
				exec() {
          BIT_B_R(z80, 4, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 62 */ {
				name: "BIT 4,D",
				exec() {
          BIT_B_R(z80, 4, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 63 */ {
				name: "BIT 4,E",
				exec() {
          BIT_B_R(z80, 4, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 64 */ {
				name: "BIT 4,H",
				exec() {
          BIT_B_R(z80, 4, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* 65 */ {
				name: "BIT 4,L",
				exec() {
          BIT_B_R(z80, 4, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* 66 */ {
				name: "BIT 4,(HL)",
				exec() {
          BIT_B_AT_RR(z80, 4, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 67 */ {
				name: "BIT 4,A",
				exec() {
          BIT_B_R(z80, 4, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 68 */ {
				name: "BIT 5,B",
				exec() {
          BIT_B_R(z80, 5, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 69 */ {
				name: "BIT 5,C",
				exec() {
          BIT_B_R(z80, 5, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 6A */ {
				name: "BIT 5,D",
				exec() {
          BIT_B_R(z80, 5, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 6B */ {
				name: "BIT 5,E",
				exec() {
          BIT_B_R(z80, 5, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 6C */ {
				name: "BIT 5,H",
				exec() {
          BIT_B_R(z80, 5, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* 6D */ {
				name: "BIT 5,L",
				exec() {
          BIT_B_R(z80, 5, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* 6E */ {
				name: "BIT 5,(HL)",
				exec() {
          BIT_B_AT_RR(z80, 5, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 6F */ {
				name: "BIT 5,A",
				exec() {
          BIT_B_R(z80, 5, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 70 */ {
				name: "BIT 6,B",
				exec() {
          BIT_B_R(z80, 6, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 71 */ {
				name: "BIT 6,C",
				exec() {
          BIT_B_R(z80, 6, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 72 */ {
				name: "BIT 6,D",
				exec() {
          BIT_B_R(z80, 6, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 73 */ {
				name: "BIT 6,E",
				exec() {
          BIT_B_R(z80, 6, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 74 */ {
				name: "BIT 6,H",
				exec() {
          BIT_B_R(z80, 6, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* 75 */ {
				name: "BIT 6,L",
				exec() {
          BIT_B_R(z80, 6, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* 76 */ {
				name: "BIT 6,(HL)",
				exec() {
          BIT_B_AT_RR(z80, 6, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 77 */ {
				name: "BIT 6,A",
				exec() {
          BIT_B_R(z80, 6, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 78 */ {
				name: "BIT 7,B",
				exec() {
          BIT_B_R(z80, 7, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 79 */ {
				name: "BIT 7,C",
				exec() {
          BIT_B_R(z80, 7, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 7A */ {
				name: "BIT 7,D",
				exec() {
          BIT_B_R(z80, 7, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 7B */ {
				name: "BIT 7,E",
				exec() {
          BIT_B_R(z80, 7, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 7C */ {
				name: "BIT 7,H",
				exec() {
          BIT_B_R(z80, 7, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* 7D */ {
				name: "BIT 7,L",
				exec() {
          BIT_B_R(z80, 7, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* 7E */ {
				name: "BIT 7,(HL)",
				exec() {
          BIT_B_AT_RR(z80, 7, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 7F */ {
				name: "BIT 7,A",
				exec() {
          BIT_B_R(z80, 7, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 80 */ {
				name: "RES 0,B",
				exec() {
          RES_B_R(z80, 0, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 81 */ {
				name: "RES 0,C",
				exec() {
          RES_B_R(z80, 0, z80.regOffsets8.C)
				},
				length: 2
			 },
      /* 82 */ {
				name: "RES 0,D",
				exec() {
          RES_B_R(z80, 0, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 83 */ {
				name: "RES 0,E",
				exec() {
          RES_B_R(z80, 0, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 84 */ {
				name: "RES 0,H",
				exec() {
          RES_B_R(z80, 0, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* 85 */ {
				name: "RES 0,L",
				exec() {
          RES_B_R(z80, 0, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* 86 */ {
				name: "RES 0,(HL)",
				exec() {
          RES_B_AT_RR(z80, 0, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 87 */ {
				name: "RES 0,A",
				exec() {
          RES_B_R(z80, 0, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 88 */ {
				name: "RES 1,B",
				exec() {
          RES_B_R(z80, 1, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 89 */ {
				name: "RES 1,C",
				exec() {
          RES_B_R(z80, 1, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 8A */ {
				name: "RES 1,D",
				exec() {
          RES_B_R(z80, 1, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 8B */ {
				name: "RES 1,E",
				exec() {
          RES_B_R(z80, 1, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 8C */ {
				name: "RES 1,H",
				exec() {
          RES_B_R(z80, 1, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* 8D */ {
				name: "RES 1,L",
				exec() {
          RES_B_R(z80, 1, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* 8E */ {
				name: "RES 1,(HL)",
				exec() {
          RES_B_AT_RR(z80, 1, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 8F */ {
				name: "RES 1,A",
				exec() {
          RES_B_R(z80, 1, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 90 */ {
				name: "RES 2,B",
				exec() {
          RES_B_R(z80, 2, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 91 */ {
				name: "RES 2,C",
				exec() {
          RES_B_R(z80, 2, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 92 */ {
				name: "RES 2,D",
				exec() {
          RES_B_R(z80, 2, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 93 */ {
				name: "RES 2,E",
				exec() {
          RES_B_R(z80, 2, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 94 */ {
				name: "RES 2,H",
				exec() {
          RES_B_R(z80, 2, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* 95 */ {
				name: "RES 2,L",
				exec() {
          RES_B_R(z80, 2, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* 96 */ {
				name: "RES 2,(HL)",
				exec() {
          RES_B_AT_RR(z80, 1, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 97 */ {
				name: "RES 2,A",
				exec() {
          RES_B_R(z80, 2, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 98 */ {
				name: "RES 3,B",
				exec() {
          RES_B_R(z80, 3, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* 99 */ {
				name: "RES 3,C",
				exec() {
          RES_B_R(z80, 3, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* 9A */ {
				name: "RES 3,D",
				exec() {
          RES_B_R(z80, 3, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* 9B */ {
				name: "RES 3,E",
				exec() {
          RES_B_R(z80, 3, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* 9C */ {
				name: "RES 3,H",
				exec() {
          RES_B_R(z80, 3, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* 9D */ {
				name: "RES 3,L",
				exec() {
          RES_B_R(z80, 3, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* 9E */ {
				name: "RES 3,(HL)",
				exec() {
          RES_B_AT_RR(z80, 3, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* 9F */ {
				name: "RES 3,A",
				exec() {
          RES_B_R(z80, 3, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* A0 */ {
				name: "RES 4,B",
				exec() {
          RES_B_R(z80, 4, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* A1 */ {
				name: "RES 4,C",
				exec() {
          RES_B_R(z80, 4, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* A2 */ {
				name: "RES 4,D",
				exec() {
          RES_B_R(z80, 4, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* A3 */ {
				name: "RES 4,E",
				exec() {
          RES_B_R(z80, 4, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* A4 */ {
				name: "RES 4,H",
				exec() {
          RES_B_R(z80, 4, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* A5 */ {
				name: "RES 4,L",
				exec() {
          RES_B_R(z80, 4, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* A6 */ {
				name: "RES 4,(HL)",
				exec() {
          RES_B_AT_RR(z80, 4, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* A7 */ {
				name: "RES 4,A",
				exec() {
          RES_B_R(z80, 4, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* A8 */ {
				name: "RES 5,B",
				exec() {
          RES_B_R(z80, 5, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* A9 */ {
				name: "RES 5,C",
				exec() {
          RES_B_R(z80, 5, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* AA */ {
				name: "RES 5,D",
				exec() {
          RES_B_R(z80, 5, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* AB */ {
				name: "RES 5,E",
				exec() {
          RES_B_R(z80, 5, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* AC */ {
				name: "RES 5,H",
				exec() {
          RES_B_R(z80, 5, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* AD */ {
				name: "RES 5,L",
				exec() {
          RES_B_R(z80, 5, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* AE */ {
				name: "RES 5,(HL)",
				exec() {
          RES_B_AT_RR(z80, 5, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* AF */ {
				name: "RES 5,A",
				exec() {
          RES_B_R(z80, 5, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* B0 */ {
				name: "RES 6,B",
				exec() {
          RES_B_R(z80, 6, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* B1 */ {
				name: "RES 6,C",
				exec() {
          RES_B_R(z80, 6, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* B2 */ {
				name: "RES 6,D",
				exec() {
          RES_B_R(z80, 6, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* B3 */ {
				name: "RES 6,E",
				exec() {
          RES_B_R(z80, 6, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* B4 */ {
				name: "RES 6,H",
				exec() {
          RES_B_R(z80, 6, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* B5 */ {
				name: "RES 6,L",
				exec() {
          RES_B_R(z80, 6, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* B6 */ {
				name: "RES 6,(HL)",
				exec() {
          RES_B_AT_RR(z80, 6, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* B7 */ {
				name: "RES 6,A",
				exec() {
          RES_B_R(z80, 6, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* B8 */ {
				name: "RES 7,B",
				exec() {
          RES_B_R(z80, 7, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* B9 */ {
				name: "RES 7,C",
				exec() {
          RES_B_R(z80, 7, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* BA */ {
				name: "RES 7,D",
				exec() {
          RES_B_R(z80, 7, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* BB */ {
				name: "RES 7,E",
				exec() {
          RES_B_R(z80, 7, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* BC */ {
				name: "RES 7,H",
				exec() {
          RES_B_R(z80, 7, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* BD */ {
				name: "RES 7,L",
				exec() {
          RES_B_R(z80, 7, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* BE */ {
				name: "RES 7,(HL)",
				exec() {
          RES_B_AT_RR(z80, 7, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* BF */ {
				name: "RES 7,A",
				exec() {
          RES_B_R(z80, 7, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* C0 */ {
				name: "SET 0,B",
				exec() {
          SET_B_R(z80, 0, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* C1 */ {
				name: "SET 0,C",
				exec() {
          SET_B_R(z80, 0, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* C2 */ {
				name: "SET 0,D",
				exec() {
          SET_B_R(z80, 0, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* C3 */ {
				name: "SET 0,E",
				exec() {
          SET_B_R(z80, 0, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* C4 */ {
				name: "SET 0,H",
				exec() {
          SET_B_R(z80, 0, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* C5 */ {
				name: "SET 0,L",
				exec() {
          SET_B_R(z80, 0, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* C6 */ {
				name: "SET 0,(HL)",
				exec() {
          SET_B_AT_RR(z80, 0, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* C7 */ {
				name: "SET 0,A",
				exec() {
          SET_B_R(z80, 0, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* C8 */ {
				name: "SET 1,B",
				exec() {
          SET_B_R(z80, 1, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* C9 */ {
				name: "SET 1,C",
				exec() {
          SET_B_R(z80, 1, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* CA */ {
				name: "SET 1,D",
				exec() {
          SET_B_R(z80, 1, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* CB */ {
				name: "SET 1,E",
				exec() {
          SET_B_R(z80, 1, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* CC */ {
				name: "SET 1,H",
				exec() {
          SET_B_R(z80, 1, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* CD */ {
				name: "SET 1,L",
				exec() {
          SET_B_R(z80, 1, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* CE */ {
				name: "SET 1,(HL)",
				exec() {
          SET_B_AT_RR(z80, 1, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* CF */ {
				name: "SET 1,A",
				exec() {
          SET_B_R(z80, 1, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* D0 */ {
				name: "SET 2,B",
				exec() {
          SET_B_R(z80, 2, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* D1 */ {
				name: "SET 2,C",
				exec() {
          SET_B_R(z80, 2, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* D2 */ {
				name: "SET 2,D",
				exec() {
          SET_B_R(z80, 2, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* D3 */ {
				name: "SET 2,E",
				exec() {
          SET_B_R(z80, 2, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* D4 */ {
				name: "SET 2,H",
				exec() {
          SET_B_R(z80, 2, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* D5 */ {
				name: "SET 2,L",
				exec() {
          SET_B_R(z80, 2, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* D6 */ {
				name: "SET 2,(HL)",
				exec() {
          SET_B_AT_RR(z80, 2, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* D7 */ {
				name: "SET 2,A",
				exec() {
          SET_B_R(z80, 2, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* D8 */ {
				name: "SET 3,B",
				exec() {
          SET_B_R(z80, 3, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* D9 */ {
				name: "SET 3,C",
				exec() {
          SET_B_R(z80, 3, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* DA */ {
				name: "SET 3,D",
				exec() {
          SET_B_R(z80, 3, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* DB */ {
				name: "SET 3,E",
				exec() {
          SET_B_R(z80, 3, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* DC */ {
				name: "SET 3,H",
				exec() {
          SET_B_R(z80, 3, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* DD */ {
				name: "SET 3,L",
				exec() {
          SET_B_R(z80, 3, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* DE */ {
				name: "SET 3,(HL)",
				exec() {
          SET_B_AT_RR(z80, 3, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* DF */ {
				name: "SET 3,A",
				exec() {
          SET_B_R(z80, 3, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* E0 */ {
				name: "SET 4,B",
				exec() {
          SET_B_R(z80, 4, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* E1 */ {
				name: "SET 4,C",
				exec() {
          SET_B_R(z80, 4, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* E2 */ {
				name: "SET 4,D",
				exec() {
          SET_B_R(z80, 4, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* E3 */ {
				name: "SET 4,E",
				exec() {
          SET_B_R(z80, 4, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* E4 */ {
				name: "SET 4,H",
				exec() {
          SET_B_R(z80, 4, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* E5 */ {
				name: "SET 4,L",
				exec() {
          SET_B_R(z80, 4, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* E6 */ {
				name: "SET 4,(HL)",
				exec() {
          SET_B_AT_RR(z80, 4, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* E7 */ {
				name: "SET 4,A",
				exec() {
          SET_B_R(z80, 4, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* E8 */ {
				name: "SET 5,B",
				exec() {
          SET_B_R(z80, 5, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* E9 */ {
				name: "SET 5,C",
				exec() {
          SET_B_R(z80, 5, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* EA */ {
				name: "SET 5,D",
				exec() {
          SET_B_R(z80, 5, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* EB */ {
				name: "SET 5,E",
				exec() {
          SET_B_R(z80, 5, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* EC */ {
				name: "SET 5,H",
				exec() {
          SET_B_R(z80, 5, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* ED */ {
				name: "SET 5,L",
				exec() {
          SET_B_R(z80, 5, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* EE */ {
				name: "SET 5,(HL)",
				exec() {
          SET_B_AT_RR(z80, 5, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* EF */ {
				name: "SET 5,A",
				exec() {
          SET_B_R(z80, 5, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* F0 */ {
				name: "SET 6,B",
				exec() {
          SET_B_R(z80, 6, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* F1 */ {
				name: "SET 6,C",
				exec() {
          SET_B_R(z80, 6, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* F2 */ {
				name: "SET 6,D",
				exec() {
          SET_B_R(z80, 6, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* F3 */ {
				name: "SET 6,E",
				exec() {
          SET_B_R(z80, 6, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* F4 */ {
				name: "SET 6,H",
				exec() {
          SET_B_R(z80, 6, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* F5 */ {
				name: "SET 6,L",
				exec() {
          SET_B_R(z80, 6, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* F6 */ {
				name: "SET 6,(HL)",
				exec() {
          SET_B_AT_RR(z80, 6, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* F7 */ {
				name: "SET 6,A",
				exec() {
          SET_B_R(z80, 6, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* F8 */ {
				name: "SET 7,B",
				exec() {
          SET_B_R(z80, 7, z80.regOffsets8.B)
				},
				length: 1
			 },
      /* F9 */ {
				name: "SET 7,C",
				exec() {
          SET_B_R(z80, 7, z80.regOffsets8.C)
				},
				length: 1
			 },
      /* FA */ {
				name: "SET 7,D",
				exec() {
          SET_B_R(z80, 7, z80.regOffsets8.D)
				},
				length: 1
			 },
      /* FB */ {
				name: "SET 7,E",
				exec() {
          SET_B_R(z80, 7, z80.regOffsets8.E)
				},
				length: 1
			 },
      /* FC */ {
				name: "SET 7,H",
				exec() {
          SET_B_R(z80, 7, z80.regOffsets8.H)
				},
				length: 1
			 },
      /* FD */ {
				name: "SET 7,L",
				exec() {
          SET_B_R(z80, 7, z80.regOffsets8.L)
				},
				length: 1
			 },
      /* FE */ {
				name: "SET 7,(HL)",
				exec() {
          SET_B_AT_RR(z80, 7, z80.regOffsets16.HL_IX_IY)
				},
				length: 1
			 },
      /* FF */ {
				name: "SET 7,A",
				exec() {
          SET_B_R(z80, 7, z80.regOffsets8.A)
				},
				length: 1
			 },
    ]

    this.ed_instructions = [
      /* 00 */ {
				name: "CPM_OUT_CHAR",
				exec() {
          const mode = z80.reg8[z80.regOffsets8.C]
          switch(mode) {
            case 0x02:
              console.log(String.fromCharCode(z80.reg8[z80.regOffsets8.E]))
              break
            case 0x09:
              {
                let string = ""
                let addr = z80.reg16[z80.regOffsets16.DE]
                let c = z80.mmu.readByte(addr)
                while(c !== ('$'.charCodeAt(0))) {
                  string = string.concat(String.fromCharCode(c))
                  addr += 1
                  c = z80.mmu.readByte(addr)
                }
                console.log(string)
              }
              break
            default:
              break
          }
				},
				length: 1
			 },
      /* 01 */ null,
      /* 02 */ null,
      /* 03 */ null,
      /* 04 */ null,
      /* 05 */ null,
      /* 06 */ null,
      /* 07 */ null,
      /* 08 */ null,
      /* 09 */ null,
      /* 0A */ null,
      /* 0B */ null,
      /* 0C */ null,
      /* 0D */ null,
      /* 0D */ null,
      /* 0F */ null,
      /* 10 */ null,
      /* 11 */ null,
      /* 12 */ null,
      /* 13 */ null,
      /* 14 */ null,
      /* 15 */ null,
      /* 16 */ null,
      /* 17 */ null,
      /* 18 */ null,
      /* 19 */ null,
      /* 1A */ null,
      /* 1B */ null,
      /* 1C */ null,
      /* 1D */ null,
      /* 1E */ null,
      /* 1F */ null,
      /* 20 */ null,
      /* 21 */ null,
      /* 22 */ null,
      /* 23 */ null,
      /* 24 */ null,
      /* 25 */ null,
      /* 26 */ null,
      /* 27 */ null,
      /* 28 */ null,
      /* 29 */ null,
      /* 2A */ null,
      /* 2B */ null,
      /* 2C */ null,
      /* 2D */ null,
      /* 2E */ null,
      /* 2F */ null,
      /* 30 */ null,
      /* 31 */ null,
      /* 32 */ null,
      /* 33 */ null,
      /* 34 */ null,
      /* 35 */ null,
      /* 36 */ null,
      /* 37 */ null,
      /* 38 */ null,
      /* 39 */ null,
      /* 3A */ null,
      /* 3B */ null,
      /* 3C */ null,
      /* 3D */ null,
      /* 3E */ null,
      /* 3F */ null,
      /* 40 */ {
				name: "IN B,(C)",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 41 */ {
				name: "OUT (C),B",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 42 */ {
				name: "SBC HL,BC",
				exec() {
          SBC_RR_RR(z80, z80.regOffsets16.HL, z80.regOffsets16.BC)
				},
				length: 1
			 },
      /* 43 */ {
				name: "LD (\\2\\1H),BC",
				exec() {
          LD_TO_NNNN_RR(z80, z80.regOffsets16.BC)
				},
				length: 3
			 },
      /* 44 */ {
				name: "NEG",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 45 */ {
				name: "RETN",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 46 */ {
				name: "IM 0",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 47 */ {
				name: "LD I,A",
				exec() {
          LD_R_R(z80, z80.regOffsets8.I, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 48 */ {
				name: "IN C,(C)",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 49 */ {
				name: "OUT (C),C",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 4A */ {
				name: "ADC HL,BC",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 4B */ {
        name: "LD BC,(\\2\\1H)",
        exec() {
          LD_RR_FROM_NNNN(z80, z80.regOffsets16.BC)
        },
        length: 3
      },
      /* 4C */ {
				name: "NEG",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 4D */ {
				name: "RETI",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 4E */ {
				name: "IM 0/1",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 4F */ {
				name: "LD R,A",
				exec() {
          LD_R_R(z80, z80.regOffsets8.R, z80.regOffsets8.A)
				},
				length: 1
			 },
      /* 50 */ {
				name: "IN D,(C)",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 51 */ {
				name: "OUT (C),D",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 52 */ {
				name: "SBC HL,DE",
				exec() {
          SBC_RR_RR(z80, z80.regOffsets16.HL, z80.regOffsets16.DE)
				},
				length: 1
			 },
      /* 53 */ {
				name: "LD (\\2\\1H),DE",
				exec() {
          LD_TO_NNNN_RR(z80, z80.regOffsets16.DE)
				},
				length: 3
			 },
      /* 54 */ {
				name: "NEG",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 55 */ {
				name: "RETN",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 56 */ {
				name: "IM 1",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 57 */ {
				name: "LD A,I",
				exec() {
          LD_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.I)
          // Set flags, this is one of the few LD instructions that affect flags.
          const i = z80.reg8[z80.regOffsets8.I]
          z80.flags.S = ((i & 0x80) !== 0)
          z80.flags.Z = !(i & 0xFF)
          z80.flags.H = false
          z80.flags.P = false // TODO: should be set to IFF2
          z80.flags.N = false
				},
				length: 1
			 },
      /* 58 */ {
				name: "IN E,(C)",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 59 */ {
				name: "OUT (C),E",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 5A */ {
				name: "ADC HL,DE",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 5B */ {
        name: "LD DE,(\\2\\1H)",
        exec() {
          LD_RR_FROM_NNNN(z80, z80.regOffsets16.DE)
        },
        length: 3
      },
      /* 5C */ {
				name: "NEG",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 5D */ {
				name: "RETN",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 5E */ {
				name: "IM 2",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 5F */ {
				name: "LD A,R",
				exec() {
          LD_R_R(z80, z80.regOffsets8.A, z80.regOffsets8.R)
          // Set flags, this is one of the few LD instructions that affect flags.
          const r = z80.reg8[z80.regOffsets8.R]
          z80.flags.S = ((r & 0x80) !== 0)
          z80.flags.Z = !(r & 0xFF)
          z80.flags.H = false
          z80.flags.P = false // TODO: should be set to IFF2
          z80.flags.N = false
				},
				length: 1
			 },
      /* 60 */ {
				name: "IN H,(C)",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 61 */ {
				name: "OUT (C),H",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 62 */ {
				name: "SBC HL,HL",
				exec() {
          SBC_RR_RR(z80, z80.regOffsets16.HL, z80.regOffsets16.HL)
				},
				length: 1
			 },
      /* 63 */ {
				name: "LD (\\2\\1H),HL",
				exec() {
          LD_TO_NNNN_RR(z80, z80.regOffsets16.HL)
				},
				length: 3
			 },
      /* 64 */ {
				name: "NEG",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 65 */ {
				name: "RETN",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 66 */ {
				name: "IM 0",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 67 */ {
				name: "RRD",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 68 */ {
				name: "IN L,(C)",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 69 */ {
				name: "OUT (C),L",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 6A */ {
				name: "ADC HL,HL",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 6B */ {
        name: "LD HL,(\\2\\1H)",
        exec() {
          LD_RR_FROM_NNNN(z80, z80.regOffsets16.HL)
        },
        length: 3
      },
      /* 6C */ {
				name: "NEG",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 6D */ {
				name: "RETN",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 6E */ {
				name: "IM 0/1",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 6F */ {
				name: "RLD",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 70 */ {
				name: "IN F,(C) / IN (C)",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 71 */ {
				name: "OUT (C),0",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 72 */ {
				name: "SBC HL,SP",
				exec() {
          SBC_RR_RR(z80, z80.regOffsets16.HL, z80.regOffsets16.SP)
				},
				length: 1
			 },
      /* 73 */ {
				name: "LD (\\2\\1H),SP",
				exec() {
          LD_TO_NNNN_RR(z80, z80.regOffsets16.SP)
				},
				length: 3
			 },
      /* 74 */ {
				name: "NEG",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 75 */ {
				name: "RETN",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 76 */ {
				name: "IM 1",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 77 */ {
				name: "",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 78 */ {
				name: "IN A,(C)",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 79 */ {
				name: "OUT (C),A",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 7A */ {
				name: "ADC HL,SP",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 7B */ {
        name: "LD SP,(\\2\\1H)",
        exec() {
          LD_RR_FROM_NNNN(z80, z80.regOffsets16.SP)
        },
        length: 3
      },
      /* 7C */ {
				name: "NEG",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 7D */ {
				name: "RETN",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 7E */ {
				name: "IM 2",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* 7F */ null,
      /* 80 */ null,
      /* 81 */ null,
      /* 82 */ null,
      /* 83 */ null,
      /* 84 */ null,
      /* 85 */ null,
      /* 86 */ null,
      /* 87 */ null,
      /* 88 */ null,
      /* 89 */ null,
      /* 8A */ null,
      /* 8B */ null,
      /* 8C */ null,
      /* 8D */ null,
      /* 8E */ null,
      /* 8F */ null,
      /* 90 */ null,
      /* 91 */ null,
      /* 92 */ null,
      /* 93 */ null,
      /* 94 */ null,
      /* 95 */ null,
      /* 96 */ null,
      /* 97 */ null,
      /* 98 */ null,
      /* 99 */ null,
      /* 9A */ null,
      /* 9B */ null,
      /* 9C */ null,
      /* 9D */ null,
      /* 9E */ null,
      /* 9F */ null,
      /* A0 */ {
				name: "LDI",
				exec() {
          LDI(z80)
				},
				length: 1
			 },
      /* A1 */ {
				name: "CPI",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* A2 */ {
				name: "INI",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* A3 */ {
				name: "OUTI",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* A4 */ null,
      /* A5 */ null,
      /* A6 */ null,
      /* A7 */ null,
      /* A8 */ {
				name: "LDD",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* A9 */ {
				name: "CPD",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* AA */ {
				name: "IND",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* AB */ {
				name: "OUTD",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* AC */ null,
      /* AD */ null,
      /* AE */ null,
      /* AF */ null,
      /* B0 */ {
				name: "LDIR",
				exec() {
          do {
            LDI(z80)
          } while(!z80.flags.P)
          z80.flags.P = false
				},
				length: 1
			 },
      /* B1 */ {
				name: "CPIR",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* B2 */ {
				name: "INIR",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* B3 */ {
				name: "OTIR",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* B4 */ null,
      /* B5 */ null,
      /* B6 */ null,
      /* B7 */ null,
      /* B8 */ {
				name: "LDDR",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* B9 */ {
				name: "CPDR",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* BA */ {
				name: "INDR",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* BB */ {
				name: "OTDR",
				exec() {
				},
				unimplemented: true,
				length: 1
			 },
      /* BC */ null,
      /* BD */ null,
      /* BE */ null,
      /* BF */ null,
      /* C0 */ null,
      /* C1 */ null,
      /* C2 */ null,
      /* C3 */ null,
      /* C4 */ null,
      /* C5 */ null,
      /* C6 */ null,
      /* C7 */ null,
      /* C8 */ null,
      /* C9 */ null,
      /* CA */ null,
      /* CB */ null,
      /* CC */ null,
      /* CD */ null,
      /* CE */ null,
      /* CF */ null,
      /* D0 */ null,
      /* D1 */ null,
      /* D2 */ null,
      /* D3 */ null,
      /* D4 */ null,
      /* D5 */ null,
      /* D6 */ null,
      /* D7 */ null,
      /* D8 */ null,
      /* D9 */ null,
      /* DA */ null,
      /* DB */ null,
      /* DC */ null,
      /* DD */ null,
      /* DE */ null,
      /* DF */ null,
      /* E0 */ null,
      /* E1 */ null,
      /* E2 */ null,
      /* E3 */ null,
      /* E4 */ null,
      /* E5 */ null,
      /* E6 */ null,
      /* E7 */ null,
      /* E8 */ null,
      /* E9 */ null,
      /* EA */ null,
      /* EB */ null,
      /* EC */ null,
      /* ED */ null,
      /* EE */ null,
      /* EF */ null,
      /* F0 */ null,
      /* F1 */ null,
      /* F2 */ null,
      /* F3 */ null,
      /* F4 */ null,
      /* F5 */ null,
      /* F6 */ null,
      /* F7 */ null,
      /* F8 */ null,
      /* F9 */ null,
      /* FA */ null,
      /* FB */ null,
      /* FC */ null,
      /* FD */ null,
      /* FE */ null,
      /* FF */ null,
    ]

    if(process.env.NODE_ENV === 'DEV') {
      let unimplemented = 0
      let total = 0
      for(let i = 0; i < this.instructions.length; i += 1) {
        total += 1
        if(this.instructions[i].unimplemented) {
          unimplemented += 1;
        }
      }
      for(let i = 0; i < this.cb_instructions.length; i += 1) {
        total += 1
        if(this.cb_instructions[i].unimplemented) {
          unimplemented += 1;
        }
      }
      for(let i = 0; i < this.ed_instructions.length; i += 1) {
        if(this.ed_instructions[i]) {
          total += 1
          if(this.ed_instructions[i].unimplemented) {
            unimplemented += 1;
          }
        }
      }
      console.log(`${total-unimplemented}/${total} (${unimplemented}) ${Math.round((100.0/total)*(total-unimplemented))}%`);
    }

    this.registers = new ArrayBuffer(26)
    this.reg16 = new Uint16Array(this.registers)
    this.reg8 = new Uint8Array(this.registers)

    // 16 bit indices into the register array
    this.regOffsets16 = {
      AF: 0,
      BC: 1,
      DE: 2,
      HL: 3,
      AF_: 4,
      BC_: 5,
      DE_: 6,
      HL_: 7,
      IX: 8,
      IY: 9,
      IR: 10,
      SP: 11,
      PC: 12,
      // Special, toggled for 0xDD and 0xFD prefixed instructions
      HL_IX_IY: 3,
    }


    // TODO: Presume little endian for now.
    // 8 bit indices into the register array
    this.regOffsets8 = {
      A: 1,
      F: 0,
      B: 3,
      C: 2,
      D: 5,
      E: 4,
      H: 7,
      L: 6,
      A_: 9,
      F_: 8,
      B_: 11,
      C_: 10,
      D_: 13,
      E_: 12,
      H_: 15,
      L_: 14,
      IXh: 17,
      IXl: 16,
      IYh: 19,
      IYl: 18,
      I: 21,
      R: 20,
      // Special, toggled for 0xDD and 0xFD prefixed instructions
      H_IXH_IYH: 7,
      L_IXL_IYL: 6,
    }

    this.flags = {
      S: true,
      Z: true,
      Y: true,
      H: true,
      X: true,
      P: true,
      N: true,
      C: true,
    }

    this.altFlags = {
      S: true,
      Z: true,
      Y: true,
      H: true,
      X: true,
      P: true,
      N: true,
      C: true,
    }

    this.reset()
  }

  reset() {
    this.reg16[this.regOffsets16.AF] = 0xFFFF
    this.reg16[this.regOffsets16.BC] = 0xFFFF
    this.reg16[this.regOffsets16.DE] = 0xFFFF
    this.reg16[this.regOffsets16.HL] = 0xFFFF
    this.reg16[this.regOffsets16.SP] = 0xFFFF 
    this.reg16[this.regOffsets16.PC] = 0
    this.flags.S = true
    this.flags.Z = true
    this.flags.Y = true
    this.flags.H = true
    this.flags.X = true
    this.flags.P = true
    this.flags.N = true
    this.flags.C = true
    this.flags.S_ = true
    this.altFlags.Z = true
    this.altFlags.Y = true
    this.altFlags.H = true
    this.altFlags.X = true
    this.altFlags.P = true
    this.altFlags.N = true
    this.altFlags.C = true
  }

  getRegister8(reg) {
    return this.reg8[this.regOffsets8[reg]]
  }

  getRegister16(reg) {
    return this.reg16[this.regOffsets16[reg]]
  }

  setRegister8(reg, value) {
    this.reg8[this.regOffsets8[reg]] = value
  }

  setRegister16(reg, value) {
    this.reg16[this.regOffsets16[reg]] = value
  }

  resetIXIYState() {
    this.regOffsets16.HL_IX_IY = this.regOffsets16.HL
    this.regOffsets8.H_IXH_IYH = this.regOffsets8.H
    this.regOffsets8.L_IXL_IYL = this.regOffsets8.L
  }

  hexOpCodeAt(address) {
    const opcode = this.mmu.readByte(address)
    let hex = hexByte(opcode)
    for(let b = 1; b < this.instructions[opcode].length; b += 1 ) {
      hex += hexByte(this.mmu.readByte(address + b))
    }
    return (hex + "        ").substr(0, 8)
  }

  disasm(opcode, address) {
    return opcode.name.
      replace(/\\1/, ("00" + this.mmu.readByte(address + 1).toString(16).toUpperCase()).substr(-2)).
      replace(/\\2/, ("00" + this.mmu.readByte(address + 2).toString(16).toUpperCase()).substr(-2))
  }

  disasmOpCodeAt(address) {
    const opcode = this.mmu.readByte(address)
    try {
      return this.disasm(this.instructions[opcode], address)
    } catch(e) {
      return "NOP"
    }
  }

  disasmNextOpCode() {
    return this.disasmOpCodeAt(this.reg16[this.regOffsets16.PC])
  }

  opcodeLengthAt(address) {
    const opcode = this.mmu.readByte(address)
    return this.instructions[opcode].length
  }

  stepExecution() {
    const opcode = this.mmu.readByte(this.reg16[this.regOffsets16.PC])
    if(this.instructions[opcode] && this.instructions[opcode].unimplemented) {
      console.log(`Error: unimplemented opcode: 0x${opcode.toString(16)}`)
    }
    if(!this.instructions[opcode].exec()) {
      this.reg16[this.regOffsets16.PC] += this.instructions[opcode].length
    }
    if(opcode !== 0xDD && opcode !== 0xFD) {
      this.resetIXIYState()
    } else {
      this.stepExecution()
    }
  }

  runUntilZero() {
    do {
      this.stepExecution()
    } while(this.reg16[this.regOffsets16.PC] !== 0x000)
  }

  getParity(value) {
    var parity_bits = [
      1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
      0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 
      0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 
      1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 
      0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 
      1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 
      1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 
      0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 
      0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 
      1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 
      1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 
      0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 
      1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 
      0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 
      0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 
      1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1
    ];
    return parity_bits[value];
  }
}
