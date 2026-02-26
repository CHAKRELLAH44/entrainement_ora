"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

export interface AudioRecorderHandle {
  start: () => Promise<void>;
  stop: () => void;
}

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob | null) => void;
}

const AudioRecorder = forwardRef<AudioRecorderHandle, AudioRecorderProps>(
  ({ onRecordingComplete }, ref) => {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    useImperativeHandle(ref, () => ({
      async start() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          chunksRef.current = [];
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;

          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
          };

          recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: "audio/webm" });
            onRecordingComplete(blob);
            stream.getTracks().forEach((t) => t.stop());
          };

          recorder.start();
        } catch {
          onRecordingComplete(null);
        }
      },
      stop() {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        ) {
          mediaRecorderRef.current.stop();
        }
      },
    }));

    return null;
  }
);

AudioRecorder.displayName = "AudioRecorder";
export default AudioRecorder;