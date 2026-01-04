import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-youtube';

interface VideoPlayerProps {
    src: string;
    playbackRate: number;
    onError?: (error: any) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, playbackRate, onError }) => {
    const videoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any | null>(null);

    useEffect(() => {
        if (!videoRef.current) return;

        if (!playerRef.current) {
            const videoElement = document.createElement("video-js");
            videoElement.classList.add('vjs-big-play-centered');
            videoRef.current.appendChild(videoElement);

            const player = videojs(videoElement, {
                controls: false, // No UI controls since we want tap to play/pause
                userActions: {
                    click: true // Let Video.js handle clicks
                },
                autoplay: false,
                preload: 'auto',
                fluid: true, // Responsive by default
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
            player.playbackRate(playbackRate);
        }
    }, [playbackRate]);

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
        <div data-vjs-player style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <div ref={videoRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};