import React from 'react'
import {render} from 'react-dom'

import './style.css'
import Z80 from './Z80.js'
import MMU from './MMU.js'

import App from './components/App.jsx'

const mmu = new MMU()
const z80 = new Z80(mmu)

mmu.writeByte(0, 0x06)
mmu.writeByte(1, 0x47)
mmu.writeByte(2, 0x3E)
mmu.writeByte(3, 0x20)
mmu.writeByte(4, 0x80)
mmu.writeByte(5, 0xD2)
mmu.writeByte(6, 0x04)
mmu.writeByte(7, 0x00)

render(<App z80={z80}/>, document.getElementById('app'))
