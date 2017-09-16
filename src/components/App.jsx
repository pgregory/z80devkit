import React from 'react'
import Registers from './Registers.jsx'

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      registers: { 
        A: this.props.z80.getRegister8(this.props.z80.A), 
        B: this.props.z80.getRegister8(this.props.z80.B), 
        C: this.props.z80.getRegister8(this.props.z80.C), 
        D: this.props.z80.getRegister8(this.props.z80.D), 
        E: this.props.z80.getRegister8(this.props.z80.E), 
        H: this.props.z80.getRegister8(this.props.z80.H), 
        L: this.props.z80.getRegister8(this.props.z80.L), 
        A_: this.props.z80.getRegister8(this.props.z80.A_), 
        B_: this.props.z80.getRegister8(this.props.z80.B_), 
        C_: this.props.z80.getRegister8(this.props.z80.C_), 
        D_: this.props.z80.getRegister8(this.props.z80.D_), 
        E_: this.props.z80.getRegister8(this.props.z80.E_), 
        H_: this.props.z80.getRegister8(this.props.z80.H_), 
        L_: this.props.z80.getRegister8(this.props.z80.L_), 
        IX: this.props.z80.getRegister16(this.props.z80.IX), 
        IY: this.props.z80.getRegister16(this.props.z80.IY), 
        I: this.props.z80.getRegister8(this.props.z80.I), 
        R: this.props.z80.getRegister8(this.props.z80.R), 
        SP: this.props.z80.getRegister16(this.props.z80.SP), 
        PC: this.props.z80.getRegister16(this.props.z80.PC), 
      },
      z80: this.props.z80,
    }
  }

  render() {
    return (
      <div>
        <Registers registers = {this.state.registers} z80 = {this.state.z80}/>
      </div>
    )
  }
}

export default App
