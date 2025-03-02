"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { TongueTwister } from '@/lib/supabase/types';

interface SpeechRecorderProps {
  tongueTwister: TongueTwister;
  onRecordingComplete: (audioData: string) => void;
}

export function SpeechRecorder({ tongueTwister, onRecordingComplete }: SpeechRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  const handleDataAvailable = useCallback((event: BlobEvent) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      onRecordingComplete(base64Data);
    };
    reader.readAsDataURL(event.data);
  }, [onRecordingComplete]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.addEventListener('dataavailable', handleDataAvailable);
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to access microphone. Please ensure you have granted microphone permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        className="w-full max-w-xs"
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? (
          <>
            <Square className="mr-2 h-4 w-4" />
            Recording...
          </>
        ) : (
          <>
            <Mic className="mr-2 h-4 w-4" />
            Start Recording
          </>
        )}
      </Button>
    </div>
  );
}
