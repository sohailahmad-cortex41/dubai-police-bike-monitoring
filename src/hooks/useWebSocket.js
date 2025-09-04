import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../../store/appStore';
import toast from 'react-hot-toast';
import webSocketService, { MessageTypes } from '../services/webSocketService';

export const useWebSocket = (cameraType = 'front') => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionAttempts, setConnectionAttempts] = useState(0);
    const [videoFrame, setVideoFrame] = useState(null);

    // Zustand store actions
    const setFrontLaneData = useAppStore((state) => state.setFrontLaneData);
    const setBackLaneData = useAppStore((state) => state.setBackLaneData);
    const setFrontGPSData = useAppStore((state) => state.setFrontGPSData);
    const setBackGPSData = useAppStore((state) => state.setBackGPSData);
    const addViolation = useAppStore((state) => state.addViolation);
    const setSystemStatus = useAppStore((state) => state.setSystemStatus);
    const status = useAppStore((state) => state.status);
    const setStatus = useAppStore((state) => state.setStatus);

    // Set camera as active when connecting

    // useEffect(() => {
    //     if (!status[cameraType]) {
    //         setStatus({
    //             ...status,
    //             [cameraType]: true
    //         });
    //     }
    // }, [cameraType, status, setStatus]);

    // Handle GPS updates
    const handleGpsUpdate = useCallback((data) => {
        console.log(`� [${cameraType}] GPS update:`, data);
        if (cameraType === 'front') {
            setFrontGPSData(data);
        } else {
            setBackGPSData(data);
        }
    }, [cameraType, setFrontGPSData, setBackGPSData]);

    // Handle lane updates
    const handleLaneUpdate = useCallback((data) => {
        console.log(`🛣️ [${cameraType}] Lane update:`, data);
        if (cameraType === 'front') {
            setFrontLaneData(data);
        } else {
            setBackLaneData(data);
        }
    }, [cameraType, setFrontLaneData, setBackLaneData]);

    // Handle violation alerts
    const handleViolation = useCallback((data) => {
        console.log(`🚨 Violation detected:`, data);

        // Add to store
        if (addViolation) {
            addViolation({
                ...data,
                cameraType,
                id: Date.now() // Add unique ID
            });
        }

        // Show toast notification
        toast.error(`🚨 ${data.violation_type}: ${data.description}`, {
            duration: 5000,
            style: {
                background: '#ef4444',
                color: 'white',
            },
        });
    }, [cameraType, addViolation]);

    // Handle video frames
    const handleVideoFrame = useCallback((data) => {
        console.log(`📹 [${cameraType}] Video frame received`);
        setVideoFrame(data);
    }, [cameraType]);

    // Handle system status
    const handleSystemStatus = useCallback((data) => {
        console.log(`⚙️ System status:`, data);
        if (setSystemStatus) {
            setSystemStatus(data);
        }

        if (data.error_message) {
            toast.error(`System Error: ${data.error_message}`);
        }
    }, [setSystemStatus]);

    // Handle incoming WebSocket messages (fallback for any unhandled messages)
    const handleMessage = useCallback((message) => {
        const { type, data, timestamp } = message;

        console.log(`📡 [${cameraType}] WebSocket message:`, type, data);

        switch (type) {
            case MessageTypes.PROCESSING_STARTED:
                toast.success(`${cameraType.toUpperCase()} camera processing started`, {
                    duration: 3000,
                });
                break;

            case MessageTypes.PROCESSING_STOPPED:
                toast.info(`${cameraType.toUpperCase()} camera processing stopped`, {
                    duration: 3000,
                });
                break;

            case MessageTypes.ERROR:
                toast.error(`${cameraType.toUpperCase()} camera error: ${data.message || 'Unknown error'}`);
                break;

            default:
                console.log(`[${cameraType}] Unhandled message type: ${type}`);
        }
    }, [cameraType]);

    // Handle connection status changes
    const handleStatusChange = (connected) => {
        setIsConnected(connected);
        if (connected) {
            setConnectionAttempts(0);
        }
    };

    // Effect to manage connection and handlers - connect regardless of status for now
    useEffect(() => {
        // Always connect for testing video streaming
        console.log(`🔌 Connecting WebSocket for ${cameraType} camera...`);

        // Connect to WebSocket
        webSocketService.connect(cameraType, handleMessage, handleStatusChange);

        // Register specific handlers for better performance
        webSocketService.onGpsUpdate(handleGpsUpdate);
        webSocketService.onLaneUpdate(handleLaneUpdate);
        webSocketService.onViolation(handleViolation);
        webSocketService.onVideoFrame(cameraType, handleVideoFrame);
        webSocketService.onSystemStatus(handleSystemStatus);

        // Cleanup on unmount or when camera changes
        return () => {
            console.log(`🔌 Disconnecting WebSocket for ${cameraType} camera...`);
            webSocketService.removeListener(cameraType, handleMessage);
            webSocketService.removeVideoHandler(cameraType);
            webSocketService.removeGpsHandler(handleGpsUpdate);
            webSocketService.removeLaneHandler(handleLaneUpdate);
            webSocketService.removeViolationHandler(handleViolation);
            webSocketService.removeSystemStatusHandler(handleSystemStatus);
            webSocketService.disconnect(cameraType);
        };
    }, [
        cameraType,
        handleMessage,
        handleGpsUpdate,
        handleLaneUpdate,
        handleViolation,
        handleVideoFrame,
        handleSystemStatus
    ]);

    // Update connection attempts from service
    useEffect(() => {
        const attempts = webSocketService.reconnectAttempts.get(cameraType) || 0;
        setConnectionAttempts(attempts);
    });

    return {
        isConnected,
        connectionAttempts,
        videoFrame, // New: current video frame data
        send: (message) => webSocketService.send(cameraType, message),
        isConnectedToService: () => webSocketService.isConnected(cameraType),
        // Expose specific handler registration for custom use
        onVideoFrame: (handler) => webSocketService.onVideoFrame(cameraType, handler),
        onViolation: (handler) => webSocketService.onViolation(handler),
        onGpsUpdate: (handler) => webSocketService.onGpsUpdate(handler),
        onLaneUpdate: (handler) => webSocketService.onLaneUpdate(handler),
        onSystemStatus: (handler) => webSocketService.onSystemStatus(handler),
    };
};

export default useWebSocket;
