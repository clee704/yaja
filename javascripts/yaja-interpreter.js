window.yaja = typeof yaja === 'undefined' ? {} : yaja;
(function (yaja, undefined) {
"use strict";

// Intials: ㄱ ㄲ ㄴ ㄷ ㄸ ㄹ ㅁ ㅂ ㅃ ㅅ ㅆ ㅇ ㅈ ㅉ ㅊ ㅋ ㅌ ㅍ ㅎ
// Command codes
var NULL = 11,       // ㅇ
    TERMINATE = 18,  // ㅎ
    ADD = 3,         // ㄷ
    MULTIPLY = 4,    // ㄸ
    DIVIDE = 2,      // ㄴ
    SUBTRACT = 16,   // ㅌ
    MODULO = 5,      // ㄹ
    POP = 6,         // ㅁ
    PUSH = 7,        // ㅂ
    DUPLICATE = 8,   // ㅃ
    SWAP = 17,       // ㅍ
    SELECT = 9,      // ㅅ
    TRANSFER = 10,   // ㅆ
    COMPARE = 12,    // ㅈ
    DECIDE = 14,     // ㅊ
    COMMAND_ARITY = [0, 0, 2, 2, 2, 2, 1, 0, 1, 0, 1, 0, 2, 0, 1, 0, 2, 2, 0];

// Medials: ㅏ ㅐ ㅑ ㅒ ㅓ ㅔ ㅕ ㅖ ㅗ ㅘ ㅙ ㅚ ㅛ ㅜ ㅝ ㅞ ㅟ ㅠ ㅡ ㅢ ㅣ
// Directions (bits 0,1)
var UP = 0,
    RIGHT = 1,
    DOWN = 3,
    LEFT = 2,
    DIRECTION = 3;  // 0b000011
// Inertia and deflection (bits 2,3,4)
var FORCE = 0,
    SAME = 4,
    REFLECT = 24,
    SAME_V_REFLECT_H = 8,
    REFLECT_V_SAME_H = 20,
    INERTIA = 28;  // 0b011100
// Speed (bit 5)
var ONE = 0,
    TWO = 32,
    SPEED = 32;  // 0b100000
// Movements
var MOVEMENTS = [RIGHT | ONE, SAME, RIGHT | TWO, SAME, LEFT | ONE, SAME,
      LEFT | TWO, SAME, UP | ONE, SAME, SAME, SAME, UP | TWO, DOWN | ONE,
      SAME, SAME, SAME, DOWN | TWO, REFLECT_V_SAME_H, REFLECT, SAME_V_REFLECT_H
    ];

// Finals: null ㄱ ㄲ ㄳ ㄴ ㄵ ㄶ ㄷ ㄹ ㄺ ㄻ ㄼ ㄽ ㄾ ㄿ ㅀ ㅁ ㅂ ㅄ ㅅ ㅆ ㅇ ㅈ ㅊ ㅋ ㅌ ㅍ ㅎ
// Arguments for POP and PUSH
var INTEGER = 21,    // ㅇ
    CHARACTER = 27,  // ㅎ
    VALUES = [0, 2, 4, 4, 2, 5, 5, 3, 5, 7, 9, 9, 7, 9, 9, 8, 4, 4, 6, 2, 4,
      undefined, 3, 4, 3, 4, 4, undefined];

// Storage
var QUEUE = 21;

var NULL_INSTRUCTION = [NULL, 1, 0];

function Interpreter() {
  this._buffer = [];
  this._bufferingMode = 'line-bufferred';
  this._out = {print: function () {}};
}

Interpreter.prototype.setOut = function (out, bufferingMode) {
  this._out = out;
  if (bufferingMode !== undefined) this._bufferingMode = bufferingMode;
};

Interpreter.prototype.setProgram = function (program) {
  var code = this._parse(program);
  this._process = {
    code: code,
    height: code.length
  };
  this.reset();
};

Interpreter.prototype.reset = function () {
  var process = this._process;
  process.instructionIndex = [0, 0];
  process.direction = DOWN;
  process.speed = ONE;
  process.storage = this._createStorage();
  process.storageIndex = 0;
  process.instructionCount = 0;
  process.terminated = true;
  for (var i = 0; i < process.code.length; ++i) {
    if (process.code[i].length > 0) {
      process.terminated = false;
      break;
    }
  }
};

Interpreter.prototype.run = function (maxInstructions) {
  var process = this._process;
  if (process.terminated) return true;
  var code = process.code,
      data = process.storage[process.storageIndex],
      index = process.instructionIndex,
      currentInstructionCount = 0;
  while (maxInstructions === undefined ||
         currentInstructionCount < maxInstructions) {
    var row = code[index[0]],
        instruction = row[index[1]];
    if (instruction !== undefined) {
      var commandCode = instruction[0],
          movement = MOVEMENTS[instruction[1]],
          direction = movement & DIRECTION,
          speed = movement & SPEED,
          argumentCode = instruction[2],
          arity = COMMAND_ARITY[commandCode],
          first,
          second;
      // Update current direction
      if ((movement & INERTIA) === FORCE) {
        // Simple movement
        process.direction = direction;
        process.speed = speed;
      } else if (movement !== SAME) {
        var d = process.direction;
        if (movement === REFLECT ||
            (movement === SAME_V_REFLECT_H && (d === RIGHT || d === LEFT)) ||
            (movement === REFLECT_V_SAME_H && (d === UP || d === DOWN))) {
          process.direction = ~d & DIRECTION;
        }
      }
      // Check if current storage has enough values
      if (data.length < 2 &&
          (arity === 2 || data.length < 1 && arity === 1)) {
        commandCode = NULL;
        process.direction = ~process.direction & DIRECTION;
      }
      // Get values
      if (arity >= 1) {
        if (commandCode !== DUPLICATE) first = data.pop();
        if (arity === 2) second = data.pop();
      }
      // Perform command
      switch (commandCode) {
        // Arithmetic commands
        case ADD:      data.push(second + first); break;
        case MULTIPLY: data.push(second * first); break;
        case DIVIDE:   data.push(Math.floor(second / first)); break;
        case SUBTRACT: data.push(second - first); break;
        case MODULO:   data.push(second % first); break;
        // Storage commands
        case POP:
          if (argumentCode === INTEGER) {
            this._write(first);
          } else if (argumentCode === CHARACTER) {
            this._write(String.fromCharCode(first));
          } else {
            // Invalid argument; discard value
          }
          break;
        case PUSH:
          var value;
          if (argumentCode === INTEGER) {
            value = Math.floor(window.prompt('Enter an integer:'));
          } else if (argumentCode === CHARACTER) {
            value = window.prompt('Enter a character:').charCodeAt(0);
          } else {
            value = VALUES[argumentCode];
          }
          data.push(value);
          break;
        case DUPLICATE:
          data.duplicate();
          break;
        case SWAP:
          data.push(first);
          data.push(second);
          break;
        // Miscellaneous commands
        case SELECT:
          data = process.storage[process.storageIndex = argumentCode];
          break;
        case TRANSFER:
          process.storage[argumentCode].push(first);
          break;
        case COMPARE:
          data.push(second >= first ? 1 : 0);
          break;
        case DECIDE:
          if (first === 0) process.direction = ~process.direction & DIRECTION;
          break;
        case TERMINATE:
          process.terminated = true;
          this._flush();
          return true;
        case NULL: default:
          break;
      }
      ++process.instructionCount;
      ++currentInstructionCount;
    }
    // Move to the next instruction
    var inc = process.speed === ONE ? 1 : 2,
        width = row.length,
        height = process.height,
        x;
    switch (process.direction) {
      case UP:    x = index[0] - inc; index[0] = x < 0 ? height - 1 : x; break;
      case DOWN:  x = index[0] + inc; index[0] = x >= height ? 0 : x; break;
      case RIGHT: x = index[1] + inc; index[1] = x >= width ? 0 : x; break;
      case LEFT:  x = index[1] - inc; index[1] = x < 0 ? width - 1 : x; break;
    }
  }
  this._flush();
};

Interpreter.prototype._parse = function (program) {
  var lines = program.split('\n'),
      height = lines.length,
      rows = [];
  for (var i = 0; i < height; ++i) {
    var line = lines[i],
        width = line.length,
        row = [];
    for (var j = 0; j < width; ++j) {
      row.push(this._makeInstruction(line.charCodeAt(j)));
    }
    rows.push(row);
  }
  return rows;
};

Interpreter.prototype._makeInstruction = function (charCode) {
  // '가'.charCodeAt(0) == 0xac00
  // '힣'.charCodeAt(0) == 0xd7a3
  if (charCode < 0xac00 || charCode > 0xd7a3) return NULL_INSTRUCTION;
  var offset = charCode - 0xac00,
      argumentCode = offset % 28,  // final (종성)
      movementCode = Math.floor(offset / 28) % 21,  // medial (중성)
      commandCode = Math.floor(offset / 28 / 21);  // initial (초성)
  return [commandCode, movementCode, argumentCode];
};

Interpreter.prototype._createStorage = function () {
  var storage = [];
  for (var i = 0; i < 28; ++i) {
    storage[i] = i === QUEUE ? new yaja.Queue() : new yaja.Stack();
  }
  return storage;
};

Interpreter.prototype._write = function (c) {
  var bufferingMode = this._bufferingMode,
      buffer = this._buffer,
      out = this._out;
  if (bufferingMode === 'unbuffered') {
    out.print(c);
  } else {
    buffer.push(c);
    if (bufferingMode === 'line-buffered' && c === '\n') this._flush();
  }
};

Interpreter.prototype._flush = function () {
  this._out.print(this._buffer.join(''));
  this._buffer.length = 0;
};

yaja.Interpreter = Interpreter;

})(yaja);
