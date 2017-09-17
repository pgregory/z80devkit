import React from 'react'
import {hexByte, hexWord} from '../utilities.js'

class Registers extends React.Component {
  render() {
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>A:</th><td colSpan={2}>{hexByte(this.props.registers.A)}</td>
            </tr>
            <tr>
              <th>BC:</th><td>{hexWord(this.props.registers.BC)}</td>
            </tr>
            <tr>
              <th>DE:</th><td>{hexWord(this.props.registers.DE)}</td>
            </tr>
            <tr>
              <th>HL:</th><td>{hexWord(this.props.registers.HL)}</td>
            </tr>
            <tr>
              <th>IX:</th><td>{hexWord(this.props.registers.IX)}</td>
            </tr>
            <tr>
              <th>IY:</th><td>{hexWord(this.props.registers.IY)}</td>
            </tr>
            <tr>
              <th>PC:</th><td>{hexWord(this.props.registers.PC)}</td>
            </tr>
            <tr>
              <th>SP:</th><td>{hexWord(this.props.registers.SP)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

export default Registers
