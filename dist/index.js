"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var etty_mockup_1 = require("etty-mockup");
var Reset = "\x1b[0m";
var Bright = "\x1b[1m";
var Dim = "\x1b[2m";
var Underscore = "\x1b[4m";
var Blink = "\x1b[5m";
var Reverse = "\x1b[7m";
var Hidden = "\x1b[8m";
var FgBlack = "\x1b[30m";
var FgRed = "\x1b[31m";
var FgGreen = "\x1b[32m";
var FgYellow = "\x1b[33m";
var FgBlue = "\x1b[34m";
var FgMagenta = "\x1b[35m";
var FgCyan = "\x1b[36m";
var FgWhite = "\x1b[37m";
var BgBlack = "\x1b[40m";
var BgRed = "\x1b[41m";
var BgGreen = "\x1b[42m";
var BgYellow = "\x1b[43m";
var BgBlue = "\x1b[44m";
var BgMagenta = "\x1b[45m";
var BgCyan = "\x1b[46m";
var BgWhite = "\x1b[47m";
var EttyPlugin = /** @class */ (function () {
    function EttyPlugin(options) {
        var _this = this;
        this.mhashes = {};
        this.__makeTranslations = function () {
            var error = false;
            try {
                var template = JSON.parse(fs.readFileSync(_this.options.template, { encoding: "utf8" }));
                var locales = JSON.parse(fs.readFileSync(_this.options.locales, { encoding: "utf8" }));
                locales.forEach(function (locale) {
                    console.log("");
                    var readPath = _this.options.prefillFrom + "/" + locale + ".json";
                    var writePath = _this.options.compileTo + "/" + locale + ".json";
                    var spacesCount = _this.options.minify ? 0 : 4;
                    var lastTranslate;
                    try {
                        _this.__info("Reading prefill for " + FgBlue + locale + FgWhite + "...");
                        lastTranslate = JSON.parse(fs.readFileSync(readPath, { encoding: "utf8" }));
                    }
                    catch (e) {
                        _this.__warning("Prefill for " + FgBlue + locale + FgWhite + " not found");
                        lastTranslate = {};
                    }
                    _this.__info("Generating translation for " + FgBlue + locale + FgWhite);
                    var translation = etty_mockup_1.default(template, locale, lastTranslate);
                    try {
                        _this.__info("Writing " + FgBlue + locale + ".json" + FgWhite);
                        fs.writeFileSync(writePath, JSON.stringify(translation, null, spacesCount));
                    }
                    catch (e) {
                        if (e.code == "ENOENT") {
                            _this.__warning("Target folder does not exist!");
                            _this.__info("Creating folder...");
                            fs.mkdirSync(_this.options.compileTo);
                            fs.writeFileSync(writePath, JSON.stringify(translation, null, spacesCount));
                        }
                        else {
                            throw new Error("Unknown error during writing " + locale + " translation file. " + e.code);
                        }
                    }
                    _this.__success("Successfully created " + FgBlue + locale + ".json" + FgWhite + "!");
                });
            }
            catch (e) {
                error = true;
                _this.__error(e.message || (e.toString && e.toString()) || e);
            }
            console.log("");
            if (error)
                _this.__error("Failed to compile translations :(");
            else
                _this.__success("Translations are successfully compiled! :)");
        };
        /* Loggers */
        this.__ettyLog = "" + Dim + FgYellow + "\uFF62etty\uFF63" + Reset + ":";
        this.__info = function (message) {
            if (_this.options.logLevel == "all")
                console.log(FgBlue + "\u2139 " + _this.__ettyLog + " " + message);
        };
        this.__error = function (message) {
            if (_this.options.logLevel != "none")
                console.log(FgRed + "\u2716 " + _this.__ettyLog + " " + message + " " + FgRed);
        };
        this.__success = function (message) {
            if (_this.options.logLevel == "all")
                console.log(FgGreen + "\u2714 " + _this.__ettyLog + " " + message);
        };
        this.__warning = function (message) {
            if (["all", "warning"].includes(_this.options.logLevel))
                console.log(FgYellow + "\u26A0 " + _this.__ettyLog + " " + message);
        };
        this.options = {};
        this.options.template = path.resolve(options.template);
        this.options.locales = path.resolve(options.locales);
        this.options.compileTo = path.resolve(options.compileTo);
        this.options.prefillFrom = options.prefillFrom
            ? path.resolve(options.prefillFrom)
            : this.options.compileTo;
        this.options.logLevel = ["all", "warning", "error", "none"].includes(options.logLevel)
            ? options.logLevel
            : "all";
        this.options.minify = options.minify || false;
    }
    EttyPlugin.prototype.apply = function (compiler) {
        var _this = this;
        compiler.hooks.emit.tapAsync('EttyPlugin', function (compilation, done) {
            _this.__info("Checking updated modules...");
            var changedModules = compilation.modules.filter(function (mdl) {
                if (/\/node_modules\//.test(mdl.id) || !mdl.hash || !mdl.resource)
                    return false;
                var old = _this.mhashes[mdl.resource];
                _this.mhashes[mdl.resource] = mdl.hash;
                return mdl.hash != old;
            }).map(function (mdl) { return mdl.resource; });
            var length = changedModules.length;
            _this.__info("There " + (length == 1 ? "is" : "are") + " " + length + " updated module" + (length == 1 ? "" : "s"));
            var _a = _this.options, locales = _a.locales, template = _a.template;
            var shouldCompile = false;
            if (changedModules.includes(template)) {
                _this.__info("template was changed, recompiling translations...");
                shouldCompile = true;
            }
            else if (changedModules.includes(locales)) {
                _this.__info("locales were changed, recompiling translations...");
                shouldCompile = true;
            }
            if (shouldCompile)
                _this.__makeTranslations();
            else
                _this.__info("No changes related to translations. Nothing to compile.");
            done();
        });
    };
    return EttyPlugin;
}());
exports.default = EttyPlugin;
