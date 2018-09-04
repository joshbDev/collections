<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
import {INITIALIZE_COMMITS, SAVE_COLLECTION, ADD_ARTIST_PLAYLIST, ADD_ALBUM_PLAYLIST, INITIALIZE_FEATURED} from '../store/store';
import Collection from './Collection.vue';
import { ARTIST, USER, ARTISTS_PLAYLIST_KEY, DEEPLINK_URL } from '../constants';
import { getUserPlaylists } from '../api/api';
import { AUTH_TOKEN_KEY } from '../auth/OAuthCallbackHandler';
import { AUTH_TOKEN, fireGAEvent } from '../util';
import Sidebar from './Sidebar.vue';
import './mobile-style.vue';

export default {
  async beforeCreate() {
    if (!window.localStorage.getItem(AUTH_TOKEN_KEY) || new Date(JSON.parse(window.localStorage.getItem(AUTH_TOKEN_KEY))['expires_at']) < new Date()) {
      window.localStorage.setItem(DEEPLINK_URL, window.location.href);
      this.$router.push('/');
    }
    if (!Object.keys(this.$route.params)) {
      this.$router.replace('/browse');
    }
  },
  computed: mapGetters({
    albumPlaylists: 'albumCollections',
    artistPlaylists: 'artistCollections',
    tracks: 'playlistTracks',
    initialFetchComplete: 'initialFetchComplete',
    savedArtists: 'savedArtists',
    savedAlbums: 'savedAlbums',
    featuredCollections: 'featuredCollections',
  }),
  methods: Object.assign({}, mapActions([
    INITIALIZE_COMMITS,
    SAVE_COLLECTION,
    INITIALIZE_FEATURED,
  ]), mapMutations([
    ADD_ARTIST_PLAYLIST,
    ADD_ALBUM_PLAYLIST
  ]), {
    clickItem(uri) {
      const playlistUrl = uri.split(USER)[1].split(':').join('/');
      this.$router.push(`/browse/${playlistUrl}`);
      this.isOpen = true;
      this.openUri = uri;
    },
    createNew({className, type}) {
      if (type === ARTIST) {
        this.isArtistInputOpen = true;
      } else {
        this.isAlbumInputOpen = true;
      }
      setTimeout(() => {
        document.getElementsByClassName(className)[0].focus();
        window.addEventListener('mousedown', this.onWindowEvent, true);
      }); 
      
    },
    closeItem() {
      this.$router.push('/browse');
      this.openUri = '';
    },
    onWindowEvent({type, target}) {
      if (type === 'mousedown' && !document.getElementsByClassName('input-section')[0].contains(target)) {
        this.isAlbumInputOpen = false;
        this.isArtistInputOpen = false;
        window.removeEventListener('mousedown', this.onWindowEvent, true);
      }
    },
    submitNew({target, type}) {
      if (!this.$refs[target].value) {return;}
      this[SAVE_COLLECTION]({name: this.$refs[target].value, type}).then((newPlaylist) => {
        this.isAlbumInputOpen = false;
        this.isArtistInputOpen = false;
        fireGAEvent('create', type, newPlaylist.uri);
        window.removeEventListener('mousedown', this.onWindowEvent, true);
        this[INITIALIZE_COMMITS]().then(() => {
          this.clickItem(newPlaylist.uri);
        });
      });

      
    },
    submitNewSidebar(uri) {
      this[INITIALIZE_COMMITS]().then(() => {
          this.clickItem(uri);
        });
    },
    resetPlaylists() {
      this[INITIALIZE_COMMITS]();
    }
  }),
  data() {
    return {
      isOpen: false,
      openUri: '',
      isAlbumInputOpen: false,
      isArtistInputOpen: false,
    }
  },
  created() {
    try {
      this[INITIALIZE_COMMITS]();
      this[INITIALIZE_FEATURED]();
    } catch(e) {
      debugger;
    }
  },
  watch: {
    initialFetchComplete: watchForDeeplink,
  },
  render(h) {
    return (<div class="browse-page">
    <div class="container mobile-container">
    <Sidebar openCollection={this.clickItem} artistsCollection={[...this.artistPlaylists, this.savedArtists]} albumsCollection={[...this.albumPlaylists, this.savedAlbums]} openedUri={this.openUri} createNew={this.submitNewSidebar.bind(this)} />
    <div class="featured-collections">
    {!this.$route.params.uri ? <h1 class="hide-mobile"> Browse</h1> : null}
    {!this.$route.params.uri ? <hr class="hide-mobile" /> : null}
    {!this.$route.params.uri ? <h2 > Featured Collections</h2> : null}
    {this.featuredCollections.map((item, index) => {
      return !this.$route.params.uri || this.openUri === item.uri ? (<div key={item.uri} class="album-collection-item"><Collection closeItem={this.closeItem} openItem={this.clickItem.bind(this)} index={index} collection={item} isOpen={this.$route.params.uri && this.openUri === item.uri} isArtist={item.name.includes(ARTISTS_PLAYLIST_KEY)}  /></div>) : <div key={index} class="album-collection-item" />;
    })}
    </div>
    <div class="type-container">
    {!this.$route.params.uri ? <hr /> : null}
    {!this.$route.params.uri ? <h2> Artists </h2> : null}
    {this.artistPlaylists.map((item, index) => {
      return !this.$route.params.uri || this.openUri === item.uri ? (<div key={item.uri} class="album-collection-item"><Collection closeItem={this.closeItem} openItem={this.clickItem.bind(this)} index={index} collection={item} isOpen={this.$route.params.uri && this.openUri === item.uri} isArtist={true} resetPlaylists={this.resetPlaylists}   /></div>) : <div key={index} class="album-collection-item" />;
      }
    )}
    {this.savedArtists.items && (!this.$route.params.uri || this.openUri === this.savedArtists.uri) ? (<div class="album-collection-item"><Collection isSaved={true} closeItem={this.closeItem} openItem={this.clickItem.bind(this)} collection={this.savedArtists} isOpen={this.$route.params.uri && this.openUri === this.savedArtists.uri} isArtist={true} /></div> ) : null}
    {!this.$route.params.uri ? (<div class={{"create-new-text": true, 'is-focused': this.isArtistInputOpen, btn: true, 'btn-primary': true}} onClick={this.createNew.bind(this, {className: 'create-artist-input', type: ARTIST})}>
      {this.isArtistInputOpen ? <span class="input-section">
      <form onSubmit={(e) => {e.preventDefault(); this.submitNew({target: 'create-artist-input', type: ARTIST})}}>
       <input ref="create-artist-input" class="create-input create-artist-input" placeholder="New Collection" type='string' />
       <span onClick={this.submitNew.bind(this, {target: 'create-artist-input', type: ARTIST})} class="add-collection-icon glyphicon glyphicon-plus-sign" />
       </form>
      </span> : <span>New Artist Collection</span>}
    </div>) : null}
    </div>
    <div class="type-container">
    {!this.$route.params.uri ? <hr /> : null}
    {!this.$route.params.uri ? <h2> Albums</h2> : null}
    {this.albumPlaylists.map((item, index) => {
      return !this.$route.params.uri || this.openUri === item.uri ? (<div key={item.uri} class="album-collection-item"><Collection closeItem={this.closeItem} openItem={this.clickItem.bind(this)} index={index} collection={item} isOpen={this.$route.params.uri && this.openUri === item.uri} resetPlaylists={this.resetPlaylists} /></div>) : <div key={index} class="album-collection-item" />;
      }
    )}
    {this.savedAlbums.items && (!this.$route.params.uri || this.openUri === this.savedAlbums.uri) ? (<div class="album-collection-item"><Collection isSaved={true} closeItem={this.closeItem} openItem={this.clickItem.bind(this)} collection={this.savedAlbums} isOpen={this.$route.params.uri && this.openUri === this.savedAlbums.uri}  /></div>) : null}
    {!this.$route.params.uri ? (<div class={{"create-new-text": true, 'is-focused': this.isAlbumInputOpen, btn: true, 'btn-primary': true}} onClick={this.createNew.bind(this, {className: 'create-album-input'})}>
      {this.isAlbumInputOpen ? <span class="input-section">
      <form onSubmit={(e) => {e.preventDefault(); this.submitNew({target: 'create-album-input', type: 'album'})}}>
       <input ref="create-album-input" class="create-input create-album-input" placeholder="New Collection" type='string' />
      <span onClick={this.submitNew.bind(this, {target: 'create-album-input', type: 'album'})} class="add-collection-icon glyphicon glyphicon-plus-sign" />
      </form>
      </span> : <span>New Album Collection</span>}
    </div>) : null}
    </div>
    </div>
    </div>)
  } 
}

