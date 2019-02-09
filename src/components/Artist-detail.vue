<script>
import {getSongsFromAlbum, playTrack, getAlbumsFromArtist} from '../api/api';
import {format} from 'date-fns';
import {uniqBy} from 'lodash';
import { fireGAEvent } from '../util';
import { mapActions } from 'vuex';
import { CHECK_PLAYING_TRACK } from '../store/store';
const DEFAULT = 'default';
export default {
  data() {
    return {
      albums: [],
      openUri: '',
      openIndex: null,
      isAfterRender: false,
      hoverNum: null,
    }
  },
  props: {
    artist: Object,
    closeDetails: Function,
    moveDetailItem: Function,
    removeItem: Function,
  },
  watch: {
    album(val, oldval) {
      this.getSongs();
    }
  },
  created() {
    this.getAlbums();
    setTimeout(() => {
      this.isAfterRender = true;
    })
  },
   methods: Object.assign(mapActions([
    CHECK_PLAYING_TRACK,
  ]), {
    getAlbums() {
      getAlbumsFromArtist(this.artist.uri).then((albums) => {
        this.albums = uniqBy(albums.filter((i) => i.album_type === 'album'), 'name').sort(sortNewest);
      });
    },
    playAlbum(item) {
      fireGAEvent('play', 'artist', item.uri);
      const songs = getSongsFromAlbum(item.uri)
      .then((songs) => {
        const sortedAlbum = songs.items.sort((a, b) => {
        if (a.track_number > b.track_number) {
          return 1;
        } else if (a.track_number < b.track_number) {
          return -1;
        }
        return 0;
      });
      playTrack(sortedAlbum.map(i => i.uri));
      setTimeout(this[CHECK_PLAYING_TRACK].bind(this), 500);
      });
      
    },
    playAllAlbums() {
      const allSongs = [];
      this.albums.forEach((item, index) => {
        const songs = getSongsFromAlbum(item.uri)
        .then((songs) => {
          const sortedAlbum = songs.items.sort((a, b) => {
          if (a.track_number > b.track_number) {
            return 1;
          } else if (a.track_number < b.track_number) {
            return -1;
          }
          return 0;
          });
          allSongs[index] = sortedAlbum;
          if (allSongs.filter(n => true).length === this.albums.length) {
            const allSongsFlattened = allSongs.reduce((prev, curr) => [...prev, ...curr], []);
            playTrack(allSongsFlattened.map(i => i.uri));
          }
        });
      });
    },
    close() {
      this.isAfterRender = false;
      this.moveDetailItem();
      setTimeout(() => {
        this.closeDetails();
      }, 500);
    },
    removeFromCollection() {
      this.removeItem(this.artist);
      this.close();
    },
    sortAlbums(e) {
        this.albums = this.albums.sort(e.target.value === DEFAULT ? sortNewest : sortOldest);
    },
    albumHover(index) {
      this.hoverNum = index;
    },
    albumHoverLeave() {
      this.hoverNum = null;
    }
  }),
  render(h) {
    return (<span>
    <div class={{"album-detail-page": true, 'is-open': this.isAfterRender}}>
      <div class="album-detail-page-sidebar">
      <div class="artist-detail-left-rail">
        <h2 class="artist-detail-name"> {this.artist.name}</h2>
        <select class="album-detail-page-sort-select" onChange={this.sortAlbums}>
        <option value={DEFAULT}>Newest to Oldest</option>
        <option value='flipped'>Oldest to Newest</option>
        </select>
        <button class="btn btn-primary" onClick={this.playAllAlbums}>Play All Albums</button>
        </div>
      </div>
      <div class="album-detail-page-text">
        <div class="track-list album-list" onMouseleave={this.albumHoverLeave}>
          {this.albums ? this.albums.map((item, index) => (
            <div onMouseover={this.albumHover.bind(this, index)} onClick={this.playAlbum.bind(this, item)} class={{"artist-detail-album-preview": true, 'is-hovered': this.hoverNum === index}}>
            <img src={item.images[0].url} class="detail-artist-album" />
            <div class="artist-detail-page-album-text">
              {item.name}
              <div class="artist-album-year">{format(new Date(item.release_date), 'YYYY')}</div>
            </div>
          </div>)) : null}
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

function sortNewest(a, b) {
  if (new Date(a.release_date) < new Date(b.release_date)) {
    return 1;
  } else if (new Date(a.release_date) > new Date(b.release_date)) {
    return -1;
  }
  return 0;
}
function sortOldest(a, b) {
  if (new Date(a.release_date) > new Date(b.release_date)) {
    return 1;
  } else if (new Date(a.release_date) < new Date(b.release_date)) {
    return -1;
  }
  return 0;
}
</script>
<style lang="sass">
.artist-detail-album-preview {
  text-align: center;
  cursor: pointer;
  position: relative;
  height: 375px;
  &.is-hovered {
    .detail-artist-album {
      opacity: .7
    }
  }
  .detail-artist-album {
    transition: .3s ease-in-out;
    max-width: 300px;
    margin: 0 auto;
    opacity: 1;
  }
}
.remove-button {
  position: absolute;
  bottom: 20px;
  right: 10px;
  background-color: #EB1E32;
  cursor: pointer;
  &:hover {
    background-color: #FF4632;
  }
}
.artist-detail-left-rail {
  top: 175px;
  position: absolute;
  left: 10%;
}

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
  
  &-sort-select {
    background: transparent;
    border: none;
    display: block;
    margin: 10px auto;
    position: relative;
    font-size: 22px;
  }
  &.is-open {
    bottom: 0;
  }
  &-sidebar {
    & > button {
      top: 200px;
      position: relative;
    }
  }
  &-text {
    overflow-y: scroll;
    overflow-x: hidden;
  }
  h2.artist-detail-name {
    margin: 0;
    text-align: center;
  }
}

.blur-background {
  background-color: white;
  opacity: 0.5;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  transition: .5s ease-in-out;
  position: fixed;
}

.track-list.album-list {
  margin-top: 20px;
  .artist-detail-page-album-text {
    margin: 10px 0 20px;
    font-weight: 100;
    .artist-album-year {
      font-size: 12px;
      color: #eee
    }
  }
  i {
    position: absolute;
    font-size: 294px;
    left: 0;
    margin: 0 auto;
    width: 100%;
  }
}
</style>
