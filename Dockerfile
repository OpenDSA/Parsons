FROM node:22

# Ruby isntall & depenedencies
RUN apt-get update && apt-get install -y \
  ruby-full \
  build-essential \
  && rm -rf /var/lib/apt/lists/*


WORKDIR /app

COPY . .

# Node depenedencies
RUN npm install --include=dev
RUN npm run build


WORKDIR /app/peml
RUN gem build *.gemspec
RUN gem install *.gem

WORKDIR /app

EXPOSE 3000

#CMD ["npm", "run", "start"]
CMD ["nodemon","server/index.js"]