var yaja = typeof yaja === 'undefined' ? {} : yaja;
(function (window, yaja, $, undefined) {

function App(config) {
  this.config = $.extend({
    // Define default config values here.
    "shortcuts": {
      "run": "F11",
      "pause": "F8"
    }
  }, config);
  this._currentLoopId = 0;
  this._input = $('.yaja-input')[0];
  var output = this._output = $('.yaja-output')[0];
  this._out = {
    print: function (str) {
      output.value += str;
      output.scrollTop = output.scrollHeight;
    }
  };
  this._interpreter = new yaja.Interpreter();
  this._interpreter.setOut(this._out);
  this._bindListeners();
  this._updateStatusBar('Idle');
}

App.prototype.run = function () {
  var status = this._getStatus();
  if (status == 'Running') return;
  this._updateStatusBar('Running');
  if (status == 'Idle' || status == 'Terminated') {
    this._interpreter.setProgram(this._input.value);
  }
  this._startLoop();
};

App.prototype.pause = function () {
  var status = this._getStatus();
  if (status == 'Paused') return;
  this._updateStatusBar('Paused');
  this._stopLoop();
  if (status == 'Idle') this._interpreter.setProgram(this._input.value);
};

App.prototype.reset = function () {
  if (this._getStatus() == 'Reset') return;
  this._updateStatusBar('Reset');
  this._stopLoop();
  this._interpreter.setProgram(this._input.value);
};

App.prototype.clearOutput = function () {
  this._output.value = '';
};

App.prototype._bindListeners = function () {
  var self = this,
      shortcuts = this.config.shortcuts,
      actions = {
        "run": {
          func: function () { self.run(); },
          htmlClass: ".yaja-run"
        },
        "pause": {
          func: function () { self.pause(); },
          htmlClass: ".yaja-pause"
        },
        "reset": {
          func: function () { self.reset(); },
          htmlClass: ".yaja-reset"
        },
        "clearOutput": {
          func: function () { self.clearOutput(); },
          htmlClass: ".yaja-clear-output"
        }
      };
  for (var name in actions) {
    var act = actions[name],
        button = $(act.htmlClass).click(act.func);
    if (shortcuts[name]) {
      button.attr('title', function () {
        return $(this).text().trim() + ' [' + shortcuts[name] + ']';
      });
      $(window).add('textarea').bind('keydown', shortcuts[name], act.func);
    }
  }
};

App.prototype._getStatus = function () {
  return this._status;
};

App.prototype._updateStatusBar = function (status) {
  this._status = status;
  $('.yaja-status-bar').text(status);
};

App.prototype._startLoop = function () {
  var self = this,
      interpreter = this._interpreter,
      // Prevent multiple calls to _startLoop() from creating as many loops
      // as the calls.
      currentLoopId = ++this._currentLoopId,
      loop = function () {
        if (currentLoopId != self._currentLoopId) return;
        if (interpreter.run(10000)) {  // Terminated
          self._updateStatusBar('Terminated');
        } else {
          setTimeout(loop, 0);
        }
      };
  loop();
};

App.prototype._stopLoop = function () {
  ++this._currentLoopId;
};

App.prototype._getFullWidthChar = function (c) {
  var charCode = c.charCodeAt(0);
  if (charCode >= 33 && charCode <= 270) {
    return String.fromCharCode(charCode + 65248);
  } else if (charCode == 32) {
    return String.fromCharCode(12288);
  } else {
    return c;
  }
};

yaja.App = App;

})(window, yaja, jQuery);
