import winston from "winston";
import util from "util";

class Log {
    _log;
    _settings;
    _level = "info";

    constructor() {
        this._log = new winston.createLogger({
            transports: [
                new winston.transports.Console({
                    level: this._level,
                    handleExceptions: false,
                    json: false,
                    prettyPrint: true,
                    colorize: true,
                }),
            ],
            exitOnError: false,
        });
        this._settings = this._log.transports.console;

        // Mapping methods to winston and support util.format('a %s c', 'b')
        ["silly", "debug", "verbose", "info", "warn", "error"].forEach(
            (func) => {
                this[func] = (...arg) => {
                    this._log[func](
                        arg[1] !== undefined
                            ? util.format.apply(null, arg)
                            : arg[0]
                    );
                };
            }
        );
    }

    set file(filename) {
        this._log = new winston.createLogger({
            transports: [
                new winston.transports.File({
                    level: this._level,
                    filename,
                    zippedArchive: true,
                    tailable: true,
                    handleExceptions: false,
                    json: false,
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
            ],
            exitOnError: false,
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
    set level(level) {
        this._level = level;
        this._settings.level = level;
    }
}

const log = new Log();
export default log;
