import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-youtube';

interface VideoPlayerProps {
    src: string;
    playbackRate: number;
    playing: boolean;
    volume?: number;
    onPlay?: () => void;
    onPause?: () => void;
    onError?: (error: any) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, playbackRate, playing, volume = 1, onPlay, onPause, onError }) => {
    const videoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any | null>(null);

    useEffect(() => {
        if (!videoRef.current) return;

        if (!playerRef.current) {
            const videoElement = document.createElement("video-js");
            videoElement.classList.add('vjs-big-play-centered');
            videoRef.current.appendChild(videoElement);

            const player = videojs(videoElement, {
                controls: false, // Disable default UI controls
                userActions: {
                    click: true // Enable click interactions
                },
                autoplay: false,
                preload: 'auto',
                fluid: false, // Explicitly control dimensions via CSS
                fill: true, // Fill the container
                playsinline: true, // Important for iOS
                techOrder: ['youtube'],
                sources: [{
                    type: 'video/youtube',
                    src: src
                }],
                youtube: {
                    iv_load_policy: 3, // Hide annotations
                    modestbranding: 1, // Minimize branding
                    rel: 0, // Limit related videos
                    controls: 0, // Hide YouTube native player controls (cleanest look)
                    fs: 0, // Hide fullscreen button
                    disablekb: 1 // Disable keyboard shortcuts
                }
            }, () => {
                player.playbackRate(playbackRate);

                player.on('play', () => {
                    if (onPlay) onPlay();
                });

                player.on('pause', () => {
                    if (onPause) onPause();
                });

                // Tap/click to play/pause - using Video.js's built-in click handler
                // since we set userActions.click = true
                player.on('click', () => {
                    if (player.paused()) {
                        player.play()?.catch(() => {
                            // Autoplay may be blocked - that's okay
                            console.log('Playback requires user interaction on some devices');
                        });
                    } else {
                        player.pause();
                    }
                });

                player.on('error', () => {
                    const err = player.error();
                    console.error('VideoJS Error:', err);
                    if (onError) onError(err);
                });

                // Handle mobile touch events gracefully
                player.on('touchstart', () => {
                    // No need to prevent default - let browser handle naturally
                });
            });

            playerRef.current = player;
        } else {
            // Update src if changed
            const player = playerRef.current;
            if (player.currentSrc() !== src) {
                player.src({ type: 'video/youtube', src });
                player.load();
            }
        }
    }, [src]);

    useEffect(() => {
        const player = playerRef.current;
        if (player) {
            // Pause playback if rate is below 0.1, as YouTube API does not support playbackRate(0).
            if (playbackRate < 0.1) {
                if (!player.paused()) {
                    player.pause();
                }
            } else {
                // Resume playback if allowed by props.
                if (playing && player.paused()) {
                    player.play()?.catch(() => console.log('Playback blocked'));
                }
                player.playbackRate(playbackRate);
                
                // Mute audio when speed is too slow to avoid distortion
                if (playbackRate < 0.5) {
                    player.muted(true);
                } else {
                    player.muted(false);
                }
            }
        }
    }, [playbackRate, playing]);

    useEffect(() => {
        const player = playerRef.current;
        if (player) {
            if (playing && player.paused()) {
                player.play()?.catch(() => {
                    console.log('Playback failed or was blocked');
                });
            } else if (!playing && !player.paused()) {
                player.pause();
            }
        }
    }, [playing]);

    // Volume control
    useEffect(() => {
        const player = playerRef.current;
        if (player) {
            player.volume(volume);
        }
    }, [volume]);

    // Cleanup
    useEffect(() => {
        const player = playerRef.current;
        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, []);

    return (
        <div data-vjs-player style={{
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'black'
        }}>
            <div ref={videoRef} style={{
                width: 'min(100vw, 177.78vh)',
                height: 'min(100vh, 56.25vw)',
                position: 'relative'
            }} />
        </div>
    );
};