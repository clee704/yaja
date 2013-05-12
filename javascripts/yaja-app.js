var yaja = typeof yaja === 'undefined' ? {} : yaja;
(function (yaja, $, undefined) {
"use strict";

var KEY_CODE = {
  BACKSPACE: 8,
  TAB: 9,
  RETURN: 13,
  PAUSE_BREAK: 19,
  CAPS_LOCK: 20,
  ESCAPE: 27,
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
  if (status === 'Running') return;
  this._setStatus('Running');
  if (status !== 'Paused') {
    this.clearOutput();
    this._interpreter.setProgram(this._editor.getValue());
  }
  this._startLoop();
};

App.prototype.pause = function () {
  var status = this._getStatus();
  if (status !== 'Running') return;
  this._setStatus('Paused');
  this._stopLoop();
};

App.prototype.reset = function () {
  if (this._getStatus() === 'Reset') return;
  this._setStatus('Reset');
  this._stopLoop();
  this.clearOutput();
};

App.prototype.open = function () {
  this._openModal.open();
};

App.prototype.save = function () {
  this._saveModal.open();
};

App.prototype.clearOutput = function () {
  this._output.value = '';
};

App.prototype._initObjects = function () {
  var self = this;
  this._editor = new Editor();
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
          prefixPattern = new RegExp('^' + self._storagePrefix + '(.*)$');
      for (var key in localStorage) {
        var m = key.match(prefixPattern);
        if (m) keys.push(m[1]);
      }
      return keys;
    }
  };
  this._openModal = new OpenModal(this);
  this._saveModal = new SaveModal(this);
};

App.prototype._bindActionListeners = function () {
  var self = this,
      shortcuts = this.config.shortcuts,
      actions = ['run', 'pause', 'reset', 'open', 'save'];
  for (var i = 0; i < actions.length; ++i) {
    var action = actions[i],
        callback = (function () {
          var methodName = action;
          return function () {
            self[methodName]();
            return false;
          };
        })(),
        button = $('.yaja-' + action).click(callback),
        shortcut = shortcuts[action];
    if (shortcut) {
      button.attr('title', function () {
        return $(this).text().trim() + ' [' + shortcut + ']';
      });
      $(window).add('textarea').bind('keydown', shortcut, callback);
    }
  }
};

App.prototype._bindInputListeners = function () {
  var self = this;
  this._editor.on('beforeChange', function (cm, changeObj) {
    var text = changeObj.text,
        n = text.length;
    for (var i = 0; i < n; ++i) {
      text[i] = self._stretchCharacters(text[i]);
    }
    changeObj.update(undefined, undefined, text);
  });
  this._editor.on('cursorActivity', function () { self._updateRuler(); });
  this._editor.on('change', function () { self._updateCodeSize(); });
};

App.prototype._startAutosaveLoop = function () {
  var self = this;
  this._autosaveLoopId = setInterval(function () {
    var autosavedProgram = self._storage.get('autosave'),
        currentProgram = self._editor.getValue();
    if (currentProgram === autosavedProgram) return;
    self._storage.set('autosave', currentProgram);
    $('.yaja-autosave-status').text('Autosaved')
        .hide().fadeIn(200).delay(2000).fadeOut(400);
  }, 10000);
};

App.prototype._loadAutosavedProgram = function () {
  if (this._editor.getValue() !== '') return;
  this._loadProgram(this._storage.get('autosave'));
};

App.prototype._getStatus = function () {
  return this._status;
};

App.prototype._setStatus = function (status) {
  this._status = status;
  $('.yaja-status').text(status);
};

App.prototype._saveProgram = function (name) {
  this._storage.set('saved_program_' + name, this._editor.getValue());
};

App.prototype._getSavedProgram = function (name) {
  return this._storage.get('saved_program_' + name);
};

App.prototype._loadSavedProgram = function (name) {
  this._loadProgram(this._getSavedProgram(name));
};

