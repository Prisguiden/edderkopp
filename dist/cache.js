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

var Cache =
/*#__PURE__*/
function () {
  function Cache(file) {
    (0, _classCallCheck2["default"])(this, Cache);
    (0, _defineProperty2["default"])(this, "_cache", void 0);

    if (file) {
      this._file = file;
    }
  }

  (0, _createClass2["default"])(Cache, [{
    key: "has",
    value: function has(url) {
      this._init();

      return !!this._cache[url];
    }
  }, {
    key: "get",
    value: function get(url) {
      this._init();

      return this._cache[url];
    }
  }, {
    key: "set",
    value: function set(url, value) {
      this._init();

      this._cache[url] = value;
    }
  }, {
    key: "write",
    value: function write() {
      if (this._file) {
        _fs["default"].writeFileSync(this._file, JSON.stringify(this._cache));
      }
    }
  }, {
    key: "keys",
    value: function keys() {
      this._init();

      return Object.keys(this._cache);
    }
  }, {
    key: "_init",
    value: function _init() {
      if (this._cache === undefined) {
        if (this._file) {
          try {
            var f = _fs["default"].readFileSync(this._file);

            this._cache = JSON.parse(f.toString());
          } catch (err) {
            this._cache = {};
          }
        } else {
          this._cache = {};
        }
      }
    }
  }]);
  return Cache;
}();

exports["default"] = Cache;
//# sourceMappingURL=cache.js.map