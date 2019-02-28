"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _request = _interopRequireDefault(require("request"));

var _puppeteer = _interopRequireDefault(require("puppeteer"));

var Download =
/*#__PURE__*/
function () {
  // delay 2-5 sec (simulate a user)
  function Download(options) {
    (0, _classCallCheck2.default)(this, Download);
    (0, _defineProperty2.default)(this, "_timeout", 30000);
    (0, _defineProperty2.default)(this, "_cache", false);
    (0, _defineProperty2.default)(this, "_delay", [2, 5]);
    (0, _defineProperty2.default)(this, "_force", false);
    (0, _defineProperty2.default)(this, "_followRedirect", true);
    (0, _defineProperty2.default)(this, "_renderWithBrowser", false);

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

  (0, _createClass2.default)(Download, [{
    key: "get",
    value: function get(url, cookies) {
      var _this = this;

      if (cookies) {
        this._jar = _request.default.jar();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = cookies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var cookie = _step.value;

            this._jar.setCookie(cookie, url);
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
      } // Get from cache or download it?


      if (this._cache && !this._force && this._cache.has(url)) {
        var res = {
          content: this._cache.get(url),
          cached: true
        };
        return Promise.resolve(res);
      } else {
        return (0, _asyncToGenerator2.default)(
        /*#__PURE__*/
        _regenerator.default.mark(function _callee() {
          var delay, options, res;
          return _regenerator.default.wrap(function _callee$(_context) {
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
                      'User-Agent': USER_AGENT
                    },
                    followRedirect: _this._followRedirect,
                    gzip: true,
                    timeout: _this._timeout,
                    bannedRequestUrlsRegexp: BANNED_REQUEST_URLS_REGEXP ? BANNED_REQUEST_URLS_REGEXP : []
                  };

                  if (_this._headers) {
                    options.headers = (0, _objectSpread2.default)({}, options.headers, _this._headers);
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
        (0, _request.default)(options, function (error, response, content) {
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
              reject('Response code: ' + response.statusCode);
            }
        });
      });
    }
  }, {
    key: "_downloadWithPuppeteer",
    value: function _downloadWithPuppeteer(options) {
      var _this3 = this;

      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref2 = (0, _asyncToGenerator2.default)(
        /*#__PURE__*/
        _regenerator.default.mark(function _callee4(resolve, reject) {
          var t0, debug, abortMessage, browser, page, headersToSet, key, navigateOptions, gotoError, response, rejectMsg, headers, statusCode, content, diff, time;
          return _regenerator.default.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  t0 = process.hrtime();
                  debug = false;
                  abortMessage = '';
                  _context4.next = 5;
                  return _puppeteer.default.launch({
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
                  page.on('error',
                  /*#__PURE__*/
                  function () {
                    var _ref3 = (0, _asyncToGenerator2.default)(
                    /*#__PURE__*/
                    _regenerator.default.mark(function _callee2(err) {
                      return _regenerator.default.wrap(function _callee2$(_context2) {
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
                  page.on('pageerror', function (err) {
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
                  page.on('request', function (request) {
                    var requestUrl = request.url(); // Handle navigation redirects based on followRedirect option.

                    if (!options.followRedirect && request.isNavigationRequest() && request.redirectChain().length) {
                      var prevResponse = request.redirectChain()[0].response();
                      abortMessage = "Aborting redirect for url: ".concat(requestUrl, " status: ").concat(prevResponse.status(), " status: ").concat(prevResponse.statusText());
                      request.abort();
                    } else {
                      // Skip certain requests
                      if (requestUrl) {
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                          for (var _iterator2 = options.bannedRequestUrlsRegexp[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var regexp = _step2.value;

                            if (requestUrl.match(regexp)) {
                              request.abort();
                              return;
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
                      }

                      request.continue();
                    }
                  });
                  navigateOptions = {
                    timeout: options.timeout,
                    waitUntil: 'load' // TODO create option for waitUntil
                    // Begin navigating to url

                  };
                  gotoError = null;
                  _context4.next = 23;
                  return page.goto(options.url, navigateOptions).catch(
                  /*#__PURE__*/
                  function () {
                    var _ref4 = (0, _asyncToGenerator2.default)(
                    /*#__PURE__*/
                    _regenerator.default.mark(function _callee3(err) {
                      return _regenerator.default.wrap(function _callee3$(_context3) {
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
                  _context4.next = 41;
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
                  ; // await page.screenshot({'path':'/path/to/save/screenshot'});

                  _context4.next = 37;
                  return browser.close();

                case 37:
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

                case 41:
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

exports.default = Download;
//# sourceMappingURL=download.js.map