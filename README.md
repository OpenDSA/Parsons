# Parsons

This is a server side rendered implementation of OpenDSA/Parsons.
This implementation consumes
the [Parsons Problem Input Format (PIF)](https://docs.google.com/document/d/1ZzEgS4_2SyS88fhWVp0041KmfWFnXBKgMWmPEDI7chw/edit?usp=sharing)
an extension of [PEML](https://cssplice.org/peml/).

## How to run

1. Clone the repo

```bash
git clone https://github.com/OpenDSA/Parsons.git
```

### For Development

1. Install dependencies

```bash
npm install 
```


#### Server-side development
2. Run server

```bash
node server/index.js 
```

OR (for hot reloads on save)

```bash
nodemon server/index.js
```

The homepage will be served at http://localhost:3000/parsons/ by default. To use a different port set PORT in the environment to the desired one. 

OR Copy `.env.example` and edit as desired

```bash
cp .env.example .env
```


#### Client-side development
3. Client-side code can be found in `./src`. This code is bundled with webpack into the `./public` directory with the command below.
```bash
  npx webpack --config webpack.config.js
```
NB: Remember to bundle when changes are made so they are served to the browser.


### For Production

```bash
docker compose up
```

