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
              <td>{this.props.flags.S? 1 : 0}</td>
              <td>{this.props.flags.Z? 1 : 0}</td>
              <td>{this.props.flags.Y? 1 : 0}</td>
              <td>{this.props.flags.H? 1 : 0}</td>
              <td>{this.props.flags.X? 1 : 0}</td>
              <td>{this.props.flags.P? 1 : 0}</td>
              <td>{this.props.flags.N? 1 : 0}</td>
              <td>{this.props.flags.C? 1 : 0}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

export default Flags
