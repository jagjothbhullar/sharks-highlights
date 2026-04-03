import { useState, useEffect, useRef } from 'react';
import { getClipUrl } from '../api';

export default function VideoPlayer({ brightcoveId }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const [poster, setPoster] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const videoRef = useRef(null);

  // Eagerly fetch poster thumbnail on mount
  useEffect(() => {
    if (!brightcoveId) return;
    getClipUrl(brightcoveId).then(data => {
      setPoster(data.poster || data.thumbnail || null);
      setVideoUrl(data.url);
    }).catch(() => {});
  }, [brightcoveId]);

  async function handlePlay() {
    if (videoUrl && videoRef.current) {
      videoRef.current.play();
      setPlaying(true);
      return;
    }

    setLoading(true);
    try {
      const data = await getClipUrl(brightcoveId);
      setVideoUrl(data.url);
      setPoster(data.poster || data.thumbnail || null);
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
      {playing && videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          autoPlay
          onEnded={() => setPlaying(false)}
        />
      ) : (
        <div
          className="play-overlay"
          onClick={handlePlay}
          style={poster ? { backgroundImage: `url(${poster})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
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
