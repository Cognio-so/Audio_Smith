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
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted');

      recorder = new MediaRecorder(stream);
      socket = new WebSocket('wss://api.deepgram.com/v1/listen', [
        'token',
        DEEPGRAM_API_KEY,
      ]);

      socket.onopen = () => {
        console.log('WebSocket connection established');
        recorder.start(100);
        retryCount = 0; // Reset retry count on successful connection
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.channel?.alternatives?.[0]?.transcript) {
            const transcript = data.channel.alternatives[0].transcript;
            onTranscript({
              content: transcript,
              role: 'user'
            });
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
        } else {
          throw new Error('WebSocket connection error');
        }
      };

      socket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        recorder.stop();
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
          socket.send(event.data);
        }
      };

      recorder.onerror = (error) => {
        console.error('Recorder error:', error);
        socket.close();
        throw new Error('Audio recording error');
      };

    } catch (error) {
      console.error('Initialization error:', error);
      if (stream) stream.getTracks().forEach(track => track.stop());
      throw error;
    }
  };

  await connect();

  return {
    socket,
    recorder,
    stop: () => {
      if (socket) socket.close();
      if (recorder) recorder.stop();
      if (stream) stream.getTracks().forEach(track => track.stop());
    }
  };
}; 