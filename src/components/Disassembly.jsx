import React from 'react'
import {hexWord} from '../utilities.js'

class Disassembly extends React.Component {
  render() {
    const textStyle = {
      fontFamily: "monospace",
      fontSize: 12
    }
    const code = []
    let address = this.props.z80.getRegister16("PC")
    for(let r = 0; r < 20; r += 1) {
      code.push(hexWord(address) + ": " + this.props.z80.disasmOpCodeAt(address))
      address = this.props.z80.nextOpCodeAddress(address)
    }
    return (
      <div>
        <textarea style={textStyle} rows={20} cols={16}
          readOnly={true}
          value={code.join("\n")}/>
      </div>
    )
  }
}

export default Disassembly
