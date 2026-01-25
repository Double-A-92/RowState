import React from 'react';

export type MetronomePhase = 'drive' | 'recovery';

interface MetronomeVisualizerProps {
    phase: MetronomePhase;
    bpm: number;
}

export const MetronomeVisualizer: React.FC<MetronomeVisualizerProps> = ({ phase, bpm }) => {
    // Drive (Top -> Bottom) takes 1/3 of the cycle
    // Recovery (Bottom -> Top) takes 2/3 of the cycle
    const secondsPerBeat = 60.0 / bpm;
    const driveDurationMs = (secondsPerBeat * (1.0 / 3.0)) * 1000;
    const recoveryDurationMs = (secondsPerBeat * (2.0 / 3.0)) * 1000;

    const isDrive = phase === 'drive';
    const duration = isDrive ? driveDurationMs : recoveryDurationMs;

    // Ease-out for drive (explosive start), Ease-in-out for recovery (smooth)
    const timingFunction = isDrive ? 'cubic-bezier(0.215, 0.61, 0.355, 1)' : 'cubic-bezier(0.455, 0.03, 0.515, 0.955)';

    return (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none z-20">
            {/* Container styled like top buttons - tall like video */}
            <div className="w-10 h-[70vh] bg-neutral-900/90 rounded-full border border-white/20 shadow-xl flex items-center justify-center relative overflow-hidden">
                {/* Track line */}
                <div className="absolute inset-x-0 top-6 bottom-6 mx-auto w-0.5 bg-white/10 rounded-full" />

                {/* Top endpoint */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/30 rounded-full" />

                {/* Bottom endpoint */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/30 rounded-full" />

                {/* Moving Ball - Red for Drive/Catch, Blue for Recovery/Finish */}
                <div
                    className="absolute left-1/2 w-6 h-6 rounded-full will-change-transform"
                    style={{
                        // Drive goes DOWN, Recovery goes UP
                        top: isDrive ? 'calc(100% - 36px)' : '16px',
                        transform: 'translateX(-50%)',
                        transitionProperty: 'top',
                        transitionDuration: `${duration}ms`,
                        transitionTimingFunction: timingFunction,
                        background: isDrive
                            ? 'radial-gradient(circle at 30% 30%, #C86466, #B63033)' // Red for catch/drive
                            : 'radial-gradient(circle at 30% 30%, #9CD4F0, #71C1EA)', // Blue for finish/recovery
                        border: '2px solid #9FA9A8'
                    }}
                />
            </div>
        </div>
    );
};
