import React from 'react'
import {render} from 'react-dom'

import './style.css'
import Z80 from './Z80.js'
import MMU from './MMU.js'

import App from './components/App.jsx'

import zexall from '../zexall.bin'

const mmu = new MMU()
const z80 = new Z80(mmu)

const code = new Uint8Array(zexall)
mmu.copyFrom(code, 0x100)

// Simple CP/M routines.
mmu.writeByte(0x0005, 0xED)
mmu.writeByte(0x0006, 0x00)
mmu.writeByte(0x0007, 0xC9)

/*mmu.writeByte(0x100, 0x3E)
mmu.writeByte(0x101, 0x04)
mmu.writeByte(0x102, 0x67)
mmu.writeByte(0x103, 0x6F)
mmu.writeByte(0x104, 0xE5)
mmu.writeByte(0x105, 0xFD)
mmu.writeByte(0x106, 0xE1)*/

/*mmu.writeByte(0x110, 0x3E)
mmu.writeByte(0x111, 0x01)
mmu.writeByte(0x112, 0x06)
mmu.writeByte(0x113, 0x08)
mmu.writeByte(0x114, 0x17)
mmu.writeByte(0x115, 0x10)
mmu.writeByte(0x116, 0xFD)
mmu.writeByte(0x117, 0xC9)*/

z80.setRegister16("PC", 0x100)

render(<App z80={z80}/>, document.getElementById('app'))
