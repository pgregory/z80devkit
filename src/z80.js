import {hexByte} from './utilities.js'

// Macros for common flag update modes
DEFINE_MACRO(FLAGS_MMMV0M, (z80, a, b, r) => {
  z80.flags.S = ((r & 0x80) !== 0)
  z80.flags.Z = !(r & 0xFF)
  z80.flags.Y = ((r & 0x20) !== 0)
  z80.flags.H = ((((a & 0xF) + (b & 0xF)) & 0x10) !== 0)
  z80.flags.X = ((r & 0x08) !== 0)
  z80.flags.P = (((a & 0x80) === (b & 0x80)) && ((a & 0x80) !== (r & 0x80)))
  z80.flags.N = false
  z80.flags.C = (r > 255)
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
  const nh = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1) 
  const nl = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 2) 
  const addr = nh << 8 + nl
  // Read data from address
  const rh = z80.mmu.readByte(addr)
  const rl = z80.mmu.readByte(addr + 1)
  // TODO: Is this construction right?
  z80.reg16[r] = (rh << 8) + rl
})

DEFINE_MACRO(LD_R_NN, (z80, r) => {
  const n = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1)
  z80.reg8[r] = n
})

DEFINE_MACRO(LD_RR_RR, (z80, r, r2) => {
  z80.reg16[r] = z80.reg16[r2]
})

