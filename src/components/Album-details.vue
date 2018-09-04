<script>
import {getSongsFromAlbum, playTrack} from '../api/api';
import {format} from 'date-fns';
import {uniqBy} from 'lodash';
import { fireGAEvent } from '../util';
import { CHECK_PLAYING_TRACK } from '../store/store';
import { mapActions } from 'vuex';
const BASE_CLASS = 'album-detail-page';
const IS_OPEN = 'is-open';
export default {
  data() {
    return {
      tracks: [],
      openUri: '',
      openIndex: null,
      isAfterRender: false,
    }
  },
  props: {
    album: Object,
    closeDetails: Function,
    isSaved: Boolean,
    moveDetailItem: Function,
    removeItem: Function,
  },
  watch: {
    album(val, oldval) {
      this.getSongs();
    }
  },
  created() {
    this.getSongs();
    setTimeout(() => {
      this.isAfterRender = true;
    })
  },
   methods: Object.assign(mapActions([
    CHECK_PLAYING_TRACK,
  ]), {
    getSongs() {
      getSongsFromAlbum(this.isSaved ? this.album.uri : this.album.album.uri).then((item) => {
      const sortedAlbum = item.items.sort((a, b) => {
      if (a.track_number > b.track_number) {
        return 1;
      } else if (a.track_number < b.track_number) {
        return -1;
      }
      return 0;
    })
    this.tracks = sortedAlbum;
    });
    },
    async playAlbum() {
      fireGAEvent('play', 'album', this.album.uri);
      playTrack(this.tracks.map(i => i.uri));
      setTimeout(this[CHECK_PLAYING_TRACK].bind(this), 500);
    },
    close() {
      this.isAfterRender = false;
      this.moveDetailItem();
      setTimeout(() => {
        this.closeDetails();
      }, 500);
    },
    removeFromCollection() {
      this.removeItem(this.album);
      this.close();
    },
    playFromTrack(index) {
      playTrack(this.tracks.slice(index).map(i => i.uri));
    }
  }),
  render(h) {
    const album = this.isSaved ? this.album : this.album.album;
    return (<span>
    <div class={{[BASE_CLASS]: true, [IS_OPEN]: this.isAfterRender}}>
      <div class={`${BASE_CLASS}-sidebar`}>
      <div class={`${BASE_CLASS}-sidebar-content`}>
        <h2> {album.name}</h2>
        <div>{album.artists[0].name}</div>
        <div class={`${BASE_CLASS}-sub-info`}>{format(new Date(album.release_date), 'YYYY')} • {this.tracks.length} Songs</div>
        <button class="btn btn-primary" onClick={this.playAlbum}>Play Album</button>
        </div>
      </div>
      <div class={`${BASE_CLASS}-text`}>
        
        <div class="track-list">
          {this.tracks ? this.tracks.map((item, index) => (<div class="track-list-item" onClick={this.playFromTrack.bind(this, index)}><span> {index + 1} </span><span>{item.name}</span><span>{millisToMinutesAndSeconds(item.duration_ms)}</span></div>)) : null}
        </div>
      </div>
      <span>
      <span class="btn btn-sm remove-button" onClick={this.removeFromCollection}>Remove</span>
      </span>
    </div>
    <span class="blur-background" style={{opacity: this.isAfterRender ? .5 : 0}} onClick={this.close} />
    </span>)
  }
}

function millisToMinutesAndSeconds(millis) {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);
  return `${minutes }:${ seconds < 10 ? '0' : '' }${seconds}`;
}

</script>
<style lang="sass">
.album-detail-page {
  width: 100%;
  background-color: #333;
  color: white;
  position: fixed;
  bottom: -70%;
  left: 0;
  height: 70%;
  display: grid;
  grid-template-columns: 2fr 3fr 1fr;
  grid-gap: 20px;
  transition: .5s ease-in-out;
  z-index: 1;
  &.is-open {
    bottom: 0;
  }
  &-sub-info {
    font-size: 10px;
    margin-bottom: 20px;
    margin-top: 5px;
  }
  &-sidebar {
    color: #eee;
    & &-content {
      top: 150px;
      position: absolute;
      left: 9%;
      text-align: center;
      width: 300px;
      h2 {
        margin: 5px 0;
        color: white;
        text-align: center;
      }
    }
    & > button {
      top: 200px;
      position: relative;
    }
  }
  &-text {
    overflow-y: scroll;
    overflow-x: hidden;
  }
}

.blur-background {
  background-color: white;
  opacity: 0.5;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  position: fixed;
}

.track-list {
  text-align: left;
  font-size: 20px;
  font-weight: 100;
  &-item {
    display: grid;
    grid-template-columns: 1fr 8fr 1fr;
    padding: 20px 10px;
    transition: .5s ease-in-out;
    cursor: pointer;
    &:hover {
      background-color: black;
    }
  }
}
</style>
