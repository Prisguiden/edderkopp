import request from "request";
import puppeteer from "puppeteer";

export default class Download {

    _timeout = 60000;
    _cache = false;
    _delay = [2, 5]; // delay 2-5 sec (simulate a user)
    _force = false;
    _followRedirect = true;
    _renderWithJs = false;

    constructor(options) {
        if (options.timeout !== undefined) { this._timeout = options.timeout; }
        if (options.delay !== undefined) { this._delay = options.delay; }
        if (options.cache !== undefined) { this._cache = options.cache; }
        if (options.force !== undefined) { this._force = options.force; }
        if (options.followRedirect !== undefined) { this._followRedirect = options.followRedirect; }
        if (options.renderWithJs !== undefined) { this._renderWithJs = options.renderWithJs; }
    }

    get(url, cookies) {
        if (cookies) {
            this._jar = request.jar()
            for (let cookie of cookies) {
                this._jar.setCookie(cookie, url);
            }
        }

        // Get from cache or download it?
        if (this._cache && !this._force && this._cache.has(url)) {
            let res = {
                content: this._cache.get(url),
                cached: true
            }
            return Promise.resolve(res);
        } else {
            return (async () => {
                let delay = 0;
                if (this._useDelay) {
                    delay = !Array.isArray(this._delay) ? this._delay : this._delay[0] + (this._delay[1] - this._delay[0]) * Math.random();
                    await new Promise(resolve => setTimeout(resolve, delay * 1000));
                } else {
                    // Don't delay first download
                    this._useDelay = true;
                }

                // Prepare options for request
                let options = {
                    url: url,
                    headers: {
                        'User-Agent': USER_AGENT
                    },
                    followRedirect: this._followRedirect,
                    gzip: true,
                    timeout: this._timeout
                };
                if (this._jar) {
                    options.jar = this._jar;
                }
                let res = null;
                if (this._renderWithJs) {
                    console.log("downloading with puppeteer");
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
                else if (response.statusCode === 200 || /30[12]/.test(response.statusCode) && !this._followRedirect) {
                    // Debug info
                    let diff = process.hrtime(t0);
                    let time = diff[0] + diff[1] * 1e-9;

                    if (this._cache) { this._cache.set(options.url, content); }
                    resolve({ statusCode: response.statusCode, headers: response.headers, content, time });
                } else {
                    reject('Response code: ' + response.statusCode);
                }
            });
        });
    }
    _downloadWithPuppeteer(options) {
        return new Promise(async (resolve, reject) => {
            const t0 = process.hrtime();
            let i = 0;
            let response = {};
            let debug = false;
            const browser = await puppeteer.launch({
                headless: true,
                slowMo: 0 // slow down by ms
            });
            const page = await browser.newPage();
            /**
             * Handle exceptions
             */
            process.on("unhandledRejection", (reason, p) => {
                let error = "Unhandled Rejection at: Promise " + p + " reason: " + reason;
                browser.close();
                reject(error);
            });
            page.on('error', msg => {
                browser.close();
                reject(msg);
            });
            page.on('pageerror', msg => {
                browser.close();
                reject(msg);
            });

            // TODO handle redirects based on this._followRedirect
            await page.setRequestInterception(true);
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
            page.on('request', request => {
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
                let headers = request.headers();
                if (options.headers) {
                    for (let key in options.headers) {
                        headers[key.toLowerCase()] = options.headers[key];
                    }
                } else {
                    headers['user-agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36';
                }
                request.continue({ headers });
            });

            response = await page.goto(options.url);
            let headers = response.headers();
            let statusCode = response.status();
            //await page.waitFor(2000);

            let content = await page.evaluate(() => document.documentElement.outerHTML);
            await browser.close();

            // Debug info
            let diff = process.hrtime(t0);
            let time = diff[0] + diff[1] * 1e-9;

            if (this._cache) { this._cache.set(options.url, content); }
            resolve({ statusCode: statusCode, headers: headers, content, time });
        });
    }
}
