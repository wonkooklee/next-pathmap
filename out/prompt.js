var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import inquirer from "inquirer";
import { resolve } from "node:path";
import { PathmapConfig } from "./models.js";
import { checkFileExist } from "./check.js";
import { Print } from "./print.js";
export function prompt() {
    return __awaiter(this, void 0, void 0, function () {
        var config, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!checkFileExist("pathmap.config.js")) return [3 /*break*/, 2];
                    Print.success("> pathmap.config.js has been detected.", {
                        highlight: "background",
                        spacing: true,
                    });
                    return [4 /*yield*/, import(resolve("pathmap.config.js"))];
                case 1:
                    config = _a.sent();
                    result = validateConfig(config.default);
                    return [2 /*return*/, result];
                case 2:
                    Print.info("INFO: pathmap.config.js has not been found.", {
                        highlight: "background",
                        spacing: true,
                    });
                    return [4 /*yield*/, inquirer.prompt([
                            {
                                type: "input",
                                name: "pathToPages",
                                message: "Enter the path to the '/pages' directory.",
                                default: "src/pages",
                            },
                            {
                                type: "input",
                                name: "pathToSave",
                                message: "Enter the destination to save jsonized pathmap file.",
                                default: "pathmap/pathmap.json",
                            },
                            {
                                type: "list",
                                name: "includes",
                                choices: [
                                    {
                                        checked: true,
                                        name: "**/*.page.{ts,tsx}",
                                        value: "**/*.page.{ts,tsx}",
                                    },
                                    {
                                        checked: false,
                                        name: "**/*.{ts,tsx}",
                                        value: "**/*.{ts,tsx}",
                                    },
                                    {
                                        checked: false,
                                        name: "**/*.page.{js,jsx}",
                                        value: "**/*.page.{js,jsx}",
                                    },
                                    {
                                        checked: false,
                                        name: "**/*.{js,jsx}",
                                        value: "**/*.{js,jsx}",
                                    },
                                ],
                            },
                            {
                                type: "checkbox",
                                name: "excludes",
                                choices: [
                                    {
                                        checked: true,
                                        name: "!**/_*.{ts,tsx}",
                                        value: "!**/_*.{ts,tsx}",
                                    },
                                    {
                                        checked: true,
                                        name: "!**/[A-Z]*.{ts,tsx}",
                                        value: "!**/[A-Z]*.{ts,tsx}",
                                    },
                                    {
                                        checked: true,
                                        name: "!api",
                                        value: "!api",
                                    },
                                ],
                            },
                        ])];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function validateConfig(config) {
    var _a, _b;
    var result = PathmapConfig.safeParse(config);
    if (result.success === false) {
        Print.error("EXCEPTION: Invalid configuration. (1015)", {
            highlight: "background",
            spacing: true,
        });
        Print.error((_b = (_a = result.error) === null || _a === void 0 ? void 0 : _a.issues) === null || _b === void 0 ? void 0 : _b.toString(), {
            highlight: "foreground",
        });
        process.exit(12);
    }
    return config;
}
