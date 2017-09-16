import React from 'react'

class Registers extends React.Component {
  render() {
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>A:</th><td span="2">{this.props.registers.A}</td>
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
              <th>IX:</th><td span="2">{this.props.registers.IX}</td>
            </tr>
            <tr>
              <th>IY:</th><td span="2">{this.props.registers.IY}</td>
            </tr>
            <tr>
              <th>PC:</th><td span="2">{this.props.registers.PC}</td>
            </tr>
            <tr>
              <th>SP:</th><td span="2">{this.props.registers.SP}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

export default Registers
