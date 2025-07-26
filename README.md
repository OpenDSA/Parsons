# Parsons

This is a server side rendered implementation of OpenDSA/Parsons.
This implementation consumes
the [Parsons Problem Input Format (PIF)](https://docs.google.com/document/d/1ZzEgS4_2SyS88fhWVp0041KmfWFnXBKgMWmPEDI7chw/edit?usp=sharing)
an extension of [PEML](https://cssplice.org/peml/).

## How to run

1. Clone the repo and checkout the server branch

```bash
git clone https://github.com/OpenDSA/Parsons.git
cd Parsons
git checkout server
```

OR

```bash
git clone -b server https://github.com/OpenDSA/Parsons.git && cd Parsons
```

### For Development

1. Install dependencies

```bash
npm install 
```

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

### For Production

```bash
docker compose up
```

