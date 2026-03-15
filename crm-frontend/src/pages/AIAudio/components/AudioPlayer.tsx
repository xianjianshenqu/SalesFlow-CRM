import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  fileUrl?: string;
  duration: number;
  title?: string;
}

export function AudioPlayer({ fileUrl, duration, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handlePlaybackRate = () => {
    const rates = [0.5, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('ended', () => setIsPlaying(false));
    }
    return () => {
      if (audio) {
        audio.removeEventListener('ended', () => setIsPlaying(false));
      }
    };
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
      {title && (
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 truncate">
          {title}
        </p>
      )}
      
      <div className="flex items-center gap-3">
        {/* 后退按钮 */}
        <button
          onClick={skipBackward}
          className="size-9 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          title="后退10秒"
        >
          <span className="material-symbols-outlined text-lg text-slate-600 dark:text-slate-400">replay_10</span>
        </button>

        {/* 播放/暂停按钮 */}
        <button
          onClick={handlePlayPause}
          className="size-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-2xl">
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        {/* 前进按钮 */}
        <button
          onClick={skipForward}
          className="size-9 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          title="前进10秒"
        >
          <span className="material-symbols-outlined text-lg text-slate-600 dark:text-slate-400">forward_10</span>
        </button>

        {/* 进度条 */}
        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            style={{
              background: `linear-gradient(to right, var(--color-primary) ${progress}%, transparent ${progress}%)`,
            }}
          />
          <div className="flex justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* 播放速度 */}
        <button
          onClick={handlePlaybackRate}
          className="px-2 py-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
        >
          {playbackRate}x
        </button>
      </div>

      {/* 隐藏的音频元素 */}
      {fileUrl && (
        <audio
          ref={audioRef}
          src={fileUrl}
          onTimeUpdate={handleTimeUpdate}
          preload="metadata"
        />
      )}

      {/* 无文件提示 */}
      {!fileUrl && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-2">
          暂无可播放的录音文件
        </p>
      )}
    </div>
  );
}