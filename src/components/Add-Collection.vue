<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
import {SEARCH, RESET_SEARCH} from '../store/store';
import {ARTIST} from '../constants';
import {get, throttle} from 'lodash';
import {addTracksToPlaylist, getSongsFromSelected} from '../api/api';
const DISPLAY_ITEM_CLASS = 'display-item';
const IS_ARTIST_CLASS = 'is-artist';
const IS_SELECTED = 'item-is-selected';

const setThrottledSearch = throttle(function(e) {
  if (!e.target.value) {return;}
  this[SEARCH]({input: e.target.value, type: this.type});
}, 500);

export default {
  computed: mapGetters({
    searchResults: 'searchResults',
    me: 'me',
  }),
  data() {
    return {
      selectedItems: []
    };
  },
  props: {
    type: String,
    selectedPlaylist: Object,
    close: Function,
  },
  methods: Object.assign({}, mapActions([
    SEARCH,
  ]),
  mapMutations([
    RESET_SEARCH
  ]),{
    setSearch(e) { 
      return setThrottledSearch.call(this, e);
    },
    async finish() {
      if(!this.selectedItems.length) {
        this.close();
        return;
      }
      const tracks = await getSongsFromSelected(this.type, this.selectedItems);
      await addTracksToPlaylist(this.me, this.selectedPlaylist.id, tracks.map(i => i.uri));
      this.close();
      this[RESET_SEARCH]();
    },
    selectItem(item) {
      if (this.selectedItems.filter(i => i.id === item.id).length) {
        this.selectedItems.forEach((i, index) => {
          if(i.id === item.id) {
            delete this.selectedItems[index];
          }
        });
        this.selectedItems = [...this.selectedItems.filter(n => n)]
        return;
      }
      this.selectedItems = [...this.selectedItems.filter(n => n), item]
    }
  },
  ),
  render(h) {
    const mapItem = (item, index) => {
      if (!get(item, 'images[0].url') && !get(item, 'item.images[0].url')) {
        return null;
      }
      const className = {
        [DISPLAY_ITEM_CLASS]: true,
        [IS_ARTIST_CLASS]: this.type === ARTIST,
        [IS_SELECTED]: this.selectedItems.filter(i => i.id === item.id).length,
      }
      return (<div onClick={this.selectItem.bind(this, item)} key={item.uri} class={className}>
        <img src={this.type === ARTIST ? get(item, 'images[0].url') : item.images[0].url} class={{'is-artist': this.type === ARTIST}} />
        <span class="display-item-selected-transparency glyphicon glyphicon-ok-sign" style={{opacity: className[IS_SELECTED] ? .5 : 0}} />
        <div>{item.name}</div>
      </div>);
    }
    const selectedItemIds = this.selectedItems.map(i => i.id);
    const filteredResults = this.searchResults.filter(i => !selectedItemIds.includes(i.id));
    return (<div class="search-add-section">
      <input onKeyup={this.setSearch} placeholder={`search for an ${this.type}`} class='add-search-input' />
      {this.selectedItems.length ? <i class="glyphicon glyphicon-ok-sign" onClick={this.finish}/> : <i class="glyphicon glyphicon-chevron-left" onClick={this.finish}/> }
      <div class="browse-page-display-group">
      {this.selectedItems.map(mapItem)}
      {filteredResults.map(mapItem)}
    </div>
    </div>)
  } 
}


</script>
<style lang="sass">
  .search-add-section {
    position: absolute;
    width: 100%;
    left: 0;
    top: 100px;
    text-align: center;
    .browse-page-display-group {
      display: grid;
      grid-gap: 20px;
      margin: 20px;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      grid-template-rows: repeat(auto-fit, 250px);
    }
    .glyphicon {
      cursor: pointer;
      left: 50px;
      position: absolute;
      font-size: 46px;
      top: -60px;
    }
  }
  .display-item {
    max-width: 240px;
    min-width: 220px;
    position: relative;
    .is-artist {
      border-radius: 50%;
    }
    & &-selected-transparency {
      top: -4px;
      left: -7px;
      font-size: 240px;
      opacity: .5;
      color: white;
      transition: .2s ease-in-out;
      &:hover {
        opacity: .3 !important;
      }
    }
    &.item-is-selected img {
      border: 2px solid #1ed760;
    }
    img {
      width: 220px;
      height: 220px;
    }
  }
  .add-search-input {
    background-color: transparent;
    border: none;
    border-bottom: 1px solid #333;
    margin-bottom: 20px;
    font-size: 36px;
  }
@media (max-width: 1350px) { 
  body .search-add-section {
    width: 90%;
  }
}
</style>