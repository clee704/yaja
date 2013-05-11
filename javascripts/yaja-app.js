var yaja = typeof yaja === 'undefined' ? {} : yaja;
(function (yaja, $, undefined) {

var KEY_CODE = {
  BACKSPACE: 8,
  TAB: 9,
  PAUSE_BREAK: 19,
  CAPS_LOCK: 20,
  SCROLL_LOCK: 145,
  IME: 229
};

function App(config) {
  this.config = $.extend({
    // Define default config values here.
    "shortcuts": {
      "run": "Ctrl+Return",
      "pause": "Ctrl+P",
      "reset": "Ctrl+R",
      "open": "Ctrl+O",
      "save": "Ctrl+S"
    }
  }, config);
  this._currentLoopId = 0;
  this._storagePrefix = 'yaja_';
  this._initObjects();
  this._bindActionListeners();
  this._bindInputListeners();
  this._bindModalListeners();
  this._startAutosaveLoop();
  this._loadAutosavedProgram();
  this._setStatus('Idle');
  this._updateRuler();
  this._updateCodeSize();
  this._configureLayout();
}

App.prototype.run = function () {
  var status = this._getStatus();
  if (status == 'Running') return;
  this._setStatus('Running');
  if (status != 'Paused') {
    this.clearOutput();
    this._interpreter.setProgram(this._input.value);
  }
  this._startLoop();
};

App.prototype.pause = function () {
  var status = this._getStatus();
  if (status != 'Running') return;
  this._setStatus('Paused');
  this._stopLoop();
};

App.prototype.reset = function () {
  if (this._getStatus() == 'Reset') return;
  this._setStatus('Reset');
  this._stopLoop();
  this.clearOutput();
};

App.prototype.clearOutput = function () {
  this._output.value = '';
};

App.prototype.save = function () {
  var name = prompt('Program name:');
  if (!name) return;
  this._saveProgram(name);
};

App.prototype.open = function () {
  var self = this,
      modal = $('.yaja-open-modal'),
      savedPrograms = this._getSavedPrograms(),
      tbody = $('.yaja-open-modal-body tbody').detach();
  tbody.empty();
  if (savedPrograms.names.length == 0) {
    tbody.append('<td class="empty" colspan="2">No saved programs</td>');
  } else {
    for (var i = 0; i < savedPrograms.names.length; ++i) {
      var name = savedPrograms.names[i],
          programSummary = savedPrograms.programs[name].substr(0, 80),
          tr = $('<tr></tr>').data('program_name', name);
      $('<td class="name">' + name + '</td>').appendTo(tr);
      $('<td><code>' + programSummary + '</code></td>').appendTo(tr);
      tr.click(function () {
        tbody.find('.selected').removeClass('selected');
        $(this).addClass('selected');
      }).dblclick(function () {
        self._loadProgram($(this).data('program_name'));
        modal.modal('hide');
        return false;
      });
      tr.appendTo(tbody);
    }
  }
  $('.yaja-open-modal-body table').append(tbody);
  modal.modal();
};

App.prototype._initObjects = function () {
  var self = this;
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
  this._storage = {
    set: function (key, value) {
      localStorage[self._storagePrefix + key] = value;
    },
    get: function (key) {
      return localStorage[self._storagePrefix + key];
    },
    remove: function (key) {
      delete localStorage[self._storagePrefix + key];
    },
    keys: function () {
      var keys = [],
          prefixPattern = RegExp('^' + self._storagePrefix + '(.*)$');
      for (var key in localStorage) {
        var m = key.match(prefixPattern);
        if (m) keys.push(m[1]);
      }
      return keys;
    }
  };
};

App.prototype._bindActionListeners = function () {
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
        },
        "save": {
          func: function () { self.save(); return false; },
          htmlClass: ".yaja-save"
        },
        "open": {
          func: function () { self.open(); return false; },
          htmlClass: ".yaja-open"
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

App.prototype._bindInputListeners = function () {
  var self = this;
  this._$input.keypress(function (e) {
    // In Firefox, special keys also trigger keypress events; so filter them
    var c = e.which;
    if (e.metaKey || e.altKey || e.ctrlKey ||
        c == KEY_CODE.IME || c == 0 || c == KEY_CODE.BACKSPACE ||
        c == KEY_CODE.TAB || c == KEY_CODE.PAUSE_BREAK ||
        c == KEY_CODE.CAPS_LOCK || c == KEY_CODE.SCROLL_LOCK) {
      return;
    }
    return self._convertKeypressToFullWidth(e.which);
  }).keyup(function () {
    self._updateRuler();
    self._updateCodeSize();
  });
};

App.prototype._bindModalListeners = function () {
  var self = this;
  $('.yaja-open-modal-open').click(function () {
    var tr = $('.yaja-open-modal-body .selected');
    if (tr) {
      self._loadProgram(tr.data('program_name'));
      $('.yaja-open-modal').modal('hide');
    }
  });
  $('.yaja-open-modal-delete').click(function () {
    var tr = $('.yaja-open-modal-body .selected');
    if (tr) {
      self._removeProgram(tr.data('program_name'));
      tr.remove();
    }
  });
};

App.prototype._startAutosaveLoop = function () {
  var self = this;
  this._autosaveLoopId = setInterval(function () {
    var autosavedProgram = self._storage.get('autosave'),
        currentProgram = self._input.value;
    if (currentProgram == autosavedProgram) return;
    self._storage.set('autosave', currentProgram);
    $('.yaja-autosave-status').text('Autosaved')
        .hide().fadeIn(200).delay(2000).fadeOut(400);
  }, 10000);
};

App.prototype._loadAutosavedProgram = function () {
  if (this._input.value != '') return;
  var autosavedProgram = this._storage.get('autosave');
  if (autosavedProgram !== undefined) this._input.value = autosavedProgram;
};

App.prototype._getStatus = function () {
  return this._status;
};

App.prototype._setStatus = function (status) {
  this._status = status;
  $('.yaja-status').text(status);
};

App.prototype._saveProgram = function (name) {
  this._storage.set('saved_program_' + name, this._input.value);
};

App.prototype._loadProgram = function (name) {
  var program = this._storage.get('saved_program_' + name);
  if (program === undefined) return;
  this.reset();
  this._input.value = program;
};

App.prototype._removeProgram = function (name) {
  this._storage.remove('saved_program_' + name);
};

App.prototype._getSavedPrograms = function () {
  var keys = this._storage.keys(),
      names = [],
      programs = {};
  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i],
        m = key.match(/^saved_program_(.*)$/);
    if (m) {
      names.push(m[1]);
      programs[m[1]] = this._storage.get(key);
    }
  }
  names.sort();
  return {names: names, programs: programs};
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
          self._setStatus('Terminated');
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
    text = (s.end - s.start) + ' characters selected';
  } else {
    var index = s.end,
        lines = this._input.value.substr(0, index).split('\n'),
        line = lines.length,
        col = lines[lines.length - 1].length + 1;
    text = 'Line ' + line + ', Column ' + col;
  }
  $('.yaja-ruler').text(text);
};

App.prototype._updateCodeSize = function () {
  var program = this._input.value,
      lines = program.split('\n'),
      chars = program.length - (lines.length - 1),
      height = chars == 0 ? 0 : lines.length,
      width = 0;
  for (var i = 0; i < height; ++i) {
    if (lines[i].length > width) width = lines[i].length;
  }
  $('.yaja-code-size').text(width + 'x' + height + ', ' + chars + ' characters');
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

})(yaja, jQuery);
