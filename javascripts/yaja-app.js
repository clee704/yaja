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
  this._bindListeners();
}

App.prototype.run = function () {
  this._output.value = '';
  this._interpreter.setProgram(this._input.value);
  this._interpreter.run();
};

App.prototype._bindListeners = function () {
  var self = this,
      shortcuts = this.config.shortcuts,
      actions = {
        "run": {
          func: function () { self.run(); },
          htmlClass: '.yaja-run'
        }
      };
  for (var name in actions) {
    var act = actions[name];
    $(act.htmlClass).click(act.func).attr('title', function () {
      return $(this).text().trim() + ' [' + shortcuts[name] + ']';
    });
    $(window).add('textarea').bind('keydown', shortcuts[name], act.func);
  }
};

yaja.App = App;

})(window, yaja, jQuery);
