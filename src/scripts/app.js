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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var EbayCheckerApp = /** @class */ (function () {
    function EbayCheckerApp() {
        this.stream = null;
        this.track = null;
        this.flashOn = false;
        this.video = document.getElementById("camera");
        this.canvas = document.getElementById("cameraCanvas");
        this.cameraOverlay = document.getElementById("cameraOverlay");
        this.historyList = document.getElementById("historyList");
        this.display = document.getElementById("calcDisplay");
        this.setupTabs();
        this.bindButtons();
        this.setupCalculator();
    }
    EbayCheckerApp.prototype.setupTabs = function () {
        var buttons = document.querySelectorAll(".tab-btn");
        buttons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                buttons.forEach(function (b) { return b.classList.remove("active"); });
                btn.classList.add("active");
                document.querySelectorAll(".tab-content").forEach(function (tab) { return tab.classList.remove("active"); });
                var target = document.getElementById(btn.dataset.tab);
                target === null || target === void 0 ? void 0 : target.classList.add("active");
            });
        });
    };
    EbayCheckerApp.prototype.bindButtons = function () {
        var _this = this;
        var _a, _b, _c, _d;
        (_a = document.getElementById("openCamera")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () { return _this.openCamera(); });
        (_b = document.getElementById("closeCamera")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () { return _this.closeCamera(); });
        (_c = document.getElementById("flashBtn")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", function () { return _this.toggleFlash(); });
        (_d = document.getElementById("clearHistory")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", function () {
            localStorage.removeItem("ebayHistory");
            _this.historyList.innerHTML = "";
        });
    };
    EbayCheckerApp.prototype.openCamera = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.stream)
                            return [2 /*return*/];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        _a = this;
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })];
                    case 2:
                        _a.stream = _c.sent();
                        this.video.srcObject = this.stream;
                        return [4 /*yield*/, this.video.play()];
                    case 3:
                        _c.sent();
                        this.track = this.stream.getVideoTracks()[0];
                        this.cameraOverlay.classList.remove("hidden");
                        return [3 /*break*/, 5];
                    case 4:
                        _b = _c.sent();
                        alert("Camera access failed.");
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    EbayCheckerApp.prototype.closeCamera = function () {
        var _a;
        (_a = this.stream) === null || _a === void 0 ? void 0 : _a.getTracks().forEach(function (t) { return t.stop(); });
        this.stream = null;
        this.track = null;
        this.cameraOverlay.classList.add("hidden");
    };
    EbayCheckerApp.prototype.toggleFlash = function () {
        return __awaiter(this, void 0, void 0, function () {
            var caps;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.track)
                            return [2 /*return*/];
                        caps = (_b = (_a = this.track).getCapabilities) === null || _b === void 0 ? void 0 : _b.call(_a);
                        if (!(caps && caps.torch)) return [3 /*break*/, 2];
                        this.flashOn = !this.flashOn;
                        return [4 /*yield*/, this.track.applyConstraints({ advanced: [{ torch: this.flashOn }] })];
                    case 1:
                        _c.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        alert("Flash not supported on this device.");
                        _c.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    EbayCheckerApp.prototype.setupCalculator = function () {
        var _this = this;
        var _a, _b;
        document.querySelectorAll(".calc-buttons button").forEach(function (btn) {
            var value = btn.dataset.value;
            if (value) {
                btn.addEventListener("click", function () { return _this.display.value += value; });
            }
        });
        (_a = document.getElementById("calcClear")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () { return _this.display.value = ""; });
        (_b = document.getElementById("calcEquals")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () {
            try {
                _this.display.value = eval(_this.display.value);
            }
            catch (_a) {
                _this.display.value = "Error";
            }
        });
    };
    return EbayCheckerApp;
}());
document.addEventListener("DOMContentLoaded", function () { return new EbayCheckerApp(); });