App.prototype._loadProgram = function(program) {
  if (program === undefined) return;
  this.reset();
  this._editor.setValue(program);
  this._updateRuler();
  this._updateCodeSize();
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

App.prototype._focusEditor = function () {
  this._editor.focus();
};

App.prototype._startLoop = function () {
  var self = this,
      interpreter = this._interpreter,
      // Prevent multiple calls to _startLoop() from creating as many loops
      // as the calls.
      currentLoopId = ++this._currentLoopId,
      loop = function () {
        if (currentLoopId !== self._currentLoopId) return;
        if (interpreter.run(10000)) {  // Terminated
          self._setStatus('Terminated');
        } else {
          setTimeout(loop, 0);
        }
      };
  setTimeout(loop, 0);
};

App.prototype._stopLoop = function () {
  ++this._currentLoopId;
};

App.prototype._stretchCharacters = function (str) {
  var temp = [],
      n = str.length,
      j = 0;
  for (var i = 0; i < n; ++i) {
    var charCode = str.charCodeAt(i),
        newCode = null;
    if (charCode >= 33 && charCode <= 270) {
      newCode = charCode + 65248;
    } else if (charCode === 32) {
      newCode = 12288;
    }
    if (newCode !== null) {
      if (j < i) temp.push(str.substring(j, i));
      temp.push(String.fromCharCode(newCode));
      j = i + 1;
    }
  }
  if (j < n) temp.push(str.substring(j, n));
  return temp.join('');
};

App.prototype._updateRuler = function () {
  var cursor = this._editor.getCursor(),
      text = 'Line ' + (cursor.line + 1) + ', Column ' + (cursor.ch + 1);
  $('.yaja-ruler').text(text);
};

App.prototype._updateCodeSize = function () {
  var program = this._editor.getValue(),
      lines = program.split('\n'),
      chars = program.length - (lines.length - 1),
      height = chars === 0 ? 0 : lines.length,
      width = 0;
  for (var i = 0; i < height; ++i) {
    if (lines[i].length > width) width = lines[i].length;
  }
  $('.yaja-code-size').text(width + 'x' + height + ', ' + chars + ' characters');
};

App.prototype._configureLayout = function () {
  $(function () {
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

function Editor() {
  this._input = $('.yaja-input')[0];
  this._cm = CodeMirror.fromTextArea(this._input, {
    lineNumbers: true
  });
}

Editor.prototype.getValue = function () {
  return this._cm.getValue();
};

Editor.prototype.setValue = function (text) {
  return this._cm.setValue(text);
};

Editor.prototype.on = function () {
  return this._cm.on.apply(this._cm, arguments);
};

Editor.prototype.focus = function () {
  return this._cm.focus();
};

Editor.prototype.getCursor = function () {
  return this._cm.getCursor();
};

function OpenModal(app) {
  this._app = app;
  this._modal = $('.yaja-open-modal');
  this._body = $('.yaja-open-modal-body');
  this._table = this._body.find('table');
  this._tbody = this._table.find('tbody');
  this._bindListeners();
}

OpenModal.prototype.open = function () {
  if (this._app._modalOpen) return;
  this._app._modalOpen = true;
  this._updateTable();
  this._modal.modal();
};

OpenModal.prototype.close = function () {
  this._modal.modal('hide');
};

OpenModal.prototype._select = function (index) {
  if (this._selectedRow) this._selectedRow.tr.removeClass('selected');
  this._selectedRow = this._data[index];
  this._selectedRow.tr.addClass('selected');
  var top = this._selectedRow.tr.position().top,
      bottom = top + this._selectedRow.tr.height(),
      containerHeight = this._body.height();
  if (bottom > containerHeight) {
    this._body.scrollTop(this._body.scrollTop() + bottom - containerHeight);
  } else if (top < 0) {
    this._body.scrollTop(this._body.scrollTop() + top);
  }
};

OpenModal.prototype._selectedIndex = function () {
  if (this._selectedRow) return this._selectedRow.index;
};

OpenModal.prototype._loadProgram = function () {
  if (!this._selectedRow) return;
  this._app._loadSavedProgram(this._selectedRow.programName);
  this.close();
};

OpenModal.prototype._removeProgram = function () {
  if (!this._selectedRow) return;
  this._app._removeProgram(this._selectedRow.programName);
  this._data.splice(this._selectedRow.index, 1);
  for (var i = this._selectedRow.index; i < this._data.length; ++i) {
    var row = this._data[i];
    row.index = i;
    row.tr.data('index', i);
  }
  this._selectedRow.tr.remove();
  this._selectedRow = undefined;
  if (this._data.length === 0) this._addEmptyRow();
};

OpenModal.prototype._addEmptyRow = function () {
  this._tbody.append('<tr><td class="empty" colspan="2">No saved programs</td></tr>');
};

OpenModal.prototype._updateTable = function () {
  this._updateData();
  var data = this._data,
      tbody = this._tbody.detach();
  tbody.empty();
  if (data.length === 0) {
    this._addEmptyRow();
  } else {
    for (var i = 0; i < data.length; ++i) {
      var row = data[i],
          tr = $('<tr></tr>').data('index', i);
      row.tr = tr;
      $('<td class="name">' + row.programName + '</td>').appendTo(tr);
      $('<td><code>' + row.programSummary + '</code></td>').appendTo(tr);
      tr.appendTo(tbody);
    }
  }
  this._table.append(tbody);
};

OpenModal.prototype._updateData = function () {
  var savedPrograms = this._app._getSavedPrograms(),
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
  $('.yaja-open-modal-open').click(function () { self._loadProgram(); });
  $('.yaja-open-modal-delete').click(function () { self._removeProgram(); });
  this._modal.bind('hidden', function () {
    self._app._focusEditor();
    self._app._modalOpen = false;
  }).keydown(function (e) {
    var c = e.which,
        n = self._data.length,
        i = self._selectedIndex();
    if (n === 0) return;
    switch (c) {
    case KEY_CODE.DOWN_ARROW:
      self._select(i === undefined ? 0 : i < n - 1 ? i + 1 : 0);
      return false;
    case KEY_CODE.UP_ARROW:
      self._select(i === undefined ? n - 1 : i > 0 ? i - 1 : n - 1);
      return false;
    case KEY_CODE.DELETE:
      self._removeProgram();
      self._select(Math.min(i, n - 2));
      return false;
    case KEY_CODE.RETURN:
      self._loadProgram();
      return false;
    case KEY_CODE.ESCAPE:
      self.close();
      return false;
    default:
      return;
    }
  });
  this._tbody.on('click', 'tr', function () {
    self._select($(this).data('index'));
  }).on('dblclick', 'tr', function () {
    self._select($(this).data('index'));
    self._loadProgram();
  });
};

function SaveModal(app) {
  this._app = app;
  this._modal = $('.yaja-save-modal');
  this._bindListeners();
}

SaveModal.prototype.open = function () {
  if (this._app._modalOpen) return;
  this._app._modalOpen = true;
  this._modal.modal();
};

SaveModal.prototype.close = function () {
  this._modal.modal('hide');
};

SaveModal.prototype._save = function () {
  var app = this._app,
      name = $('.yaja-save-modal-name').val();
  if (!name) return;
  if (app._getSavedProgram(name)) {
    var overwrite = window.confirm("Program '" + name +
        "' already exists. Do you want to replace it?");
    if (!overwrite) return;
  }
  app._saveProgram(name);
  this.close();
};

SaveModal.prototype._bindListeners = function () {
  var self = this;
  $('.yaja-save-modal-save').click(function () { self._save(); });
  this._modal.bind('shown', function () {
    $(this).find('input').focus();
  }).bind('hidden', function () {
    self._app._focusEditor();
    self._app._modalOpen = false;
  }).keydown(function (e) {
    var c = e.which;
    switch (c) {
    case KEY_CODE.RETURN:
      self._save();
      return false;
    case KEY_CODE.ESCAPE:
      self.close();
      return false;
    default:
      return;
    }
  });
};

yaja.App = App;

})(yaja, jQuery);
