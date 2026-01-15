import React, { useState, useEffect } from 'react';
import type { ConnectionStatus } from '../hooks/useRowingMetrics';
import type { HRConnectionStatus } from '../hooks/useHeartRate';
import { type RowingData } from '../services/BluetoothService';
import { type HeartRateData } from '../services/HeartRateService';
import { MetronomeVisualizer, type MetronomePhase } from './MetronomeVisualizer';

interface OverlayProps {
    connectionStatus: ConnectionStatus;
    metrics: RowingData;
    onConnect: () => void;
    onDisconnect: () => void;
    hrConnectionStatus: HRConnectionStatus;
    heartRateData: HeartRateData | null;
    onHrConnect: () => void;
    onHrDisconnect: () => void;
    onUrlChange: (url: string) => void;
    currentUrl: string;
    baselineSpm: number;
    onBaselineChange: (spm: number) => void;
    metronomeEnabled: boolean;
    onMetronomeChange: (enabled: boolean) => void;
    metronomePhase: MetronomePhase;
    baselineBpm: number;
    videoVolume: number;
    onVolumeChange: (volume: number) => void;
}

export const Overlay: React.FC<OverlayProps> = ({
    connectionStatus,
    metrics,
    onConnect,
    onDisconnect,
    hrConnectionStatus,
    heartRateData,
    onHrConnect,
    onHrDisconnect,
    onUrlChange,
    currentUrl,
    baselineSpm,
    onBaselineChange,
    metronomeEnabled,
    onMetronomeChange,
    metronomePhase,
    baselineBpm,
    videoVolume,
    onVolumeChange
}) => {
    const [showInput, setShowInput] = useState(false);
    const [urlInput, setUrlInput] = useState(currentUrl);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const formatTime = (seconds?: number) => {
        if (seconds === undefined) return '--:--';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const formatPace = (pace500m?: number) => {
        if (!pace500m || pace500m === Infinity || pace500m === undefined || isNaN(pace500m)) return '--';
        return formatTime(pace500m);
    };

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUrlChange(urlInput);
        setShowInput(false);
    };

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10 font-sans">
            {/* Metronome Visualizer - Left Side */}
            {metronomeEnabled && (
                <MetronomeVisualizer phase={metronomePhase} bpm={baselineBpm} />
            )}
            {/* Top Bar - Minimal */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 pointer-events-none">
                <div className="pointer-events-auto flex gap-3">
                    {/* Rower Connection */}
                    {(connectionStatus === 'disconnected' || connectionStatus === 'error') && (
                        <button
                            onClick={onConnect}
                            className="group h-12 flex items-center gap-3 px-5 bg-neutral-900/90 hover:bg-neutral-800 text-white rounded-full border border-white/20 transition-all shadow-xl hover:shadow-blue-500/20 active:scale-95 touch-manipulation"
                        >
                            <svg className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7l10 10-5 5V2l5 5L7 17" />
                            </svg>
                            <span className="font-bold text-sm tracking-wide uppercase">Rower</span>
                        </button>
                    )}

                    {connectionStatus === 'connecting' && (
                        <div className="h-12 flex items-center gap-3 px-5 bg-neutral-900/90 text-yellow-200 rounded-full border border-yellow-500/30 shadow-xl">
                            <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="font-bold text-sm tracking-wide uppercase">Connecting...</span>
                        </div>
                    )}

                    {connectionStatus === 'connected' && (
                        <div className="flex items-center gap-0 shadow-xl rounded-full h-12">
                            <div className="flex items-center gap-3 px-5 h-full bg-neutral-900/95 text-green-400 rounded-l-full border border-green-500/30 border-r-0">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="font-bold text-sm tracking-wide uppercase">Rower</span>
                            </div>
                            <button
                                onClick={onDisconnect}
                                className="px-5 h-full bg-neutral-900/95 hover:bg-neutral-800 text-red-400 hover:text-red-300 rounded-r-full border border-red-500/30 border-l border-l-white/10 transition-all font-semibold text-xs flex items-center touch-manipulation"
                                title="Disconnect"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Heart Rate Monitor Connection */}
                    {(hrConnectionStatus === 'disconnected' || hrConnectionStatus === 'error') && (
                        <button
                            onClick={onHrConnect}
                            className="group h-12 flex items-center gap-3 px-5 bg-neutral-900/90 hover:bg-neutral-800 text-white rounded-full border border-white/20 transition-all shadow-xl hover:shadow-red-500/20 active:scale-95 touch-manipulation"
                        >
                            <svg className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="font-bold text-sm tracking-wide uppercase">Heart Rate</span>
                        </button>
                    )}

                    {hrConnectionStatus === 'connecting' && (
                        <div className="h-12 flex items-center gap-3 px-5 bg-neutral-900/90 text-yellow-200 rounded-full border border-yellow-500/30 shadow-xl">
                            <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="font-bold text-sm tracking-wide uppercase">Connecting...</span>
                        </div>
                    )}

                    {hrConnectionStatus === 'connected' && (
                        <div className="flex items-center gap-0 shadow-xl rounded-full h-12">
                            <div className="flex items-center gap-3 px-5 h-full bg-neutral-900/95 text-red-400 rounded-l-full border border-red-500/30 border-r-0">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                <span className="font-bold text-sm tracking-wide uppercase">Heart Rate</span>
                            </div>
                            <button
                                onClick={onHrDisconnect}
                                className="px-5 h-full bg-neutral-900/95 hover:bg-neutral-800 text-red-400 hover:text-red-300 rounded-r-full border border-red-500/30 border-l border-l-white/10 transition-all font-semibold text-xs flex items-center touch-manipulation"
                                title="Disconnect Heart Rate Monitor"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                <div className="pointer-events-auto flex flex-col gap-3 items-end">
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowInput(!showInput)}
                            className="group h-12 flex items-center gap-3 bg-neutral-900/90 hover:bg-neutral-800 px-5 rounded-full border border-white/20 text-sm text-white font-bold transition-all shadow-xl hover:shadow-white/10 tracking-wide uppercase touch-manipulation"
                        >
                            <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                {showInput ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                )}
                                {!showInput && <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                            </svg>
                            {showInput ? 'Close' : 'Video'}
                        </button>

                        <button
                            onClick={() => {
                                if (!document.fullscreenElement) {
                                    document.documentElement.requestFullscreen();
                                } else {
                                    if (document.exitFullscreen) {
                                        document.exitFullscreen();
                                    }
                                }
                            }}
                            className="group h-12 w-12 flex items-center justify-center bg-neutral-900/90 hover:bg-neutral-800 rounded-full border border-white/20 text-white font-bold transition-all shadow-xl hover:shadow-white/10 touch-manipulation"
                            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                        >
                            <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                {isFullscreen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                                )}
                            </svg>
                        </button>
                    </div>
                    {showInput && (
                        <form onSubmit={handleUrlSubmit} className="flex flex-col gap-3 items-end bg-black/90 p-5 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl origin-top-right animate-in fade-in slide-in-from-top-4 duration-200">
                            <div className="w-full">
                                <label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-2 block">YouTube URL</label>
                                <input
                                    type="text"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="https://youtube.com/..."
                                    className="bg-white/5 text-white px-4 py-3 rounded-lg text-sm w-72 border border-white/20 focus:outline-none focus:border-blue-500 focus:bg-white/10 font-mono transition-colors"
                                />
                            </div>

                            <div className="w-full">
                                <label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-2 block">
                                    Baseline SPM (1.0x Speed)
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => onBaselineChange(Math.max(10, baselineSpm - 1))}
                                        className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
                                    >-</button>
                                    <span className="font-mono text-xl text-white font-bold w-8 text-center">{baselineSpm}</span>
                                    <button
                                        type="button"
                                        onClick={() => onBaselineChange(Math.min(40, baselineSpm + 1))}
                                        className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
                                    >+</button>
                                </div>
                            </div>

                            <div className="w-full">
                                <label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-2 block">
                                    Metronome
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                    <div className={`w-10 h-6 rounded-full border flex items-center transition-all px-1 ${metronomeEnabled ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-white/20 group-hover:border-white/40'}`}>
                                        <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all transform ${metronomeEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                    <span className="text-white text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                                        {metronomeEnabled ? 'On' : 'Off'}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={metronomeEnabled}
                                        onChange={(e) => onMetronomeChange(e.target.checked)}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            <div className="w-full">
                                <label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-2 block">
                                    Volume
                                </label>
                                <div className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 10H4a1 1 0 00-1 1v2a1 1 0 001 1h1.586l3.707 3.707A1 1 0 0011 17V7a1 1 0 00-1.707-.707L5.586 10z" />
                                    </svg>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={videoVolume}
                                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                                        className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                                    />
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 10H4a1 1 0 00-1 1v2a1 1 0 001 1h1.586l3.707 3.707A1 1 0 0011 17V7a1 1 0 00-1.707-.707L5.586 10z" />
                                    </svg>
                                </div>
                            </div>

                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-lg text-xs font-bold transition uppercase w-full shadow-lg tracking-wider">
                                Load Video
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Bottom HUD Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-12 pb-8 px-8 z-10 pointer-events-none">
                <div className="max-w-7xl mx-auto grid grid-cols-5 gap-3 md:gap-8 text-center items-end">

                    {/* Stroke Rate */}
                    <div className="flex flex-col items-center">
                        <span className="text-3xl md:text-6xl font-black font-mono text-white tracking-tighter drop-shadow-lg leading-none">
                            {metrics.strokeRate ?? '--'}
                        </span>
                        <span className="text-white/60 text-[10px] md:text-xs uppercase tracking-widest font-bold mt-1">SPM</span>
                    </div>

                    {/* Split */}
                    <div className="flex flex-col items-center">
                        <span className="text-3xl md:text-6xl font-black font-mono text-white tracking-tighter drop-shadow-lg leading-none">
                            {formatPace(metrics.instantaneousPace)}
                        </span>
                        <span className="text-white/60 text-[10px] md:text-xs uppercase tracking-widest font-bold mt-1">Split / 500m</span>
                    </div>

                    {/* Distance */}
                    <div className="flex flex-col items-center">
                        <span className="text-3xl md:text-6xl font-black font-mono text-white tracking-tighter drop-shadow-lg leading-none">
                            {metrics.totalDistance ?? '0'}
                        </span>
                        <span className="text-white/60 text-[10px] md:text-xs uppercase tracking-widest font-bold mt-1">Meters</span>
                    </div>

                    {/* Power */}
                    <div className="flex flex-col items-center">
                        <span className="text-3xl md:text-6xl font-black font-mono text-white tracking-tighter drop-shadow-lg leading-none">
                            {metrics.instantaneousPower ?? '--'}
                        </span>
                        <span className="text-white/60 text-[10px] md:text-xs uppercase tracking-widest font-bold mt-1">Watts</span>
                    </div>

                    {/* Heart Rate */}
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-3xl md:text-6xl font-black font-mono text-white tracking-tighter drop-shadow-lg leading-none">
                                {heartRateData?.heartRate ?? '--'}
                            </span>
                            {heartRateData && !heartRateData.contactDetected && (
                                <span className="text-yellow-400 text-xs" title="Sensor not in contact">⚠</span>
                            )}
                        </div>
                        <span className="text-white/60 text-[10px] md:text-xs uppercase tracking-widest font-bold mt-1">BPM</span>
                    </div>

                </div>
            </div>
        </div>
    );
};
