import React from 'react'
import {render} from 'react-dom'

import './style.css'
import Z80 from './Z80.js'
import App from './components/App.jsx'

render(<App z80={new Z80()}/>, document.getElementById('app'))
