<script>
import {get} from 'lodash';
import {URL_SPLIT, ALBUMS_PLAYLIST_KEY, ALBUM, ARTISTS_PLAYLIST_KEY, ARTIST} from '../constants';
import {getFullUrl, getArtistsInfo, followPlaylist, deleteSongs, unfollowPlaylist} from '../api/api';
import {fireGAEvent} from '../util';
import { mapGetters } from 'vuex';
import AlbumDetails from './Album-details.vue';
import AddCollection from './Add-Collection.vue';
import ArtistDetail from './Artist-detail.vue';

let scrollHeight = 0;
export default {
  props: {
    collection: Object,
    isOpen: Boolean,
    index: Number,
    openItem: Function,
    isArtist: Boolean,
    closeItem: Function,
    isSaved: Boolean,
    resetPlaylists: Function,
  },
  computed: mapGetters({
    me: 'me'
  }),
  data() {
    return {
      // this is positioning for the group from the main page to being open
      x: null,
      y: null,
      origX: null,
      origY: null,
      isHovered: false,
      
      isSearchOpen: false,
      songs: [],
      renderItems: [],

      // this is when an album is chosen, the details for the item and the positioning of the item
      showExpanded: false,
      hasExpanded: false,
      isDetailsOpen: false,
      detailsData: {},
      SAX: 'auto',
      SAY: 'auto',
      origSAY: 'auto',
      origSAX: 'auto',
    }
  },
  created() {
    if (this.isSaved) {
      this.songs = this.renderItems = this.collection.items;
      return;
    }
    this.populateCollection();
  },
  mounted() {
    const item = this.$refs[`container_${this.index}`].getBoundingClientRect();
    this.origX = item.x - 20 + 'px';
    this.origY = item.y - 120 + 'px';
  },
  watch: {
    isOpen(val, oldval) {
      if (this.isOpen && !this.songs.length) {
        setTimeout(() => {
          this.openSearch();
        }, 500);
      }
      if (val && !this.showExpanded) {
        this.openCollection();
      }
      if (!val && this.showExpanded) {
        this.closeCollection();
      }
    },
    songs(val, oldval) {
      if (this.isOpen && !this.showExpanded) {
          this.openCollection();
      }
    }
  },
  methods: {
    populateCollection() {
      getFullUrl(this.collection.tracks.href.split(URL_SPLIT)[1]).then((item) => {
        this.songs = item.reduce((prev, curr) => {
          const albums = prev.map((i) => i.track.album.uri);
          if (albums.includes(curr.track.album.uri)) {return prev;}
          return [...prev, curr];
        }, []);
        if (!this.isArtist) {
          this.renderItems = this.songs;
          return;
        }

        //getting artist information because it doesn't come back with the song
        getArtistsInfo(item).then((artists) => {
          this.renderItems = artists.sort((a, b) => {
            if (a.name.toLowerCase() > b.name.toLowerCase()) {
              return 1;
            } else if (a.name.toLowerCase() < b.name.toLowerCase()) {
              return -1;
            }
            return 0;
          });
        })
      }).catch((e) => {
      });
    },
    moveDetailItem() {
      this.SAY = this.origSAY;
      this.SAX = this.origSAX;
    },
    openSearch() {
      fireGAEvent('interaction', 'open search', this.collection.uri);
      this.isSearchOpen = true;
      this.x = '-125%';
      setTimeout(() => {
        document.getElementsByClassName('add-search-input')[0].focus();
      })
    },
    closeSearch() {
      this.isSearchOpen = false;
      this.x = '20px';
      this.populateCollection();
    },
    openCollection() {
      if (this.hasExpanded) {return;}
      scrollHeight = document.getElementsByClassName('browse-page')[0].scrollTop;
      document.getElementsByClassName('browse-page')[0].scrollTo(0, 0);
      fireGAEvent('interaction', 'open collection', this.collection.uri);
      const item = this.$refs[`container_${this.index}`].getBoundingClientRect();
      this.x = item.x - 20 + 'px';
      this.y = item.y - 120 + 'px';
      this.hasExpanded = true;
      this.isHovered = false;
      this.openItem(this.collection.uri);
      setTimeout(() => {
        this.x = 20 + 'px';
        this.y = 130 + 'px';
        this.showExpanded = true;
      }, 50);
    },
    closeCollection() {
      fireGAEvent('interaction', 'close collection', this.collection.uri);
      document.getElementsByClassName('browse-page')[0].scrollTo(0, scrollHeight);
      scrollHeight = 0;
      this.isDetailsOpen = false;
      setTimeout(() => {
      this.closeItem();
      this.x = this.origX;
      this.y = this.origY;
      this.hasExpanded = false;
      this.showExpanded = false;
      }, 50);
      setTimeout(() => {
        this.x = null;
        this.y = null;
      }, 500);
    },
    closeDetails() {
      this.SAX = 'auto';
      this.SAY = 'auto';
      setTimeout(() => {
        this.isDetailsOpen = false;
        this.indexOpen = null;
        this.$set(this, 'detailsData', {});
      }, 0);
    },
    openDetails(item, index) {
      fireGAEvent('interaction', 'open details', item.uri);
      if(!this.isOpen || this.isDetailsOpen) {return;}
      this.isDetailsOpen = true;
      this.indexOpen = index;
      this.$set(this, 'detailsData', item);
      this.SAX = 'auto';
      this.SAY = 'auto';
      this.origSAX = null;
      this.origSAY = null;

      // this is all the styling of the image from it's position to the feature position on the left
      const image = this.$refs[`album-detail-${index}`].getBoundingClientRect();
      setTimeout(() => {
        this.SAX = this.origSAX = image.x + 'px';
        this.SAY = this.origSAY = image.y + 'px';
        setTimeout(() => {
          this.SAX = window.innerWidth > 1150 ? '10%' : window.innerWidth > 768 ? '45%' : '40%';
          this.SAY = window.innerWidth < 1150 ? '5%' : window.innerHeight > 700 ? '20%' : '10%';
        }, 100);
      });
    },
    mouseEnter(bool = false) {
      if (this.hasExpanded) {return;}
      this.isHovered = bool;
    },
    follow() {
      followPlaylist(this.collection.owner.id, this.collection.id);
      this.collection.deeplink = false;
    },
    removeItem(item) {
      const songs = this.songs.filter(({track}) => this.isArtist ? track.artists[0].id === item.id : track.id === item.id);
      deleteSongs({userId: this.me.id, playlistId: this.collection.id, tracks: songs.map(({track}) => {return {uri: track.uri}})}).then(() => {
        this.populateCollection();
      });
    },
    removeCollection() {
      unfollowPlaylist({userId: this.me.id, playlistId: this.collection.id}).then(() => {
        this.closeCollection();
        this.resetPlaylists();
      });
    },
  },
  render(h) {
    //setup
    const type = this.isArtist ? ARTIST : ALBUM;
    const isArtistsOrSaved = this.isArtist || this.isSaved;
    const renderItems = this.isOpen ? this.renderItems : [...this.renderItems.slice(0, window.innerWidth >= 1440 ? 4 : 3)];
    const delimiter = this.isArtist ? ARTISTS_PLAYLIST_KEY : ALBUMS_PLAYLIST_KEY;
    const name = this.collection.name || '';
    //build main container
    return (<span><div ref={`container_${this.index}`} style={{left: this.x, top: this.y}} onMouseover={this.mouseEnter.bind(this, true)} onMouseleave={this.mouseEnter.bind(this, false)} onClick={this.openCollection} class={{'is-open': this.isOpen, 'collection-item': true, 'is-search-open': this.isSearchOpen, 'is-hovered': !this.isOpen && this.isHovered}}>
    {renderItems.length ? renderItems.map((item, index) => {
      const previewItem = `preview-album-${index}`;
      const isSelected = this.indexOpen === index;
      const fullTitle = isArtistsOrSaved ? item.name : item.track.album.name;
      const title = fullTitle.length > 50 ? fullTitle.split('').slice(0, 50).join('') + '...' : fullTitle;
      
      return (<div
        key={item.uri}
        class={{'detail-selected': isSelected, 'collection-item-container': true}}
        onClick={this.openDetails.bind(this, isArtistsOrSaved ? item : item.track, index)}
      >
      <span class={{
            'image-container': true,
            [previewItem]: !this.showExpanded,
            'is-open': this.showExpanded,
            'is-artist' : this.isArtist,
            'is-selected': this.indexOpen === index}}
            style={{left: isSelected ? this.SAX : null, top: isSelected ? this.SAY : null}}>
        <img
          ref={`album-detail-${index}`}
          src={isArtistsOrSaved ? get(item, 'images[0].url') : get(item, 'track.album.images[0].url')}
          class={{'preview-album': true,
            'is-open': this.showExpanded,
            'is-artist' : this.isArtist,
            'is-selected': this.indexOpen === index}}
           />
        </span>
        <div class="item-name">{this.showExpanded && title}</div>
      </div>)
      }) : null }
    <div class={{'collection-item-title': true, 'is-open': this.isOpen, 'is-search-open': this.isSearchOpen}}> {name.split(delimiter)[1] && name.split(delimiter)[1].split('').length > 30 && !this.showExpanded ? name.split(delimiter)[1].split('').slice(0, 30).join('') + '...': name.split(delimiter)[1]} </div>
    {this.isOpen ? (<div>
      <div class="back-to-main" onClick={this.closeCollection}><i class="glyphicon glyphicon-chevron-left" /></div>
      {!this.isSaved && this.collection.owner.id === this.me.id ? <div class="add-album-text" onClick={this.openSearch}>Add More {this.isArtist ? 'Artists' : 'Albums'} </div> : 
      !this.isSaved ? <span class="collection-item-owned-by collection-item-title">Owned by {this.collection.owner.display_name || this.collection.owner.id}</span> : null}
      {this.collection.deeplink ? <span onClick={this.follow} class="follow-button btn btn-primary btn-sm">Follow</span> : null}
      {!this.isSaved ? <span class="btn btn-sm remove-button remove-collection" onClick={this.removeCollection}>Delete Collection</span> : null}
      </div>) : null}
    {this.isDetailsOpen && !this.isArtist ? <AlbumDetails isSaved={this.isSaved} album={this.detailsData} moveDetailItem={this.moveDetailItem} closeDetails={this.closeDetails} removeItem={this.removeItem}/> : null}
    {this.isDetailsOpen && this.isArtist ? <ArtistDetail artist={this.detailsData} closeDetails={this.closeDetails} moveDetailItem={this.moveDetailItem} removeItem={this.removeItem}/> : null}

    </div>
    {this.isSearchOpen ? <AddCollection type={type} selectedPlaylist={this.collection} close={this.closeSearch} /> : null}</span>)
  } 
}
</script>


