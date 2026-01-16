# RowState

RowState is a web application that connects your rowing machine to YouTube videos, automatically adjusting playback speed to match your rowing pace. Row faster, the video speeds up. Row slower, it slows down.

🚀 **[Try it now!](https://double-a-92.github.io/RowState/)**

## Features

- **Smart Video Sync** - Video playback automatically adjusts to your stroke rate
- **Bluetooth Rowing Monitor** - Connects to any FTMS-compatible rowing machine
- **Heart Rate Monitoring** - Optional Bluetooth heart rate sensor support
- **Real-time Metrics** - Live display of stroke rate, split time, distance, power, and heart rate
- **YouTube Integration** - Row along to any YouTube video
- **Visual Metronome** - Animated vertical bar that moves with your rowing rhythm (drive/recovery phases)
- **Video Volume Control** - Adjustable volume slider in the settings panel

## Getting Started

### Prerequisites

- A Bluetooth-enabled rowing machine (FTMS protocol)
- Chrome or Edge browser (desktop or Android)
- Optional: Bluetooth heart rate monitor

### Running Locally

```bash
npm install
npm run dev
```

Open your browser to the local development server and click "Connect Rower" to pair your rowing machine.

### Deployment

This app can be deployed to GitHub Pages. See [DEPLOYMENT.md](DEPLOYMENT.md) for instructions.

## Browser Compatibility

The Bluetooth features require the Web Bluetooth API, which is currently supported in:
- Chrome and Edge (desktop and Android)

Bluetooth connections will not work in Firefox, Safari, or iOS browsers.

## How It Works

1. Connect your Bluetooth rowing machine
2. Optionally connect a heart rate monitor
3. Load a YouTube video
4. Set your baseline stroke rate (default: 22 SPM = 1.0x speed)
5. Start rowing - the video speed adjusts automatically

## License

MIT

---

*Disclaimer: This app has been vibe coded.*
