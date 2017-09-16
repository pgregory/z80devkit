import React from 'react'

class Registers extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      registers: {
        A: this.props.z80.getRegister8(this.props.z80.A),
      }
    }
  }
  render() {
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>A:</th><td span="2">{this.state.registers.A}</td>
            </tr>
            <tr>
              <th>BC:</th><td>{this.props.registers.B}</td><td>{this.props.registers.C}</td>
            </tr>
            <tr>
              <th>DE:</th><td>{this.props.registers.D}</td><td>{this.props.registers.E}</td>
            </tr>
            <tr>
              <th>HL:</th><td>{this.props.registers.H}</td><td>{this.props.registers.L}</td>
            </tr>
            <tr>
              <th>IX:</th><td>{this.props.registers.H}</td><td>{this.props.registers.L}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

export default Registers
