import { useState, useCallback, useEffect, useRef } from 'react';
import { BluetoothService, type RowingData } from '../services/BluetoothService';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export const useRowingMetrics = () => {
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [errorDetails, setErrorDetails] = useState<string>('');
    const [metrics, setMetrics] = useState<RowingData>({});
    const serviceRef = useRef<BluetoothService>(new BluetoothService());

    const connect = useCallback(async () => {
        setStatus('connecting');
        try {
            await serviceRef.current.connect(
                (data) => {
                    setMetrics((prev) => ({ ...prev, ...data }));
                },
                (statusMsg) => {
                    console.log('BLE Status:', statusMsg);
                    if (statusMsg === 'Connected') setStatus('connected');
                    else if (statusMsg === 'Disconnected') setStatus('disconnected');
                    else if (statusMsg.startsWith('Connection failed')) {
                        setStatus('error');
                        setErrorDetails(statusMsg);
                    }
                }
            );
        } catch (e: any) {
            setStatus('error');
            setErrorDetails(e.toString());
        }
    }, []);

    const disconnect = useCallback(() => {
        serviceRef.current.disconnect();
        setStatus('disconnected');
        setMetrics({});
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            serviceRef.current.disconnect();
        };
    }, []);

    return {
        status,
        errorDetails,
        metrics,
        connect,
        disconnect
    };
};
