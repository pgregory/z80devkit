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

mmu.writeByte(0x100, 0x3E)
mmu.writeByte(0x101, 0x00)
mmu.writeByte(0x102, 0x06)
mmu.writeByte(0x103, 0x05)
mmu.writeByte(0x104, 0x3C)
mmu.writeByte(0x105, 0x10)
mmu.writeByte(0x106, 0xFD)
mmu.writeByte(0x107, 0x00)
mmu.writeByte(0x108, 0x00)

z80.setRegister16("PC", 0x100)

render(<App z80={z80}/>, document.getElementById('app'))
