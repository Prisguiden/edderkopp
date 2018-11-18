"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

var _puppeteer = require("puppeteer");

var _puppeteer2 = _interopRequireDefault(_puppeteer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Download = function () {
    function Download(options) {
        (0, _classCallCheck3.default)(this, Download);
        this._timeout = 60000;
        this._cache = false;
        this._delay = [2, 5];
        this._force = false;
        this._followRedirect = true;
        this._renderWithJs = false;

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
        if (options.renderWithJs !== undefined) {
            this._renderWithJs = options.renderWithJs;
        }
    } // delay 2-5 sec (simulate a user)


    (0, _createClass3.default)(Download, [{
        key: "get",
        value: function get(url, cookies) {
            var _this = this;

            if (cookies) {
                this._jar = _request2.default.jar();
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = (0, _getIterator3.default)(cookies), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var cookie = _step.value;

                        this._jar.setCookie(cookie, url);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }

            // Get from cache or download it?
            if (this._cache && !this._force && this._cache.has(url)) {
                var res = {
                    content: this._cache.get(url),
                    cached: true
                };
                return _promise2.default.resolve(res);
            } else {
                return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                    var delay, options, res;
                    return _regenerator2.default.wrap(function _callee$(_context) {
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
                                    return new _promise2.default(function (resolve) {
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
                                        timeout: _this._timeout
                                    };

                                    if (_this._jar) {
                                        options.jar = _this._jar;
                                    }
                                    res = null;

                                    if (!_this._renderWithJs) {
                                        _context.next = 18;
                                        break;
                                    }

                                    console.log("downloading with puppeteer");
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
                    }, _callee, _this);
                }))();
            }
        }
    }, {
        key: "_download",
        value: function _download(options) {
            var _this2 = this;

            return new _promise2.default(function (resolve, reject) {
                var t0 = process.hrtime();
                (0, _request2.default)(options, function (error, response, content) {
                    if (error !== null) {
                        reject(error);
                    }
                    // Note: the strange 301|302 condition is for the very weird case where a site returns a 301|302
                    // with the correct content! Then we don't want to follow redirect, just return the body.
                    else if (response.statusCode === 200 || /30[12]/.test(response.statusCode) && !_this2._followRedirect) {
                            // Debug info
                            var diff = process.hrtime(t0);
                            var time = diff[0] + diff[1] * 1e-9;

                            if (_this2._cache) {
                                _this2._cache.set(options.url, content);
                            }
                            resolve({ statusCode: response.statusCode, headers: response.headers, content: content, time: time });
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

            return new _promise2.default(function () {
                var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(resolve, reject) {
                    var t0, i, response, debug, browser, page, headers, statusCode, content, diff, time;
                    return _regenerator2.default.wrap(function _callee2$(_context2) {
                        while (1) {
                            switch (_context2.prev = _context2.next) {
                                case 0:
                                    t0 = process.hrtime();
                                    i = 0;
                                    response = {};
                                    debug = false;
                                    _context2.next = 6;
                                    return _puppeteer2.default.launch({
                                        headless: true,
                                        slowMo: 0 // slow down by ms
                                    });

                                case 6:
                                    browser = _context2.sent;
                                    _context2.next = 9;
                                    return browser.newPage();

                                case 9:
                                    page = _context2.sent;

                                    /**
                                     * Handle exceptions
                                     */
                                    process.on("unhandledRejection", function (reason, p) {
                                        var error = "Unhandled Rejection at: Promise " + p + " reason: " + reason;
                                        browser.close();
                                        reject(error);
                                    });
                                    page.on('error', function (msg) {
                                        browser.close();
                                        reject(msg);
                                    });
                                    page.on('pageerror', function (msg) {
                                        browser.close();
                                        reject(msg);
                                    });

                                    // TODO handle redirects based on this._followRedirect
                                    _context2.next = 15;
                                    return page.setRequestInterception(true);

                                case 15:
                                    /*
                                    page.on('response', res => {
                                        if (i < 5) {
                                            console.log(res.url());
                                        }
                                        //console.log(res);
                                        const status = res.status()
                                        if ((status >= 300) && (status <= 399)) {
                                            console.log('Redirect from', res.url(), 'to', res.headers()['location']);
                                            if (i === 2) {
                                                if (debug) {
                                                    console.log('Redirect from', res.url(), 'to', res.headers()['location'])
                                                }
                                                response.redirectUrl = res.headers()['location'];
                                            }
                                        }
                                    });
                                    */

                                    // for each request/resource download
                                    page.on('request', function (request) {
                                        i++;
                                        // Do nothing in case of non-navigation requests.
                                        if (!request.isNavigationRequest()) {
                                            request.continue();
                                            return;
                                        }
                                        if (debug) {
                                            console.log(request.url());
                                        }

                                        // Add a new header for navigation request.
                                        var headers = request.headers();
                                        if (options.headers) {
                                            for (var key in options.headers) {
                                                headers[key.toLowerCase()] = options.headers[key];
                                            }
                                        } else {
                                            headers['user-agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36';
                                        }
                                        request.continue({ headers: headers });
                                    });

                                    _context2.next = 18;
                                    return page.goto(options.url);

                                case 18:
                                    response = _context2.sent;
                                    headers = response.headers();
                                    statusCode = response.status();
                                    //await page.waitFor(2000);

                                    _context2.next = 23;
                                    return page.evaluate(function () {
                                        return document.documentElement.outerHTML;
                                    });

                                case 23:
                                    content = _context2.sent;
                                    _context2.next = 26;
                                    return browser.close();

                                case 26:

                                    // Debug info
                                    diff = process.hrtime(t0);
                                    time = diff[0] + diff[1] * 1e-9;


                                    if (_this3._cache) {
                                        _this3._cache.set(options.url, content);
                                    }
                                    resolve({ statusCode: statusCode, headers: headers, content: content, time: time });

                                case 30:
                                case "end":
                                    return _context2.stop();
                            }
                        }
                    }, _callee2, _this3);
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