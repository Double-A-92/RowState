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
                controls: false,
                userActions: {
                    click: true
                },
                autoplay: false,
                preload: 'auto',
                fluid: true,
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

                // Explicit click handler for touch/interaction
                player.on('click', () => {
                    if (player.paused()) {
                        player.play();
                    } else {
                        player.pause();
                    }
                });

                player.on('error', () => {
                    const err = player.error();
                    console.error('VideoJS Error:', err);
                    if (onError) onError(err);
                });
            });

            playerRef.current = player;
        } else {
            // Update src if changed
            const player = playerRef.current;
            if (player.currentSrc() !== src) {
                player.src({ type: 'video/youtube', src });
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
