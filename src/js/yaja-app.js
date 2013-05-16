window.yaja = typeof yaja === 'undefined' ? {} : yaja;
(function (yaja, $, undefined) {
"use strict";

var iOS = !!navigator.userAgent.match(/(iPad|iPhone|iPod)/),
    Mac = !!navigator.userAgent.match(/Macintosh/);

var storage = new (function Storage(prefix) {
  this._prefix = prefix;
  this.getItem = function (key) {
    return localStorage.getItem(this._prefix + key);
  };
  this.setItem = function (key, value) {
    // TODO handle QuotaExceededError
    localStorage.setItem(this._prefix + key, value);
  };
  this.removeItem = function (key) {
    localStorage.removeItem(this._prefix + key);
  };
  this.keys = function () {
    var keys = [],
        prefixPattern = new RegExp('^' + this._prefix + '(.*)$');
    for (var i = 0; i < localStorage.length; ++i) {
      var m = localStorage.key(i).match(prefixPattern);
      if (m) keys.push(m[1]);
    }
    return keys;
  };
  this.prefixed = function (prefix) {
    return new Storage(this._prefix + prefix);
  };
})('yaja_');

var FileManager = {
  _storage: storage.prefixed('files_'),
  read: function (filename) {
    return this._storage.getItem(filename);
  },
  exists: function (filename) {
    return this._storage.getItem(filename) !== null;
  },
  write: function (filename, data) {
    this._storage.setItem(filename, data);
  },
  remove: function (filename) {
    this._storage.removeItem(filename);
  },
  list: function () {
    return this._storage.keys();
  }
};

function App(config) {
  this.config = $.extend({
    "shortcuts": {
      "mac": {
        "run": "command+return",
        "pause": "command+p",
        "reset": "command+r",
        "open": "command+o",
        "save": "command+s",
        "save_as": "command+shift+s"
      },
      "others": {
        "run": "ctrl+return",
        "pause": "ctrl+p",
        "reset": "ctrl+r",
        "open": "ctrl+o",
        "save": "ctrl+s",
        "save_as": "ctrl+shift+s"
      }
    }
  }, config);
  this._originalTitle = document.title;
  this._initObjects();
  this._bindActionListeners();
  this._configureLayout();
  this._setInterpreterStatus('Idle');
  this._restoreSavedSession();
}

App.prototype._initObjects = function () {
  var self = this;
  this._$programSize = $('.yaja-program-size');
  // CodeMirror doesn't work well with Korean keyboard (Hangul) on iPhone.
  this._editor = iOS ? new TextAreaEditor() : new CodeMirrorEditor();
  this._editor.onChange(function () {
    self._programChanged(true);
  });
  var output = this._output = $('.yaja-output')[0];
  this._out = {
    print: function (str) {
      output.value += str;
      output.scrollTop = output.scrollHeight;
    }
  };
  this._interpreter = new yaja.Interpreter();
  this._interpreter.setOut(this._out);
  this._currentLoopId = 0;
  this._openModal = new OpenModal(this);
  this._saveModal = new SaveModal(this);
  this._modalOpen = false;
};

App.prototype._bindActionListeners = function () {
  var self = this,
      actions = ['run', 'pause', 'reset',
                 'new_file', 'open', 'save', 'save_as'],
      shortcuts = this.config.shortcuts[Mac ? 'mac' : 'others'];
  for (var i = 0; i < actions.length; ++i) {
    var action = actions[i],
        button = $('.yaja-' + action),
        callback = (function () {
          var methodName = action;
          return function (e) {
            self[methodName]();
            if (e.type !== 'click') return false;
          };
        })(),
        shortcut = shortcuts[action];
    button.click(callback);
    if (shortcut) {
      button.attr('title', function () {
        return $(this).text().trim() + ' [' + shortcut + ']';
      });
      Mousetrap.bindGlobal(shortcut, callback);
    }
  }
};

App.prototype._configureLayout = function () {
  $(function () {
    $('body').layout({
      spacing_open: 1,
      north: {closable: false, resizable: false},
      south: {closable: false, resizable: false},
      center: {
        fxSpeed: "fast",
        childOptions: {
          spacing_open: Modernizr.touch ? 12 : 6,
          spacing_closed: Modernizr.touch ? 12 : 6,
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
      }
    });
  });
  if (iOS) {
    $(window).load(function () {
      setTimeout(function () { $(window).resize(); }, 0);
    });
  }
};

App.prototype._restoreSavedSession = function () {
  this._openFile(storage.getItem('current_file'));
  this._loadProgram(storage.getItem('editor_value'));
  this._programChanged(storage.getItem('dirty') !== null);
}

App.prototype.run = function () {
  var status = this._getInterpreterStatus();
  if (status === 'Running') return;
  this._setInterpreterStatus('Running');
  if (status !== 'Paused') {
    this._clearOutput();
    this._interpreter.setProgram(this._editor.getValue());
  }
  this._startInterpreterLoop();
};

App.prototype.pause = function () {
  var status = this._getInterpreterStatus();
  if (status !== 'Running') return;
  this._setInterpreterStatus('Paused');
  this._stopInterpreterLoop();
};

App.prototype.reset = function () {
  if (this._getInterpreterStatus() === 'Reset') return;
  this._setInterpreterStatus('Reset');
  this._stopInterpreterLoop();
  this._clearOutput();
};

App.prototype._clearOutput = function () {
  this._output.value = '';
};

App.prototype._startInterpreterLoop = function () {
  var self = this,
      interpreter = this._interpreter,
      // Prevent multiple calls to _startInterpreterLoop()
      // from creating as many loops as the calls.
      currentLoopId = ++this._currentLoopId,
      loop = function () {
        if (currentLoopId !== self._currentLoopId) return;
        if (interpreter.run(10000)) {  // Terminated
          self._setInterpreterStatus('Terminated');
        } else {
          setTimeout(loop, 0);
        }
      };
  setTimeout(loop, 0);
};

App.prototype._stopInterpreterLoop = function () {
  ++this._currentLoopId;
};

App.prototype._getInterpreterStatus = function () {
  return this._status;
};

App.prototype._setInterpreterStatus = function (status) {
  this._status = status;
  $('.yaja-interpreter-status').text(status);
};

App.prototype.new_file = function () {
  if (!this._confirmDiscardChanges()) return;
  this._currentFile = null;
  this._loadProgram('');
};

App.prototype.open = function () {
  if (!this._confirmDiscardChanges()) return;
  this._openModal.open();
};

App.prototype.save = function () {
  if (this._currentFile) {
    this._saveCurrentProgramAs(this._currentFile);
  } else {
    this._saveModal.open();
  }
};

App.prototype.save_as = function () {
  this._saveModal.open();
};

App.prototype._confirmDiscardChanges = function () {
  if (!this._dirty) return true;
  return window.confirm('Do you want to discard changes you made?');
}

App.prototype._openFile = function (filename) {
  this._currentFile = filename;
  this._loadProgram(FileManager.read(filename));
};

App.prototype._loadProgram = function (program) {
  if (program === null) return;
  this.reset();
  this._editor.setValue(program);
  this._programChanged(false);
};

App.prototype._saveCurrentProgramAs = function (filename) {
  this._currentFile = filename;
  FileManager.write(filename, this._editor.getValue());
  this._programChanged(false);
}

App.prototype._programChanged = function (dirty) {
  this._dirty = dirty;
  this._updateTitle();
  this._updateCodeSize();
  clearTimeout(this._autosaveTimer);
  var self = this;
  this._autosaveTimer = setTimeout(function () {
    storage.setItem('editor_value', self._editor.getValue());
    if (self._currentFile) {
      storage.setItem('current_file', self._currentFile);
    } else {
      storage.removeItem('current_file');
    }
    if (self._dirty) {
      storage.setItem('dirty', 'true');
    } else {
      storage.removeItem('dirty');
    }
  }, 3000);
};

App.prototype._updateTitle = function () {
  if (!this._currentFile) {
    document.title = this._originalTitle;
  } else {
    document.title = (this._dirty ? '*' : '') + this._currentFile + ' - ' +
        this._originalTitle;
  }
};

App.prototype._updateCodeSize = function () {
  var program = this._editor.getValue().replace(/\n*$/, ''),
      lines = program.split('\n'),
      chars = program.length - (lines.length - 1),
      height = chars === 0 ? 0 : lines.length,
      width = 0;
  for (var i = 0; i < height; ++i) {
    if (lines[i].length > width) width = lines[i].length;
  }
  this._$programSize.text(width + 'x' + height + ', ' + chars + ' characters');
};

function TextAreaEditor() {
  this._input = $('.yaja-input')[0];
  this._$input = $(this._input);
  $('.yaja-separator-program-size-ruler').remove();
  this._bindListeners();
}

TextAreaEditor.prototype.getValue = function () {
  return this._input.value;
};

TextAreaEditor.prototype.setValue = function (value) {
  this._input.value = value;
  // textarea doesn't fire change event when value is set programmatically
  this._$input.change();
};

TextAreaEditor.prototype.focus = function () {
  this._$input.focus();
};

TextAreaEditor.prototype.onChange = function (callback) {
  this._$input.change(callback);
};

function CodeMirrorEditor() {
  // CodeMirror offers following features:
  // * Line numbers at the left
  // * Detect cursor movement and get current cursor position
  // * Convert characters being inserted
  this._input = $('.yaja-input')[0];
  this._cm = CodeMirror.fromTextArea(this._input, {lineNumbers: true});
  this._$ruler = $('.yaja-ruler');
  this._bindListeners();
  this._updateRuler();
}

CodeMirrorEditor.prototype._bindListeners = function () {
  var self = this;
  this._cm.on('beforeChange', function (cm, changeObj) {
    var text = changeObj.text,
        n = text.length;
    for (var i = 0; i < n; ++i) text[i] = stretchCharacters(text[i]);
    changeObj.update(undefined, undefined, text);
  });
  this._cm.on('cursorActivity', function () { self._updateRuler(); });
};

CodeMirrorEditor.prototype.getValue = function () {
  return this._cm.getValue();
};

CodeMirrorEditor.prototype.setValue = function (value) {
  this._cm.setValue(value);
};

CodeMirrorEditor.prototype.focus = function () {
  this._cm.focus();
};

CodeMirrorEditor.prototype.onChange = function (callback) {
  this._cm.on('change', callback);
};

CodeMirrorEditor.prototype._updateRuler = function () {
  var cursor = this._cm.getCursor(),
      text = 'Line ' + (cursor.line + 1) + ', Column ' + (cursor.ch + 1);
  this._$ruler.text(text);
};

var KEY_CODE = {
  BACKSPACE: 8,
  RETURN: 13,
  ESCAPE: 27,
  LEFT_ARROW: 37,
  UP_ARROW: 38,
  RIGHT_ARROW: 39,
  DOWN_ARROW: 40,
  DELETE: 46
};

function OpenModal(app) {
  this._app = app;
  this._modal = $('.yaja-open-modal');
  this._body = $('.yaja-open-modal-body');
  this._table = this._body.find('table');
  this._tbody = this._table.find('tbody');
  this._data = [];
  this._selectedRow = null;
  this._bindListeners();
}

OpenModal.prototype._bindListeners = function () {
  var self = this;
  $('.yaja-open-modal-open').click(function () { self._openFile(); });
  $('.yaja-open-modal-delete').click(function () { self._removeFile(); });
  this._modal.bind({
    hidden: function () {
      self._app._editor.focus();
      self._app._modalOpen = false;
    },
    keydown: function (e) {
      var c = e.which,
          n = self._data.length,
          i = self._getSelectedIndex();
      if (n === 0) return;
      switch (c) {
        case KEY_CODE.DOWN_ARROW:
          self._selectRow(i === null ? 0 : i < n - 1 ? i + 1 : 0);
          return false;
        case KEY_CODE.UP_ARROW:
          self._selectRow(i === null ? n - 1 : i > 0 ? i - 1 : n - 1);
          return false;
        case KEY_CODE.DELETE:
        case KEY_CODE.BACKSPACE:
          self._removeFile();
          self._selectRow(Math.min(i, n - 2));
          return false;
        case KEY_CODE.RETURN:
          self._openFile();
          return false;
        case KEY_CODE.ESCAPE:
          self.close();
          return false;
        default:
          return;
      }
    }
  });
  this._tbody.on('click', 'tr', function () {
    self._selectRow($(this).data('index'));
  }).on('dblclick', 'tr', function () {
    self._selectRow($(this).data('index'));
    self._openFile();
  });
};

OpenModal.prototype.open = function () {
  if (this._app._modalOpen) return;
  this._app._modalOpen = true;
  this._updateTable();
  this._modal.modal();
};

OpenModal.prototype.close = function () {
  this._modal.modal('hide');
};

OpenModal.prototype._updateData = function () {
  var filenames = FileManager.list(),
      data = [];
  filenames.sort();
  for (var i = 0; i < filenames.length; ++i) {
    var filename = filenames[i],
        row = {
          index: i,
          filename: filename,
          summary: FileManager.read(filename).substr(0, 80)
        };
    data.push(row);
  }
  this._data = data;
  this._selectedRow = null;
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
      $('<td class="name">' + row.filename + '</td>').appendTo(tr);
      $('<td><code>' + row.summary + '</code></td>').appendTo(tr);
      tr.appendTo(tbody);
    }
  }
  this._table.append(tbody);
};

OpenModal.prototype._addEmptyRow = function () {
  this._tbody.append('<tr><td class="empty" colspan="2">No saved programs</td></tr>');
};

OpenModal.prototype._selectRow = function (index) {
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

OpenModal.prototype._getSelectedIndex = function () {
  return this._selectedRow ? this._selectedRow.index : null;
};

OpenModal.prototype._openFile = function () {
  if (!this._selectedRow) return;
  this._app._openFile(this._selectedRow.filename);
  this.close();
};

OpenModal.prototype._removeFile = function () {
  if (!this._selectedRow) return;
  var filename = this._selectedRow.filename;
  FileManager.remove(filename);
  this._data.splice(this._selectedRow.index, 1);
  for (var i = this._selectedRow.index; i < this._data.length; ++i) {
    var row = this._data[i];
    row.index = i;
    row.tr.data('index', i);
  }
  this._selectedRow.tr.remove();
  this._selectedRow = null;
  if (this._data.length === 0) this._addEmptyRow();
  if (this._app._currentFile === filename) {
    this._app._programChanged(true);
  }
};

function SaveModal(app) {
  this._app = app;
  this._modal = $('.yaja-save-modal');
  this._bindListeners();
}

SaveModal.prototype._bindListeners = function () {
  var self = this;
  $('.yaja-save-modal-save').click(function () { self._save(); });
  this._modal.bind({
    shown: function () {
      $(this).find('input').focus();
    },
    hidden: function () {
      self._app._editor.focus();
      self._app._modalOpen = false;
    },
    keydown: function (e) {
      var c = e.which;
      switch (c) {
        case KEY_CODE.RETURN: self._save(); return false;
        case KEY_CODE.ESCAPE: self.close(); return false;
        default: return;
      }
    }
  });
};

SaveModal.prototype.open = function () {
  if (this._app._modalOpen) return;
  this._app._modalOpen = true;
  this._modal.modal();
};

SaveModal.prototype.close = function () {
  this._modal.modal('hide');
};

SaveModal.prototype._save = function () {
  var filename = $('.yaja-save-modal-name').val();
  if (!filename) return;
  if (FileManager.exists(filename)) {
    var overwrite = window.confirm("Program '" + filename +
        "' already exists. Do you want to replace it?");
    if (!overwrite) return;
  }
  this._app._saveCurrentProgramAs(filename);
  this.close();
};

function stretchCharacters(str) {
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
}

yaja.App = App;

})(yaja, jQuery);
