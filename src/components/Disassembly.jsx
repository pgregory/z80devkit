import React from 'react'
import {hexWord} from '../utilities.js'

class Disassembly extends React.Component {
  render() {
    const textStyle = {
      fontFamily: "monospace",
      fontSize: 12
    }
    const code = []
    let address = this.props.address
    for(let r = 0; r < 20; r += 1) {
      code.push(((address === this.props.z80.getRegister16("PC"))? ">" : " ") + hexWord(address) + ": " + this.props.z80.hexOpCodeAt(address) + " " + this.props.z80.disasmOpCodeAt(address))
      address += this.props.z80.opcodeLengthAt(address)
    }
    return (
      <div>
        <textarea style={textStyle} rows={20} cols={32}
          readOnly={true}
          value={code.join("\n")}/>
      </div>
    )
  }
}

export default Disassembly
