const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

let currentAudio = null;

export const speakWithDeepgram = async (text, detectedLanguage = 'en-US') => {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    throw new Error('Text must be a non-empty string.');
  }

  stopSpeaking();
  console.log('Attempting TTS with text:', text.trim(), 'detected language:', detectedLanguage);

  const baseLanguage = detectedLanguage.split('-')[0].toLowerCase();

  let retryCount = 0;
  const maxRetries = 3;

  const attemptTTS = async () => {
    try {
      // Simplified payload according to Deepgram API requirements
      const payload = {
        text: text.trim()
      };

      // Only add model for non-English languages
      if (baseLanguage !== 'en') {
        payload.model = `${baseLanguage}-nova-3`;
      }

      console.log('Sending TTS payload:', payload);

      const response = await fetch('https://api.deepgram.com/v1/speak', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('TTS API error details:', errorData);
        throw new Error(`TTS API error: ${response.status} - ${errorData.err_msg || 'Unknown error'}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      currentAudio = audio;

      return new Promise((resolve, reject) => {
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

        audio.play().catch(error => {
          console.error('Audio playback failed:', error);
          URL.revokeObjectURL(audioUrl);
          if (currentAudio === audio) {
            currentAudio = null;
          }
          reject(error);
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
};

export const isSpeaking = () => {
  return currentAudio !== null && !currentAudio.paused;
};