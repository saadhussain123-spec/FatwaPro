import { useCallback, useEffect, useRef, useState } from "react";
import type { AppLanguage } from "../types/research";
import type { AppTranslations } from "../i18n/translations";

interface UseVoiceInputOptions {
  language: AppLanguage;
  t: AppTranslations;
  onTranscript: (text: string) => void;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const win = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

function pickSupportedMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return undefined;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const commaIdx = result.indexOf(",");
      if (commaIdx === -1) {
        reject(new Error("Failed to read recorded audio."));
        return;
      }
      resolve(result.slice(commaIdx + 1));
    };
    reader.onerror = () => reject(new Error("Failed to process recorded audio."));
    reader.readAsDataURL(blob);
  });
}

async function hasAudibleSpeech(blob: Blob): Promise<boolean> {
  if (typeof window === "undefined") return true;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return true;

  let ctx: AudioContext | null = null;
  try {
    ctx = new AudioCtx();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    let peak = 0;
    for (let i = 0; i < channelData.length; i += 4) {
      const abs = Math.abs(channelData[i]);
      if (abs > peak) peak = abs;
      if (peak > 0.015) return true;
    }
    return peak > 0.005;
  } catch {
    return true;
  } finally {
    if (ctx) {
      void ctx.close().catch(() => {});
    }
  }
}

export function useVoiceInput({
  language,
  t,
  onTranscript,
}: UseVoiceInputOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const speechRecRef = useRef<SpeechRecognitionLike | null>(null);
  const activeLanguageRef = useRef<AppLanguage>(language);
  const tRef = useRef<AppTranslations>(t);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopTracks = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // Ignore unmount stop error
        }
      }
      if (speechRecRef.current) {
        try {
          speechRecRef.current.stop();
        } catch {
          // Ignore unmount stop error
        }
      }
      stopTracks();
    };
  }, [clearTimer, stopTracks]);

  const stopRecording = useCallback(() => {
    clearTimer();
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        stopTracks();
        setIsRecording(false);
      }
      return;
    }
    if (speechRecRef.current) {
      try {
        speechRecRef.current.stop();
      } catch {
        // Ignore stop error
      }
      speechRecRef.current = null;
    }
    setIsRecording(false);
  }, [clearTimer, stopTracks]);

  const startBrowserSpeechFallback = useCallback(
    (selectedLang: AppLanguage) => {
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        setVoiceError(tRef.current.search.micUnsupportedError);
        return;
      }

      const rec = new Ctor();
      rec.lang =
        selectedLang === "de"
          ? "de-DE"
          : selectedLang === "ur"
            ? "ur-PK"
            : selectedLang === "ar"
              ? "ar-SA"
              : "en-US";
      rec.interimResults = false;
      rec.continuous = false;
      rec.maxAlternatives = 1;

      let gotResult = false;
      rec.onresult = (event) => {
        const parts: string[] = [];
        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          if (item?.[0]?.transcript) {
            parts.push(item[0].transcript);
          }
        }
        const combined = parts.join(" ").trim();
        if (combined) {
          gotResult = true;
          onTranscriptRef.current(combined);
        }
      };

      rec.onerror = (event) => {
        clearTimer();
        setIsRecording(false);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setVoiceError(tRef.current.search.micPermissionError);
        } else if (event.error === "no-speech") {
          setVoiceError(tRef.current.search.micNoSpeechError);
        } else {
          setVoiceError(tRef.current.search.micUnsupportedError);
        }
      };

      rec.onend = () => {
        clearTimer();
        setIsRecording(false);
        speechRecRef.current = null;
        if (!gotResult) {
          setVoiceError((prev) => prev ?? tRef.current.search.micNoSpeechError);
        }
      };

      speechRecRef.current = rec;
      setVoiceError(null);
      setElapsedSeconds(0);
      setIsRecording(true);
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
      rec.start();
    },
    [clearTimer]
  );

  const startRecording = useCallback(async () => {
    if (isRecording || isTranscribing) return;
    setVoiceError(null);

    const capturedLanguage = language;
    activeLanguageRef.current = capturedLanguage;

    const canRecordMedia =
      typeof navigator !== "undefined" &&
      Boolean(navigator.mediaDevices?.getUserMedia) &&
      typeof MediaRecorder !== "undefined";

    if (!canRecordMedia) {
      startBrowserSpeechFallback(capturedLanguage);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const mimeType = pickSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        clearTimer();
        stopTracks();
        setIsRecording(false);
        setVoiceError(tRef.current.search.micUnsupportedError);
      };

      recorder.onstop = async () => {
        clearTimer();
        stopTracks();
        setIsRecording(false);

        const recordedType = recorder.mimeType || mimeType || "audio/webm";
        const audioBlob = new Blob(chunksRef.current, { type: recordedType });
        chunksRef.current = [];

        if (audioBlob.size < 400) {
          setVoiceError(tRef.current.search.micNoSpeechError);
          return;
        }

        const audible = await hasAudibleSpeech(audioBlob);
        if (!audible) {
          setVoiceError(tRef.current.search.micNoSpeechError);
          return;
        }

        setIsTranscribing(true);
        try {
          const audioBase64 = await blobToBase64(audioBlob);
          const response = await fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              audioBase64,
              mimeType: recordedType,
              language: activeLanguageRef.current,
            }),
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || tRef.current.search.micNoSpeechError);
          }

          const transcript =
            typeof data.text === "string" ? data.text.trim() : "";
          if (!transcript) {
            setVoiceError(tRef.current.search.micNoSpeechError);
            return;
          }

          onTranscriptRef.current(transcript);
        } catch (err: unknown) {
          const msg =
            err instanceof Error
              ? err.message
              : tRef.current.search.micNoSpeechError;
          setVoiceError(msg);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      setElapsedSeconds(0);
      setIsRecording(true);
      recorder.start(250);

      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          if (next >= 60) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (err: unknown) {
      stopTracks();
      clearTimer();
      setIsRecording(false);
      const errName =
        err && typeof err === "object" && "name" in err
          ? String((err as { name?: string }).name)
          : "";
      if (errName === "NotAllowedError" || errName === "PermissionDeniedError") {
        setVoiceError(tRef.current.search.micPermissionError);
      } else {
        startBrowserSpeechFallback(capturedLanguage);
      }
    }
  }, [
    clearTimer,
    isRecording,
    isTranscribing,
    language,
    startBrowserSpeechFallback,
    stopRecording,
    stopTracks,
  ]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      void startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isTranscribing,
    elapsedSeconds,
    voiceError,
    clearVoiceError: () => setVoiceError(null),
    toggleRecording,
  };
}
