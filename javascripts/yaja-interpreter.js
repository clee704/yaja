var yaja = typeof yaja === 'undefined' ? {} : yaja;
(function (window, yaja, undefined) {

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
    TWO = 32;
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
  var self = this;
  this.out = function (c) { self.buffer.push(c) };
  this.buffer = [];
}

Interpreter.prototype.setOut = function (out) {
  this.out = out;
};

Interpreter.prototype.run = function (program, maxInstructions) {
  var out = this.out,
      code = this._parse(program),
      height = code.length,
      width = height == 0 ? 0 : code[0].length,
      i = 0,
      j = 0,
      currentDirection = DOWN,
      currentSpeed = ONE,
      storage = this._createStorage(),
      currentStorage = storage[0],
      currentStorageSize = currentStorage.length,
      instructionCount = 0;
  this.buffer = [];
  if (height == 0 || width == 0) return;
  while (maxInstructions === undefined ||
         instructionCount <= maxInstructions) {
    var instruction = code[i][j],
        commandCode = instruction[0],
        movement = MOVEMENTS[instruction[1]],
        direction = movement & DIRECTION,
        speed = movement & SPEED,
        argumentCode = instruction[2],
        arity = COMMAND_ARITY[commandCode],
        first,
        second;
    // Update current direction
    if ((movement & INERTIA) == FORCE) {
      // Simple movement
      currentDirection = direction;
      currentSpeed = speed;
    } else if (movement != SAME) {
      var d = currentDirection;
      if (movement == REFLECT ||
          (movement == SAME_V_REFLECT_H && (d == RIGHT || d == LEFT)) ||
          (movement == REFLECT_V_SAME_H && (d == UP || d == DOWN))) {
        currentDirection = ~currentDirection & DIRECTION;
      }
    }
    // Check if current storage has enough values
    if (currentStorageSize < 2 &&
        (arity == 2 || currentStorageSize < 1 && arity == 1)) {
      commandCode = NULL;
      currentDirection = ~currentDirection & DIRECTION;
    }
    // Get values
    if (arity >= 1) {
      if (commandCode != DUPLICATE) first = currentStorage.pop();
      if (arity == 2) second = currentStorage.pop();
    }
    // Perform command
    switch (commandCode) {
      // Arithmetic commands
      case ADD:      currentStorage.push(second + first); break;
      case MULTIPLY: currentStorage.push(second * first); break;
      case DIVIDE:   currentStorage.push(~~(second / first)); break;
      case SUBTRACT: currentStorage.push(second - first); break;
      case MODULO:   currentStorage.push(second % first); break;
      // Storage commands
      case POP:
        if (argumentCode == INTEGER) {
          out(first);
        } else if (argumentCode == CHARACTER) {
          out(String.fromCharCode(first));
        } else {
          // Invalid argument; discard value
        }
        break;
      case PUSH:
        var value;
        if (argumentCode == INTEGER) {
          value = ~~window.prompt('Enter an integer:');
        } else if (argumentCode == CHARACTER) {
          value = window.prompt('Enter a character:').charCodeAt(0);
        } else {
          value = VALUES[argumentCode];
        }
        currentStorage.push(value);
        break;
      case DUPLICATE:
        currentStorage.duplicate();
        break;
      case SWAP:
        currentStorage.push(first);
        currentStorage.push(second);
        break;
      // Miscellaneous commands
      case SELECT:
        currentStorage = storage[argumentCode];
        break;
      case TRANSFER:
        storage[argumentCode].push(first);
        break;
      case COMPARE:
        currentStorage.push(second >= first ? 1 : 0);
        break;
      case DECIDE:
        if (first == 0) currentDirection = ~currentDirection & DIRECTION;
        break;
      case TERMINATE:
        return;
      case NULL: default:
        break;
    }
    currentStorageSize = currentStorage.length;
    // Move to the next instruction
    var inc = currentSpeed == ONE ? 1 : 2,
        x;
    switch (currentDirection) {
      case UP:    x = i - inc; i = x < 0 ? height - 1 : x; break;
      case DOWN:  x = i + inc; i = x >= height ? 0 : x; break;
      case RIGHT: x = j + inc; j = x >= width ? 0 : x; break;
      case LEFT:  x = j - inc; j = x < 0 ? width - 1 : x; break;
    }
    if (instruction !== NULL_INSTRUCTION) ++instructionCount;
  }
};

Interpreter.prototype._parse = function (program) {
  var lines = program.split('\n')
      height = lines.length,
      maxWidth = 0,
      rows = [];
  for (var i = 0; i < height; ++i) {
    var line = lines[i],
        width = line.length,
        row = [];
    if (width > maxWidth) maxWidth = width;
    for (var j = 0; j < width; ++j) {
      row.push(this._makeInstruction(line.charCodeAt(j)));
    }
    rows.push(row);
  }
  for (var i = 0; i < height; ++i) {
    var row = rows[i];
    for (var j = row.length; j < maxWidth; ++j) {
      row.push(NULL_INSTRUCTION);
    }
  }
  return rows;
};

Interpreter.prototype._makeInstruction = function (charCode) {
  // '가'.charCodeAt(0) == 0xac00
  // '힣'.charCodeAt(0) == 0xd7a3
  if (charCode < 0xac00 || charCode > 0xd7a3) return NULL_INSTRUCTION;
  // ~~ (double bitwise NOT) is a fast alternative to Math.floor
  var x = charCode - 0xac00,
      argumentCode = x % 28,  // final (종성)
      y = ~~(x / 28),
      movementCode = y % 21,  // medial (중성)
      commandCode = ~~(y / 21);  // initial (초성)
  return [commandCode, movementCode, argumentCode];
};

Interpreter.prototype._createStorage = function () {
  var storage = [];
  for (var i = 0; i < 28; ++i) {
    if (i == QUEUE) {  // ㅇ
      storage[i] = new yaja.Queue();
    } else {
      storage[i] = new yaja.Stack();
    }
  }
  return storage;
};

yaja.Interpreter = Interpreter;

})(window, yaja);
