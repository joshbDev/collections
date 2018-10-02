// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

// app specific credentials
const SPOT_API_URL = 'https://api.spotify.com';
const { CLIENT_ID, PROJECT_DOMAIN } = process.env;

// parse application/json
// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text({ type: 'text/html' }));

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('dist'));

/**
 * Section 1:
 *   Forward requests to the Spotify API.
 */

const forwardRequestToSpotify = ({ originalUrl, method, headers: { authorization } }, responseType, overridePayload) => {
  const defaultPayload = { method, headers: { authorization } };
  const endpoint = SPOT_API_URL + originalUrl;
  const payload = Object.assign({}, defaultPayload, overridePayload);

  return fetch(endpoint, payload).then(res => responseType == 'json' ? res.json() : res.text());
};

// HTTP GET
app.get(`/v1/*`, (req, res) =>
  forwardRequestToSpotify(req, 'json')
    .then(json => res.json(json))
    .catch(err => res.status(500).json(err)));

// HTTP POST
app.post(`/v1/*`, (req, res) =>
  forwardRequestToSpotify(req, 'json', { body: JSON.stringify(req.body) })
    .then(json => res.json(json))
    .catch(err => res.status(500).json(err)));

// HTTP PUT
app.put(`/v1/*`, (req, res) =>
  forwardRequestToSpotify(req, 'json', { body: Object.keys(req.body).length ? JSON.stringify(req.body) : null })
    .then(json => res.json(json))
    .catch(err => res.status(500).json(err)));

// HTTP DELETE
app.delete(`/v1/*`, (req, res) =>
  forwardRequestToSpotify(req, 'text', { body: JSON.stringify(req.body) })
    .then(text => text.json({}))
    .catch(err => res.status(500).json(err)));

/**
 * Section 2:
 *   Get authentication setup with the Spotify Accounts API.
 */

// Replace with your redirect URI, required scopes, and show_dialog preference
const scopes = ['user-read-playback-state', 'playlist-modify-public', 'user-library-read', 'user-follow-read', 'user-modify-playback-state', 'streaming', 'user-read-birthdate', 'user-read-email', 'user-read-private'];
const redirectUri = `https://${PROJECT_DOMAIN}.glitch.me/callback`;

app.get("/authorize", (request, response) => {
  response.redirect(
    'https://accounts.spotify.com/authorize' +
    '?response_type=token' +
    '&client_id=' + CLIENT_ID +
    '&scope=' + encodeURIComponent(scopes) +
    '&redirect_uri=' + encodeURIComponent(redirectUri)
  );
});

/**
 * Section 3:
 *   Get the project setup with Node and Express.
 */

// listen for requests :)
// http://expressjs.com/en/starter/basic-routing.html

app.get("/*", (req, res) => res.sendFile(`${__dirname }/dist/index.html`));

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Your app is listening on port ${ listener.address().port}`);
});
