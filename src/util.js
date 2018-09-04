export const ARTIST_DELIMITER = 'artist:';
export const URI_DELIMITER = 'user:';
export const TRACK_DELIMITER = 'track:';
import { AUTH_TOKEN_KEY } from './auth/OAuthCallbackHandler';
import { ALBUMS_PLAYLIST_KEY, ARTIST, ARTISTS_PLAYLIST_KEY } from './constants';

let webSDKId;

export function setWebSDKId(id) {
  webSDKId = id;
}

export function getWebSDKId() {
  return webSDKId;
}

export function fireGAEvent(cat, sub, label) {
  if (window.ga) {
    window.ga('send', 'event', cat, sub, label);
  }
}

export let AUTH_TOKEN;
export function getAuthToken() {
  if (AUTH_TOKEN) {return AUTH_TOKEN;}
  AUTH_TOKEN = window.localStorage.getItem(AUTH_TOKEN_KEY) && JSON.parse(window.localStorage.getItem(AUTH_TOKEN_KEY))['#access_token'];
  return AUTH_TOKEN;
}

export function getHeaders() {
  return {
    "Authorization": `Bearer ${ getAuthToken()}`,
    'Content-Type': 'application/json',
    "Accept": 'application/json',
  };
}
export function getPutConfig() {
  const config = getConfig();
  config.headers['Content-Type'] = 'application/json';
  config.method = 'PUT';
  return config;
}
export function getDeleteConfig(body = {}) {
  const config = getConfig();
  config.headers['Content-Type'] = 'application/json';
  config.method = 'DELETE';
  config.body = JSON.stringify(body);
  return config;
}
export function getPostConfig(body = {}) {
  const config = getConfig();
  config.headers['Content-Type'] = 'application/json';
  config.method = 'POST';
  config.body = JSON.stringify(body);
  return config;
}
export function getConfig() {
  return {
    headers: {
      Authorization: `Bearer ${ getAuthToken()}`,
    },
    credentials: 'include',
  };
}

export function uniq(a) {
  return Array.from(new Set(a));
}
export function chunkArray(array = [], size = 50) {
  const results = [];
  while (array.length) {
    results.push(array.splice(0, size));
  }
  return results;
}

export function createPlaylistForSaved(tracks, type = ARTIST, me) {
  return {
    items: tracks,
    uri: `spotify:user:${me.id}:playlist:saved ${type}`,
    name: `${type === ARTIST ? ARTISTS_PLAYLIST_KEY : ALBUMS_PLAYLIST_KEY}Saved ${type[0].toUpperCase() + type.slice(1)}s`,
    isSaved: true,
    owner: {
      id: me.id,
    },
  };
}
