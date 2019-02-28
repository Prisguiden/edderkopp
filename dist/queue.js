"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var Queue =
/*#__PURE__*/
function () {
  function Queue() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck2.default)(this, Queue);
    this.maxItems = options.maxItems !== undefined ? options.maxItems : Number.MAX_VALUE;
    this.maxDepth = options.maxDepth !== undefined ? options.maxDepth : Number.MAX_VALUE;
    this.init();
  }

  (0, _createClass2.default)(Queue, [{
    key: "init",
    value: function init() {
      this._stack = {
        add: [],
        get: []
      };
      this._depth = 0;
      this._items = 0;
    }
  }, {
    key: "add",
    value: function add(items) {
      if (!Array.isArray(items)) {
        items = [items];
      }

      for (var i = 0; i < items.length; i++) {
        if (this._items < this.maxItems) {
          this._stack.add.push(items[i]);

          this._items++;
        } else {
          // Reached max items, don't add more
          break;
        }
      }

      ;
    }
  }, {
    key: "get",
    value: function get() {
      if (this._stack.get.length) {
        return this._stack.get.pop();
      } else {
        if (this._stack.add.length) {
          if (this._depth < this.maxDepth) {
            this._stack.get = this._stack.add;
            this._stack.add = [];
            this._depth++;
            return this._stack.get.pop();
          } else {
            // Reached max depth
            return false;
          }
        } else {
          // Out of items
          return false;
        }
      }
    }
  }, {
    key: "empty",
    get: function get() {
      return this._stack.add.length == 0 && this._stack.get.length == 0;
    }
  }, {
    key: "depth",
    get: function get() {
      return this._depth;
    }
  }]);
  return Queue;
}();

exports.default = Queue;
//# sourceMappingURL=queue.js.map