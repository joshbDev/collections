<script>
import {SPLASH_IMAGES} from '../constants';
export default {
  render(h) {
    return (<span>
    <span class="splash-background-black" />
    <span class="splash-background">
    {SPLASH_IMAGES.map((item, index) => (<img class="album__artwork" src={item} />))}
    </span>
    </span>)
  } 
}
</script>
<style lang="sass">
.splash-background {
  z-index: -1;
  filter: blur(5px);
  top: 50px;
  left: 0;
  width: 100%;
  position: fixed;
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  &-black {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: white;
    z-index: -99;
  }
}
</style>
