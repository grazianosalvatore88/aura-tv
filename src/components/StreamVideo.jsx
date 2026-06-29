import { useEffect, useRef, useState } from 'react';

export default function StreamVideo({
  src,
  fallbackSrc,
  poster,
  muted,
  paused,
  onStatusChange = () => {}
}) {
  const videoRef = useRef(null);
  const [failedPrimary, setFailedPrimary] = useState(false);
  const activeSrc = failedPrimary && fallbackSrc ? fallbackSrc : src;

  useEffect(() => {
    setFailedPrimary(false);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeSrc) return undefined;

    onStatusChange('Caricamento stream...');

    function handleCanPlay() {
      onStatusChange('Stream pronto');
    }

    function handleLoadedMetadata() {
      onStatusChange('Stream pronto');
    }

    function handleWaiting() {
      onStatusChange('Buffer...');
    }

    function handlePlaying() {
      onStatusChange('In riproduzione');
    }

    function handleError() {
      if (!failedPrimary && fallbackSrc) {
        setFailedPrimary(true);
        onStatusChange('Fallback stream...');
        return;
      }

      onStatusChange('Stream non disponibile');
    }

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);

    video.src = activeSrc;
    video.muted = muted;
    video.playsInline = true;
    video.preload = 'metadata';

    if (!paused) {
      video.play().catch(() => onStatusChange('Premi play per avviare'));
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
      video.removeAttribute('src');
      video.load();
    };
  }, [activeSrc, fallbackSrc, failedPrimary, muted, onStatusChange, paused]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = muted;
  }, [muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeSrc) return;

    if (paused) {
      video.pause();
    } else {
      video.play().catch(() => onStatusChange('Premi play per avviare'));
    }
  }, [activeSrc, onStatusChange, paused]);

  if (!activeSrc) return null;

  return (
    <video
      ref={videoRef}
      className="stream-video"
      poster={poster}
      muted={muted}
      playsInline
      preload="metadata"
    />
  );
}
