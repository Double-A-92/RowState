import { useState } from 'react';
import { useRowingMetrics } from './hooks/useRowingMetrics';
import { useHeartRate } from './hooks/useHeartRate';
import { VideoPlayer } from './components/VideoPlayer';
import { useSmartPlaybackRate } from './hooks/useSmartPlaybackRate';
import { Overlay } from './components/Overlay';

function App() {
  const { status, metrics, connect, disconnect } = useRowingMetrics();
  const { status: hrStatus, heartRateData, connect: hrConnect, disconnect: hrDisconnect } = useHeartRate();
  // Default video
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=FljjSVANT9I');
  const [baselineSpm, setBaselineSpm] = useState(22);

  // Smart playback rate
  const playbackRate = useSmartPlaybackRate(metrics.strokeRate, baselineSpm, status === 'connected');
  const [videoError, setVideoError] = useState<string | null>(null);

  const handleVideoError = (error: any) => {
    setVideoError(error?.message || 'Video playback failed. Try another URL.');
  };

  return (
    <div className="relative w-screen h-screen bg-black">
      <VideoPlayer
        src={videoUrl}
        playbackRate={playbackRate}
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
        onUrlChange={setVideoUrl}
        currentUrl={videoUrl}
        baselineSpm={baselineSpm}
        onBaselineChange={setBaselineSpm}
      />
    </div>
  );
}

export default App;
