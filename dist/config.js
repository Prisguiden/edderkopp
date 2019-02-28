"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _fs = _interopRequireDefault(require("fs"));

var _url = _interopRequireDefault(require("url"));

var Config =
/*#__PURE__*/
function () {
  // regular require function.
  function Config() {
    (0, _classCallCheck2.default)(this, Config);
    (0, _defineProperty2.default)(this, "_cache", {});
    (0, _defineProperty2.default)(this, "_requireFunc", null);
    // Force webpack to run regular require() because _parse() is running a dynamic require
    // https://github.com/webpack/webpack/issues/4175
    this._requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
    this._dir = process.env.NODE_CONFIG_DIR || process.cwd() + '/config';
  } // Set config dir


  (0, _createClass2.default)(Config, [{
    key: "get",
    // Get config
    value: function get(arg) {
      if (!this._cache[arg]) {
        if (Number.isInteger(arg)) {
          // support id in filename (ex: configfile-<id>.js)
          this._cache[arg] = this._getById(arg);
        } else if (arg.indexOf('http') !== -1) {
          // support url (will look for the url property in all config files)
          this._cache[arg] = this._getByUrl(arg);
        } else if (arg.indexOf('/') !== -1) {
          // support full path of file (ex: /home/user/config.js)
          this._cache[arg] = this._parse(arg);
        } else {
          // support recursive search for config file in dir. return first found (ex: configfile.js)
          this._cache[arg] = this._getByFile(arg);
        }
      }

      return this._cache[arg];
    } // Get config

  }, {
    key: "getAll",
    value: function getAll() {
      if (!this._cache.all) {
        this._init();

        var all = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this._files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var file = _step.value;

            var _config = this._parse(file);

            if (_config) {
              all.push(_config);
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        this._cache.all = all;
      }

      return this._cache.all;
    } // Get config by id. Match id with all files found in _getFiles

  }, {
    key: "_getById",
    value: function _getById(id) {
      this._init();

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this._files[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var file = _step2.value;
          var match = file.match(/-(\d+)\./);

          if (match && match[1] == id) {
            return this._parse(file);
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return false;
    } // Get config by filename. Match file with all files found in _getFiles

  }, {
    key: "_getByFile",
    value: function _getByFile(file) {
      this._init();

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this._files[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var f = _step3.value;

          if (f.indexOf(file) > -1) {
            return this._parse(f);
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      return false;
    } // Get config by url. Open all files found in _getFiles and look at the url property

  }, {
    key: "_getByUrl",
    value: function _getByUrl(url) {
      this._init();

      var hostname = _url.default.parse(url).hostname;

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = this._files[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var file = _step4.value;

          var _config2 = this._parse(file);

          if (_config2 && _config2.url && hostname == _url.default.parse(_config2.url).hostname) {
            return _config2;
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return false;
    } // Get filenames

  }, {
    key: "_init",
    value: function _init() {
      if (!this._files) {
        this._files = this._getFiles(this._dir);
      }
    } // Open and parse file

  }, {
    key: "_parse",
    value: function _parse(file) {
      if (file.match(/\.js$/)) {
        return this._requireFunc(file);
      } else {
        return false;
      }
    } // Recursivly find all filenames

  }, {
    key: "_getFiles",
    value: function _getFiles(dir) {
      var files = [];
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = _fs.default.readdirSync(dir)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var file = _step5.value;

          if (_fs.default.statSync(dir + '/' + file).isDirectory()) {
            files = files.concat(this._getFiles(dir + '/' + file));
          } else {
            files.push(dir + '/' + file);
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      ;
      return files;
    }
  }, {
    key: "dir",
    set: function set(dir) {
      this._dir = dir;
    }
  }]);
  return Config;
}();

var config = new Config();
var _default = config;
exports.default = _default;
//# sourceMappingURL=config.js.map