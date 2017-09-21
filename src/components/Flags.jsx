import React from 'react'

class Flags extends React.Component {
  render() {
    const textStyle = {
      fontFamily: "monospace",
      fontSize: 14
    }
    return (
      <div>
        <table style={textStyle}>
          <tbody>
            <tr>
              <th>S</th><th>Z</th><th>Y</th><th>H</th><th>X</th><th>P</th><th>N</th><th>C</th>
            </tr>
            <tr>
              <td>{this.props.flags.S? 1 : 0}</td>
              <td>{this.props.flags.Z? 1 : 0}</td>
              <td>{this.props.flags.Y? 1 : 0}</td>
              <td>{this.props.flags.H? 1 : 0}</td>
              <td>{this.props.flags.X? 1 : 0}</td>
              <td>{this.props.flags.P? 1 : 0}</td>
              <td>{this.props.flags.N? 1 : 0}</td>
              <td>{this.props.flags.C? 1 : 0}</td>
            </tr>
            <tr>
              <th>S'</th><th>Z'</th><th>Y'</th><th>H'</th><th>X'</th><th>P'</th><th>N'</th><th>C'</th>
            </tr>
            <tr>
              <td>{this.props.altFlags.S? 1 : 0}</td>
              <td>{this.props.altFlags.Z? 1 : 0}</td>
              <td>{this.props.altFlags.Y? 1 : 0}</td>
              <td>{this.props.altFlags.H? 1 : 0}</td>
              <td>{this.props.altFlags.X? 1 : 0}</td>
              <td>{this.props.altFlags.P? 1 : 0}</td>
              <td>{this.props.altFlags.N? 1 : 0}</td>
              <td>{this.props.altFlags.C? 1 : 0}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

export default Flags
