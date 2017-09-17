import React from 'react'

class Flags extends React.Component {
  render() {
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>S</th><th>Z</th><th>Y</th><th>H</th><th>X</th><th>P</th><th>N</th><th>C</th>
            </tr>
            <tr>
              <th>{this.props.flags.S}</th>
              <th>{this.props.flags.Z}</th>
              <th>{this.props.flags.Y}</th>
              <th>{this.props.flags.H}</th>
              <th>{this.props.flags.X}</th>
              <th>{this.props.flags.P}</th>
              <th>{this.props.flags.N}</th>
              <th>{this.props.flags.C}</th>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

export default Flags
