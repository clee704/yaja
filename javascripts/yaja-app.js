var yaja = typeof yaja === 'undefined' ? {} : yaja;
(function (window, yaja, $, undefined) {

function App(config) {
  this.config = $.extend({
    // Define default config values here.
    "shortcuts": {
      "run": "Ctrl+Return",
      "pause": "Ctrl+P",
      "reset": "Ctrl+R"
    }
  }, config);
  this._currentLoopId = 0;
  this._input = $('.yaja-input')[0];
  this._$input = $(this._input);
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
  this._configureLayout();
}

App.prototype.run = function () {
  var status = this._getStatus();
  if (status == 'Running') return;
  this._updateStatusBar('Running');
  if (status == 'Idle' || status == 'Terminated') {
    this.clearOutput();
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
  this.clearOutput();
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
          func: function () { self.run(); return false; },
          htmlClass: ".yaja-run"
        },
        "pause": {
          func: function () { self.pause(); return false; },
          htmlClass: ".yaja-pause"
        },
        "reset": {
          func: function () { self.reset(); return false; },
          htmlClass: ".yaja-reset"
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
  this._$input.keypress(function (e) {
    return self._convertKeypressToFullWidth(e.which);
  }).keyup(function () {
    self._updateRuler();
  });
};

App.prototype._getStatus = function () {
  return this._status;
};

App.prototype._updateStatusBar = function (status) {
  this._status = status;
  $('.yaja-status').text(status);
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

App.prototype._getFullWidthChar = function (charCode) {
  if (charCode >= 33 && charCode <= 270) {
    return String.fromCharCode(charCode + 65248);
  } else if (charCode == 32) {
    return String.fromCharCode(12288);
  } else {
    return;  // undefined
  }
};

App.prototype._convertKeypressToFullWidth = function (charCode) {
  var fullWidthChar = this._getFullWidthChar(charCode);
  if (fullWidthChar !== undefined) {
    this._$input.replaceSelectedText(fullWidthChar);
    return false;
  }
};

App.prototype._updateRuler = function () {
  var s = this._$input.getSelection(),
      text;
  if (s.start != s.end) {
    text = ''
  } else {
    var index = s.end,
        lines = this._input.value.substr(0, index).split('\n'),
        line = lines.length,
        col = lines[lines.length - 1].length + 1;
    text = 'Line ' + line + ', Column ' + col;
  }
  $('.yaja-ruler').text(text);
};

App.prototype._configureLayout = function () {
  $(document).ready(function () {
    $('body').layout({
      spacing_open: 1,
      north: {
        closable: false,
        resizable: false
      },
      center: {
        fxSpeed: "fast",
        childOptions: {
          center: {
            paneSelector: ".ui-layout-upper-center",
            minSize: 100
          },
          south: {
            paneSelector: ".ui-layout-lower-center",
            size: 200,
            minSize: 100
          }
        }
      },
      south: {
        closable: false,
        resizable: false
      }
    });
  });
};

yaja.App = App;

})(window, yaja, jQuery);
