import { useState, useEffect, useRef } from 'react';

export const useSmartPlaybackRate = (currentSpm: number | undefined, baselineSpm: number = 22, isConnected: boolean = false) => {
    const [rate, setRate] = useState(1.0);

    // Refs to hold state for the animation loop
    const targetRateRef = useRef(1.0);
    const currentRateRef = useRef(1.0);
    const lastSpmRef = useRef<number | undefined>(undefined);
    const animationFrameRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!isConnected) {
            // If not connected, default to normal speed (1.0)
            targetRateRef.current = 1.0;
            return;
        }

        // Update target rate based on SPM
        if (currentSpm === undefined || currentSpm < 10) {
            // Decelerate to stop (0) when not rowing
            targetRateRef.current = 0;
        } else {
            // Apply deadband/tolerance
            // Only update target if SPM change is significant (> 1) to prevent jitter
            // OR if we are resuming from a stop
            const lastSpm = lastSpmRef.current;
            if (lastSpm === undefined || Math.abs(currentSpm - lastSpm) > 1 || lastSpm < 10) {
                // Calculate raw target
                // Logic: 1.0x speed at Baseline SPM.
                // 0.05x change per 1 SPM difference.
                // e.g. Baseline 20. Current 24. Diff +4. rate = 1.0 + 0.2 = 1.2x.
                let newTarget = 1.0 + (currentSpm - baselineSpm) * 0.05;

                // Clamp target
                // Min 0.25 (slowest useful playback), Max 2.5
                newTarget = Math.max(0.25, Math.min(2.5, newTarget));

                targetRateRef.current = newTarget;
                lastSpmRef.current = currentSpm;
            }
        }
    }, [currentSpm, baselineSpm, isConnected]);

    useEffect(() => {
        const animate = () => {
            // Smoothly interpolate current -> target
            const diff = targetRateRef.current - currentRateRef.current;

            // Deceleration constant (coasting) vs Acceleration
            // We want 'coasting' to stop to be slow (simulating boat momentum)
            // We want acceleration to be relatively responsive

            let easing = 0.05; // Default responsiveness

            if (Math.abs(diff) < 0.01) {
                currentRateRef.current = targetRateRef.current;
            } else {
                if (targetRateRef.current < currentRateRef.current) {
                    // Decelerating (coasting)
                    easing = 0.005;
                } else {
                    // Accelerating
                    easing = 0.1;
                }
                currentRateRef.current += diff * easing;
            }

            // Update state to trigger re-render if value changed significantly
            // (Optimization: only set state if change is visible to avoid react render spam, 
            // but we need it for the video player prop)
            setRate(Number(currentRateRef.current.toFixed(2)));

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return rate;
};
