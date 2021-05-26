"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _fs = _interopRequireDefault(require("fs"));

var _url = _interopRequireDefault(require("url"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var Config = /*#__PURE__*/function () {
  // regular require function.
  function Config() {
    (0, _classCallCheck2["default"])(this, Config);
    (0, _defineProperty2["default"])(this, "_cache", {});
    (0, _defineProperty2["default"])(this, "_requireFunc", null);
    // Force webpack to run regular require() because _parse() is running a dynamic require
    // https://github.com/webpack/webpack/issues/4175
    this._requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
    this._dir = process.env.NODE_CONFIG_DIR || process.cwd() + '/config';
  } // Set config dir


  (0, _createClass2["default"])(Config, [{
    key: "dir",
    set: function set(dir) {
      this._dir = dir;
    } // Get config

  }, {
    key: "get",
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

        var _iterator = _createForOfIteratorHelper(this._files),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var file = _step.value;

            var _config = this._parse(file);

            if (_config) {
              all.push(_config);
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        this._cache.all = all;
      }

      return this._cache.all;
    } // Get config by id. Match id with all files found in _getFiles

  }, {
    key: "_getById",
    value: function _getById(id) {
      this._init();

      var _iterator2 = _createForOfIteratorHelper(this._files),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var file = _step2.value;
          var match = file.match(/-(\d+)\./);

          if (match && match[1] == id) {
            return this._parse(file);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      return false;
    } // Get config by filename. Match file with all files found in _getFiles

  }, {
    key: "_getByFile",
    value: function _getByFile(file) {
      this._init();

      var _iterator3 = _createForOfIteratorHelper(this._files),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var f = _step3.value;

          if (f.indexOf(file) > -1) {
            return this._parse(f);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      return false;
    } // Get config by url. Open all files found in _getFiles and look at the url property

  }, {
    key: "_getByUrl",
    value: function _getByUrl(url) {
      this._init();

      var hostname = _url["default"].parse(url).hostname;

      var _iterator4 = _createForOfIteratorHelper(this._files),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var file = _step4.value;

          var _config2 = this._parse(file);

          if (_config2 && _config2.url && hostname == _url["default"].parse(_config2.url).hostname) {
            return _config2;
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
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

      var _iterator5 = _createForOfIteratorHelper(_fs["default"].readdirSync(dir)),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var file = _step5.value;

          if (_fs["default"].statSync(dir + '/' + file).isDirectory()) {
            files = files.concat(this._getFiles(dir + '/' + file));
          } else {
            files.push(dir + '/' + file);
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }

      ;
      return files;
    }
  }]);
  return Config;
}();

var config = new Config();
var _default = config;
exports["default"] = _default;
//# sourceMappingURL=config.js.map