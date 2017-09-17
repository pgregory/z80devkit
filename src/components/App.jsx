import React from 'react'
import update from 'immutability-helper'

import Registers from './Registers.jsx'
import Flags from './Flags.jsx'

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      registers: this.getRegisters(),
      flags: this.getFlags(),
      z80: this.props.z80,
    }

    this.handleClick = this.handleClick.bind(this)
  }

  getRegisters() {
    return {
      A: this.props.z80.getRegister8("A"), 
      B: this.props.z80.getRegister8("B"), 
      C: this.props.z80.getRegister8("C"), 
      D: this.props.z80.getRegister8("D"), 
      E: this.props.z80.getRegister8("E"), 
      H: this.props.z80.getRegister8("H"), 
      L: this.props.z80.getRegister8("L"), 
      A_: this.props.z80.getRegister8("A_"), 
      B_: this.props.z80.getRegister8("B_"), 
      C_: this.props.z80.getRegister8("C_"), 
      D_: this.props.z80.getRegister8("D_"), 
      E_: this.props.z80.getRegister8("E_"), 
      H_: this.props.z80.getRegister8("H_"), 
      L_: this.props.z80.getRegister8("L_"), 
      IX: this.props.z80.getRegister16("IX"), 
      IY: this.props.z80.getRegister16("IY"), 
      I: this.props.z80.getRegister8("I"), 
      R: this.props.z80.getRegister8("R"), 
      SP: this.props.z80.getRegister16("SP"), 
      PC: this.props.z80.getRegister16("PC"), 
    }
  }

  getFlags() {
    return {
      S: this.props.z80.getFlag("S"),
      Z: this.props.z80.getFlag("Z"),
      Y: this.props.z80.getFlag("Y"),
      H: this.props.z80.getFlag("H"),
      X: this.props.z80.getFlag("X"),
      P: this.props.z80.getFlag("P"),
      N: this.props.z80.getFlag("N"),
      C: this.props.z80.getFlag("C"),
    }
  }

  handleClick(e) {
    this.props.z80.stepExecution()
    this.setState(prevState => ({
      registers: update(prevState.registers, {$set: this.getRegisters()}),
      flags: update(prevState.flags, {$set: this.getFlags()}),
    }))
  }

  render() {
    const regStyle = {
      border: '1px solid black',
    }
    const panelStyle = {
      display: 'flex',
      flexDirection: 'row'
    }
    const columnStyle = {
      display: 'flex',
      flexDirection: 'column'
    }
    return (
      <div style={panelStyle}>
        <div style={columnStyle}>
          <div style={regStyle}>
            <Registers registers = {this.state.registers} z80 = {this.state.z80}/>
          </div>
          <div style={regStyle}>
            <Flags flags = {this.state.flags}/>
          </div>
          <button onClick={this.handleClick}>Step</button>
        </div>
        <div style={columnStyle}>
          <p>Disassembly</p>
        </div>
      </div>
    )
  }
}

export default App
