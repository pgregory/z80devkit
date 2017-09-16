export default class MMU {
  constructor() {
    this.memoryBuffer = new ArrayBuffer(16384)
    this.memory = new Uint8Array(this.memoryBuffer)
  }

  readByte(address) {
    return this.memory[address]
  }

  writeByte(address, value) {
    this.memory[address] = value 
  }
}
