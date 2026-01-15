import { useEffect, useRef, useCallback } from 'react';

export type MetronomePhase = 'drive' | 'recovery';

export const useMetronome = (bpm: number, isPlaying: boolean, onPhaseChange?: (phase: MetronomePhase) => void) => {
    const audioContext = useRef<AudioContext | null>(null);
    const nextNoteTime = useRef<number>(0);
    const timerID = useRef<number | null>(null);

    // Lookahead/schedule settings
    const lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
    const scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)

    const playClick = useCallback((time: number, type: 'catch' | 'finish') => {
        if (!audioContext.current) return;

        const osc = audioContext.current.createOscillator();
        const gainNode = audioContext.current.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioContext.current.destination);

        if (type === 'catch') {
            // Catch: Higher pitch, louder (Start of stroke)
            osc.frequency.value = 880;
            gainNode.gain.setValueAtTime(0.3, time); // Louder
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
            osc.start(time);
            osc.stop(time + 0.1);

            // Schedule visual update
            if (onPhaseChange) {
                const timeUntilNote = (time - audioContext.current.currentTime) * 1000;
                setTimeout(() => {
                    onPhaseChange('drive');
                }, Math.max(0, timeUntilNote));
            }
        } else {
            // Finish: Lower pitch, slightly softer (Recovery start)
            osc.frequency.value = 440;
            gainNode.gain.setValueAtTime(0.15, time);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
            osc.start(time);
            osc.stop(time + 0.1);

            // Schedule visual update
            if (onPhaseChange) {
                const timeUntilNote = (time - audioContext.current.currentTime) * 1000;
                setTimeout(() => {
                    onPhaseChange('recovery');
                }, Math.max(0, timeUntilNote));
            }
        }
    }, [onPhaseChange]);

    const scheduler = useCallback(() => {
        if (!audioContext.current) return;

        // while there are notes that will need to play before the next interval,
        // schedule them and advance the pointer.
        while (nextNoteTime.current < audioContext.current.currentTime + scheduleAheadTime) {
            const secondsPerBeat = 60.0 / bpm;

            // Schedule the "Catch" (Start of Drive)
            playClick(nextNoteTime.current, 'catch');

            // Schedule the "Finish" (Start of Recovery)
            // Drive : Recovery = 1 : 2 ratio
            // Drive time = 1/3 of total cycle
            const driveDuration = secondsPerBeat * (1.0 / 3.0);
            playClick(nextNoteTime.current + driveDuration, 'finish');

            // Add a beat length to nextNoteTime
            nextNoteTime.current += secondsPerBeat;
        }

        timerID.current = window.setTimeout(scheduler, lookahead);
    }, [bpm, playClick]);

    useEffect(() => {
        if (isPlaying) {
            // Initialize AudioContext on user interaction/first play
            if (!audioContext.current) {
                audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            // Resume if suspended (browser requirements)
            if (audioContext.current.state === 'suspended') {
                audioContext.current.resume();
            }

            // Start the metronome
            // If nextNoteTime is in the past (or not set), reset it to start "now" + a tiny delay
            if (nextNoteTime.current < audioContext.current.currentTime) {
                nextNoteTime.current = audioContext.current.currentTime + 0.05;
            }

            scheduler();
        } else {
            if (timerID.current !== null) {
                window.clearTimeout(timerID.current);
                timerID.current = null;
            }
        }

        return () => {
            if (timerID.current !== null) {
                window.clearTimeout(timerID.current);
            }
        };
    }, [isPlaying, bpm, scheduler]);

    return null; // logic only hook
};
