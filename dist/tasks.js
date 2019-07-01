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

var prefix = '[tasks] ';

var Tasks =
/*#__PURE__*/
function () {
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


      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = tasks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var task = _step.value;
          var name = task[0];

          if (!!this._tasks[name]) {
            var args = task.slice(1);
            var tmp = [];
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = values[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var value = _step2.value;

                var res = this._tasks[name](value, args);

                if (res) {
                  tmp = tmp.concat(res);
                }
              }
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                  _iterator2["return"]();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
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
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
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