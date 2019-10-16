import React from 'react'
import update from 'immutability-helper'

import Registers from './Registers.jsx'
import Flags from './Flags.jsx'
import Disassembly from './Disassembly.jsx'
import Stack from './Stack.jsx'
import {hexWord} from '../utilities.js'

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      registers: this.getRegisters(),
      flags: this.props.z80.flags,
      altFlags: this.props.z80.altFlags,
      z80: this.props.z80,
			breakpoints: [ ],
			newBreakpoint: "0200",
    }

    this.handleStep = this.handleStep.bind(this)
    this.handleRun = this.handleRun.bind(this)
    this.runStep = this.runStep.bind(this)
    this.handleAddBreakpoint = this.handleAddBreakpoint.bind(this)
    this.handleChangeBreakpoint = this.handleChangeBreakpoint.bind(this)

    this.timer = null
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

  handleStep(e) {
    this.props.z80.stepExecution()
    this.setState(prevState => ({
      registers: update(prevState.registers, {$set: this.getRegisters()}),
      flags: update(prevState.flags, {$set: this.props.z80.flags}),
    }))
  }

  handleRun(e) {
    if(this.timer !== null) {
      // Stop execution
      clearInterval(this.timer)
      this.timer = null
    } else {
      // Start execution
      this.timer = setInterval(this.runStep, 5)
    }
  }

	handleChangeBreakpoint(e) {
		this.setState({newBreakpoint: e.target.value})
	}

  handleAddBreakpoint(e) {
		var address = parseInt(this.state.newBreakpoint, 16)
		this.setState(prevState => ({
			breakpoints: [...prevState.breakpoints, address]
		}))
  }
  
  runStep() {
		// Check for any breakpoints
		if(this.state.breakpoints.includes(this.props.z80.getRegister16("PC")) && this.time !== null) {
      // Stop execution
      clearInterval(this.timer)
      this.timer = null
		} else {
			this.props.z80.stepExecution()
			this.setState(prevState => ({
				registers: update(prevState.registers, {$set: this.getRegisters()}),
				flags: update(prevState.flags, {$set: this.props.z80.flags}),
			}))
		}
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
    const breakpointStyle = {
      fontFamily: "monospace",
      fontSize: 12
    }
		const breakpoints = []
		for(const[index, value] of this.state.breakpoints.entries()) {
			breakpoints.push(<li style={breakpointStyle} key={index}>{hexWord(value)}</li>)
		}
    return (
      <div style={panelStyle}>
        <div style={columnStyle}>
          <div style={regStyle}>
            <Registers registers = {this.state.registers} z80 = {this.state.z80}/>
          </div>
          <div style={regStyle}>
            <Flags flags={this.state.flags} altFlags={this.state.altFlags}/>
          </div>
          <button onClick={this.handleStep}>Step</button>
          <button onClick={this.handleRun}>Run</button>
        </div>
        <div style={columnStyle}>
          <Disassembly address={this.state.registers.PC} z80={this.state.z80}/>
        </div>
        <div style={columnStyle}>
          <Stack address={this.state.registers.SP} z80={this.state.z80}/>
        </div>
        <div style={columnStyle}>
          <Stack address={this.state.registers.HL} z80={this.state.z80}/>
        </div>
        <div style={columnStyle}>
					<div>
						<ul>
							{breakpoints}
						</ul>
					</div>
					<input type="text" value={this.state.newBreakpoint || ''} onChange={this.handleChangeBreakpoint}/>
          <button onClick={this.handleAddBreakpoint}>Add</button>
        </div>
      </div>
    )
  }
}

export default App
