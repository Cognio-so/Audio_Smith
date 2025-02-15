const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

export const startSpeechToTextStreaming = async (onTranscript) => {
  console.log('Initializing WebSocket connection...');
  
  let stream;
  let recorder;
  let socket;
  let retryCount = 0;
  const maxRetries = 3;

  const connect = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 68000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      console.log('Microphone access granted');

      socket = new WebSocket('wss://api.deepgram.com/v1/listen', [
        'token',
        DEEPGRAM_API_KEY,
      ]);

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 5000);

        socket.onopen = () => {
          clearTimeout(timeout);
          console.log('WebSocket connection established');
          resolve();
        };

        socket.onerror = (error) => {
          clearTimeout(timeout);
          reject(error);
        };
      });

      const options = {
        model: "zeus",
        punctuate: true,
        encoding: "linear16",
        channels: 1,
        sample_rate: 68000,
        language: "hi,en",
        smart_format: true,
        detect_language: true,
        interim_results: true,
        endpointing: 300,
        vad_events: true,
        diarize: false,
        profanity_filter: false,
        redact: false,
        multilingual: true
      };

      socket.send(JSON.stringify({ options }));

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/mp4';

      recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000
      });

      let finalTranscript = '';
      let isFinal = false;

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const transcript = data.channel?.alternatives?.[0]?.transcript || '';
          const language = data.channel?.alternatives?.[0]?.language || 'en-US';
          isFinal = data.is_final || false;

          if (transcript) {
            console.log('Received transcript:', transcript, 'isFinal:', isFinal, 'Language:', language);
            
            // Send both interim and final transcripts with detected language
            onTranscript({
              content: transcript,
              language: language,
              isFinal: isFinal
            });

            if (isFinal) {
              finalTranscript = transcript;
              console.log('Final transcript in language:', language);
            }
          }
        } catch (error) {
          console.error('Error parsing transcript:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying connection (${retryCount}/${maxRetries})...`);
          setTimeout(connect, 1000 * retryCount);
        }
      };

      socket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        if (recorder && recorder.state === 'recording') {
          recorder.stop();
        }
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      };

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
          socket.send(event.data);
        }
      };

      recorder.start(100);

    } catch (error) {
      console.error('Setup error:', error);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (socket) {
        socket.close();
      }
      throw error;
    }
  };

  await connect();

  return {
    socket,
    recorder,
    stop: () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
      if (recorder && recorder.state === 'recording') {
        recorder.stop();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };
}; 