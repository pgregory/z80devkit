export default class MMU {
  constructor() {
    this.memory = [16384]
  }

  readByte(address) {
    return this.memory[address]
  }

  writeByte(address, value) {
    this.memory[address] = value 
  }
}
