import { useState, useEffect, useRef } from 'react';

export const useSmartPlaybackRate = (currentSpm: number | undefined, baselineSpm: number = 20, isConnected: boolean = false) => {
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
            // Only update target if SPM change is significant or resuming from stop.
            const lastSpm = lastSpmRef.current;
            if (lastSpm === undefined || Math.abs(currentSpm - lastSpm) > 1 || lastSpm < 10) {
                // Calculate raw target
                // Calculate target rate: 1.0x at baseline, +/- 0.05x per SPM difference.
                let newTarget = 1.0 + (currentSpm - baselineSpm) * 0.05;

                // Clamp target
                // Min 0 (stop), Max 2.5 (fastest useful playback)
                newTarget = Math.max(0, Math.min(2.5, newTarget));

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
            // Apply differential easing for acceleration vs deceleration.

            let easing = 0.05; // Default responsiveness

            if (Math.abs(diff) < 0.01) {
                currentRateRef.current = targetRateRef.current;
            } else {
                if (targetRateRef.current < currentRateRef.current) {
                    // Decelerating (coasting)
                    easing = 0.01;
                } else {
                    // Accelerating
                    easing = 0.1;
                }
                currentRateRef.current += diff * easing;
            }

            // Update state.
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
