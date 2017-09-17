export function hexByte(value) {
  return ("00" + value.toString(16)).substr(-2).toUpperCase()
}

export function hexWord(value) {
  return ("0000" + value.toString(16)).substr(-4).toUpperCase()
}
