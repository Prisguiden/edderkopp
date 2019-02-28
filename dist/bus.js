"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.warn = warn;
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _events = _interopRequireDefault(require("events"));

var Bus =
/*#__PURE__*/
function (_EventEmitter) {
  (0, _inherits2.default)(Bus, _EventEmitter);

  function Bus() {
    (0, _classCallCheck2.default)(this, Bus);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(Bus).apply(this, arguments));
  }

  return Bus;
}(_events.default);

var bus = new Bus();
var _default = bus;
exports.default = _default;

function warn(message) {
  bus.emit('log', 'warn', message);
}
//# sourceMappingURL=bus.js.map