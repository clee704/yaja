var yaja = typeof yaja === 'undefined' ? {} : yaja;
(function (window, yaja, $) {

function App(config) {
  this.config = $.extend({
    // Define default config values here.
    "shortcuts": {
      "run": "F5"
    }
  }, config);
  this._input = $('.yaja-input')[0];
  var output = this._output = $('.yaja-output')[0];
  this._interpreter = new yaja.Interpreter();
  this._interpreter.setOut({print: function (str) {
    output.value += str;
    output.scrollTop = output.scrollHeight;
  }});
  this._pauseButton = $('.yaja-pause');
  this._paused = false;
  this._currentLoopId = 0;
  this._bindListeners();
}

App.prototype.run = function () {
  this.clearOutput();
  this._interpreter.setProgram(this._input.value);
  this._pauseButton.attr('disabled', null);
  this.pause(false);
};

App.prototype.pause = function (paused) {
  if (this._pauseButton.attr('disabled')) return;
  ++this._currentLoopId;  // Stop current loop
  this.paused = paused === undefined ? !this.paused : paused;
  if (this.paused) {
    this._pauseButton.find('span').text('Resume');
  } else {
    this._pauseButton.find('span').text('Pause');
    this._resume();
  }
};

App.prototype.clearOutput = function () {
  this._output.value = '';
};

App.prototype._resume = function () {
  var self = this,
      interpreter = this._interpreter,
      currentLoopId = ++this._currentLoopId,
      loop = function () {
        if (currentLoopId != self._currentLoopId) return;
        if (interpreter.run(10000)) {  // Terminated
          self._pauseButton.attr('disabled', 'disabled');
        } else {
          setTimeout(loop, 0);
        }
      };
  loop();
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

yaja.App = App;

})(window, yaja, jQuery);
