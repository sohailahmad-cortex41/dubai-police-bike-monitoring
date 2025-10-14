/**
 * WebSocket Service for Real-time Communication
 * Handles connections to both front and back camera WebSocket endpoints
 */

// Message type constants (matching backend)
export const MessageTypes = {
    GPS_UPDATE: 'gps_update',
    LANE_UPDATE: 'lane_update',
    VIOLATION_ALERT: 'violation_alert',
    VIDEO_FRAME: 'video_frame',
    SYSTEM_STATUS: 'system_status',
    ERROR: 'error',
    PROCESSING_STARTED: 'processing_started',
    PROCESSING_STOPPED: 'processing_stopped',
    CAMERA_SWITCHED: 'camera_switched'
};

class WebSocketService {
    constructor() {
        this.connections = new Map(); // Map<cameraType, WebSocket>
        this.listeners = new Map(); // Map<cameraType, Set<Function>>
        this.reconnectAttempts = new Map(); // Map<cameraType, number>
        this.maxReconnectAttempts = parseInt(import.meta.env.VITE_WS_RECONNECT_ATTEMPTS) || 5;
        this.pingInterval = parseInt(import.meta.env.VITE_WS_PING_INTERVAL) || 30000;
        this.debug = import.meta.env.VITE_DEBUG_WEBSOCKET === 'true';

        // Specific handlers for different message types
        this.messageHandlers = new Map();
        this.videoHandlers = new Map(); // Map<cameraType, Function>
        this.violationHandlers = new Set(); // Set<Function>
        this.gpsHandlers = new Set(); // Set<Function>
        this.laneHandlers = new Set(); // Set<Function>
        this.systemStatusHandlers = new Set(); // Set<Function>
    }

