"use client";

import { useEffect, useRef, useState } from "react";

interface TimerProps {
  total: number;
  onComplete: () => void;
  label: string;
  sublabel?: string;
}

export default function Timer({ total, onComplete, label, sublabel }: TimerProps) {
  const [remaining, setRemaining] = useState(total);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const R = 68;
  const circumference = 2 * Math.PI * R;
  const progress = (remaining / total) * circumference;

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current!);
          setTimeout(onComplete, 200);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, []);

  return (
    <div className="timer-wrap">
      <div className="timer-ring">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle className="timer-ring-track" cx="80" cy="80" r={R} />
          <circle
            className="timer-ring-progress"
            cx="80"
            cy="80"
            r={R}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
          />
        </svg>
        <div className="timer-number">{remaining}</div>
      </div>
      <div className="timer-label">{label}</div>
      {sublabel && <p className="timer-sublabel">{sublabel}</p>}
    </div>
  );
}