export default class Z80 {
  constructor(mmu) {
    this.mmu = mmu
    
    const z80 = this
    this.instructions = [
      /* 00 */ { name: "NOP", exec() {}, length: 1 },
      /* 01 */ { 
        name: "LD BC,\\2\\1H", 
        exec() {
          LD_RR_NNNN(z80, z80.regOffsets16.BC)
        }, 
        length: 3 
      },
      /* 02 */ { name: "LD (BC),A", exec() {}, length: 1 },
      /* 03 */ { name: "INC BC", exec() {}, length: 1 },
      /* 04 */ { name: "INC B", exec() {}, length: 1 },
      /* 05 */ { name: "DEC B", exec() {}, length: 1 },
      /* 06 */ { 
        name: 'LD B,\\1H',
        exec() { 
          const n = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1) 
          z80.reg8[z80.regOffsets8.B] = n
        }, 
        length: 2 
      },
      /* 07 */ { name: "RLCA", exec() {}, length: 1 },
      /* 08 */ { name: "EX AF,AF'", exec() {}, length: 1 },
      /* 09 */ { name: "ADD HL,BC", exec() {}, length: 1 },
      /* 0A */ { name: "LA A,(BC)", exec() {}, length: 1 },
      /* 0B */ { name: "DEC BC", exec() {}, length: 1 },
      /* 0C */ { name: "INC C", exec() {}, length: 1 },
      /* 0D */ { name: "DEC C", exec() {}, length: 1 },
      /* 0E */ {
        name: "LD C,\\1H",
        exec() {
          LD_R_NN(z80, z80.regOffsets8.C)
        },
        length: 2
      },
      /* 0F */ { name: "RRCA", exec() {}, length: 1 },
      /* 10 */ { name: "DJNZ e", exec() {}, length: 2 },
      /* 11 */ {
        name: "LD DE,\\2\\1H",
        exec() {
          LD_RR_NNNN(z80, z80.regOffsets16.DE)
        },
        length: 3
      },
      /* 12 */ { name: "LD (DE),A", exec() {}, length: 1 },
      /* 13 */ { name: "INC DE", exec() {}, length: 1 },
      /* 14 */ { name: "INC D", exec() {}, length: 1 },
      /* 15 */ { name: "DEC D", exec() {}, length: 1 },
      /* 16 */ { name: "LD D,\\1H", exec() {}, length: 2 },
      /* 17 */ { name: "RLA", exec() {}, length: 1 },
      /* 18 */ { name: "JR e", exec() {}, length: 2 },
      /* 19 */ { name: "ADD HL,DE", exec() {}, length: 1 },
      /* 1A */ { name: "LA A,(DE)", exec() {}, length: 1 },
      /* 1B */ { name: "DEC DE", exec() {}, length: 1 },
      /* 1C */ { name: "INC E", exec() {}, length: 1 },
      /* 1D */ { name: "DEC E", exec() {}, length: 1 },
      /* 1E */ { name: "LD E,\\1H", exec() {}, length: 2 },
      /* 1F */ { name: "RRA", exec() {}, length: 1 },
      /* 20 */ { name: "JR NZ,e", exec() {}, length: 2 },
      /* 21 */ { name: "LD HL,\\2\\1H", exec() {}, length: 3 },
      /* 22 */ { name: "LD (\\2\\1H),HL", exec() {}, length: 3 },
      /* 23 */ { name: "INC HL", exec() {}, length: 1 },
      /* 24 */ { name: "INC H", exec() {}, length: 1 },
      /* 25 */ { name: "DEC H", exec() {}, length: 1 },
      /* 26 */ { name: "LD H,\\1H", exec() {}, length: 2 },
      /* 27 */ { name: "DAA", exec() {}, length: 1 },
      /* 28 */ { name: "JR Z,\\1H", exec() {}, length: 2 },
      /* 29 */ { name: "ADD HL,HL", exec() {}, length: 1 },
      /* 2A */ {
        name: "LD HL,(\\2\\1H)",
        exec() {
          LD_RR_FROM_NNNN(z80, z80.regOffsets16.HL)
        },
        length: 3
      },
      /* 2B */ { name: "DEC HL", exec() {}, length: 1 },
      /* 2C */ { name: "INC L", exec() {}, length: 1 },
      /* 2D */ { name: "DEC L", exec() {}, length: 1 },
      /* 2E */ { name: "LD L,\\1H", exec() {}, length: 2 },
      /* 2F */ { name: "CPL", exec() {}, length: 1 },
      /* 30 */ { name: "JR NC,(PC+e)", exec() {}, length: 2 },
      /* 31 */ { name: "LD SP,\\2\\1H", exec() {}, length: 3 },
      /* 32 */ { name: "LD (\\2\\1H),A", exec() {}, length: 3 },
      /* 33 */ { name: "INC SP", exec() {}, length: 1 },
      /* 34 */ { name: "INC (HL)", exec() {}, length: 1 },
      /* 35 */ { name: "DEC (HL)", exec() {}, length: 1 },
      /* 36 */ { name: "LD (HL),\\1H", exec() {}, length: 2 },
      /* 37 */ { name: "SCF", exec() {}, length: 1 },
      /* 38 */ { name: "JR C,e", exec() {}, length: 2 },
      /* 39 */ { name: "ADD HL,SP", exec() {}, length: 1 },
      /* 3A */ { name: "LA A,(\\2\\1H)", exec() {}, length: 3 },
      /* 3B */ { name: "DEC SP", exec() {}, length: 1 },
      /* 3C */ { name: "INC A", exec() {}, length: 1 },
      /* 3D */ { name: "DEC A", exec() {}, length: 1 },
      /* 3E */ {
        name: "LA A,\\1H",
        exec() {
          const n1 = z80.mmu.readByte(z80.reg16[z80.regOffsets16.PC] + 1) 
          z80.reg8[z80.regOffsets8.A] = n1
        },
        length: 2
      },
      /* 3F */ { name: "CCF", exec() {}, length: 1 },
      /* 40 */ { name: "LD B,B", exec() {}, length: 1 },
      /* 41 */ { name: "LD B,C", exec() {}, length: 1 },
      /* 42 */ { name: "LD B,D", exec() {}, length: 1 },
      /* 43 */ { name: "LD B,E", exec() {}, length: 1 },
      /* 44 */ { name: "LD B,H", exec() {}, length: 1 },
      /* 45 */ { name: "LD B,L", exec() {}, length: 1 },
      /* 46 */ { name: "LD B,(HL)", exec() {}, length: 1 },
      /* 47 */ { name: "LD B,A", exec() {}, length: 1 },
      /* 48 */ { name: "LD C,B", exec() {}, length: 1 },
      /* 49 */ { name: "LD C,C", exec() {}, length: 1 },
      /* 4A */ { name: "LD C,D", exec() {}, length: 1 },
      /* 4B */ { name: "LD C,E", exec() {}, length: 1 },
      /* 4C */ { name: "LD C,H", exec() {}, length: 1 },
      /* 4D */ { name: "LD C,L", exec() {}, length: 1 },
      /* 4E */ { name: "LD C,(HL)", exec() {}, length: 1 },
      /* 4F */ { name: "LD C,A", exec() {}, length: 1 },
      /* 50 */ { name: "LD D,B", exec() {}, length: 1 },
      /* 51 */ { name: "LD D,C", exec() {}, length: 1 },
      /* 52 */ { name: "LD D,D", exec() {}, length: 1 },
      /* 53 */ { name: "LD D,E", exec() {}, length: 1 },
      /* 54 */ { name: "LD D,H", exec() {}, length: 1 },
      /* 55 */ { name: "LD D,L", exec() {}, length: 1 },
      /* 56 */ { name: "LD D,(HL)", exec() {}, length: 1 },
      /* 57 */ { name: "LD D,A", exec() {}, length: 1 },
      /* 58 */ { name: "LD E,B", exec() {}, length: 1 },
      /* 59 */ { name: "LD E,C", exec() {}, length: 1 },
      /* 5A */ { name: "LD E,D", exec() {}, length: 1 },
      /* 5B */ { name: "LD E,E", exec() {}, length: 1 },
      /* 5C */ { name: "LD E,H", exec() {}, length: 1 },
      /* 5D */ { name: "LD E,L", exec() {}, length: 1 },
      /* 5E */ { name: "LD E,(HL)", exec() {}, length: 1 },
      /* 5F */ { name: "LD E,A", exec() {}, length: 1 },
      /* 60 */ { name: "LD H,B", exec() {}, length: 1 },
      /* 61 */ { name: "LD H,C", exec() {}, length: 1 },
      /* 62 */ { name: "LD H,D", exec() {}, length: 1 },
      /* 63 */ { name: "LD H,E", exec() {}, length: 1 },
      /* 64 */ { name: "LD H,H", exec() {}, length: 1 },
      /* 65 */ { name: "LD H,L", exec() {}, length: 1 },
      /* 66 */ { name: "LD H,(HL)", exec() {}, length: 1 },
      /* 67 */ { name: "LD H,A", exec() {}, length: 1 },
      /* 68 */ { name: "LD L,B", exec() {}, length: 1 },
      /* 69 */ { name: "LD L,C", exec() {}, length: 1 },
      /* 6A */ { name: "LD L,D", exec() {}, length: 1 },
      /* 6B */ { name: "LD L,E", exec() {}, length: 1 },
      /* 6C */ { name: "LD L,H", exec() {}, length: 1 },
      /* 6D */ { name: "LD L,L", exec() {}, length: 1 },
      /* 6E */ { name: "LD L,(HL)", exec() {}, length: 1 },
      /* 6F */ { name: "LD L,A", exec() {}, length: 1 },
      /* 70 */ { name: "LD (HL),B", exec() {}, length: 1 },
      /* 71 */ { name: "LD (HL),C", exec() {}, length: 1 },
      /* 72 */ { name: "LD (HL),D", exec() {}, length: 1 },
      /* 73 */ { name: "LD (HL),E", exec() {}, length: 1 },
      /* 74 */ { name: "LD (HL),H", exec() {}, length: 1 },
      /* 75 */ { name: "LD (HL),L", exec() {}, length: 1 },
      /* 76 */ { name: "HALT", exec() {}, length: 1 },
      /* 77 */ { name: "LD (HL),A", exec() {}, length: 1 },
      /* 78 */ { name: "LD A,B", exec() {}, length: 1 },
      /* 79 */ { name: "LD A,C", exec() {}, length: 1 },
      /* 7A */ { name: "LD A,D", exec() {}, length: 1 },
      /* 7B */ { name: "LD A,E", exec() {}, length: 1 },
      /* 7C */ { name: "LD A,H", exec() {}, length: 1 },
      /* 7D */ { name: "LD A,L", exec() {}, length: 1 },
      /* 7E */ { name: "LD A,(HL)", exec() {}, length: 1 },
      /* 7F */ { name: "LD A,A", exec() {}, length: 1 },
      /* 80 */ {
        name: "ADD A,B",
        exec() {
          const a = z80.reg8[z80.regOffsets8.A]
          const b = z80.reg8[z80.regOffsets8.B]
          const res = a + b
          z80.reg8[z80.regOffsets8.A] = res
          FLAGS_MMMV0M(z80, a, b, res)
        },
        length: 1,
      },
      /* 81 */ { name: "ADD A,C", exec() {}, length: 1 },
      /* 82 */ { name: "ADD A,D", exec() {}, length: 1 },
      /* 83 */ { name: "ADD A,E", exec() {}, length: 1 },
      /* 84 */ { name: "ADD A,H", exec() {}, length: 1 },
      /* 85 */ { name: "ADD A,L", exec() {}, length: 1 },
      /* 86 */ { name: "ADD A,(HL)", exec() {}, length: 1 },
      /* 87 */ { name: "ADD A,A", exec() {}, length: 1 },
      /* 88 */ { name: "ADC A,B", exec() {}, length: 1 },
      /* 89 */ { name: "ADC A,C", exec() {}, length: 1 },
      /* 8A */ { name: "ADC A,D", exec() {}, length: 1 },
      /* 8B */ { name: "ADC A,E", exec() {}, length: 1 },
      /* 8C */ { name: "ADC A,H", exec() {}, length: 1 },
      /* 8D */ { name: "ADC A,L", exec() {}, length: 1 },
      /* 8E */ { name: "ADC A,(HL)", exec() {}, length: 1 },
      /* 8F */ { name: "ADC A,A", exec() {}, length: 1 },
      /* 90 */ { name: "SUB A,B", exec() {}, length: 1 },
      /* 91 */ { name: "SUB A,C", exec() {}, length: 1 },
      /* 92 */ { name: "SUB A,D", exec() {}, length: 1 },
      /* 93 */ { name: "SUB A,E", exec() {}, length: 1 },
      /* 94 */ { name: "SUB A,H", exec() {}, length: 1 },
      /* 95 */ { name: "SUB A,L", exec() {}, length: 1 },
      /* 96 */ { name: "SUB A,(HL)", exec() {}, length: 1 },
      /* 97 */ { name: "SUB A,A", exec() {}, length: 1 },
      /* 98 */ { name: "SBC A,B", exec() {}, length: 1 },
      /* 99 */ { name: "SBC A,C", exec() {}, length: 1 },
      /* 9A */ { name: "SBC A,D", exec() {}, length: 1 },
      /* 9B */ { name: "SBC A,E", exec() {}, length: 1 },
      /* 9C */ { name: "SBC A,H", exec() {}, length: 1 },
      /* 9D */ { name: "SBC A,L", exec() {}, length: 1 },
      /* 9E */ { name: "SBC A,(HL)", exec() {}, length: 1 },
      /* 9F */ { name: "SBC A,A", exec() {}, length: 1 },
      /* A0 */ { name: "AND B", exec() {}, length: 1 },
      /* A1 */ { name: "AND C", exec() {}, length: 1 },
      /* A2 */ { name: "AND D", exec() {}, length: 1 },
      /* A3 */ { name: "AND E", exec() {}, length: 1 },
      /* A4 */ { name: "AND H", exec() {}, length: 1 },
      /* A5 */ { name: "AND L", exec() {}, length: 1 },
      /* A6 */ { name: "AND (HL)", exec() {}, length: 1 },
      /* A7 */ { name: "AND A", exec() {}, length: 1 },
      /* A8 */ { name: "XOR B", exec() {}, length: 1 },
      /* A9 */ { name: "XOR C", exec() {}, length: 1 },
      /* AA */ { name: "XOR D", exec() {}, length: 1 },
      /* AB */ { name: "XOR E", exec() {}, length: 1 },
      /* AC */ { name: "XOR H", exec() {}, length: 1 },
      /* AD */ { name: "XOR L", exec() {}, length: 1 },
      /* AE */ { name: "XOR (HL)", exec() {}, length: 1 },
      /* AF */ { name: "XOR A", exec() {}, length: 1 },
      /* B0 */ { name: "OR B", exec() {}, length: 1 },
      /* B1 */ { name: "OR C", exec() {}, length: 1 },
      /* B2 */ { name: "OR D", exec() {}, length: 1 },
      /* B3 */ { name: "OR E", exec() {}, length: 1 },
      /* B4 */ { name: "OR H", exec() {}, length: 1 },
      /* B5 */ { name: "OR L", exec() {}, length: 1 },
      /* B6 */ { name: "OR (HL)", exec() {}, length: 1 },
      /* B7 */ { name: "OR A", exec() {}, length: 1 },
      /* B8 */ { name: "CP B", exec() {}, length: 1 },
      /* B9 */ { name: "CP C", exec() {}, length: 1 },
      /* BA */ { name: "CP D", exec() {}, length: 1 },
      /* BB */ { name: "CP E", exec() {}, length: 1 },
      /* BC */ { name: "CP H", exec() {}, length: 1 },
      /* BD */ { name: "CP L", exec() {}, length: 1 },
      /* BE */ { name: "CP (HL)", exec() {}, length: 1 },
      /* BF */ { name: "CP A", exec() {}, length: 1 },
      /* C0 */ { name: "RET NZ", exec() {}, length: 1 },
      /* C1 */ { name: "POP BC", exec() {}, length: 1 },
      /* C2 */ { name: "JP NZ,\\2\\1H", exec() {}, length: 3 },
      /* C3 */ {
        name: "JP \\2\\1H",
        exec() {
          const addr = z80.mmu.readWord(z80.reg16[z80.regOffsets16.PC] + 1)
          z80.reg16[z80.regOffsets16.PC] = addr
          return true
        },
        length: 3
      },
      /* C4 */ { name: "CALL NZ,\\2\\1H", exec() {}, length: 3 },
      /* C5 */ { name: "PUSH BC", exec() {}, length: 1 },
      /* C6 */ { name: "ADD A,\\1H", exec() {}, length: 2 },
      /* C7 */ { name: "RST 00H", exec() {}, length: 1 },
      /* C8 */ { name: "RET Z", exec() {}, length: 1 },
      /* C9 */ { name: "RET", exec() {}, length: 1 },
      /* CA */ { name: "JP Z,\\2\\1H", exec() {}, length: 3 },
      /* CB */ { name: "**** CB ****", exec() {}, length: 0 },
      /* CC */ { name: "CALL Z,\\2\\1H", exec() {}, length: 3 },
      /* CD */ { name: "CALL \\2\\1H", exec() {}, length: 3 },
      /* CE */ { name: "ADC A,\\1H", exec() {}, length: 2 },
      /* CF */ { name: "RST 08H", exec() {}, length: 1 },
      /* D0 */ { name: "RET NC", exec() {}, length: 1 },
      /* D1 */ { name: "POP DE", exec() {}, length: 1 },
      /* D2 */ {
        name: "JP NC,\\2\\1H",
        exec() {
          return JP_CC_NNNN(z80, !z80.flags.C, this.length)
        },
        length: 3
      },
      /* D3 */ { name: "OUT (\\1H),A", exec() {}, length: 2 },
      /* D4 */ { name: "CALL NC,\\2\\1H", exec() {}, length: 3 },
      /* D5 */ { name: "PUSH DE", exec() {}, length: 1 },
      /* D6 */ { name: "SUB A,\\1H", exec() {}, length: 2 },
      /* D7 */ { name: "RST 10H", exec() {}, length: 1 },
      /* D8 */ { name: "RET C", exec() {}, length: 1 },
      /* D9 */ { name: "EXX", exec() {}, length: 1 },
      /* DA */ {
        name: "JP C,\\2\\1H",
        exec() {
          return JP_CC_NNNN(z80, z80.flags.C, this.length)
        },
        length: 3
      },
      /* DB */ { name: "IN A,(\\1H)", exec() {}, length: 2 },
      /* DC */ { name: "CALL C,\\2\\1H", exec() {}, length: 3 },
      /* DD */ { name: "**** DD ****", exec() {}, length: 1 },
      /* DE */ { name: "SBC A,\\1H", exec() {}, length: 2 },
      /* DF */ { name: "RST 18H", exec() {}, length: 1 },
      /* E0 */ { name: "RET PO", exec() {}, length: 1 },
      /* E1 */ { name: "POP HL", exec() {}, length: 1 },
      /* E2 */ { name: "JP PO,\\2\\1H", exec() {}, length: 3 },
      /* E3 */ { name: "EX (SP),HL", exec() {}, length: 1 },
      /* E4 */ { name: "CAlL PO,\\2\\1H", exec() {}, length: 3 },
      /* E5 */ { name: "PUSH HL", exec() {}, length: 1 },
      /* E6 */ { name: "AND \\1H", exec() {}, length: 2 },
      /* E7 */ { name: "RST 20H", exec() {}, length: 1 },
      /* E8 */ { name: "RET PE", exec() {}, length: 1 },
      /* E9 */ { name: "JP (HL)", exec() {}, length: 1 },
      /* EA */ { name: "JP PE,\\2\\1H", exec() {}, length: 3 },
      /* EB */ { name: "EX DE,HL", exec() {}, length: 1 },
      /* EC */ { name: "CALL PE,\\2\\1H", exec() {}, length: 3 },
      /* ED */ { name: "**** ED ****", exec() {}, length: 0 },
      /* EE */ { name: "XOR \\1H", exec() {}, length: 2 },
      /* EF */ { name: "RST 28H", exec() {}, length: 1 },
      /* F0 */ { name: "RET P", exec() {}, length: 1 },
      /* F1 */ { name: "POP AF", exec() {}, length: 1 },
      /* F2 */ { name: "JP P,\\2\\1H", exec() {}, length: 3 },
      /* F3 */ { name: "DI", exec() {}, length: 1 },
      /* F4 */ { name: "CALL P,\\2\\1H", exec() {}, length: 3 },
      /* F5 */ { name: "PUSH AF", exec() {}, length: 1 },
      /* F6 */ { name: "OR \\1H", exec() {}, length: 2 },
      /* F7 */ { name: "RST 30H", exec() {}, length: 1 },
      /* F8 */ { name: "RET M", exec() {}, length: 1 },
      /* F9 */ {
        name: "LD SP,HL",
        exec() {
          LD_RR_RR(z80, z80.regOffsets16.SP, z80.regOffsets16.HL)
        },
        length: 1
      },
      /* FA */ { name: "JP M,\\2\\1H", exec() {}, length: 3 },
      /* FB */ { name: "EI", exec() {}, length: 1 },
      /* FC */ { name: "CALL M,\\2\\1H", exec() {}, length: 3 },
      /* FD */ { name: "**** FD ****", exec() {}, length: 1 },
      /* FE */ { name: "CP \\1H", exec() {}, length: 2 },
      /* FF */ { name: "RST 38H", exec() {}, length: 1 },
    ]

