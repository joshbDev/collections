import Vue from 'vue';
import Vuex from 'vuex';
import { findMe, getMyFollowArtists, getMySavedAlbums, getPlayingTrack, getPlaylist, getUserPlaylists, saveNewPlaylist, search } from '../api/api';
import { initializeWebPlayer } from '../api/web-playback-sdk';
import { ALBUM, ALBUMS_PLAYLIST_KEY, ARTIST, ARTISTS_PLAYLIST_KEY, SAMPLE_PLAYLISTS } from '../constants';
import { createPlaylistForSaved } from '../util';
Vue.use(Vuex);

export const INITIALIZE_COMMITS = 'initializeCommits';
export const SAVE_COLLECTION = 'saveCollection';
export const ADD_NEW_PLAYLIST = 'addNewItem';
export const SEARCH = 'search';
export const RESET_SEARCH = 'reset-search';
export const ADD_ALBUM_PLAYLIST = 'addAlbumPlaylist';
export const ADD_ARTIST_PLAYLIST = 'addArtistPlaylist';
export const CHECK_PLAYING_TRACK = 'checkPlayingTrack';
export const [INITIALIZE_FEATURED] = 'initializeFeatured';

export const store = new Vuex.Store({
  state: {
    me: {},
    albumCollections: [],
    artistCollections: [],
    playlistTracksOrArtists: [],
    searchResults: [],
    initialFetchComplete: false,
    savedAlbums: [],
    savedArtists: [],
    playingTrack: {},
    featuredCollections: []
  },
  getters: {
    albumCollections: (state) => state.albumCollections,
    artistCollections: (state) => state.artistCollections,
    playlistTracks: (state) => state.playlistTracksOrArtists,
    me: (state) => state.me,
    searchResults: (state) => state.searchResults,
    initialFetchComplete: (state) => state.initialFetchComplete,
    savedAlbums: (state) => state.savedAlbums,
    savedArtists: (state) => state.savedArtists,
    playingTrack: (state) => state.playingTrack,
    featuredCollections: (state) => state.featuredCollections,
  },
  mutations: {
    [INITIALIZE_COMMITS]: (state, {albums, artists, me, savedAlbums, savedArtists }) => {
      state.albumCollections = albums;
      state.artistCollections = artists;
      state.me = me;
      state.savedAlbums = savedAlbums;
      state.savedArtists = savedArtists;
      state.initialFetchComplete = true;
    },
    [SAVE_COLLECTION]: (state, {newPlaylist, type }) => {
      if (type === ARTIST) {
        state.artistCollections = [...state.artistCollections, newPlaylist ];
        return;
      }
      state.albumCollections = [...state.albumCollections, newPlaylist ];
    },
    [SEARCH]: (state, results) => {
      state.searchResults = results;
    },
    [RESET_SEARCH]: (state) => {
      state.searchResults = [];
    },
    [ADD_ALBUM_PLAYLIST]: (state, playlist) => {
      state.albumCollections = [...state.albumCollections, playlist ];
    },
    [ADD_ARTIST_PLAYLIST]: (state, playlist) => {
      state.artistCollections = [...state.artistCollections, playlist ];
    },
    [CHECK_PLAYING_TRACK]: (state, track) => {
      state.playingTrack = track;
    },
    [INITIALIZE_FEATURED]: (state, featuredCollections) => {
      state.featuredCollections = featuredCollections;
    },
  },
  actions: {
    [INITIALIZE_COMMITS]: ({commit }) => {
      return new Promise(async(res) => {
        initialize();
        const me = await findMe();
        const myPlaylists = await getUserPlaylists(me.id);
        const [artists, albums ] = myPlaylists.reduce((prev, curr) => {
          if (curr.name.includes(ALBUMS_PLAYLIST_KEY)) {
            prev[1] = [...prev[1], curr ];
          } else if (curr.name.includes(ARTISTS_PLAYLIST_KEY)) {
            prev[0] = [...prev[0], curr ];
          }
          return prev;
        }, [[], [] ]);
        const savedAlbumsRaw = await getMySavedAlbums();
        const savedArtistsRaw = await getMyFollowArtists();
        const savedArtists = createPlaylistForSaved(savedArtistsRaw, ARTIST, me);
        const savedAlbums = createPlaylistForSaved(savedAlbumsRaw.map((i) => i.album), ALBUM, me);
        commit(INITIALIZE_COMMITS, {me, artists, albums, savedAlbums, savedArtists });
        res();
      });
    },
    [SAVE_COLLECTION]: ({commit, state }, {type, name }) => {
      return new Promise(async(res) => {
        const newPlaylist = await saveNewPlaylist(state.me, `${type === ARTIST ? ARTISTS_PLAYLIST_KEY : ALBUMS_PLAYLIST_KEY}${name}`);
        commit(SAVE_COLLECTION, {type, newPlaylist });
        res(newPlaylist);
      });
    },
    [SEARCH]: async({commit, state }, {input, type }) => {
      const searchResults = await search(type, input);
      commit(SEARCH, type === ARTIST ? searchResults.artists.items : searchResults.albums.items);
    },
    [CHECK_PLAYING_TRACK]: async({commit, state }) => {
      const track = await getPlayingTrack();
      commit(CHECK_PLAYING_TRACK, track);
    },
    [INITIALIZE_FEATURED]: ({commit, state}) => {
      const playlists = [];
      SAMPLE_PLAYLISTS.forEach((item) => {
        getPlaylist(item).then((playlist) => {
          playlists.push(playlist);
          if (playlists.length === SAMPLE_PLAYLISTS.length) {
            commit(INITIALIZE_FEATURED, playlists);
          }
        });
      });
    },
  },
});

function initialize() {
  initializeWebPlayer();
}
