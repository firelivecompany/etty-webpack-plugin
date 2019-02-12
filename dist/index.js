"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EttyPlugin = /** @class */ (function () {
    function EttyPlugin(options) {
        this.mhashes = {};
        this.options = options;
        // if (!this.options.prefillFrom)
        // 	this.options.prefillFrom = this.options.compileTo
    }
    EttyPlugin.prototype.apply = function (compiler) {
        var _this = this;
        compiler.hooks.emit.tapAsync('MyPlugin', function (compilation, done) {
            var changedModules = compilation.modules.filter(function (mdl) {
                if (/\/node_modules\//.test(mdl.id) || !mdl.hash || !mdl.resource)
                    return false;
                var old = _this.mhashes[mdl.resource];
                _this.mhashes[mdl.resource] = mdl.hash;
                return mdl.hash != old;
            }).map(function (mdl) { return mdl.resource; });
            console.log(changedModules);
            done();
        });
    };
    return EttyPlugin;
}());
exports.default = EttyPlugin;
