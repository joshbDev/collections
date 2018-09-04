import { ARTIST, URL_SPLIT } from '../constants';
import { chunkArray, getConfig, getDeleteConfig, getHeaders, getPostConfig, getWebSDKId, uniq } from "../util";

export function saveNewPlaylist(user, name) {
  return new Promise((resolve) => {
    fetch(`/v1/users/${user.id}/playlists`, getPostConfig({
      name,
      description: 'Created By Collections',
    }))
      .then((res) => {
        return res.json();
      }).then((res) => {
        resolve(res);
      });
  });
}

export function findMe() {
  return new Promise((resolve, reject) => {
    fetch('/v1/me/', getConfig())
      .then((res) => {
        return res.json();
      }).then((res) => {
        resolve(res);
      }).catch((e) => {
        reject(e);
      });
  });
}
export function deleteSongs({userId, playlistId, tracks }) {
  return new Promise((resolve, reject) => {
    fetch(`/v1/users/${userId}/playlists/${playlistId}/tracks`, getDeleteConfig({tracks }))
      .then((res) => {
        return res.json();
      }).then((res) => {
        resolve(res);
      }).catch((e) => {
        reject(e);
      });
  });
}
export function unfollowPlaylist({userId, playlistId }) {
  return new Promise((resolve, reject) => {
    fetch(`/v1/users/${userId}/playlists/${playlistId}/followers`, getDeleteConfig())
      .then((res) => {
        resolve();
      }).catch((e) => {
        reject(e);
      });
  });
}
export function getMyFollowArtists() {
  return new Promise((resolve, reject) => {
    fetch('/v1/me/following?type=artist&limit=50', getConfig()).then((res) => {
      return res.json();
    }).then(({artists }) => {
      let nextPages = [];
      if (artists.next) {
        getFullUrl(artists.next.split(URL_SPLIT)[1], 'artists').then((deepRes) => {
          nextPages = [...deepRes ];
          resolve([...artists.items, ...nextPages ]);
        });
        return;
      }
      resolve([...artists.items, ...nextPages ]);
    }).catch((e) => {
      reject(e);
    });
  });
}

export function getMySavedAlbums() {
  return new Promise((resolve, reject) => {
    fetch('/v1/me/albums?limit=50', getConfig())
      .then((res) => {
        return res.json();
      }).then((res) => {
        let nextPages = [];
        if (res.next) {
          getFullUrl(res.next.split(URL_SPLIT)[1]).then((deepRes) => {
            nextPages = [...deepRes ];
            resolve([...res.items, ...nextPages ]);
          });
          return;
        }
        resolve([...res.items, ...nextPages ]);
      }).catch((e) => {
        reject(e);
      });
  });
}
export function getUserPlaylists(id) {
  return new Promise((resolve) => {
    fetch(`/v1/users/${id}/playlists`, getConfig())
      .then((res) => {
        return res.json();
      }).then((res) => {
        let nextPages = [];
        if (res.next) {
          getFullUrl(res.next.split(URL_SPLIT)[1]).then((deepRes) => {
            nextPages = [...deepRes ];
            resolve([...res.items, ...nextPages ]);
          });
          return;
        }
        resolve([...res.items, ...nextPages ]);
      });
  });
}
export function getFullUrl(url, key = 'items') {
  return new Promise((resolve) => {
    fetch(url, getConfig())
      .then((res) => {
        return res.json();
      }).then((res) => {
        let nextPages = [];
        if (res.next) {
          getFullUrl(res.next.split(URL_SPLIT)[1]).then((deepRes) => {
            nextPages = [...deepRes ];
            resolve([...res[key], ...nextPages ]);
          });
          return;
        }
        resolve([...res[key], ...nextPages ]);
      });
  });
}

