<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
import {INITIALIZE_COMMITS, SAVE_COLLECTION, ADD_ARTIST_PLAYLIST, ADD_ALBUM_PLAYLIST, INITIALIZE_FEATURED} from '../store/store';
import Collection from './Collection.vue';
import { ARTIST, USER, ARTISTS_PLAYLIST_KEY, DEEPLINK_URL, SPOTIFY } from '../constants';
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
    me: 'me'
  }),
  methods: Object.assign({}, mapActions([
    INITIALIZE_COMMITS,
    SAVE_COLLECTION,
    INITIALIZE_FEATURED,
  ]), mapMutations([
    ADD_ARTIST_PLAYLIST,
    ADD_ALBUM_PLAYLIST
  ]), {
    clickItem(uri, userId = this.me.id) {
      const playlistUrl = uri.includes(USER) ?  uri.split(USER)[1].split(':').slice(1).join('/') : uri.split(SPOTIFY)[1].split(':').join('/');
      this.$router.push(`/browse/${userId}/${playlistUrl}`);
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
      document.getElementsByClassName('browse-page')[0].scrollTo(0, 0);
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
    const isCollectionOpen = this.$route.params.uri;
    return (<div class="browse-page">
    <div class="mobile-header desktop-hide"><h1 class="title"><span>Collections<span class="top-banner-period">.</span></span></h1></div>
    <div class="container mobile-container">
    <Sidebar openCollection={this.clickItem} artistsCollection={[...this.artistPlaylists, this.savedArtists]} albumsCollection={[...this.albumPlaylists, this.savedAlbums]} openedUri={this.openUri} createNew={this.submitNewSidebar.bind(this)} />
    <div class="featured-collections">
    {!isCollectionOpen ? <h1 class="hide-mobile"> All Your Collections</h1> : null}
    {!isCollectionOpen ? <hr class="hide-mobile" /> : null}
    {!isCollectionOpen ? <h2 > Featured</h2> : null}
    {this.featuredCollections.map((item, index) => {
      return !isCollectionOpen || this.openUri === item.uri ? (<div key={item.uri} class="album-collection-item" style={{position: isCollectionOpen ? 'initial' : 'relative'}}><Collection closeItem={this.closeItem} openItem={this.clickItem.bind(this)} index={index} collection={item} isOpen={isCollectionOpen && this.openUri === item.uri} isArtist={item.name.includes(ARTISTS_PLAYLIST_KEY)}  /></div>) : <div key={index} class="album-collection-item" style={{position: isCollectionOpen ? 'initial' : 'relative'}} />;
    })}
    </div>
    <div class="type-container">
    {!isCollectionOpen ? <hr /> : null}
    {!isCollectionOpen ? <h2> Artists </h2> : null}
    {this.artistPlaylists.map((item, index) => {
      return !isCollectionOpen || this.openUri === item.uri ? (<div key={item.uri} class="album-collection-item" style={{position: isCollectionOpen ? 'initial' : 'relative'}}><Collection closeItem={this.closeItem} openItem={this.clickItem.bind(this)} index={index} collection={item} isOpen={isCollectionOpen && this.openUri === item.uri} isArtist={true} resetPlaylists={this.resetPlaylists}   /></div>) : <div key={index} class="album-collection-item" style={{position: isCollectionOpen ? 'initial' : 'relative'}}/>;
      }
    )}
    {this.savedArtists.items && (!isCollectionOpen || this.openUri === this.savedArtists.uri) ? (<div class="album-collection-item" style={{position: isCollectionOpen ? 'initial' : 'relative'}}><Collection isSaved={true} closeItem={this.closeItem} openItem={this.clickItem.bind(this)} collection={this.savedArtists} isOpen={isCollectionOpen && this.openUri === this.savedArtists.uri} isArtist={true} /></div> ) : null}
    {!isCollectionOpen ? (<div class={{"create-new-text": true, 'is-focused': this.isArtistInputOpen, btn: true, 'btn-primary': true}} onClick={this.createNew.bind(this, {className: 'create-artist-input', type: ARTIST})}>
      {this.isArtistInputOpen ? <span class="input-section">
      <form onSubmit={(e) => {e.preventDefault(); this.submitNew({target: 'create-artist-input', type: ARTIST})}}>
       <input ref="create-artist-input" class="create-input create-artist-input" placeholder="New Collection" type='string' />
       <span onClick={this.submitNew.bind(this, {target: 'create-artist-input', type: ARTIST})} class="add-collection-icon glyphicon glyphicon-plus-sign" />
       </form>
      </span> : <span>New Artist Collection</span>}
    </div>) : null}
    </div>
    <div class="type-container">
    {!isCollectionOpen ? <hr /> : null}
    {!isCollectionOpen ? <h2> Albums</h2> : null}
    {this.albumPlaylists.map((item, index) => {
      return !isCollectionOpen || this.openUri === item.uri ? (<div key={item.uri} class="album-collection-item" style={{position: isCollectionOpen ? 'initial' : 'relative'}}><Collection closeItem={this.closeItem} openItem={this.clickItem.bind(this)} index={index} collection={item} isOpen={isCollectionOpen && this.openUri === item.uri} resetPlaylists={this.resetPlaylists} /></div>) : <div key={index} class="album-collection-item" style={{position: isCollectionOpen ? 'initial' : 'relative'}} />;
      }
    )}
    {this.savedAlbums.items && (!isCollectionOpen || this.openUri === this.savedAlbums.uri) ? (<div class="album-collection-item" style={{position: isCollectionOpen ? 'initial' : 'relative'}}><Collection isSaved={true} closeItem={this.closeItem} openItem={this.clickItem.bind(this)} collection={this.savedAlbums} isOpen={isCollectionOpen && this.openUri === this.savedAlbums.uri}  /></div>) : null}
    {!isCollectionOpen ? (<div class={{"create-new-text": true, 'is-focused': this.isAlbumInputOpen, btn: true, 'btn-primary': true}} onClick={this.createNew.bind(this, {className: 'create-album-input'})}>
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
    debugger;
    const isDeeplinked = [...this.albumPlaylists.filter((item) => item.owner.id === this.$route.params.id && item.id === this.$route.params.uri),
    ...this.artistPlaylists.filter((item) => item.owner.id === this.$route.params.id && item.id === this.$route.params.uri),];
    if (isDeeplinked.length) {
      this.openUri = uriBuilder(this.$route.params.uri);
      return;
    }
    if(this.$route.params.uri.includes('saved')) {
      this.openUri = uriBuilder(this.$route.params.uri);
      return;
    }
    getUserPlaylists(this.$route.params.id).then((res) => {
      if (!this.$route.params.uri) {return;}
      const playlist = res.filter((item) => item.id === this.$route.params.uri)[0];
      if (playlist) {
        playlist.deeplink = true;
        playlist.name.includes(ARTISTS_PLAYLIST_KEY) ? this[ADD_ARTIST_PLAYLIST](playlist) : this[ADD_ALBUM_PLAYLIST](playlist);
        this.openUri = uriBuilder(this.$route.params.uri);
      }
    });
  }
}
function uriBuilder(uri) {
  return `spotify:playlist:${uri}`
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
      text-align: left;
    }
    .featured-collections {
      margin-bottom: 20px;
      text-align: left;
    }
  }
  hr {
    border-top: 2px solid orange;
    max-width: 150px;
    margin-left: 0;
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
    z-index: 2;
    position: relative;
    cursor: pointer;
    width: 200px;
    height: 200px;
    font-weight: 700;
    transition: .5s ease-in-out;
    span {
      vertical-align: bottom;
      height: 100%;
      display: grid;
      align-content: center;
      &.input-section {
        margin-left: -20px;
      }
    }
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
