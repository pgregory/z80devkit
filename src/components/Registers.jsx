import React from 'react'
import {hexByte, hexWord} from '../utilities.js'

class Registers extends React.Component {
  render() {
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>A:</th><td>{hexByte(this.props.registers.A)}</td>
              <th>A':</th><td>{hexByte(this.props.registers.A_)}</td>
            </tr>
            <tr>
              <th>BC:</th><td>{hexWord(this.props.registers.BC)}</td>
              <th>BC':</th><td>{hexWord(this.props.registers.BC_)}</td>
            </tr>
            <tr>
              <th>DE:</th><td>{hexWord(this.props.registers.DE)}</td>
              <th>DE':</th><td>{hexWord(this.props.registers.DE_)}</td>
            </tr>
            <tr>
              <th>HL:</th><td>{hexWord(this.props.registers.HL)}</td>
              <th>HL':</th><td>{hexWord(this.props.registers.HL_)}</td>
            </tr>
            <tr>
              <th>IX:</th><td colSpan={3}>{hexWord(this.props.registers.IX)}</td>
            </tr>
            <tr>
              <th>IY:</th><td colSpan={3}>{hexWord(this.props.registers.IY)}</td>
            </tr>
            <tr>
              <th>PC:</th><td colSpan={3}>{hexWord(this.props.registers.PC)}</td>
            </tr>
            <tr>
              <th>SP:</th><td colSpan={3}>{hexWord(this.props.registers.SP)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

export default Registers
