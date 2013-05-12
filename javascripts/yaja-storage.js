var yaja = typeof yaja === 'undefined' ? {} : yaja;
(function (window, yaja, undefined) {
"use strict";

var Stack = Array;

// This method is also added to Array, since Stack is just an alias to Array.
// It may be an undesirable side-effect. However, performance gain is
// significant (30-40% faster) compared to inheriting Array.
Stack.prototype.duplicate = function () {
  this.push(this[this.length - 1]);
};

// Efficient Queue implementation by Stephen Morley
// Adapted by Choongmin Lee
// http://code.stephenmorley.org/javascript/queues/
function Queue() {
  this.length = 0;
  this._array = [];
  this._offset = 0;
}

Queue.prototype.push = function (element) {
  ++this.length;
  this._array.push(element);
};

Queue.prototype.pop = function () {
  --this.length;
  var array = this._array,
      element = array[this._offset];
  if ((++this._offset << 1) >= array.length) {
    this._array = array.slice(this._offset);
    this._offset = 0;
  }
  return element;
};

Queue.prototype.duplicate = function () {
  ++this.length;
  var array = this._array,
      element = array[this._offset];
  if (--this._offset >= 0) {
    array[this._offset] = element;
  } else {
    array.unshift(element);
    this._offset = 0;
  }
};

// Slightly inefficient but simple implementation
//function Queue() {}
//Queue.prototype = new Array;
//Queue.prototype.constructor = Queue;
//Queue.prototype.pop = function (element) { return this.shift(); };
//Queue.prototype.duplicate = function () { return this.unshift(this[0]); };

yaja.Stack = Stack;
yaja.Queue = Queue;

})(window, yaja);
