import { fromPairs } from 'lodash';
export const AUTH_TOKEN_KEY = 'collections_access_token';

export function tryParsingAuthData() {
  const location = window.location;
  const oauthData = fromPairs(location.hash.split('&').map((pair) => pair.split('=')));
  if (!oauthData || !oauthData['#access_token']) {
    return false;
  }
  oauthData.expires_at = (+new Date()) + (oauthData.expires_in * 1000);
  window.localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(oauthData));
  return true;
}

