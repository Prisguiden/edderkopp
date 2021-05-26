"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _bus = require("./bus");

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var prefix = '[tasks] ';

var Tasks = /*#__PURE__*/function () {
  function Tasks() {
    (0, _classCallCheck2["default"])(this, Tasks);
  }

  (0, _createClass2["default"])(Tasks, null, [{
    key: "inject",
    value: function inject(tasks) {
      for (var prop in tasks) {
        if (this._tasks[prop]) {
          (0, _bus.warn)(prefix + 'Overriding task: ' + prop);
        }

        this._tasks[prop] = tasks[prop];
      }
    } // Run task(s) on value(s)

  }, {
    key: "run",
    value: function run(tasks, values) {
      // Support one or more tasks
      // a) "task": "foobar"
      // b) "task": [ "foobar", "arg1", "arg2" ]
      // c) "task": [
      //     [ "foobar1", "arg1a", "arg1b" ],
      //     [ "foobar2", "arg2a", "arg2b" ]
      //   ]
      // Rewrite a) and b) to c)
      if (typeof tasks == 'string') {
        // a
        tasks = [[tasks]];
      } else if (!Array.isArray(tasks[0])) {
        // b
        tasks = [tasks];
      } // Support one or more values


      if (typeof values == 'string') {
        values = [values];
      } // Run tasks and pipe result from one to the next unless !!<result> === false


      var _iterator = _createForOfIteratorHelper(tasks),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var task = _step.value;
          var name = task[0];

          if (!!this._tasks[name]) {
            var args = task.slice(1);
            var tmp = [];

            var _iterator2 = _createForOfIteratorHelper(values),
                _step2;

            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var value = _step2.value;

                var res = this._tasks[name](value, args);

                if (res) {
                  tmp = tmp.concat(res);
                }
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }

            values = tmp;

            if (!values.length) {
              break;
            }
          } else {
            (0, _bus.warn)(prefix + 'Task doesn\'t exist: ' + name);
          }
        } // No need to wrap single/empty values in an array

      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      if (Array.isArray(values) && values.length <= 1) {
        values = values.length == 1 ? values.pop() : null;
      }

      return values;
    }
  }]);
  return Tasks;
}(); // Default tasks


exports["default"] = Tasks;
(0, _defineProperty2["default"])(Tasks, "_tasks", {});
var tasks = {
  // task: [ 'eval', 'JSON.parse(value).foo.bar' ]
  // task: [ 'eval', 'value.foo.bar[0].message' ]
  eval: function _eval(value, args) {
    return eval(args[0]);
  },
  // task: [ 'match', '\\/(\\w+)-(\\d+)' ] => returns value or null
  // task: [ 'match', '\\/(\\w+)-(\\d+)', 2 ] => returns matches[2] or null
  match: function match(value, args) {
    var matches = value.match(new RegExp(args[0]));

    if (matches) {
      return args[1] === undefined ? value : matches[args[1]];
    } else {
      return null;
    }
  },
  // task: [ 'prepend',  'http://foo.bar/' ]
  prepend: function prepend(value, args) {
    return args[0] + value;
  },
  // task: [ 'append',  '&foo=bar' ]
  append: function append(value, args) {
    return value + args[0];
  },
  // task: [ 'insert',  'http://foo.com/{value}/bar' ]
  insert: function insert(value, args) {
    return args[0].replace(/\{.+\}/, value);
  },
  // task: [ 'split',  ', ' ]
  split: function split(value, args) {
    return value.split(args[0]);
  },
  // Replace a with b in c supporting arrays
  // task: [ 'replace',  'foo', 'bar' ]
  // task: [ 'replace',  [ 'a', 'b' ],  [ 'c', 'e' ] ]
  // task: [ 'replace',  '[\\r\\n\\t\\s]+', '', 'regexp' ]
  replace: function replace(value, args) {
    var s = args[0]; // search for

    var r = args[1]; // replace with

    var re = args[2]; // optional regexp

    if (typeof s == 'string' && typeof r == 'string') {
      s = [s];
      r = [r];
    }

    var pattern;

    for (var i = 0; i < s.length; i++) {
      pattern = re == 'regexp' ? new RegExp(s[i], 'g') : s[i];
      value = value.replace(pattern, r[i]);
    }

    return value;
  },
  // task: 'parseInt'
  parseInt: function (_parseInt) {
    function parseInt(_x) {
      return _parseInt.apply(this, arguments);
    }

    parseInt.toString = function () {
      return _parseInt.toString();
    };

    return parseInt;
  }(function (value) {
    if (typeof value === 'number') {
      return value;
    }

    value = value ? value.replace(/[^\d]/g, '') : null;
    return value ? parseInt(value, 10) : null;
  }),
  // task: 'urldecode'
  urldecode: function urldecode(value) {
    return decodeURIComponent(value);
  }
};
Tasks.inject(tasks);
//# sourceMappingURL=tasks.js.map