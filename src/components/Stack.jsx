import React from 'react'
import {hexWord, hexByte} from '../utilities.js'

class Stack extends React.Component {
  render() {
    const textStyle = {
      fontFamily: "monospace",
      fontSize: 12
    }
    const data = []
    let address = this.props.address
    for(let r = 0; r < 20; r += 1) {
      let line = ""
      line = line.concat(hexWord(address) + ": ")
      for(let c = 0; c < 8; c += 1) {
        const v = this.props.z80.mmu.readByte(address)
        if(v !== undefined) {
          line = line.concat(`${hexByte(v)} `)
        } else {
          line = line.concat('.. ')
        }
        address += 1
      }
      data.push(line)
    }
    return (
      <div>
        <textarea style={textStyle} rows={20} cols={32}
          readOnly={true}
          value={data.join("\n")}/>
      </div>
    )
  }
}

export default Stack
