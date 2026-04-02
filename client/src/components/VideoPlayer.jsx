import { useState, useRef } from 'react';
import { getClipUrl } from '../api';

export default function VideoPlayer({ brightcoveId }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const videoRef = useRef(null);

  async function handlePlay() {
    if (videoUrl) {
      videoRef.current?.play();
      setPlaying(true);
      return;
    }

    setLoading(true);
    try {
      const { url } = await getClipUrl(brightcoveId);
      setVideoUrl(url);
      setPlaying(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  if (!brightcoveId) {
    return (
      <div className="video-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#8b8ba3', fontSize: 14 }}>No clip available</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#dc2626', fontSize: 14 }}>Failed to load video</span>
      </div>
    );
  }

  return (
    <div className="video-container">
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          autoPlay
          onEnded={() => setPlaying(false)}
        />
      ) : (
        <div className="play-overlay" onClick={handlePlay}>
          {loading ? (
            <span style={{ color: 'white', fontSize: 16 }}>Loading...</span>
          ) : (
            <svg viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
}