    /**
     * Get WebSocket URL for a specific camera
     */
    getWebSocketUrl(cameraType) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5455';
        // Remove trailing slash if present
        const cleanBaseUrl = baseUrl.replace(/\/$/, '');
        const wsUrl = cleanBaseUrl.replace('http', 'ws');
        return `${wsUrl}/ws/${cameraType}`;
    }

    /**
     * Connect to WebSocket for specific camera
     */
    connect(cameraType, onMessage, onStatusChange) {
        if (this.connections.has(cameraType)) {
            this.log(`Already connected to ${cameraType} camera`);
            return;
        }

        const url = this.getWebSocketUrl(cameraType);
        this.log(`Connecting to ${cameraType} camera: ${url}`);

        try {
            const ws = new WebSocket(url);
            this.connections.set(cameraType, ws);

            // Add message listener
            if (!this.listeners.has(cameraType)) {
                this.listeners.set(cameraType, new Set());
            }
            if (onMessage) {
                this.listeners.get(cameraType).add(onMessage);
            }

            ws.onopen = () => {
                this.log(`✅ Connected to ${cameraType} camera`);
                this.reconnectAttempts.set(cameraType, 0);
                onStatusChange?.(true);

                // Start ping interval
                const pingIntervalId = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send('ping');
                        this.log(`📡 Ping sent to ${cameraType}`);
                    } else {
                        clearInterval(pingIntervalId);
                    }
                }, this.pingInterval);

                // Store interval ID for cleanup
                ws._pingIntervalId = pingIntervalId;
            };

            ws.onmessage = (event) => {
                if (event.data === 'pong') {
                    this.log(`🏓 Pong received from ${cameraType}`);
                    return;
                }

                try {
                    // Handle binary data (video frames)
                    if (event.data instanceof Blob) {
                        this.log(`📷 Binary data received from ${cameraType}: ${event.data.size} bytes`);
                        this.handleBinaryData(cameraType, event.data);
                        return;
                    }

                    // Handle text data (JSON messages)
                    if (typeof event.data === 'string') {
                        const message = JSON.parse(event.data);
                        this.log(`📥 Message from ${cameraType}:`, message.type);

                        // Handle specific message types
                        this.handleMessage(cameraType, message);

                        // Notify all listeners
                        const listeners = this.listeners.get(cameraType);
                        if (listeners) {
                            listeners.forEach(listener => {
                                try {
                                    listener(message);
                                } catch (error) {
                                    console.error(`Error in WebSocket listener for ${cameraType}:`, error);
                                }
                            });
                        }
                    } else {
                        console.warn(`Unknown data type received from ${cameraType}:`, typeof event.data);
                    }
                } catch (error) {
                    console.error(`Error processing WebSocket message from ${cameraType}:`, error);
                    console.log('Raw data:', event.data);
                }
            };

            ws.onclose = (event) => {
                this.log(`❌ Disconnected from ${cameraType} camera:`, event.code, event.reason);
                this.cleanup(cameraType);
                onStatusChange?.(false);

                // Only attempt reconnection if it wasn't a manual close
                if (event.code !== 1000) {
                    this.attemptReconnect(cameraType, onMessage, onStatusChange);
                }
            };

            ws.onerror = (error) => {
                console.error(`❌ WebSocket error for ${cameraType}:`, error);
                console.warn(`WebSocket connection failed. This might be because:
1. Backend server is not running on port 5455
2. WebSocket endpoint /ws/${cameraType} doesn't exist
3. Backend doesn't support WebSocket connections
4. CORS policy is blocking the connection`);
                onStatusChange?.(false);

                // Clean up the connection immediately on error
                this.cleanup(cameraType);
            };

        } catch (error) {
            console.error(`Failed to create WebSocket connection for ${cameraType}:`, error);
            console.warn(`Make sure the backend server is running and supports WebSocket connections at ws://localhost:5455/ws/${cameraType}`);
            onStatusChange?.(false);
        }
    }

    /**
     * Handle binary data (video frames)
     */
    handleBinaryData(cameraType, blobData) {
        this.log(`📷 Video frame received from ${cameraType}: ${blobData.size} bytes`);

        // Call video frame handler with the blob data directly
        const handler = this.videoHandlers.get(cameraType);
        if (handler) {
            try {
                handler({
                    camera_type: cameraType,
                    frame: blobData, // Pass blob directly instead of base64
                    timestamp: Date.now(),
                    size: blobData.size
                });
            } catch (error) {
                console.error(`Error in video frame handler for ${cameraType}:`, error);
            }
        } else {
            this.log(`No video handler registered for ${cameraType} camera`);
        }
    }

    /**
     * Handle different types of messages
     */
    handleMessage(cameraType, message) {
        const { type, data } = message;

        switch (type) {
            case MessageTypes.VIDEO_FRAME:
                this.handleVideoFrame(cameraType, data);
                break;
            case MessageTypes.VIOLATION_ALERT:
                this.handleViolationAlert(data);
                break;
            case MessageTypes.GPS_UPDATE:
                this.handleGpsUpdate(data);
                break;
            case MessageTypes.LANE_UPDATE:
                this.handleLaneUpdate(data);
                break;
            case MessageTypes.SYSTEM_STATUS:
                this.handleSystemStatus(data);
                break;
            default:
                this.log(`Unknown message type: ${type}`);
        }
    }

    /**
     * Handle video frame data
     */
    handleVideoFrame(cameraType, frameData) {
        const handler = this.videoHandlers.get(cameraType);
        if (handler) {
            try {
                handler(frameData);
            } catch (error) {
                console.error(`Error in video frame handler for ${cameraType}:`, error);
            }
        }
    }

    /**
     * Handle violation alerts
     */
    handleViolationAlert(violationData) {
        this.violationHandlers.forEach(handler => {
            try {
                handler(violationData);
            } catch (error) {
                console.error('Error in violation handler:', error);
            }
        });
    }

    /**
     * Handle GPS updates
     */
    handleGpsUpdate(gpsData) {
        this.gpsHandlers.forEach(handler => {
            try {
                handler(gpsData);
            } catch (error) {
                console.error('Error in GPS handler:', error);
            }
        });
    }

    /**
     * Handle lane detection updates
     */
    handleLaneUpdate(laneData) {
        this.laneHandlers.forEach(handler => {
            try {
                handler(laneData);
            } catch (error) {
                console.error('Error in lane handler:', error);
            }
        });
    }

    /**
     * Handle system status updates
     */
    handleSystemStatus(statusData) {
        this.systemStatusHandlers.forEach(handler => {
            try {
                handler(statusData);
            } catch (error) {
                console.error('Error in system status handler:', error);
            }
        });
    }

    /**
     * Disconnect from WebSocket for specific camera
     */
    disconnect(cameraType) {
        const ws = this.connections.get(cameraType);
        if (ws) {
            this.log(`Disconnecting from ${cameraType} camera`);
            this.cleanup(cameraType);
            ws.close();
        }
    }

    /**
     * Disconnect from all WebSockets
     */
    disconnectAll() {
        this.log('Disconnecting from all cameras');
        for (const cameraType of this.connections.keys()) {
            this.disconnect(cameraType);
        }
    }

    /**
     * Add message listener for specific camera
     */
    addListener(cameraType, listener) {
        if (!this.listeners.has(cameraType)) {
            this.listeners.set(cameraType, new Set());
        }
        this.listeners.get(cameraType).add(listener);
    }

    /**
     * Remove message listener for specific camera
     */
    removeListener(cameraType, listener) {
        const listeners = this.listeners.get(cameraType);
        if (listeners) {
            listeners.delete(listener);
        }
    }

    /**
     * Send message to specific camera WebSocket
     */
    send(cameraType, message) {
        const ws = this.connections.get(cameraType);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(typeof message === 'string' ? message : JSON.stringify(message));
            this.log(`📤 Message sent to ${cameraType}:`, message);
        } else {
            console.warn(`Cannot send message to ${cameraType}: WebSocket not connected`);
        }
    }

    /**
     * Check if connected to specific camera
     */
    isConnected(cameraType) {
        const ws = this.connections.get(cameraType);
        return ws && ws.readyState === WebSocket.OPEN;
    }

    /**
     * Get connection status for all cameras
     */
    getConnectionStatus() {
        return {
            front: this.isConnected('front'),
            back: this.isConnected('back'),
        };
    }

    /**
     * Attempt to reconnect to WebSocket
     */
    attemptReconnect(cameraType, onMessage, onStatusChange) {
        const attempts = this.reconnectAttempts.get(cameraType) || 0;

        if (attempts >= this.maxReconnectAttempts) {
            console.error(`Max reconnection attempts reached for ${cameraType} camera. Please check if backend server is running.`);
            return;
        }

        const delay = Math.min(2000 * Math.pow(2, attempts), 60000); // Exponential backoff, max 60 seconds
        this.log(`🔄 Reconnecting to ${cameraType} in ${delay}ms (attempt ${attempts + 1}/${this.maxReconnectAttempts})`);

        const timeoutId = setTimeout(() => {
            // Check if we should still attempt to reconnect
            if (!this.connections.has(cameraType)) {
                this.reconnectAttempts.set(cameraType, attempts + 1);
                this.connect(cameraType, onMessage, onStatusChange);
            }
        }, delay);

        // Store timeout ID for potential cleanup
        this._reconnectTimeouts = this._reconnectTimeouts || new Map();
        this._reconnectTimeouts.set(cameraType, timeoutId);
    }

    /**
     * Cleanup connection resources
     */
    cleanup(cameraType) {
        const ws = this.connections.get(cameraType);
        if (ws && ws._pingIntervalId) {
            clearInterval(ws._pingIntervalId);
        }

        // Clear any pending reconnection timeouts
        if (this._reconnectTimeouts && this._reconnectTimeouts.has(cameraType)) {
            clearTimeout(this._reconnectTimeouts.get(cameraType));
            this._reconnectTimeouts.delete(cameraType);
        }

        this.connections.delete(cameraType);
    }

    /**
     * Debug logging
     */
    log(...args) {
        if (this.debug) {
            console.log('[WebSocketService]', ...args);
        }
    }

    /**
     * Register video frame handler for specific camera
     */
    onVideoFrame(cameraType, handler) {
        this.videoHandlers.set(cameraType, handler);
        this.log(`Video frame handler registered for ${cameraType} camera`);
    }

    /**
     * Register violation alert handler
     */
    onViolation(handler) {
        this.violationHandlers.add(handler);
        this.log('Violation alert handler registered');
    }

    /**
     * Register GPS update handler
     */
    onGpsUpdate(handler) {
        this.gpsHandlers.add(handler);
        this.log('GPS update handler registered');
    }

    /**
     * Register lane detection handler
     */
    onLaneUpdate(handler) {
        this.laneHandlers.add(handler);
        this.log('Lane update handler registered');
    }

    /**
     * Register system status handler
     */
    onSystemStatus(handler) {
        this.systemStatusHandlers.add(handler);
        this.log('System status handler registered');
    }

    /**
     * Remove handlers
     */
    removeVideoHandler(cameraType) {
        this.videoHandlers.delete(cameraType);
    }

    removeViolationHandler(handler) {
        this.violationHandlers.delete(handler);
    }

    removeGpsHandler(handler) {
        this.gpsHandlers.delete(handler);
    }

    removeLaneHandler(handler) {
        this.laneHandlers.delete(handler);
    }

    removeSystemStatusHandler(handler) {
        this.systemStatusHandlers.delete(handler);
    }
}

// Export singleton instance and constants
export const webSocketService = new WebSocketService();
export default webSocketService;
