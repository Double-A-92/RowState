import { useState, useEffect, useRef } from 'react';
import { useRowingMetrics } from './hooks/useRowingMetrics';
import { useHeartRate } from './hooks/useHeartRate';
import { VideoPlayer } from './components/VideoPlayer';
import { useSmartPlaybackRate } from './hooks/useSmartPlaybackRate';
import { useMetronome, type MetronomePhase } from './hooks/useMetronome';
import { Overlay } from './components/Overlay';

// Helper function to parse URL parameters
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    videoId: params.get('v'),
    spm: params.get('spm')
  };
};

// Helper function to update URL parameters
const updateUrlParams = (videoId: string | null, spm: number) => {
  const params = new URLSearchParams();
  
  if (videoId) {
    params.set('v', videoId);
  }
  
  params.set('spm', spm.toString());
  
  const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
  window.history.replaceState({}, '', newUrl);
};

function App() {
  const { status, metrics, connect, disconnect } = useRowingMetrics();
  const { status: hrStatus, heartRateData, connect: hrConnect, disconnect: hrDisconnect } = useHeartRate();
  
  // Parse URL parameters on initial load
  const urlParams = getUrlParams();
  const videoId = urlParams.videoId;
  const spmParam = urlParams.spm;
  
  // Set initial video URL based on URL parameter or default
  const initialVideoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : 'https://www.youtube.com/watch?v=FljjSVANT9I';
  const initialSpm = spmParam ? parseInt(spmParam, 10) : 22;
  
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [currentVideoId, setCurrentVideoId] = useState(videoId || 'FljjSVANT9I');
  const [baselineSpm, setBaselineSpm] = useState(initialSpm);
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [metronomePhase, setMetronomePhase] = useState<MetronomePhase>('recovery');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoVolume, setVideoVolume] = useState(1.0); // 0.0 to 1.0
  const prevStrokeRateRef = useRef<number>(0);

  // Wrapper function to update video URL and sync with URL params
  const handleVideoUrlChange = (newUrl: string) => {
    setVideoUrl(newUrl);
    // Extract video ID from new URL and update state
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/
    ];
    
    let newVideoId = 'FljjSVANT9I'; // default
    for (const pattern of patterns) {
      const match = newUrl.match(pattern);
      if (match) {
        newVideoId = match[1];
        break;
      }
    }
    
    setCurrentVideoId(newVideoId);
    updateUrlParams(newVideoId, baselineSpm);
  };

  // Wrapper function to update SPM and sync with URL params
  const handleBaselineSpmChange = (newSpm: number) => {
    setBaselineSpm(newSpm);
    updateUrlParams(currentVideoId, newSpm);
  };

  // Update URL when values change (for initial load and any direct state changes)
  useEffect(() => {
    updateUrlParams(currentVideoId, baselineSpm);
  }, []); // Only run once on mount to sync initial state

  // Smart playback rate
  const playbackRate = useSmartPlaybackRate(metrics.strokeRate, baselineSpm, status === 'connected');
  // Metronome - only play if enabled AND video is playing
  useMetronome(baselineSpm, metronomeEnabled && isVideoPlaying, setMetronomePhase);

  const [videoError, setVideoError] = useState<string | null>(null);

  const handleVideoError = (error: any) => {
    setVideoError(error?.message || 'Video playback failed. Try another URL.');
  };

  useEffect(() => {
    const currentStrokeRate = metrics.strokeRate || 0;

    // Automatically start video playback when rowing begins (stroke rate > 0).
    if (status === 'connected' && prevStrokeRateRef.current === 0 && currentStrokeRate > 0) {
      setIsVideoPlaying(true);
    }

    prevStrokeRateRef.current = currentStrokeRate;
  }, [metrics.strokeRate, status]);

  return (
    <div className="relative w-screen h-screen bg-black">
      <VideoPlayer
        src={videoUrl}
        playbackRate={playbackRate}
        playing={isVideoPlaying}
        volume={videoVolume}
        onPlay={() => setIsVideoPlaying(true)}
        onPause={() => setIsVideoPlaying(false)}
        onError={handleVideoError}
      />
      {videoError && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-600/90 text-white px-6 py-4 rounded-xl z-50 backdrop-blur-md border border-red-400">
          <h3 className="font-bold text-lg mb-1">Video Error</h3>
          <p>{videoError}</p>
          <button
            onClick={() => setVideoError(null)}
            className="mt-2 text-xs underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}
      <Overlay
        connectionStatus={status}
        metrics={metrics}
        onConnect={connect}
        onDisconnect={disconnect}
        hrConnectionStatus={hrStatus}
        heartRateData={heartRateData}
        onHrConnect={hrConnect}
        onHrDisconnect={hrDisconnect}
        onUrlChange={handleVideoUrlChange}
        currentUrl={videoUrl}
        baselineSpm={baselineSpm}
        onBaselineChange={handleBaselineSpmChange}
        metronomeEnabled={metronomeEnabled}
        onMetronomeChange={setMetronomeEnabled}
        metronomePhase={metronomePhase}
        baselineBpm={baselineSpm}
        videoVolume={videoVolume}
        onVolumeChange={setVideoVolume}
      />
    </div>
  );
}

export default App;
