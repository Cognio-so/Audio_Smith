const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

// Keep track of the current audio element
let currentAudio = null;

export const speakWithDeepgram = async (text) => {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    throw new Error('Text must be a non-empty string.');
  }

  // Stop any existing speech first
  stopSpeaking();

  console.log('Attempting TTS with text:', text.trim());

  let retryCount = 0;
  const maxRetries = 3;

  const attemptTTS = async () => {
    try {
      const response = await fetch('https://api.deepgram.com/v1/speak', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "text": text.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('TTS API error details:', errorData);
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying TTS (${retryCount}/${maxRetries})...`);
          return attemptTTS();
        }
        throw new Error(`TTS API error: ${response.status} - ${errorData.err_msg || 'Unknown error'}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Store the current audio element
      currentAudio = audio;

      return new Promise((resolve, reject) => {
        audio.addEventListener('play', () => {
          // If this audio is not the current one, stop it
          if (currentAudio !== audio) {
            audio.pause();
            URL.revokeObjectURL(audioUrl);
            reject(new Error('Interrupted by new speech'));
            return;
          }
        });

        audio.addEventListener('ended', () => {
          URL.revokeObjectURL(audioUrl);
          if (currentAudio === audio) {
            currentAudio = null;
          }
          resolve();
        });

        audio.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          URL.revokeObjectURL(audioUrl);
          if (currentAudio === audio) {
            currentAudio = null;
          }
          reject(new Error('Audio playback error'));
        });

        // If the audio was already stopped before playing, don't start
        if (currentAudio !== audio) {
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Interrupted before playing'));
          return;
        }

        audio.play().catch(error => {
          console.error('Audio playback failed:', error);
          URL.revokeObjectURL(audioUrl);
          if (currentAudio === audio) {
            currentAudio = null;
          }
          reject(new Error('Audio playback failed to start'));
        });
      });
    } catch (error) {
      console.error('TTS error:', error);
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying TTS (${retryCount}/${maxRetries})...`);
        return attemptTTS();
      }
      throw error;
    }
  };

  return attemptTTS();
};

export const stopSpeaking = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  // Also stop any other audio elements that might be playing
  document.querySelectorAll('audio').forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
    audio.dispatchEvent(new Event('stop'));
  });
};

// Add a function to check if speech is currently playing
export const isSpeaking = () => {
  return currentAudio !== null && !currentAudio.paused;
};