export function getArtistsInfo(tracks) {
  const artistUrls = tracks.map(({track }) => track.artists[0].uri.split('artist:')[1]);
  const uniqueArtists = uniq(artistUrls);
  const chunkedArtists = chunkArray(uniqueArtists, 50);
  return new Promise((resolve, rej) => {
    const artistData = [];
    chunkedArtists.forEach((url) => {
      fetch(`/v1/artists?ids=${url.join(',')}`, getConfig())
        .then((res) => {
          return res.json();
        }).then(({artists }) => {
          artistData.push(artists);
          if (artistData.length === chunkedArtists.length) {
            const flattened = artistData.reduce((prev, curr) => [...prev, ...curr ], []);
            resolve(flattened);
          }
        }).catch((e) => {
          rej(e);
        });
    });
  });
}

export function search(type = 'artist', searchText = '') {
  return new Promise((resolve) => {
    fetch(`/v1/search?q=${searchText}&type=${type}`, getConfig())
      .then((res) => {
        return res.json();
      }).then((res) => {
        resolve(res);
      });
  });
}

export function getPlaylist(playlist) {
  const [username, id] = playlist;
  return new Promise((resolve) => {
    fetch(`/v1/users/${username}/playlists/${id}`, getConfig())
      .then((res) => {
        return res.json();
      }).then((res) => {
        resolve(res);
      });
  });
}

export function getSongsFromSelected(type, items) {
  return new Promise((resolve) => {
    const songs = [];
    items.forEach((item) => {
      const url = type === ARTIST ? `/v1/artists/${item.id}/top-tracks?country=US` : `/v1/albums/${item.id}/tracks`;
      fetch(url, getConfig())
        .then((res) => {
          return res.json();
        }).then((res) => {
          let soloSongs;
          if (type === ARTIST) {
            soloSongs = res.tracks.filter((i) => i.artists.length <= 1 || i.artists[0].uri === item.uri);
          } else {
            soloSongs = res.items;
          }
          songs.push(soloSongs[0]);
          if (items.length === songs.length) {
            resolve(songs);
          }
        });
    });
  });
}

export function playTrack(uri, type = 'play') {
  return new Promise((resolve, reject) => {
    const shouldPlayOnBrowser = type === 'play' && getWebSDKId();
    return fetch(`/v1/me/player/${type}${shouldPlayOnBrowser ? `?device_id=${getWebSDKId()}` : ''}`, {method: 'put', headers: getHeaders(), credentials: 'include', body: uri ? JSON.stringify({
      uris: uri,
    }) : null })
      .then((res) => {
        resolve();
      });
  });
}
export function skipTrack(type = 'next') {
  return new Promise((resolve, reject) => {
    return fetch(`/v1/me/player/${type}`, getPostConfig())
      .then((res) => {
        resolve();
      });
  });
}
export function getPlayingTrack(uri) {
  return new Promise((resolve, reject) => {
    return fetch(`/v1/me/player`, getConfig())
      .then((res) => {
        return res.json();
      }).then((res) => {
        resolve(res);
      });
  });
}
export function followPlaylist(ownerId, playlistId) {
  return new Promise((resolve, reject) => {
    return fetch(`/v1/users/${ownerId}/playlists/${playlistId}/followers`, {method: 'put', headers: getHeaders(), credentials: 'include' })
      .then((res) => {
      });
  });
}
export function getSongsFromAlbum(id) {
  return new Promise((resolve) => {
    fetch(`/v1/albums/${id.split('album:')[1]}/tracks?limit=50`, getConfig())
      .then((res) => {
        return res.json();
      }).then((res) => {
        resolve(res);
      });
  });
}

export function getAlbumsFromArtist(artistUri) {
  return new Promise((resolve) => {
    fetch(`/v1/artists/${artistUri.split('artist:')[1]}/albums?include_groups=album`, getConfig())
      .then((res) => {
        return res.json();
      }).then(({items }) => {
        resolve(items);
      });
  });
}
export function addTracksToPlaylist(user, id, songs) {
  return new Promise((resolve) => {
    fetch(`/v1/users/${user.id}/playlists/${id}/tracks?uris=${songs.join(',')}`, getPostConfig())
      .then((res) => {
        return res.json();
      }).then((res) => {
        resolve(true);
      });
  });
}
