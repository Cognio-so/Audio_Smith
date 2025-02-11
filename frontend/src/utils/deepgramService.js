import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

let mediaStream = null;
let deepgramLive = null;

export const startDeepgramStream = async (onTranscript, onError) => {
  try {
    const deepgram = createClient(DEEPGRAM_API_KEY);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStream = stream;

    deepgramLive = deepgram.listen.live({
      model: 'nova-2',
      language: 'en-US',
      smart_format: true,
      interim_results: true,
      punctuate: true,
    });

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (e) => {
      if (deepgramLive && !deepgramLive.isClosed) {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = inputData[i] * 0x7fff;
        }
        deepgramLive.send(pcmData);
      }
    };

    deepgramLive.on(LiveTranscriptionEvents.Open, () => {
      console.log('Deepgram connection established');
    });

    deepgramLive.on(LiveTranscriptionEvents.Close, () => {
      console.log('Deepgram connection closed');
    });

    deepgramLive.on(LiveTranscriptionEvents.Error, (error) => {
      console.error('Deepgram error:', error);
      onError(error);
    });

    deepgramLive.on(LiveTranscriptionEvents.Transcript, (data) => {
      if (data?.is_final || (data?.channel?.alternatives?.[0]?.confidence > 0.9)) {
        const transcript = data?.channel?.alternatives?.[0]?.transcript?.trim();
        if (transcript) {
          console.log('Processing transcript:', transcript);
          onTranscript(transcript);
        }
      }
    });

    return deepgramLive;
  } catch (error) {
    console.error('Deepgram initialization error:', error);
    onError(error);
    return null;
  }
};

export const stopDeepgramStream = async () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  
  if (deepgramLive) {
    try {
      await deepgramLive.finish();
      deepgramLive = null;
    } catch (error) {
      console.error('Error closing Deepgram connection:', error);
    }
  }
};

export const isDeepgramActive = () => deepgramLive !== null && !deepgramLive.isClosed;
