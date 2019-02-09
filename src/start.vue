<script>
import 'babel-polyfill';
import Vue from 'vue';
import Splash from './components/splash.vue';
import VueRouter from 'vue-router';
import Browse from './components/browse.vue';
import {tryParsingAuthData} from './auth/OAuthCallbackHandler';
import {store} from './store/store';
import {DEEPLINK_URL} from './constants';
import {fireGAEvent} from './util';

Vue.use(VueRouter);

function beforeEnter(to, from, next) {
      if (tryParsingAuthData()) {
        const deeplinkReroute = window.localStorage.getItem(DEEPLINK_URL);
        if (deeplinkReroute) {
          window.localStorage.removeItem(DEEPLINK_URL);
          window.location.href = deeplinkReroute;
        }
        from.fullPath === '/browse' ? undefined : next('/browse');
        return;
      }
      next('/');
    }
const routes = [
  { path: '/', component: Splash},
  { path: '/browse', component: Browse},
  { path: '/browse/:id/playlist/:uri', component: Browse},
  {path: '/callback', beforeEnter}
]
const router = new VueRouter({
  mode: 'history',
  routes})
new Vue({
  el: '#root',
  router,
  store,
  render(h) {
    return (<div>
  <router-view />
  </div>)
  } 
});
</script>
<style lang="sass">
body {
  overflow: hidden;
  zoom: .75;
}
</style>