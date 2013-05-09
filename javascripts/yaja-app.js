var yaja = typeof yaja === 'undefined' ? {} : yaja;
(function (window, yaja, $) {

function App(config) {
  this.config = $.extend({
    // Define default config values here.
    "shortcuts": {
      "run": "F5"
    }
  }, config);
  this.input = $('.yaja-input')[0];
  this.output = $('.yaja-output')[0];
  this.interpreter = new yaja.Interpreter();
  this._bindListeners();
}

App.prototype.run = function () {
  this.output.value = '';
  this.interpreter.run(this.input.value);
  this.output.value = this.interpreter.buffer.join('');
  this.output.scrollTop = this.output.scrollHeight;
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
    $(act.htmlClass).click(act.func);
    $(window).add('textarea').bind('keydown', shortcuts[name], act.func);
  }
};

yaja.App = App;

})(window, yaja, jQuery);
