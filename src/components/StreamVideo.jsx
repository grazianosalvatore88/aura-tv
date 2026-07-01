import { useEffect, useRef, useState } from 'react';

export default function StreamVideo({
  src,
  fallbackSrc,
  poster,
  muted,
  paused,
  streamType = '',
  onStatusChange = () => {}
}) {
  const videoRef = useRef(null);
  const dashRef = useRef(null);
  const hlsRef = useRef(null);
  const [failedPrimary, setFailedPrimary] = useState(false);
  const activeSrc = failedPrimary && fallbackSrc ? fallbackSrc : src;

  useEffect(() => {
    setFailedPrimary(false);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeSrc) return undefined;

    let cancelled = false;

    async function attachStream() {
      onStatusChange('Caricamento stream...');

      const isDash = streamType === 'dash' || /\.mpd($|\?)/i.test(activeSrc);
      const isHls = streamType === 'hls' || /\.m3u8($|\?)/i.test(activeSrc);

      try {
        if (dashRef.current) {
          dashRef.current.reset();
          dashRef.current = null;
        }

        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }

        video.muted = muted;
        video.playsInline = true;
        video.preload = 'metadata';

        if (isDash) {
          const dashModule = await import('dashjs');
          if (cancelled) return;

          const dashjs = dashModule.default || dashModule;
          const player = dashjs.MediaPlayer().create();
          player.updateSettings({
            streaming: {
              buffer: {
                fastSwitchEnabled: true,
                initialBufferLevel: 4
              }
            }
          });
          player.initialize(video, activeSrc, !paused);
          dashRef.current = player;
          onStatusChange('DASH pronto');
          return;
        }

        if (isHls && !video.canPlayType('application/vnd.apple.mpegurl')) {
          const hlsModule = await import('hls.js');
          if (cancelled) return;

          const Hls = hlsModule.default || hlsModule;
          if (Hls.isSupported()) {
            const hls = new Hls({
              maxBufferLength: 12,
              maxMaxBufferLength: 24,
              liveSyncDurationCount: 2,
              liveMaxLatencyDurationCount: 5,
              enableWorker: true,
              backBufferLength: 10
            });

            hls.loadSource(activeSrc);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (_, data) => {
              if (data?.fatal) {
                if (!failedPrimary && fallbackSrc) {
                  setFailedPrimary(true);
                  onStatusChange('Fallback stream...');
                } else {
                  onStatusChange('Stream non disponibile');
                }
              }
            });
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              onStatusChange('HLS pronto');
              if (!paused) {
                video.play().catch(() => onStatusChange('Premi play per avviare'));
              }
            });
            hlsRef.current = hls;
            return;
          }
        }

        video.src = activeSrc;

        if (!paused) {
          video.play().catch(() => onStatusChange('Premi play per avviare'));
        }
      } catch {
        if (!failedPrimary && fallbackSrc) {
          setFailedPrimary(true);
          onStatusChange('Fallback stream...');
        } else {
          onStatusChange('Stream non disponibile');
        }
      }
    }

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

    attachStream();

    return () => {
      cancelled = true;
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);

      if (dashRef.current) {
        dashRef.current.reset();
        dashRef.current = null;
      }

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      video.removeAttribute('src');
      video.load();
    };
  }, [activeSrc, fallbackSrc, failedPrimary, onStatusChange, streamType]);

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