    this.cb_instructions = [
      /* 00 */ { name: "RLC B", exec() {}, length: 2 },
      /* 01 */ { name: "RLC C", exec() {}, length: 2 },
      /* 02 */ { name: "RLC D", exec() {}, length: 2 },
      /* 03 */ { name: "RLC E", exec() {}, length: 2 },
      /* 04 */ { name: "RLC H", exec() {}, length: 2 },
      /* 05 */ { name: "RLC L", exec() {}, length: 2 },
      /* 06 */ { name: "RLC (HL)", exec() {}, length: 2 },
      /* 07 */ { name: "RLC A", exec() {}, length: 2 },
      /* 08 */ { name: "RRC B", exec() {}, length: 2 },
      /* 09 */ { name: "RRC C", exec() {}, length: 2 },
      /* 0A */ { name: "RRC D", exec() {}, length: 2 },
      /* 0B */ { name: "RRC E", exec() {}, length: 2 },
      /* 0C */ { name: "RRC H", exec() {}, length: 2 },
      /* 0D */ { name: "RRC L", exec() {}, length: 2 },
      /* 0D */ { name: "RRC (HL)", exec() {}, length: 2 },
      /* 0F */ { name: "RRC A", exec() {}, length: 2 },
      /* 10 */ { name: "RL B", exec() {}, length: 2 },
      /* 11 */ { name: "RL C", exec() {}, length: 2 },
      /* 12 */ { name: "RL D", exec() {}, length: 2 },
      /* 13 */ { name: "RL E", exec() {}, length: 2 },
      /* 14 */ { name: "RL H", exec() {}, length: 2 },
      /* 15 */ { name: "RL L", exec() {}, length: 2 },
      /* 16 */ { name: "RL (HL)", exec() {}, length: 2 },
      /* 17 */ { name: "RL A", exec() {}, length: 2 },
      /* 18 */ { name: "RR B", exec() {}, length: 2 },
      /* 19 */ { name: "RR C", exec() {}, length: 2 },
      /* 1A */ { name: "RR D", exec() {}, length: 2 },
      /* 1B */ { name: "RR E", exec() {}, length: 2 },
      /* 1C */ { name: "RR H", exec() {}, length: 2 },
      /* 1D */ { name: "RR L", exec() {}, length: 2 },
      /* 1E */ { name: "RR (HL)", exec() {}, length: 2 },
      /* 1F */ { name: "RR A", exec() {}, length: 2 },
      /* 20 */ { name: "SLA B", exec() {}, length: 2 },
      /* 21 */ { name: "SLA C", exec() {}, length: 2 },
      /* 22 */ { name: "SLA D", exec() {}, length: 2 },
      /* 23 */ { name: "SLA E", exec() {}, length: 2 },
      /* 24 */ { name: "SLA H", exec() {}, length: 2 },
      /* 25 */ { name: "SLA L", exec() {}, length: 2 },
      /* 26 */ { name: "SLA (HL)", exec() {}, length: 2 },
      /* 27 */ { name: "SLA A", exec() {}, length: 2 },
      /* 28 */ { name: "SRA B", exec() {}, length: 2 },
      /* 29 */ { name: "SRA C", exec() {}, length: 2 },
      /* 2A */ { name: "SRA D", exec() {}, length: 2 },
      /* 2B */ { name: "SRA E", exec() {}, length: 2 },
      /* 2C */ { name: "SRA H", exec() {}, length: 2 },
      /* 2D */ { name: "SRA L", exec() {}, length: 2 },
      /* 2E */ { name: "SRA (HL)", exec() {}, length: 2 },
      /* 2F */ { name: "SRA A", exec() {}, length: 2 },
      /* 30 */ { name: "SLL B", exec() {}, length: 2 },
      /* 31 */ { name: "SLL C", exec() {}, length: 2 },
      /* 32 */ { name: "SLL D", exec() {}, length: 2 },
      /* 33 */ { name: "SLL E", exec() {}, length: 2 },
      /* 34 */ { name: "SLL H", exec() {}, length: 2 },
      /* 35 */ { name: "SLL L", exec() {}, length: 2 },
      /* 36 */ { name: "SLL (HL)", exec() {}, length: 2 },
      /* 37 */ { name: "SLL A", exec() {}, length: 2 },
      /* 38 */ { name: "SRL B", exec() {}, length: 2 },
      /* 39 */ { name: "SRL C", exec() {}, length: 2 },
      /* 3A */ { name: "SRL D", exec() {}, length: 2 },
      /* 3B */ { name: "SRL E", exec() {}, length: 2 },
      /* 3C */ { name: "SRL H", exec() {}, length: 2 },
      /* 3D */ { name: "SRL L", exec() {}, length: 2 },
      /* 3E */ { name: "SRL (HL)", exec() {}, length: 2 },
      /* 3F */ { name: "SRL A", exec() {}, length: 2 },
      /* 40 */ { name: "BIT 0,B", exec() {}, length: 2 },
      /* 41 */ { name: "BIT 0,C", exec() {}, length: 2 },
      /* 42 */ { name: "BIT 0,D", exec() {}, length: 2 },
      /* 43 */ { name: "BIT 0,E", exec() {}, length: 2 },
      /* 44 */ { name: "BIT 0,H", exec() {}, length: 2 },
      /* 45 */ { name: "BIT 0,L", exec() {}, length: 2 },
      /* 46 */ { name: "BIT 0,(HL)", exec() {}, length: 2 },
      /* 47 */ { name: "BIT 0,A", exec() {}, length: 2 },
      /* 48 */ { name: "BIT 1,B", exec() {}, length: 2 },
      /* 49 */ { name: "BIT 1,C", exec() {}, length: 2 },
      /* 4A */ { name: "BIT 1,D", exec() {}, length: 2 },
      /* 4B */ { name: "BIT 1,E", exec() {}, length: 2 },
      /* 4C */ { name: "BIT 1,H", exec() {}, length: 2 },
      /* 4D */ { name: "BIT 1,L", exec() {}, length: 2 },
      /* 4E */ { name: "BIT 1,(HL)", exec() {}, length: 2 },
      /* 4F */ { name: "BIT 1,A", exec() {}, length: 2 },
      /* 50 */ { name: "BIT 2,B", exec() {}, length: 2 },
      /* 51 */ { name: "BIT 2,C", exec() {}, length: 2 },
      /* 52 */ { name: "BIT 2,D", exec() {}, length: 2 },
      /* 53 */ { name: "BIT 2,E", exec() {}, length: 2 },
      /* 54 */ { name: "BIT 2,H", exec() {}, length: 2 },
      /* 55 */ { name: "BIT 2,L", exec() {}, length: 2 },
      /* 56 */ { name: "BIT 2,(HL)", exec() {}, length: 2 },
      /* 57 */ { name: "BIT 2,A", exec() {}, length: 2 },
      /* 58 */ { name: "BIT 3,B", exec() {}, length: 2 },
      /* 59 */ { name: "BIT 3,C", exec() {}, length: 2 },
      /* 5A */ { name: "BIT 3,D", exec() {}, length: 2 },
      /* 5B */ { name: "BIT 3,E", exec() {}, length: 2 },
      /* 5C */ { name: "BIT 3,H", exec() {}, length: 2 },
      /* 5D */ { name: "BIT 3,L", exec() {}, length: 2 },
      /* 5E */ { name: "BIT 3,(HL)", exec() {}, length: 2 },
      /* 5F */ { name: "BIT 3,A", exec() {}, length: 2 },
      /* 60 */ { name: "BIT 4,B", exec() {}, length: 2 },
      /* 61 */ { name: "BIT 4,C", exec() {}, length: 2 },
      /* 62 */ { name: "BIT 4,D", exec() {}, length: 2 },
      /* 63 */ { name: "BIT 4,E", exec() {}, length: 2 },
      /* 64 */ { name: "BIT 4,H", exec() {}, length: 2 },
      /* 65 */ { name: "BIT 4,L", exec() {}, length: 2 },
      /* 66 */ { name: "BIT 4,(HL)", exec() {}, length: 2 },
      /* 67 */ { name: "BIT 4,A", exec() {}, length: 2 },
      /* 68 */ { name: "BIT 5,B", exec() {}, length: 2 },
      /* 69 */ { name: "BIT 5,C", exec() {}, length: 2 },
      /* 6A */ { name: "BIT 5,D", exec() {}, length: 2 },
      /* 6B */ { name: "BIT 5,E", exec() {}, length: 2 },
      /* 6C */ { name: "BIT 5,H", exec() {}, length: 2 },
      /* 6D */ { name: "BIT 5,L", exec() {}, length: 2 },
      /* 6E */ { name: "BIT 5,(HL)", exec() {}, length: 2 },
      /* 6F */ { name: "BIT 5,A", exec() {}, length: 2 },
      /* 70 */ { name: "BIT 6,B", exec() {}, length: 2 },
      /* 71 */ { name: "BIT 6,C", exec() {}, length: 2 },
      /* 72 */ { name: "BIT 6,D", exec() {}, length: 2 },
      /* 73 */ { name: "BIT 6,E", exec() {}, length: 2 },
      /* 74 */ { name: "BIT 6,H", exec() {}, length: 2 },
      /* 75 */ { name: "BIT 6,L", exec() {}, length: 2 },
      /* 76 */ { name: "BIT 6,(HL)", exec() {}, length: 2 },
      /* 77 */ { name: "BIT 6,A", exec() {}, length: 2 },
      /* 78 */ { name: "BIT 7,B", exec() {}, length: 2 },
      /* 79 */ { name: "BIT 7,C", exec() {}, length: 2 },
      /* 7A */ { name: "BIT 7,D", exec() {}, length: 2 },
      /* 7B */ { name: "BIT 7,E", exec() {}, length: 2 },
      /* 7C */ { name: "BIT 7,H", exec() {}, length: 2 },
      /* 7D */ { name: "BIT 7,L", exec() {}, length: 2 },
      /* 7E */ { name: "BIT 7,(HL)", exec() {}, length: 2 },
      /* 7F */ { name: "BIT 7,A", exec() {}, length: 2 },
      /* 80 */ { name: "RES 0,B", exec() {}, length: 2 },
      /* 81 */ { name: "RES 0,C", exec() {}, length: 2 },
      /* 82 */ { name: "RES 0,D", exec() {}, length: 2 },
      /* 83 */ { name: "RES 0,E", exec() {}, length: 2 },
      /* 84 */ { name: "RES 0,H", exec() {}, length: 2 },
      /* 85 */ { name: "RES 0,L", exec() {}, length: 2 },
      /* 86 */ { name: "RES 0,(HL)", exec() {}, length: 2 },
      /* 87 */ { name: "RES 0,A", exec() {}, length: 2 },
      /* 88 */ { name: "RES 1,B", exec() {}, length: 2 },
      /* 89 */ { name: "RES 1,C", exec() {}, length: 2 },
      /* 8A */ { name: "RES 1,D", exec() {}, length: 2 },
      /* 8B */ { name: "RES 1,E", exec() {}, length: 2 },
      /* 8C */ { name: "RES 1,H", exec() {}, length: 2 },
      /* 8D */ { name: "RES 1,L", exec() {}, length: 2 },
      /* 8E */ { name: "RES 1,(HL)", exec() {}, length: 2 },
      /* 8F */ { name: "RES 1,A", exec() {}, length: 2 },
      /* 90 */ { name: "RES 2,B", exec() {}, length: 2 },
      /* 91 */ { name: "RES 2,C", exec() {}, length: 2 },
      /* 92 */ { name: "RES 2,D", exec() {}, length: 2 },
      /* 93 */ { name: "RES 2,E", exec() {}, length: 2 },
      /* 94 */ { name: "RES 2,H", exec() {}, length: 2 },
      /* 95 */ { name: "RES 2,L", exec() {}, length: 2 },
      /* 96 */ { name: "RES 2,(HL)", exec() {}, length: 2 },
      /* 97 */ { name: "RES 2,A", exec() {}, length: 2 },
      /* 98 */ { name: "RES 3,B", exec() {}, length: 2 },
      /* 99 */ { name: "RES 3,C", exec() {}, length: 2 },
      /* 9A */ { name: "RES 3,D", exec() {}, length: 2 },
      /* 9B */ { name: "RES 3,E", exec() {}, length: 2 },
      /* 9C */ { name: "RES 3,H", exec() {}, length: 2 },
      /* 9D */ { name: "RES 3,L", exec() {}, length: 2 },
      /* 9E */ { name: "RES 3,(HL)", exec() {}, length: 2 },
      /* 9F */ { name: "RES 3,A", exec() {}, length: 2 },
      /* A0 */ { name: "RES 4,B", exec() {}, length: 2 },
      /* A1 */ { name: "RES 4,C", exec() {}, length: 2 },
      /* A2 */ { name: "RES 4,D", exec() {}, length: 2 },
      /* A3 */ { name: "RES 4,E", exec() {}, length: 2 },
      /* A4 */ { name: "RES 4,H", exec() {}, length: 2 },
      /* A5 */ { name: "RES 4,L", exec() {}, length: 2 },
      /* A6 */ { name: "RES 4,(HL)", exec() {}, length: 2 },
      /* A7 */ { name: "RES 4,A", exec() {}, length: 2 },
      /* A8 */ { name: "RES 5,B", exec() {}, length: 2 },
      /* A9 */ { name: "RES 5,C", exec() {}, length: 2 },
      /* AA */ { name: "RES 5,D", exec() {}, length: 2 },
      /* AB */ { name: "RES 5,E", exec() {}, length: 2 },
      /* AC */ { name: "RES 5,H", exec() {}, length: 2 },
      /* AD */ { name: "RES 5,L", exec() {}, length: 2 },
      /* AE */ { name: "RES 5,(HL)", exec() {}, length: 2 },
      /* AF */ { name: "RES 5,A", exec() {}, length: 2 },
      /* B0 */ { name: "RES 6,B", exec() {}, length: 2 },
      /* B1 */ { name: "RES 6,C", exec() {}, length: 2 },
      /* B2 */ { name: "RES 6,D", exec() {}, length: 2 },
      /* B3 */ { name: "RES 6,E", exec() {}, length: 2 },
      /* B4 */ { name: "RES 6,H", exec() {}, length: 2 },
      /* B5 */ { name: "RES 6,L", exec() {}, length: 2 },
      /* B6 */ { name: "RES 6,(HL)", exec() {}, length: 2 },
      /* B7 */ { name: "RES 6,A", exec() {}, length: 2 },
      /* B8 */ { name: "RES 7,B", exec() {}, length: 2 },
      /* B9 */ { name: "RES 7,C", exec() {}, length: 2 },
      /* BA */ { name: "RES 7,D", exec() {}, length: 2 },
      /* BB */ { name: "RES 7,E", exec() {}, length: 2 },
      /* BC */ { name: "RES 7,H", exec() {}, length: 2 },
      /* BD */ { name: "RES 7,L", exec() {}, length: 2 },
      /* BE */ { name: "RES 7,(HL)", exec() {}, length: 2 },
      /* BF */ { name: "RES 7,A", exec() {}, length: 2 },
      /* C0 */ { name: "SET 0,B", exec() {}, length: 2 },
      /* C1 */ { name: "SET 0,C", exec() {}, length: 2 },
      /* C2 */ { name: "SET 0,D", exec() {}, length: 2 },
      /* C3 */ { name: "SET 0,E", exec() {}, length: 2 },
      /* C4 */ { name: "SET 0,H", exec() {}, length: 2 },
      /* C5 */ { name: "SET 0,L", exec() {}, length: 2 },
      /* C6 */ { name: "SET 0,(HL)", exec() {}, length: 2 },
      /* C7 */ { name: "SET 0,A", exec() {}, length: 2 },
      /* C8 */ { name: "SET 1,B", exec() {}, length: 2 },
      /* C9 */ { name: "SET 1,C", exec() {}, length: 2 },
      /* CA */ { name: "SET 1,D", exec() {}, length: 2 },
      /* CB */ { name: "SET 1,E", exec() {}, length: 2 },
      /* CC */ { name: "SET 1,H", exec() {}, length: 2 },
      /* CD */ { name: "SET 1,L", exec() {}, length: 2 },
      /* CE */ { name: "SET 1,(HL)", exec() {}, length: 2 },
      /* CF */ { name: "SET 1,A", exec() {}, length: 2 },
      /* D0 */ { name: "SET 2,B", exec() {}, length: 2 },
      /* D1 */ { name: "SET 2,C", exec() {}, length: 2 },
      /* D2 */ { name: "SET 2,D", exec() {}, length: 2 },
      /* D3 */ { name: "SET 2,E", exec() {}, length: 2 },
      /* D4 */ { name: "SET 2,H", exec() {}, length: 2 },
      /* D5 */ { name: "SET 2,L", exec() {}, length: 2 },
      /* D6 */ { name: "SET 2,(HL)", exec() {}, length: 2 },
      /* D7 */ { name: "SET 2,A", exec() {}, length: 2 },
      /* D8 */ { name: "SET 3,B", exec() {}, length: 2 },
      /* D9 */ { name: "SET 3,C", exec() {}, length: 2 },
      /* DA */ { name: "SET 3,D", exec() {}, length: 2 },
      /* DB */ { name: "SET 3,E", exec() {}, length: 2 },
      /* DC */ { name: "SET 3,H", exec() {}, length: 2 },
      /* DD */ { name: "SET 3,L", exec() {}, length: 2 },
      /* DE */ { name: "SET 3,(HL)", exec() {}, length: 2 },
      /* DF */ { name: "SET 3,A", exec() {}, length: 2 },
      /* E0 */ { name: "SET 4,B", exec() {}, length: 2 },
      /* E1 */ { name: "SET 4,C", exec() {}, length: 2 },
      /* E2 */ { name: "SET 4,D", exec() {}, length: 2 },
      /* E3 */ { name: "SET 4,E", exec() {}, length: 2 },
      /* E4 */ { name: "SET 4,H", exec() {}, length: 2 },
      /* E5 */ { name: "SET 4,L", exec() {}, length: 2 },
      /* E6 */ { name: "SET 4,(HL)", exec() {}, length: 2 },
      /* E7 */ { name: "SET 4,A", exec() {}, length: 2 },
      /* E8 */ { name: "SET 5,B", exec() {}, length: 2 },
      /* E9 */ { name: "SET 5,C", exec() {}, length: 2 },
      /* EA */ { name: "SET 5,D", exec() {}, length: 2 },
      /* EB */ { name: "SET 5,E", exec() {}, length: 2 },
      /* EC */ { name: "SET 5,H", exec() {}, length: 2 },
      /* ED */ { name: "SET 5,L", exec() {}, length: 2 },
      /* EE */ { name: "SET 5,(HL)", exec() {}, length: 2 },
      /* EF */ { name: "SET 5,A", exec() {}, length: 2 },
      /* F0 */ { name: "SET 6,B", exec() {}, length: 2 },
      /* F1 */ { name: "SET 6,C", exec() {}, length: 2 },
      /* F2 */ { name: "SET 6,D", exec() {}, length: 2 },
      /* F3 */ { name: "SET 6,E", exec() {}, length: 2 },
      /* F4 */ { name: "SET 6,H", exec() {}, length: 2 },
      /* F5 */ { name: "SET 6,L", exec() {}, length: 2 },
      /* F6 */ { name: "SET 6,(HL)", exec() {}, length: 2 },
      /* F7 */ { name: "SET 6,A", exec() {}, length: 2 },
      /* F8 */ { name: "SET 7,B", exec() {}, length: 2 },
      /* F9 */ { name: "SET 7,C", exec() {}, length: 2 },
      /* FA */ { name: "SET 7,D", exec() {}, length: 2 },
      /* FB */ { name: "SET 7,E", exec() {}, length: 2 },
      /* FC */ { name: "SET 7,H", exec() {}, length: 2 },
      /* FD */ { name: "SET 7,L", exec() {}, length: 2 },
      /* FE */ { name: "SET 7,(HL)", exec() {}, length: 2 },
      /* FF */ { name: "SET 7,A", exec() {}, length: 2 },
    ]

