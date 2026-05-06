export const SOUNDS = {
  NOTIFICATION: "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3",
  SUCCESS: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
  ERROR: "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3",
  SOS: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
  CALL_RINGING: "https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3",
  RIDE_FOUND: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  CLICK: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  BABY_LAUGH: "/sounds/baby-laugh.mp3",
  CALL_JOIN: "https://assets.mixkit.co/active_storage/sfx/1358/1358-preview.mp3",
  CALL_END: "https://assets.mixkit.co/active_storage/sfx/1353/1353-preview.mp3",
};

export const playSound = (soundUrl: string, volume = 0.5) => {
  try {
    const audio = new Audio(soundUrl);
    audio.volume = volume;
    audio.play().catch(e => {
      // Browsers often block auto-play until user interaction
      console.warn("Mamacare Audio: Playback blocked or failed.", e.message);
    });
    return audio;
  } catch (e) {
    console.error("Mamacare Audio: Failed to initialize audio.", e);
    return null;
  }
};
