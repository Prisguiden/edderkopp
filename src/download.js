import request from "request";
import puppeteer from "puppeteer";

export default class Download {
    _timeout = 30000;
    _cache = false;
    _delay = [2, 5]; // delay 2-5 sec (simulate a user)
    _force = false;
    _followRedirect = true;
    _renderWithBrowser = false;

    constructor(options) {
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

    get(url, cookies) {
        if (cookies) {
            this._jar = request.jar();
            for (let cookie of cookies) {
                this._jar.setCookie(cookie, url);
            }
        }

        // Get from cache or download it?
        if (this._cache && !this._force && this._cache.has(url)) {
            let res = {
                content: this._cache.get(url),
                cached: true
            };
            return Promise.resolve(res);
        } else {
            return (async () => {
                let delay = 0;
                if (this._useDelay) {
                    delay = !Array.isArray(this._delay)
                        ? this._delay
                        : this._delay[0] +
                          (this._delay[1] - this._delay[0]) * Math.random();
                    await new Promise(resolve =>
                        setTimeout(resolve, delay * 1000)
                    );
                } else {
                    // Don't delay first download
                    this._useDelay = true;
                }

                // Prepare options for request
                let options = {
                    url: url,
                    headers: {
                        "User-Agent": USER_AGENT
                    },
                    followRedirect: this._followRedirect,
                    gzip: true,
                    timeout: this._timeout,
                    agentOptions: {
                        ecdhCurve: "auto"
                    },
                    bannedRequestUrlsRegexp: BANNED_REQUEST_URLS_REGEXP
                        ? BANNED_REQUEST_URLS_REGEXP
                        : []
                };
                if (this._headers) {
                    options.headers = { ...options.headers, ...this._headers };
                }
                if (this._jar) {
                    options.jar = this._jar;
                }
                let res = null;
                if (this._renderWithBrowser) {
                    res = await this._downloadWithPuppeteer(options);
                } else {
                    res = await this._download(options);
                }
                res.delay = delay;
                return res;
            })();
        }
    }

    _download(options) {
        return new Promise((resolve, reject) => {
            const t0 = process.hrtime();
            request(options, (error, response, content) => {
                if (error !== null) {
                    reject(error);
                }
                // Note: the strange 301|302 condition is for the very weird case where a site returns a 301|302
                // with the correct content! Then we don't want to follow redirect, just return the body.
                else if (
                    response.statusCode === 200 ||
                    (/30[12]/.test(response.statusCode) &&
                        !this._followRedirect)
                ) {
                    // Debug info
                    let diff = process.hrtime(t0);
                    let time = diff[0] + diff[1] * 1e-9;

                    if (this._cache) {
                        this._cache.set(options.url, content);
                    }
                    resolve({
                        statusCode: response.statusCode,
                        headers: response.headers,
                        content,
                        time
                    });
                } else {
                    reject("Response code: " + response.statusCode);
                }
            });
        });
    }
    _downloadWithPuppeteer(options) {
        return new Promise(async (resolve, reject) => {
            const t0 = process.hrtime();
            let debug = false;
            let abortMessage = "";
            const browser = await puppeteer.launch({
                headless: true,
                slowMo: 0 // slow down by ms
            });
            const page = await browser.newPage();
            /**
             * Handle exceptions
             */
            page.on("error", async err => {
                await browser.close();
                reject("error: " + err.toString());
            });
            page.on("pageerror", err => {
                if (debug) {
                    console.log(err.toString());
                }
            });

            if (options.headers) {
                let headersToSet = {};
                for (let key in options.headers) {
                    headersToSet[key.toLowerCase()] = options.headers[key];
                }
                await page.setExtraHTTPHeaders(headersToSet);
            }

            await page.setRequestInterception(true);

            // for each request/resource download
            page.on("request", request => {
                let requestUrl = request.url();
                // Handle navigation redirects based on followRedirect option.
                if (
                    !options.followRedirect &&
                    request.isNavigationRequest() &&
                    request.redirectChain().length
                ) {
                    let prevResponse = request.redirectChain()[0].response();
                    abortMessage = `Aborting redirect for url: ${requestUrl} status: ${prevResponse.status()} status: ${prevResponse.statusText()}`;
                    request.abort();
                } else {
                    // Skip certain requests
                    if (requestUrl) {
                        for (let regexp of options.bannedRequestUrlsRegexp) {
                            if (requestUrl.match(regexp)) {
                                request.abort();
                                return;
                            }
                        }
                    }
                    request.continue();
                }
            });

            let navigateOptions = {
                timeout: options.timeout,
                waitUntil: "load" // TODO create option for waitUntil
            };
            // Begin navigating to url
            let gotoError = null;
            let response = await page
                .goto(options.url, navigateOptions)
                .catch(async err => {
                    await browser.close();
                    gotoError = abortMessage
                        ? new Error(abortMessage)
                        : new Error(err);
                });

            if (!response) {
                let rejectMsg =
                    gotoError || new Error(`Unhandled response from page.goto`);
                reject(rejectMsg);
            } else {
                let headers = response.headers();
                let statusCode = response.status();
                // Get html
                let content = await page.evaluate(
                    () => document.documentElement.outerHTML
                );

                // await page.screenshot({'path':'/path/to/save/screenshot'});

                await browser.close();

                // Debug info
                let diff = process.hrtime(t0);
                let time = diff[0] + diff[1] * 1e-9;

                if (this._cache) {
                    this._cache.set(options.url, content);
                }
                resolve({
                    statusCode: statusCode,
                    headers: headers,
                    content,
                    time
                });
            }
        });
    }
}
