"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _winston = _interopRequireDefault(require("winston"));

var _util = _interopRequireDefault(require("util"));

_winston.default.emitErrs = true;

var Log =
/*#__PURE__*/
function () {
  function Log() {
    var _this = this;

    (0, _classCallCheck2.default)(this, Log);
    (0, _defineProperty2.default)(this, "_log", void 0);
    (0, _defineProperty2.default)(this, "_settings", void 0);
    (0, _defineProperty2.default)(this, "_level", 'info');
    this._log = new _winston.default.Logger({
      transports: [new _winston.default.transports.Console({
        level: this._level,
        handleExceptions: false,
        json: false,
        prettyPrint: true,
        colorize: true
      })],
      exitOnError: false
    });
    this._settings = this._log.transports.console; // Mapping methods to winston and support util.format('a %s c', 'b')

    ['silly', 'debug', 'verbose', 'info', 'warn', 'error'].forEach(function (func) {
      _this[func] = function () {
        for (var _len = arguments.length, arg = new Array(_len), _key = 0; _key < _len; _key++) {
          arg[_key] = arguments[_key];
        }

        _this._log[func](arg[1] !== undefined ? _util.default.format.apply(null, arg) : arg[0]);
      };
    });
  }

  (0, _createClass2.default)(Log, [{
    key: "file",
    set: function set(filename) {
      this._log = new _winston.default.Logger({
        transports: [new _winston.default.transports.File({
          level: this._level,
          filename: filename,
          zippedArchive: true,
          tailable: true,
          handleExceptions: false,
          json: false,
          maxsize: 5242880,
          // 5MB
          maxFiles: 5
        })],
        exitOnError: false
      });
      this._settings = this._log.transports.file;
    }
    /**
     * Config levels:
     *   silly: 0,
     *   debug: 1,
     *   verbose: 2,
     *   info: 3,
     *   warn: 4,
     *   error: 5
     */

  }, {
    key: "level",
    set: function set(level) {
      this._level = level;
      this._settings.level = level;
    }
  }]);
  return Log;
}();

var log = new Log();
var _default = log;
exports.default = _default;
//# sourceMappingURL=log.js.map