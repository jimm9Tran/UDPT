"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const NatsWrapper_1 = require("../NatsWrapper");
const router = express_1.default.Router();
exports.healthRouter = router;
// Basic health check
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'payment-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// API health check (for internal use)
router.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'payment-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// MongoDB health check
router.get('/api/health/mongo', (req, res) => {
    const mongoStatus = mongoose_1.default.connection.readyState;
    if (mongoStatus === 1) {
        res.status(200).json({
            status: 'healthy',
            database: 'mongodb',
            state: 'connected',
            timestamp: new Date().toISOString()
        });
    }
    else {
        res.status(503).json({
            status: 'unhealthy',
            database: 'mongodb',
            state: mongoStatus === 0 ? 'disconnected' :
                mongoStatus === 2 ? 'connecting' : 'disconnecting',
            timestamp: new Date().toISOString()
        });
    }
});
// NATS health check
router.get('/api/health/nats', (req, res) => {
    try {
        // Check if NATS client exists and is connected
        if (NatsWrapper_1.natsWrapper.client) {
            res.status(200).json({
                status: 'healthy',
                messaging: 'nats',
                state: 'connected',
                timestamp: new Date().toISOString()
            });
        }
        else {
            res.status(503).json({
                status: 'unhealthy',
                messaging: 'nats',
                state: 'disconnected',
                timestamp: new Date().toISOString()
            });
        }
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            messaging: 'nats',
            error: 'NATS client not initialized',
            timestamp: new Date().toISOString()
        });
    }
});
