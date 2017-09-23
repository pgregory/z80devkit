export default class MMU {
  constructor() {
    this.memoryBuffer = new ArrayBuffer(65536)
    this.memory = new Uint8Array(this.memoryBuffer)
  }

  readByte(address) {
    return this.memory[address]
  }

  readWord(address) {
    const l = this.memory[address]
    const h = this.memory[address + 1]
    return (h << 8) | l
  }

  writeByte(address, value) {
    this.memory[address] = value 
  }

  writeWord(address, value) {
    this.memory[address] = value & 0xFF
    this.memory[address + 1] = value >>> 8
  }

  copyFrom(source, offset) {
    this.memory.set(source, offset)
  }
}
