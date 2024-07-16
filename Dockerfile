# Fetching the minified node image on apline linux
FROM node:lts-bookworm

# Declaring env
ENV NODE_ENV development

# RUN \
#     echo "**** install packages ****" && \
#     apt-get update && \
#     apt-get install -y --no-install-recommends \
#     wget \
#     ca-certificates && \
#     echo "**** cleanup ****" && \
#     apt-get autoclean && \
#     rm -rf \
#     /config/.cache \
#     /var/lib/apt/lists/* \
#     /var/tmp/* \
#     /tmp/*
# Setting up the work directory
WORKDIR /express-docker

# Copying all the files in our project
COPY . .
# RUN wget https://raw.githubusercontent.com/luminati-io/luminati-proxy/master/bin/ca.crt
# RUN cp ca.crt /usr/local/share/ca-certificates && update-ca-certificates

# Installing dependencies
RUN npm install

# Starting our application
CMD [ "node", "index.js" ]

# Exposing server port
EXPOSE 3000
