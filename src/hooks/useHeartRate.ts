import { useState, useCallback, useEffect, useRef } from 'react';
import { HeartRateService, type HeartRateData } from '../services/HeartRateService';

export type HRConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export const useHeartRate = () => {
    const [status, setStatus] = useState<HRConnectionStatus>('disconnected');
    const [errorDetails, setErrorDetails] = useState<string>('');
    const [heartRateData, setHeartRateData] = useState<HeartRateData | null>(null);
    const serviceRef = useRef<HeartRateService>(new HeartRateService());

    const connect = useCallback(async () => {
        setStatus('connecting');
        try {
            await serviceRef.current.connect(
                (data) => {
                    setHeartRateData(data);
                },
                (statusMsg) => {
                    console.log('HR Monitor Status:', statusMsg);
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
        setHeartRateData(null);
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
        heartRateData,
        connect,
        disconnect
    };
};
