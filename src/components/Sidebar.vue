<script>
import { ARTISTS_PLAYLIST_KEY, ALBUMS_PLAYLIST_KEY } from '../constants';
import Playback from './Playback.vue';

export default {
  data() {
    return {
    }
  },
  props: {
    openCollection: Function,
    artistsCollection: Array,
    albumsCollection: Array,
    openedUri: String,
    createNew: Function,
  },
   methods: Object.assign({}, {
     goHome() {
       this.$router.push('/browse');
     }
  }),
  render(h) {
    return (<div class="sidebar">
    <h1 class="title" onClick={this.goHome}><span>Collections<span class="top-banner-period">.</span></span></h1>
    <div class="sidebar-contents">
    <div class='sidebar-title'>Artists</div>
    {this.artistsCollection.length && this.artistsCollection.map((item) => {
      if (!item.name) {return;}
      return (<div onClick={this.openCollection.bind(this, item.uri, item.owner.id)} class={{'sidebar-item': true, 'is-selected': this.openedUri === item.uri}}>{item.name.split(ARTISTS_PLAYLIST_KEY)[1]}</div>);
    })}
    <div class='sidebar-title'>Albums</div>
    {this.artistsCollection.length && this.albumsCollection.map((item) => {
      if (!item.name) {return;}
      return (<div onClick={this.openCollection.bind(this, item.uri, item.owner.id)} class={{'sidebar-item': true, 'is-selected': this.openedUri === item.uri}}>{item.name.split(ALBUMS_PLAYLIST_KEY)[1]}</div>);
    })}
    <span class="padding-bottom" />
    </div>
    <Playback createNew={this.createNew}/>
    </div>);
  }
}
</script>
<style lang="sass">
.sidebar {
  background-color: #666;
  border-right: 5px solid orange;
  color: white;
  height: 100%;
  position: fixed;
  left: 0;
  min-width: 300px;
  z-index: 1;
  h1.title {
    text-align: center;
    cursor: pointer;
    font-size: 30px;
  }
  &-item {
    font-weight: 100;
    padding: 10px 15px;
    font-size: 14px;
    transition: .25s ease-in-out;
    cursor: pointer;
    text-align: left;
    &:hover {
      background-color: #999;
    }
    &.is-selected {
      background-color: #333;
    }
  }
  &-title {
    font-size: 20px;
    margin: 20px 10px;
    text-align: left;
  }
  & &-contents {
    overflow:auto;
    height: 100%;
  }
}
.padding-bottom {
  padding-bottom: 400px;
  width: 100%;
  display: block;
}
@media (max-width: 1350px) {
  body .padding-bottom {
    padding-bottom: 280px;
  }
}
h1.title {
    text-align: center;
    font-family: 'Major Mono Display', monospace;
    color: white;
    margin-bottom: 5px;
  }
</style>