function watchForDeeplink(val, oldval) {
  if (Object.keys(this.$route.params).length) {
    const isDeeplinked = [...this.albumPlaylists.filter((item) => item.uri.includes(this.$route.params.id) && item.uri.includes(this.$route.params.uri)),
    ...this.artistPlaylists.filter((item) => item.uri.includes(this.$route.params.id) && item.uri.includes(this.$route.params.uri)),];
    if (isDeeplinked.length) {
      this.openUri = uriBuilder(this.$route.params.id, this.$route.params.uri);
      return;
    }
    if(this.$route.params.uri.includes('saved')) {
      this.openUri = uriBuilder(this.$route.params.id, this.$route.params.uri);
      return;
    }
    getUserPlaylists(this.$route.params.id).then((res) => {
      if (!this.$route.params.uri) {return;}
      const playlist = res.filter((item) => item.id === this.$route.params.uri)[0];
      if (playlist) {
        playlist.deeplink = true;
        playlist.name.includes(ARTISTS_PLAYLIST_KEY) ? this[ADD_ARTIST_PLAYLIST](playlist) : this[ADD_ALBUM_PLAYLIST](playlist);
        this.openUri = uriBuilder(this.$route.params.id, this.$route.params.uri);
      }
    });
  }
}
function uriBuilder(id, uri) {
  return `spotify:user:${id}:playlist:${uri}`
}
</script>
<style lang="sass">
.browse-page {
  position: absolute;
  width: 100%;
  height: 100%;
  padding-left: 20px;
  text-align: center;
  overflow-x: hidden;
  background: #f5f5f5;
  .container {
    width: 80%;
    left: 280px;
    min-width: 1000px;
    margin: 0;
    position: relative;
    .type-container {
      margin: 20px;
      vertical-align: top;
    }
    .featured-collections {
      margin-bottom: 20px;
    }
  }
  hr {
    border-top: 2px solid #efefef;
  }
  h2, h1 {
    margin-bottom: 50px;
    text-align: left;
  }
  .album-collection-item {
    display: inline-block;
    min-height: 250px;
    min-width: 250px;
  }
  .create-new-text {
    vertical-align: top;
    margin-top: 75px;
    z-index: 2;
    position: relative;
    cursor: pointer;
    width: 280px;
    font-weight: 700;
    transition: .5s ease-in-out;
  }
  .add-collection-icon {
    margin-left: 10px;
    font-size: 16px;
    padding-top: 5px;
    vertical-align: sub;
  }
  .create-input {
    background: transparent;
    border: none;
    border-bottom: 1px solid white;
    &::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
      color: white;
      opacity: .7;
    }
  }
  
}

@media (max-width: 1350px) {
  body .browse-page .container {
    left: 280px;
    min-width: 1000px;
  }
}
</style>