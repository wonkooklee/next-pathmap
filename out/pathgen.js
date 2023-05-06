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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { existsSync, mkdirSync, readFileSync, writeFile } from "node:fs";
import { globby } from "globby";
import jsonFormat from "json-format";
import { Print } from "./print.js";
function processing(paths, existingPaths, schema, categories) {
    return paths.reduce(function (acc, path) {
        var query = trimmingDynamicRoutes(path).query;
        var segments = path.split("/").slice(1);
        var category = categories === null || categories === void 0 ? void 0 : categories.map(function (segment, idx) {
            return segment[segments[idx]];
        }).filter(function (seg) { return seg; });
        acc[path] = __assign(__assign(__assign(__assign({}, schema), existingPaths[path]), (category && { categories: category })), { query: query });
        return acc;
    }, {});
}
function isDynamic(path) {
    return /\[(\.{3})?[\w\d-]+\]/.test(path);
}
function trimmingDynamicRoutes(path) {
    var _a;
    var query = isDynamic(path)
        ? (_a = path
            .match(/\[(\.{3})?[\w\d-]+\]/g)) === null || _a === void 0 ? void 0 : _a.map(function (queryInDynamicSyntax) {
            return queryInDynamicSyntax.replace(/\[(\.{3})?([\w\d-]+)\]/, "$2");
        })
        : [];
    return { query: query };
}
function readExistPaths(pathToSave) {
    return __awaiter(this, void 0, void 0, function () {
        var files, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, readFileSync(pathToSave, {
                            encoding: "utf-8",
                        })];
                case 1:
                    files = _a.sent();
                    return [2 /*return*/, JSON.parse(files)];
                case 2:
                    error_1 = _a.sent();
                    return [2 /*return*/, {}];
                case 3: return [2 /*return*/];
            }
        });
    });
}
export function gen(_a) {
    var pathToPages = _a.pathToPages, pathToSave = _a.pathToSave, includes = _a.includes, excludes = _a.excludes, schema = _a.schema, categories = _a.categories;
    return __awaiter(this, void 0, void 0, function () {
        var pages, existingPaths, parsedPaths;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, globby(__spreadArray(__spreadArray([], includes, true), excludes, true), {
                        cwd: pathToPages || "src/pages",
                        absolute: false,
                        caseSensitiveMatch: true,
                        gitignore: true,
                        objectMode: true,
                    })];
                case 1:
                    pages = _b.sent();
                    if (pages.length === 0) {
                        Print.error("EXCEPTION: The given directory has no matched page files. (1002)", {
                            highlight: "background",
                            spacing: true,
                        });
                        process.exit(12);
                    }
                    mkdirRecursively(normalizeSavePath(pathToSave));
                    return [4 /*yield*/, readExistPaths(pathToSave)];
                case 2:
                    existingPaths = _b.sent();
                    parsedPaths = pages
                        .map(function (page) {
                        return ("/" +
                            page.path.replace(/(\/?index)?((\.[\w\d-]+){1,})?\.(js|jsx|ts|tsx)$/, ""));
                    })
                        .sort(function (a, b) {
                        return a.localeCompare(b);
                    });
                    return [4 /*yield*/, writeFile(pathToSave, jsonFormat(processing(parsedPaths, existingPaths, schema, categories)), { encoding: "utf-8" }, function (err) {
                            if (err) {
                                Print.error("ERROR: Could not save the pathmap file to the given directory. (3002)", {
                                    highlight: "background",
                                    spacing: true,
                                });
                                Print.error(err === null || err === void 0 ? void 0 : err.message, { highlight: "foreground" });
                                process.exit(12);
                            }
                            else {
                                Print.success(parsedPaths, { highlight: "foreground" });
                                Print.success("SUCCESS: Pathmap file has been created successfully.", {
                                    highlight: "background",
                                    spacing: true,
                                });
                                Print.success("OUTPUT: ./".concat(pathToSave), { highlight: "foreground" });
                            }
                        })];
                case 3:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function mkdirRecursively(pathToSave) {
    if (!existsSync(pathToSave)) {
        mkdirSync(pathToSave, {
            recursive: true,
        });
    }
}
function normalizeSavePath(path) {
    return path.replace(/(^\.\/|^\/|\/[\w\d-]+?\.json$)/g, "");
}
