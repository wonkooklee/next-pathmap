var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
export var Print = /** @class */ (function () {
    function Print() {
    }
    Print.styleMessage = function (message, _a) {
        var spacing = _a.spacing, highlight = _a.highlight, context = _a.context;
        var mustable = [message];
        if (context) {
            mustable = [
                this.palette[context][highlight],
                message,
                this.palette.reset,
            ];
        }
        if (spacing) {
            ["\n", mustable, "\n"];
        }
        return message;
    };
    Print.error = function (message, style) {
        console.error(this.styleMessage(message, __assign({ context: "warn" }, style)));
    };
    Print.info = function (message, style) {
        console.log(this.styleMessage(message, __assign({ context: "info" }, style)));
    };
    Print.success = function (message, style) {
        console.log(this.styleMessage(message, __assign({ context: "success" }, style)));
    };
    Print.palette = {
        reset: "\x1b[0m",
        warn: {
            background: "\x1b[41m",
            foreground: "\x1b[31m",
        },
        success: {
            background: "\x1b[42m",
            foreground: "\x1b[32m",
        },
        info: {
            background: "\x1b[43m",
            foreground: "\x1b[33m",
        },
    };
    return Print;
}());
