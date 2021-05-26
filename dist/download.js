"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _request = _interopRequireDefault(require("request"));

var _puppeteer = _interopRequireDefault(require("puppeteer"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var Download = /*#__PURE__*/function () {
  // delay 2-5 sec (simulate a user)
  function Download(options) {
    (0, _classCallCheck2["default"])(this, Download);
    (0, _defineProperty2["default"])(this, "_timeout", 30000);
    (0, _defineProperty2["default"])(this, "_cache", false);
    (0, _defineProperty2["default"])(this, "_delay", [2, 5]);
    (0, _defineProperty2["default"])(this, "_force", false);
    (0, _defineProperty2["default"])(this, "_followRedirect", true);
    (0, _defineProperty2["default"])(this, "_renderWithBrowser", false);

    if (options.timeout !== undefined) {
      this._timeout = options.timeout;
    }

    if (options.delay !== undefined) {
      this._delay = options.delay;
    }

    if (options.cache !== undefined) {
      this._cache = options.cache;
    }

    if (options.force !== undefined) {
      this._force = options.force;
    }

    if (options.followRedirect !== undefined) {
      this._followRedirect = options.followRedirect;
    }

    if (options.renderWithBrowser !== undefined) {
      this._renderWithBrowser = options.renderWithBrowser;
    }

    if (options.headers !== undefined) {
      this._headers = options.headers;
    }
  }

  (0, _createClass2["default"])(Download, [{
    key: "get",
    value: function get(url, cookies) {
      var _this = this;

      if (cookies) {
        this._jar = _request["default"].jar();

        var _iterator = _createForOfIteratorHelper(cookies),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var cookie = _step.value;

            this._jar.setCookie(cookie, url);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      } // Get from cache or download it?


      if (this._cache && !this._force && this._cache.has(url)) {
        var res = {
          content: this._cache.get(url),
          cached: true
        };
        return Promise.resolve(res);
      } else {
        return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
          var delay, options, res;
          return _regenerator["default"].wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  delay = 0;

                  if (!_this._useDelay) {
                    _context.next = 7;
                    break;
                  }

                  delay = !Array.isArray(_this._delay) ? _this._delay : _this._delay[0] + (_this._delay[1] - _this._delay[0]) * Math.random();
                  _context.next = 5;
                  return new Promise(function (resolve) {
                    return setTimeout(resolve, delay * 1000);
                  });

                case 5:
                  _context.next = 8;
                  break;

                case 7:
                  // Don't delay first download
                  _this._useDelay = true;

                case 8:
                  // Prepare options for request
                  options = {
                    url: url,
                    headers: {
                      "User-Agent": USER_AGENT
                    },
                    followRedirect: _this._followRedirect,
                    gzip: true,
                    timeout: _this._timeout,
                    agentOptions: {
                      ecdhCurve: "auto"
                    },
                    bannedRequestUrlsRegexp: BANNED_REQUEST_URLS_REGEXP ? BANNED_REQUEST_URLS_REGEXP : []
                  };

                  if (_this._headers) {
                    options.headers = _objectSpread(_objectSpread({}, options.headers), _this._headers);
                  }

                  if (_this._jar) {
                    options.jar = _this._jar;
                  }

                  res = null;

                  if (!_this._renderWithBrowser) {
                    _context.next = 18;
                    break;
                  }

                  _context.next = 15;
                  return _this._downloadWithPuppeteer(options);

                case 15:
                  res = _context.sent;
                  _context.next = 21;
                  break;

                case 18:
                  _context.next = 20;
                  return _this._download(options);

                case 20:
                  res = _context.sent;

                case 21:
                  res.delay = delay;
                  return _context.abrupt("return", res);

                case 23:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }))();
      }
    }
  }, {
    key: "_download",
    value: function _download(options) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var t0 = process.hrtime();
        (0, _request["default"])(options, function (error, response, content) {
          if (error !== null) {
            reject(error);
          } // Note: the strange 301|302 condition is for the very weird case where a site returns a 301|302
          // with the correct content! Then we don't want to follow redirect, just return the body.
          else if (response.statusCode === 200 || /30[12]/.test(response.statusCode) && !_this2._followRedirect) {
              // Debug info
              var diff = process.hrtime(t0);
              var time = diff[0] + diff[1] * 1e-9;

              if (_this2._cache) {
                _this2._cache.set(options.url, content);
              }

              resolve({
                statusCode: response.statusCode,
                headers: response.headers,
                content: content,
                time: time
              });
            } else {
              reject("Response code: " + response.statusCode);
            }
        });
      });
    }
  }, {
    key: "_downloadWithPuppeteer",
    value: function _downloadWithPuppeteer(options) {
      var _this3 = this;

      return new Promise( /*#__PURE__*/function () {
        var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(resolve, reject) {
          var t0, debug, abortMessage, browser, page, headersToSet, key, navigateOptions, gotoError, response, rejectMsg, headers, statusCode, content, diff, time;
          return _regenerator["default"].wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  t0 = process.hrtime();
                  debug = false;
                  abortMessage = "";
                  _context4.next = 5;
                  return _puppeteer["default"].launch({
                    headless: true,
                    slowMo: 0 // slow down by ms

                  });

                case 5:
                  browser = _context4.sent;
                  _context4.next = 8;
                  return browser.newPage();

                case 8:
                  page = _context4.sent;

                  /**
                   * Handle exceptions
                   */
                  page.on("error", /*#__PURE__*/function () {
                    var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(err) {
                      return _regenerator["default"].wrap(function _callee2$(_context2) {
                        while (1) {
                          switch (_context2.prev = _context2.next) {
                            case 0:
                              _context2.next = 2;
                              return browser.close();

                            case 2:
                              reject("error: " + err.toString());

                            case 3:
                            case "end":
                              return _context2.stop();
                          }
                        }
                      }, _callee2);
                    }));

                    return function (_x3) {
                      return _ref3.apply(this, arguments);
                    };
                  }());
                  page.on("pageerror", function (err) {
                    if (debug) {
                      console.log(err.toString());
                    }
                  });

                  if (!options.headers) {
                    _context4.next = 16;
                    break;
                  }

                  headersToSet = {};

                  for (key in options.headers) {
                    headersToSet[key.toLowerCase()] = options.headers[key];
                  }

                  _context4.next = 16;
                  return page.setExtraHTTPHeaders(headersToSet);

                case 16:
                  _context4.next = 18;
                  return page.setRequestInterception(true);

                case 18:
                  // for each request/resource download
                  page.on("request", function (request) {
                    var requestUrl = request.url(); // Handle navigation redirects based on followRedirect option.

                    if (!options.followRedirect && request.isNavigationRequest() && request.redirectChain().length) {
                      var prevResponse = request.redirectChain()[0].response();
                      abortMessage = "Aborting redirect for url: ".concat(requestUrl, " status: ").concat(prevResponse.status(), " status: ").concat(prevResponse.statusText());
                      request.abort();
                    } else {
                      // Skip certain requests
                      if (requestUrl) {
                        var _iterator2 = _createForOfIteratorHelper(options.bannedRequestUrlsRegexp),
                            _step2;

                        try {
                          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                            var regexp = _step2.value;

                            if (requestUrl.match(regexp)) {
                              request.abort();
                              return;
                            }
                          }
                        } catch (err) {
                          _iterator2.e(err);
                        } finally {
                          _iterator2.f();
                        }
                      }

                      request["continue"]();
                    }
                  });
                  navigateOptions = {
                    timeout: options.timeout,
                    waitUntil: "load" // TODO create option for waitUntil

                  }; // Begin navigating to url

                  gotoError = null;
                  _context4.next = 23;
                  return page["goto"](options.url, navigateOptions)["catch"]( /*#__PURE__*/function () {
                    var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(err) {
                      return _regenerator["default"].wrap(function _callee3$(_context3) {
                        while (1) {
                          switch (_context3.prev = _context3.next) {
                            case 0:
                              _context3.next = 2;
                              return browser.close();

                            case 2:
                              gotoError = abortMessage ? new Error(abortMessage) : new Error(err);

                            case 3:
                            case "end":
                              return _context3.stop();
                          }
                        }
                      }, _callee3);
                    }));

                    return function (_x4) {
                      return _ref4.apply(this, arguments);
                    };
                  }());

                case 23:
                  response = _context4.sent;

                  if (response) {
                    _context4.next = 29;
                    break;
                  }

                  rejectMsg = gotoError || new Error("Unhandled response from page.goto");
                  reject(rejectMsg);
                  _context4.next = 40;
                  break;

                case 29:
                  headers = response.headers();
                  statusCode = response.status(); // Get html

                  _context4.next = 33;
                  return page.evaluate(function () {
                    return document.documentElement.outerHTML;
                  });

                case 33:
                  content = _context4.sent;
                  _context4.next = 36;
                  return browser.close();

                case 36:
                  // Debug info
                  diff = process.hrtime(t0);
                  time = diff[0] + diff[1] * 1e-9;

                  if (_this3._cache) {
                    _this3._cache.set(options.url, content);
                  }

                  resolve({
                    statusCode: statusCode,
                    headers: headers,
                    content: content,
                    time: time
                  });

                case 40:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4);
        }));

        return function (_x, _x2) {
          return _ref2.apply(this, arguments);
        };
      }());
    }
  }]);
  return Download;
}();

exports["default"] = Download;
//# sourceMappingURL=download.js.map