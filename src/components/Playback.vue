<script>
import {getPlayingTrack, playTrack, skipTrack} from '../api/api';
import {CHECK_PLAYING_TRACK, SAVE_COLLECTION} from '../store/store';
import {mapGetters, mapActions} from 'vuex';
import { fireGAEvent } from '../util';
const FIVE_SECONDS = 5000;
export default {
  computed: mapGetters({
    playingTrack: 'playingTrack',
  }),
  created() {
    this[CHECK_PLAYING_TRACK]();
    this.sync = setInterval(this[CHECK_PLAYING_TRACK].bind(this), FIVE_SECONDS);
  },
  beforeDestroy() {
    clearInterval(this.sync);
  },
  props: {
    createNew: Function
  },
  data() {
    return {
      isNewOpen: false,
      isTextOpen: false,
      type: 'album',
    }
  },
  methods: Object.assign(mapActions([
    CHECK_PLAYING_TRACK,
    SAVE_COLLECTION,
  ]), {
    play() {
      playTrack(undefined, !this.playingTrack.is_playing ? 'play' : 'pause').then(() => {
        setTimeout(() => {
          this[CHECK_PLAYING_TRACK]();
        }, 500);
      });
    },
    search(type) {
      skipTrack(type).then(() => {
        setTimeout(() => {
          this[CHECK_PLAYING_TRACK]();
        }, 500);
      });
    },
    openNew() {
      this.isNewOpen = true;
      setTimeout(() => {
        window.addEventListener('mousedown', this.onWindowEvent, true);
      }); 
    },
    openText(type) {
      this.type = type;
      this.isTextOpen = true;
      setTimeout(() => {
        document.getElementsByClassName('create-sidebar-input')[0].focus();
      });
    },
    submit() {
      if (!this.$refs['create-input-sidebar'].value) {return;}
      this.isNewOpen = false;
      this.isTextOpen = false;
      window.removeEventListener('mousedown', this.onWindowEvent, true);
      this[SAVE_COLLECTION]({name: this.$refs['create-input-sidebar'].value, type: this.type}).then((newPlaylist) => {
        fireGAEvent('create', this.type, newPlaylist.uri);
        this.createNew(newPlaylist.uri);
      });
    },
    onWindowEvent({type, target}) {
      if (type === 'mousedown' && !document.getElementsByClassName('sidebar-input-section')[0].contains(target)) {
        this.isNewOpen = false;
        this.isTextOpen = false;
        window.removeEventListener('mousedown', this.onWindowEvent, true);
      }
    },
  }),
  render(h) {
    const hasItem = !!this.playingTrack.item;
    return (<div class="playback-sidebar-item">
    <div class="create-new-sidebar sidebar-input-section">
    {this.isNewOpen ? (!this.isTextOpen ? 
      <span class="create-new-sidebar-type">
        <span onClick={this.openText.bind(this, 'album')}>Album</span>
        <span onClick={this.openText.bind(this, 'artist')}>Artist</span>
      </span> : 
      <form onSubmit={(e) => {e.preventDefault(); this.submit()}}>
        <input ref="create-input-sidebar" class="create-input create-sidebar-input" placeholder="New Collection" type='string' />
        <i onClick={this.submit} class="glyphicon glyphicon-plus-sign submit-plus-icon" />
      </form>) : (<span onClick={this.openNew}><i class="glyphicon glyphicon-plus-sign" /> Create New</span>)}
    </div>
    <span><div class="album-art">
    <img class="playing-track-album" src={hasItem && this.playingTrack.item.album.images[0].url} />
    <span class="playing-track-text">
    <div class="playing-track-title">{hasItem && this.playingTrack.item.name}</div>
    <div class="playing-track-artist">{hasItem && this.playingTrack.item.artists[0].name}</div>
    </span>
    </div>
    <div class="control-features">
    <span class="control-button" onClick={this.search.bind(this, 'previous')}><i class="glyphicon glyphicon-step-backward" /></span>
    <span class="control-button" onClick={this.play}><i class={{glyphicon: true, 'glyphicon-play': !this.playingTrack.is_playing, 'glyphicon-pause': this.playingTrack.is_playing}} /></span>
    <span class="control-button" onClick={this.search.bind(this, 'next')}><i class="glyphicon glyphicon-step-forward" /></span>
    </div></span>
    </div>);
  }
}
</script>
<style lang="sass">
.playback-sidebar-item {
  position: absolute;
  bottom: 0px;
  padding-top: 10px;
  border-top: 1px solid black;
  background-color: #333;
  .vertical-line {
    height: 20px;
    border: 1px solid white;
  }
}
.album-art {
  min-height: 246px;
  width: 100%;
  position: relative;
  min-width: 300px;
}
.create-new-sidebar {
  position: absolute;
  background-color: #1db954;
  top: -40px;
  padding: 10px 0;
  width: 100%;
  cursor: pointer;
  transition: .5s ease-in-out;
  &:hover {
    background-color: #1ed760;
  }
  &-type {
    display: grid;
    grid-template-columns: 1fr 1fr;
    & span:first-child {
      border-right: 1px solid white;
    }
  }
}
.playing-track-text {
  display: inline-block;
  font-size: 12px;
  font-weight: 100;
  vertical-align: middle;
  .playing-track-artist {
    margin-top: 10px;
    margin-bottom: 5px;
    font-size: 10px;
  }
}
.submit-plus-icon {
  margin-left: 10px;
}

.playing-track-album {
  width: 66%;
  margin: 0 auto;
}
.control-features {
  font-size: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
.control-button {
  cursor: pointer;
  border-top: 1px solid black;
  transition: .5s ease-in-out;
  &:hover {
    background-color: black;
  }
}
@media (max-width: 1350px) {
  body {
    .playing-track-album {
      width: 25%;
      margin-bottom: 5px;
      display: inline-block;
    }
    .album-art {
      min-height: 80px;
    }
    .playing-track-text {
      margin-left: 55px;
      max-width: 150px;
      text-align: left;
    }
  }
}
</style>
