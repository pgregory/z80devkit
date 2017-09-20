import React from 'react'
import update from 'immutability-helper'

import Registers from './Registers.jsx'
import Flags from './Flags.jsx'
import Disassembly from './Disassembly.jsx'

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      registers: this.getRegisters(),
      flags: this.props.z80.flags,
      z80: this.props.z80,
    }

    this.handleClick = this.handleClick.bind(this)
  }

  getRegisters() {
    return {
      A: this.props.z80.getRegister8("A"), 
      BC: this.props.z80.getRegister16("BC"), 
      DE: this.props.z80.getRegister16("DE"), 
      HL: this.props.z80.getRegister16("HL"), 
      A_: this.props.z80.getRegister8("A_"), 
      BC_: this.props.z80.getRegister16("BC_"), 
      DE_: this.props.z80.getRegister16("DE_"), 
      HL_: this.props.z80.getRegister16("HL_"), 
      IX: this.props.z80.getRegister16("IX"), 
      IY: this.props.z80.getRegister16("IY"), 
      I: this.props.z80.getRegister8("I"), 
      R: this.props.z80.getRegister8("R"), 
      SP: this.props.z80.getRegister16("SP"), 
      PC: this.props.z80.getRegister16("PC"), 
    }
  }

  handleClick(e) {
    this.props.z80.stepExecution()
    this.setState(prevState => ({
      registers: update(prevState.registers, {$set: this.getRegisters()}),
      flags: update(prevState.flags, {$set: this.props.z80.flags}),
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
          <Disassembly address={this.state.registers.PC} z80={this.state.z80}/>
        </div>
      </div>
    )
  }
}

export default App
