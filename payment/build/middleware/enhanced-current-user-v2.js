"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enhancedCurrentUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const common_1 = require("@jimm9tran/common");
const enhancedCurrentUser = (req, res, next) => {
    // First, check if there's a Bearer token in the Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        try {
            // Verify the JWT token and manually set session
            const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY);
            // Set the JWT in session so currentUser middleware can pick it up
            req.session = { jwt: token };
        }
        catch (err) {
            console.error('JWT verification failed:', err);
        }
    }
    // Now call the original currentUser middleware
    (0, common_1.currentUser)(req, res, next);
};
exports.enhancedCurrentUser = enhancedCurrentUser;