<style lang="sass">
.collection-item {
  cursor: pointer;
  color: black;
  display: grid;
  position: absolute;
  text-align: center;
  grid-gap: 40px;
  grid-template-columns: repeat(auto-fit, minmax(50px, 50px));
  width: 100%;
  padding-bottom: 120px;
  margin-left: 40px;
  &.is-open {
    margin-left: 0;
      grid-template-columns: repeat(auto-fit, minmax(150px, 250px));
      grid-template-rows: repeat(auto-fit, 300px);
  }
  &-title {
    position: absolute;
    color: #333;
    padding: 5px;
    min-width: 180px;
    margin-top: 160px;
    border-radius: 3px;
    text-align: center;
    font-size: 20px;
    transition: .5s ease-in-out, background-color .25s ease-in-out, color .25s ease-in-out;
    max-width: 180px;
    border: 1px solid #333;
    background: transparent;

    &.is-open {
      min-width: 300px;
      margin-top: -120px;
      margin-left: 35%;
      &.is-search-open {
        margin-left: 160%;
        margin-top: -120px;
      }
    }
  }
  &-owned-by {
    font-size: 12px;
    margin: 10px;
    padding: 10px;
    top: -135px;
    right: 30px;
    text-align: center;
    transform: rotate(0);
  }
  &-container {
    position: relative;
    height: 300px;
  }
  .item-name {
    margin-top: 20px;
    font-weight: 100;
    font-size: 18px;
    position: absolute;
    bottom: 0;
    width: 100%;
  }
  .back-to-main {
    position: absolute;
    left: 20px;
    top: -90px;
    font-size: 30px;
    color: white;
    background-color: black;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    cursor: pointer;
    transition: .25s ease-in-out;
    &:hover {
      background-color: #666;
    }
  }
  .image-container {
    height: 120px;
    width: 120px;
    display: inline-block;
    position: absolute;
    overflow: hidden;
    border: 1px solid #333;
    transition: left .5s ease-in-out, top .5s ease-in-out, transform .2s ease-in-out, opacity .2s ease-in-out;
    box-shadow: -2px 2px 3px;
    &.is-open {
      position: relative;
      height: 250px;
      width: 250px;
      
    }
    &.is-artist {
      border-radius: 50%;
      box-shadow: none;
    }
    &.is-selected {
      z-index: 3;
      position: fixed;
      &:hover {
        transform: rotate(0);
        opacity: 1;
      }
    }
  }
  .preview-album {
    position: relative;
    left: 0;
    top: 0;
    width: auto;
    height: 100%;
    
    transition: left .5s ease-in-out, top .5s ease-in-out, transform .2s ease-in-out, opacity .2s ease-in-out;
    width: 100%;
    transform: rotate(0);
    &.is-artist {
      border-radius: 50%;
    }
    &.is-open {
      object-fit: cover;
      opacity: 1;
      &:hover {
        opacity: .7;
      }
      &.is-artist:hover {
        opacity: 1;
        transform: rotate(4deg);
      }
      &.is-selected {
      &:hover {
        transform: rotate(0);
        opacity: 1;
      }
    }
    }
  }
  @for $i from 0 through 3 {
    .preview-album-#{$i} {
      transform: rotate($i * 3deg);
      left: -$i * 70px;
      top: $i * 10px;
    }
  }

  .follow-button {
    font-size: 10px;
    position: absolute;
    top: -50px;
    right: 35px;
  }
}
.remove-collection {
  bottom: 80px;
  position: absolute;
  display: block;
  right: 60px;
  color: white;
}
.collection-item.is-hovered {
  text-decoration: underline;
  .collection-item-title {
    background: #666;
    color: white;
  }
  @for $i from 0 through 3 {
    .preview-album-#{$i} {
      left: -$i * 60px;
      top: $i * 12px;
    }
  }
}
.add-album-text {
  position: absolute;
  top: -70px;
  right: 50px;
  font-weight: 700;
  cursor: pointer;
  font-size: 20px;
  text-align: left;
  transition: .5s ease-in-out;
  &:hover {
    color: #666;
  }
}
@media (max-width: 1350px) {
  body .add-album-text {
    right: 10%;
    &:hover {
      color: #666;
    }
  }
}
</style>
