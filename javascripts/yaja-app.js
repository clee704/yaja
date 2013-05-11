var yaja = typeof yaja === 'undefined' ? {} : yaja;
(function (yaja, $, undefined) {

var KEY_CODE = {
  BACKSPACE: 8,
  TAB: 9,
  RETURN: 13,
  PAUSE_BREAK: 19,
  CAPS_LOCK: 20,
  LEFT_ARROW: 37,
  UP_ARROW: 38,
  RIGHT_ARROW: 39,
  DOWN_ARROW: 40,
  DELETE: 46,
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

App.prototype.open = function () {
  this._openModal.open();
};

App.prototype.save = function () {
  var name = prompt('Program name:');
  if (!name) return;
  this._saveProgram(name);
};

App.prototype.clearOutput = function () {
  this._output.value = '';
};

App.prototype.focusInput = function () {
  this._$input.focus();
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
  this._openModal = new OpenModal(this);
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
        "open": {
          func: function () { self.open(); return false; },
          htmlClass: ".yaja-open"
        },
        "save": {
          func: function () { self.save(); return false; },
          htmlClass: ".yaja-save"
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

function OpenModal(app) {
  this._app = app;
  this._modal = $('.yaja-open-modal');
  this._table = $('.yaja-open-modal-body table');
  this._tbody = this._table.find('tbody');
  this._bindListeners();
}

OpenModal.prototype.open = function () {
  this._updateTable();
  this._modal.modal();
};

OpenModal.prototype.close = function () {
  this._modal.modal('hide');
};

OpenModal.prototype.select = function (index) {
  if (this._selectedRow) this._selectedRow.tr.removeClass('selected');
  this._selectedRow = this._data[index];
  this._selectedRow.tr.addClass('selected');
};

OpenModal.prototype.selectedIndex = function () {
  if (this._selectedRow) return this._selectedRow.index;
};

OpenModal.prototype.loadProgram = function () {
  if (!this._selectedRow) return;
  this._app._loadProgram(this._selectedRow.programName);
  this.close();
  this._app.focusInput();
};

OpenModal.prototype.removeProgram = function () {
  if (!this._selectedRow) return;
  this._app._removeProgram(this._selectedRow.programName);
  this._data.splice(this._selectedRow.index, 1);
  this._selectedRow.tr.remove();
  this._selectedRow = undefined;
};

OpenModal.prototype._updateTable = function () {
  this._updateData();
  var self = this,
      data = this._data,
      tbody = this._tbody.detach();
  tbody.empty();
  if (data.length == 0) {
    tbody.append('<td class="empty" colspan="2">No saved programs</td>');
  } else {
    for (var i = 0; i < data.length; ++i) {
      var row = data[i],
          tr = $('<tr></tr>').data('index', i);
      row.tr = tr;
      $('<td class="name">' + row.programName + '</td>').appendTo(tr);
      $('<td><code>' + row.programSummary + '</code></td>').appendTo(tr);
      tr.click(function () {
        self.select($(this).data('index'));
      }).dblclick(function () {
        self.select($(this).data('index'));
        self.loadProgram();
      }).appendTo(tbody);
    }
  }
  this._table.append(tbody);
};

OpenModal.prototype._updateData = function () {
  var savedPrograms = this._app._getSavedPrograms();
  data = [];
  for (var i = 0; i < savedPrograms.names.length; ++i) {
    var name = savedPrograms.names[i],
        row = {
          index: i,
          programName: name,
          programSummary: savedPrograms.programs[name].substr(0, 80)
        };
    data.push(row);
  }
  this._data = data;
  this._selectedRow = undefined;
};

OpenModal.prototype._bindListeners = function () {
  var self = this;
  $('.yaja-open-modal-open').click(function () { self.loadProgram(); });
  $('.yaja-open-modal-delete').click(function () { self.removeProgram(); });
  this._modal.keydown(function (e) {
    var c = e.which,
        n = self._data.length;
    if (n == 0) return;
    switch (c) {
    case KEY_CODE.DOWN_ARROW:
      var i = self.selectedIndex();
      self.select(i === undefined ? 0 : i < n - 1 ? i + 1 : 0);
      return false;
    case KEY_CODE.UP_ARROW:
      var i = self.selectedIndex();
      self.select(i === undefined ? n - 1 : i > 0 ? i - 1 : n - 1);
      return false;
    case KEY_CODE.DELETE:
      self.removeProgram();
      return false;
    case KEY_CODE.RETURN:
      self.loadProgram();
      return false;
    default:
      return;
    }
  });
};

yaja.App = App;

})(yaja, jQuery);
