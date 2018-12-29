# Collections
![alt text](https://lh3.googleusercontent.com/5Z9DaB_9CND3OdTA6WxlN3FJEYQG6r01xiwmspkIR0TWDFldLbj41cf94jIZfLcO5KaoWi7FjNI8BxhvC2d7U4U0AmagZI06jW1SdwzMjmDR5AwUaJsdtUugOGU-d6xk16axAExE3Y7MXm963DEdqUbsygMSfyCzbyPBekgy8KBE5aQt2cy9W1Wz8lvBWfqAwDZ9vIRTl5y19Z6iohOGa7yTPQM5HgAZQWzfGrmx6RwA2Ivcm352fQzO4qIm_Soo6qascWweBCBX_0jAaqscO6ix73BBhHTe2ibMJt4p9VtdtaK4VgQxyU_kUGYrtjMHM26Fud_yRwIC66C6J-EQpYgsQpR682Y9E9iiENgeegel1_hYh6RWBAX8TOGdW7ISTJXxDtWoUxfRiFKj50M53YF--IWTveLh3hQ8pY7j8eY8tNeb1PQ8eKFlT4hypBoOwyPTCwca3YbT4Ej_o8V1_sXAjqinLrod_v9ZbGEM7XLoNwxjfLJcxWYYSG-9r4W8hm8wukid3lWbCx7ubOIOYg38AVCM_lgzUnMuQaVBnnLtr_UoHoKQbKJ6qkxFMNBcZ6OILGBofIB_e5WJi9VEjg6-FIxim0WcQLb2Bt7-ELXHf7wQHFX_orWxiXJNBJupCInpOl0goOBGucV-otpj9UFSx7XPAMit8VtQnpRUt5WFW_vkPGm6Cm0ZQuEzqyMbNgUfsyYWyYugK4xOv7g=w1031-h469-no "Collections")


## Description

A website built off of the Spotify Web API and SDK, using Vue.js with JSX.

## Setup

```sh
# environment & build tools
brew install node yarn # node.js & yarn
```

**Dependencies**

```
yarn install
```

**Run**

```bash
yarn start
```

# Develop

**develop**
```bash
yarn run dev
```
Note: You'll need a spotify web token (you can get one from the [Spotify Web Portal](https://developer.spotify.com/dashboard/login). You'll then have to modify the `server.js` file's `CLIENT_ID` to be that code, you'll also need to change the variable `redirectUri` to be `'http://localhost:3000/callback'`.