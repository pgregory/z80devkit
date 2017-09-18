# z80devkit
A browser based z80/Spectrum development environment.

Implemented as a custom Z80 emulator, written from the ground up using Javascript es2015 language features through the babel transpiler. The intention is to build a ReactJS based user interface that includes the following features:

* Debugger/Disassembler
  * Register view
  * Execution/stepping
* Assembler
* Emulator display
  * 48K Spectrum to begin with

## Building

1. Install dependencies

    npm install
    
1. Run

    npm start
    
## Status

Currently, very little is implemented. A basic MMU and Z80 framework is in place, with a handful of instructions emulated. A simple UI with just register view and single stepping. The Z80 object is able to execute the instructions it knows about, and disassemble them for display in the disassembly view. Each element of the display is created as a ReactJS component to enable easy reuse.
