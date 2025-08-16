"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDKImage = void 0;
const react_1 = __importDefault(require("react"));
const asset_1 = require("../config/asset");
// Check for Next.js availability at module initialization
let NextImageComponent = null;
try {
    // Using require instead of import since we want synchronous evaluation
    NextImageComponent = require('next/image').default;
}
catch (e) {
    // Next.js not available, will use regular img element
    NextImageComponent = null;
}
const IDKImage = ({ id, variant = 'default', analytics = true, alt = '', width, height, className, loading = 'lazy', onError, ...rest }) => {
    var _a;
    const handleError = (e) => {
        if (onError) {
            onError(new Error(`Failed to load image: ${asset_1.IDK_MEDIA_URL}/assets/${id}`));
        }
    };
    const imageUrl = `${asset_1.IDK_MEDIA_URL}/assets/${id}?v=${variant}&analytics=${analytics}`;
    if (NextImageComponent) {
        return (react_1.default.createElement(NextImageComponent, { src: imageUrl, alt: alt, width: width, height: height, className: className, loading: loading, onError: handleError, unoptimized: (_a = rest === null || rest === void 0 ? void 0 : rest.unoptimized) !== null && _a !== void 0 ? _a : true, ...rest }));
    }
    // Fallback to regular img element
    return (react_1.default.createElement("img", { src: imageUrl, alt: alt, width: width, height: height, className: className, loading: loading, onError: handleError, ...rest }));
};
exports.IDKImage = IDKImage;