    this.ed_instructions = [
      /* 00 */ { name: "", exec() {}, length: 2 },
      /* 01 */ { name: "", exec() {}, length: 2 },
      /* 02 */ { name: "", exec() {}, length: 2 },
      /* 03 */ { name: "", exec() {}, length: 2 },
      /* 04 */ { name: "", exec() {}, length: 2 },
      /* 05 */ { name: "", exec() {}, length: 2 },
      /* 06 */ { name: "", exec() {}, length: 2 },
      /* 07 */ { name: "", exec() {}, length: 2 },
      /* 08 */ { name: "", exec() {}, length: 2 },
      /* 09 */ { name: "", exec() {}, length: 2 },
      /* 0A */ { name: "", exec() {}, length: 2 },
      /* 0B */ { name: "", exec() {}, length: 2 },
      /* 0C */ { name: "", exec() {}, length: 2 },
      /* 0D */ { name: "", exec() {}, length: 2 },
      /* 0D */ { name: "", exec() {}, length: 2 },
      /* 0F */ { name: "", exec() {}, length: 2 },
      /* 10 */ { name: "", exec() {}, length: 2 },
      /* 11 */ { name: "", exec() {}, length: 2 },
      /* 12 */ { name: "", exec() {}, length: 2 },
      /* 13 */ { name: "", exec() {}, length: 2 },
      /* 14 */ { name: "", exec() {}, length: 2 },
      /* 15 */ { name: "", exec() {}, length: 2 },
      /* 16 */ { name: "", exec() {}, length: 2 },
      /* 17 */ { name: "", exec() {}, length: 2 },
      /* 18 */ { name: "", exec() {}, length: 2 },
      /* 19 */ { name: "", exec() {}, length: 2 },
      /* 1A */ { name: "", exec() {}, length: 2 },
      /* 1B */ { name: "", exec() {}, length: 2 },
      /* 1C */ { name: "", exec() {}, length: 2 },
      /* 1D */ { name: "", exec() {}, length: 2 },
      /* 1E */ { name: "", exec() {}, length: 2 },
      /* 1F */ { name: "", exec() {}, length: 2 },
      /* 20 */ { name: "", exec() {}, length: 2 },
      /* 21 */ { name: "", exec() {}, length: 2 },
      /* 22 */ { name: "", exec() {}, length: 2 },
      /* 23 */ { name: "", exec() {}, length: 2 },
      /* 24 */ { name: "", exec() {}, length: 2 },
      /* 25 */ { name: "", exec() {}, length: 2 },
      /* 26 */ { name: "", exec() {}, length: 2 },
      /* 27 */ { name: "", exec() {}, length: 2 },
      /* 28 */ { name: "", exec() {}, length: 2 },
      /* 29 */ { name: "", exec() {}, length: 2 },
      /* 2A */ { name: "", exec() {}, length: 2 },
      /* 2B */ { name: "", exec() {}, length: 2 },
      /* 2C */ { name: "", exec() {}, length: 2 },
      /* 2D */ { name: "", exec() {}, length: 2 },
      /* 2E */ { name: "", exec() {}, length: 2 },
      /* 2F */ { name: "", exec() {}, length: 2 },
      /* 30 */ { name: "", exec() {}, length: 2 },
      /* 31 */ { name: "", exec() {}, length: 2 },
      /* 32 */ { name: "", exec() {}, length: 2 },
      /* 33 */ { name: "", exec() {}, length: 2 },
      /* 34 */ { name: "", exec() {}, length: 2 },
      /* 35 */ { name: "", exec() {}, length: 2 },
      /* 36 */ { name: "", exec() {}, length: 2 },
      /* 37 */ { name: "", exec() {}, length: 2 },
      /* 38 */ { name: "", exec() {}, length: 2 },
      /* 39 */ { name: "", exec() {}, length: 2 },
      /* 3A */ { name: "", exec() {}, length: 2 },
      /* 3B */ { name: "", exec() {}, length: 2 },
      /* 3C */ { name: "", exec() {}, length: 2 },
      /* 3D */ { name: "", exec() {}, length: 2 },
      /* 3E */ { name: "", exec() {}, length: 2 },
      /* 3F */ { name: "", exec() {}, length: 2 },
      /* 40 */ { name: "IN B,(C)", exec() {}, length: 2 },
      /* 41 */ { name: "OUT (C),B", exec() {}, length: 2 },
      /* 42 */ { name: "SBC HL,BC", exec() {}, length: 2 },
      /* 43 */ { name: "LD (\\2\\1H),BC", exec() {}, length: 4 },
      /* 44 */ { name: "NEG", exec() {}, length: 2 },
      /* 45 */ { name: "RETN", exec() {}, length: 2 },
      /* 46 */ { name: "IM 0", exec() {}, length: 2 },
      /* 47 */ { name: "LD I,A", exec() {}, length: 2 },
      /* 48 */ { name: "IN C,(C)", exec() {}, length: 2 },
      /* 49 */ { name: "OUT (C),C", exec() {}, length: 2 },
      /* 4A */ { name: "ADC HL,BC", exec() {}, length: 2 },
      /* 4B */ { name: "LD BC,(\\2\\1H)", exec() {}, length: 4 },
      /* 4C */ { name: "NEG", exec() {}, length: 2 },
      /* 4D */ { name: "RETI", exec() {}, length: 2 },
      /* 4E */ { name: "IM 0/1", exec() {}, length: 2 },
      /* 4F */ { name: "LD R,A", exec() {}, length: 2 },
      /* 50 */ { name: "IN D,(C)", exec() {}, length: 2 },
      /* 51 */ { name: "OUT (C),D", exec() {}, length: 2 },
      /* 52 */ { name: "SBC HL,DE", exec() {}, length: 2 },
      /* 53 */ { name: "LD (\\2\\1H),DE", exec() {}, length: 4 },
      /* 54 */ { name: "NEG", exec() {}, length: 2 },
      /* 55 */ { name: "RETN", exec() {}, length: 2 },
      /* 56 */ { name: "IM 1", exec() {}, length: 2 },
      /* 57 */ { name: "LD A,I", exec() {}, length: 2 },
      /* 58 */ { name: "IN E,(C)", exec() {}, length: 2 },
      /* 59 */ { name: "OUT (C),E", exec() {}, length: 2 },
      /* 5A */ { name: "ADC HL,DE", exec() {}, length: 2 },
      /* 5B */ { name: "LD DE,(\\2\\1H)", exec() {}, length: 4 },
      /* 5C */ { name: "NEG", exec() {}, length: 2 },
      /* 5D */ { name: "RETN", exec() {}, length: 2 },
      /* 5E */ { name: "IM 2", exec() {}, length: 2 },
      /* 5F */ { name: "LD A,R", exec() {}, length: 2 },
      /* 60 */ { name: "IN H,(C)", exec() {}, length: 2 },
      /* 61 */ { name: "OUT (C),H", exec() {}, length: 2 },
      /* 62 */ { name: "SBC HL,HL", exec() {}, length: 2 },
      /* 63 */ { name: "LD (\\2\\1H),HL", exec() {}, length: 4 },
      /* 64 */ { name: "NEG", exec() {}, length: 2 },
      /* 65 */ { name: "RETN", exec() {}, length: 2 },
      /* 66 */ { name: "IM 0", exec() {}, length: 2 },
      /* 67 */ { name: "RRD", exec() {}, length: 2 },
      /* 68 */ { name: "IN L,(C)", exec() {}, length: 2 },
      /* 69 */ { name: "OUT (C),L", exec() {}, length: 2 },
      /* 6A */ { name: "ADC HL,HL", exec() {}, length: 2 },
      /* 6B */ { name: "LD HL,(\\2\\1H)", exec() {}, length: 4 },
      /* 6C */ { name: "NEG", exec() {}, length: 2 },
      /* 6D */ { name: "RETN", exec() {}, length: 2 },
      /* 6E */ { name: "IM 0/1", exec() {}, length: 2 },
      /* 6F */ { name: "RLD", exec() {}, length: 2 },
      /* 70 */ { name: "IN F,(C) / IN (C)", exec() {}, length: 2 },
      /* 71 */ { name: "OUT (C),0", exec() {}, length: 2 },
      /* 72 */ { name: "SBC HL,SP", exec() {}, length: 2 },
      /* 73 */ { name: "LD (\\2\\1H),SP", exec() {}, length: 4 },
      /* 74 */ { name: "NEG", exec() {}, length: 2 },
      /* 75 */ { name: "RETN", exec() {}, length: 2 },
      /* 76 */ { name: "IM 1", exec() {}, length: 2 },
      /* 77 */ { name: "", exec() {}, length: 2 },
      /* 78 */ { name: "IN A,(C)", exec() {}, length: 2 },
      /* 79 */ { name: "OUT (C),A", exec() {}, length: 2 },
      /* 7A */ { name: "ADC HL,SP", exec() {}, length: 2 },
      /* 7B */ { name: "LD SP,(\\2\\1H)", exec() {}, length: 4 },
      /* 7C */ { name: "NEG", exec() {}, length: 2 },
      /* 7D */ { name: "RETN", exec() {}, length: 2 },
      /* 7E */ { name: "IM 2", exec() {}, length: 2 },
      /* 7F */ { name: "", exec() {}, length: 2 },
      /* 80 */ { name: "", exec() {}, length: 2 },
      /* 81 */ { name: "", exec() {}, length: 2 },
      /* 82 */ { name: "", exec() {}, length: 2 },
      /* 83 */ { name: "", exec() {}, length: 2 },
      /* 84 */ { name: "", exec() {}, length: 2 },
      /* 85 */ { name: "", exec() {}, length: 2 },
      /* 86 */ { name: "", exec() {}, length: 2 },
      /* 87 */ { name: "", exec() {}, length: 2 },
      /* 88 */ { name: "", exec() {}, length: 2 },
      /* 89 */ { name: "", exec() {}, length: 2 },
      /* 8A */ { name: "", exec() {}, length: 2 },
      /* 8B */ { name: "", exec() {}, length: 2 },
      /* 8C */ { name: "", exec() {}, length: 2 },
      /* 8D */ { name: "", exec() {}, length: 2 },
      /* 8E */ { name: "", exec() {}, length: 2 },
      /* 8F */ { name: "", exec() {}, length: 2 },
      /* 90 */ { name: "", exec() {}, length: 2 },
      /* 91 */ { name: "", exec() {}, length: 2 },
      /* 92 */ { name: "", exec() {}, length: 2 },
      /* 93 */ { name: "", exec() {}, length: 2 },
      /* 94 */ { name: "", exec() {}, length: 2 },
      /* 95 */ { name: "", exec() {}, length: 2 },
      /* 96 */ { name: "", exec() {}, length: 2 },
      /* 97 */ { name: "", exec() {}, length: 2 },
      /* 98 */ { name: "", exec() {}, length: 2 },
      /* 99 */ { name: "", exec() {}, length: 2 },
      /* 9A */ { name: "", exec() {}, length: 2 },
      /* 9B */ { name: "", exec() {}, length: 2 },
      /* 9C */ { name: "", exec() {}, length: 2 },
      /* 9D */ { name: "", exec() {}, length: 2 },
      /* 9E */ { name: "", exec() {}, length: 2 },
      /* 9F */ { name: "", exec() {}, length: 2 },
      /* A0 */ { name: "LDI", exec() {}, length: 2 },
      /* A1 */ { name: "CPI", exec() {}, length: 2 },
      /* A2 */ { name: "INI", exec() {}, length: 2 },
      /* A3 */ { name: "OUTI", exec() {}, length: 2 },
      /* A4 */ { name: "", exec() {}, length: 2 },
      /* A5 */ { name: "", exec() {}, length: 2 },
      /* A6 */ { name: "", exec() {}, length: 2 },
      /* A7 */ { name: "", exec() {}, length: 2 },
      /* A8 */ { name: "LDD", exec() {}, length: 2 },
      /* A9 */ { name: "CPD", exec() {}, length: 2 },
      /* AA */ { name: "IND", exec() {}, length: 2 },
      /* AB */ { name: "OUTD", exec() {}, length: 2 },
      /* AC */ { name: "", exec() {}, length: 2 },
      /* AD */ { name: "", exec() {}, length: 2 },
      /* AE */ { name: "", exec() {}, length: 2 },
      /* AF */ { name: "", exec() {}, length: 2 },
      /* B0 */ { name: "LDIR", exec() {}, length: 2 },
      /* B1 */ { name: "CPIR", exec() {}, length: 2 },
      /* B2 */ { name: "INIR", exec() {}, length: 2 },
      /* B3 */ { name: "OTIR", exec() {}, length: 2 },
      /* B4 */ { name: "", exec() {}, length: 2 },
      /* B5 */ { name: "", exec() {}, length: 2 },
      /* B6 */ { name: "", exec() {}, length: 2 },
      /* B7 */ { name: "", exec() {}, length: 2 },
      /* B8 */ { name: "LDDR", exec() {}, length: 2 },
      /* B9 */ { name: "CPDR", exec() {}, length: 2 },
      /* BA */ { name: "INDR", exec() {}, length: 2 },
      /* BB */ { name: "OTDR", exec() {}, length: 2 },
      /* BC */ { name: "", exec() {}, length: 2 },
      /* BD */ { name: "", exec() {}, length: 2 },
      /* BE */ { name: "", exec() {}, length: 2 },
      /* BF */ { name: "", exec() {}, length: 2 },
      /* C0 */ { name: "", exec() {}, length: 2 },
      /* C1 */ { name: "", exec() {}, length: 2 },
      /* C2 */ { name: "", exec() {}, length: 2 },
      /* C3 */ { name: "", exec() {}, length: 2 },
      /* C4 */ { name: "", exec() {}, length: 2 },
      /* C5 */ { name: "", exec() {}, length: 2 },
      /* C6 */ { name: "", exec() {}, length: 2 },
      /* C7 */ { name: "", exec() {}, length: 2 },
      /* C8 */ { name: "", exec() {}, length: 2 },
      /* C9 */ { name: "", exec() {}, length: 2 },
      /* CA */ { name: "", exec() {}, length: 2 },
      /* CB */ { name: "", exec() {}, length: 2 },
      /* CC */ { name: "", exec() {}, length: 2 },
      /* CD */ { name: "", exec() {}, length: 2 },
      /* CE */ { name: "", exec() {}, length: 2 },
      /* CF */ { name: "", exec() {}, length: 2 },
      /* D0 */ { name: "", exec() {}, length: 2 },
      /* D1 */ { name: "", exec() {}, length: 2 },
      /* D2 */ { name: "", exec() {}, length: 2 },
      /* D3 */ { name: "", exec() {}, length: 2 },
      /* D4 */ { name: "", exec() {}, length: 2 },
      /* D5 */ { name: "", exec() {}, length: 2 },
      /* D6 */ { name: "", exec() {}, length: 2 },
      /* D7 */ { name: "", exec() {}, length: 2 },
      /* D8 */ { name: "", exec() {}, length: 2 },
      /* D9 */ { name: "", exec() {}, length: 2 },
      /* DA */ { name: "", exec() {}, length: 2 },
      /* DB */ { name: "", exec() {}, length: 2 },
      /* DC */ { name: "", exec() {}, length: 2 },
      /* DD */ { name: "", exec() {}, length: 2 },
      /* DE */ { name: "", exec() {}, length: 2 },
      /* DF */ { name: "", exec() {}, length: 2 },
      /* E0 */ { name: "", exec() {}, length: 2 },
      /* E1 */ { name: "", exec() {}, length: 2 },
      /* E2 */ { name: "", exec() {}, length: 2 },
      /* E3 */ { name: "", exec() {}, length: 2 },
      /* E4 */ { name: "", exec() {}, length: 2 },
      /* E5 */ { name: "", exec() {}, length: 2 },
      /* E6 */ { name: "", exec() {}, length: 2 },
      /* E7 */ { name: "", exec() {}, length: 2 },
      /* E8 */ { name: "", exec() {}, length: 2 },
      /* E9 */ { name: "", exec() {}, length: 2 },
      /* EA */ { name: "", exec() {}, length: 2 },
      /* EB */ { name: "", exec() {}, length: 2 },
      /* EC */ { name: "", exec() {}, length: 2 },
      /* ED */ { name: "", exec() {}, length: 2 },
      /* EE */ { name: "", exec() {}, length: 2 },
      /* EF */ { name: "", exec() {}, length: 2 },
      /* F0 */ { name: "", exec() {}, length: 2 },
      /* F1 */ { name: "", exec() {}, length: 2 },
      /* F2 */ { name: "", exec() {}, length: 2 },
      /* F3 */ { name: "", exec() {}, length: 2 },
      /* F4 */ { name: "", exec() {}, length: 2 },
      /* F5 */ { name: "", exec() {}, length: 2 },
      /* F6 */ { name: "", exec() {}, length: 2 },
      /* F7 */ { name: "", exec() {}, length: 2 },
      /* F8 */ { name: "", exec() {}, length: 2 },
      /* F9 */ { name: "", exec() {}, length: 2 },
      /* FA */ { name: "", exec() {}, length: 2 },
      /* FB */ { name: "", exec() {}, length: 2 },
      /* FC */ { name: "", exec() {}, length: 2 },
      /* FD */ { name: "", exec() {}, length: 2 },
      /* FE */ { name: "", exec() {}, length: 2 },
      /* FF */ { name: "", exec() {}, length: 2 },
    ]

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
    if(!this.instructions[opcode].exec()) {
      this.reg16[this.regOffsets16.PC] += this.instructions[opcode].length
    }
  }
}
