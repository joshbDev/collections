<script>
import SplashBackground from './splash-background.vue';
export default {
  methods: {
  },
  render(h) {
    return (<span class="splash-page">
    <SplashBackground />
    <div class="splash-page-text-section">
    <span class="splash-page-text-gradient-top" />
    <div class="splash-page-text">
    <h1 class="title"><span>Collections<span class="top-banner-period">.</span></span></h1>
    <h3 class="splash-page-text-subtext">Love the idea of albums and artists collections? This is the place for you.</h3>
    <a href="/authorize"><button class="btn btn-green splash-page-text-button"> Connect to Spotify </button></a>
    <p class="notice">notice: This program is using Spotify's playlist api to create collections. By creating new collections you understand that you are also creating playlists linked to your account.</p>
    </div>
    <span class="splash-page-text-gradient-bottom" />
    </div>
    </span>)
  } 
}
</script>
<style lang="sass">
.splash-page {
  color: white;
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-rows: 0px 1fr;
  position: absolute;
  top: 50px;
  .notice {
    font-size: 12px;
    max-width: 300px;
    margin: 0 auto;
  }
}
.splash-page-text-section {
  align-self: center;
  text-align: center;
  color: black;
}
.splash-page-text {
  background-color: white;
  display: grid;
  align-items: center;
  grid-gap: 5px;
  width: 100%;
  grid-template-rows: 2fr 1fr 1fr 1fr;
  &-subtext {
    margin-top: 0;
    margin-bottom: 30px;
  }
  &-button {
    max-width: 300px;
    justify-self: center;
    align-self: center;
  }
  &-gradient-top {
    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1));
    height: 150px;
    width: 100%;
    display: grid;
  }
  &-gradient-bottom {
    background: linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0));
    height: 150px;
    width: 100%;
    display: grid;
  }
  h1.title {
    font-size: 60px;
    color: black;
  }
}
.top-banner {
  width: 100%;
  display: grid;
  align-items: center;
  justify-items: center;
  height: 70px;
  text-align: center;
  background: white;
  color: white;
    text-shadow:
   -1px -1px 0 #000,  
    1px -1px 0 #000,
    -1px 1px 0 #000,
     1px 1px 0 #000;
  border-bottom: 1px solid #999;
  h1 {
    font-size: 42px;
    margin-top: 0;
  }
  &-period {
    color: #333;
    text-shadow: none;
  }
}
</style>
