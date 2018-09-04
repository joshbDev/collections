import { getAuthToken, setWebSDKId } from '../util';

export function initializeWebPlayer() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      window.player = new window.Spotify.Player({
        name: 'Collections',
        getOAuthToken: (cb) => { cb(getAuthToken()); }
      });

      // Error handling
      window.player.addListener('initialization_error', ({ message }) => { console.error(message); });
      window.player.addListener('authentication_error', ({ message }) => { console.error(message); });
      window.player.addListener('account_error', ({ message }) => { console.error(message); });
      window.player.addListener('playback_error', ({ message }) => { console.error(message); });

      // Playback status updates
      window.player.on('player_state_changed', (state) => { console.log(state); });

      // Ready
      window.player.addListener('ready', ({device_id: deviceId}) => {
        setWebSDKId(deviceId);
        resolve(deviceId);
      });
      // Connect to the player!
      window.player.connect();
    };
  });
}


export function toggleWebPlayerPlayback() {
  return window.player.togglePlay();
}

export function destroyWebPlayer() {
  return window.player.disconnect();
}
