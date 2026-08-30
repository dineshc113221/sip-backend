ARG BASE_IMAGE=ts-docker.artifactrepo.kenvue.com/ts-docker/node:22.23.1

#FROM jnj.artifactrepo.jnj.com/node:16

# Build the application from source
FROM ${BASE_IMAGE} AS builder

# Create app directory
#WORKDIR /usr/src/app
WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)

COPY package*.json ./
COPY tsconfig*.json ./
COPY .npmrc ./
# Bundle app source
COPY src ./src

ENV HUSKY=0
RUN npm pkg delete scripts.prepare
RUN npm ci && npm run build && rm -rf node_modules
RUN npm ci --only=production --no-update-notifier

#RUN npm install
# If you are building your code for production
#RUN npm ci --only=production

# Optimize the final image for running in production, and run as a non-root user
FROM ${BASE_IMAGE}
USER node
WORKDIR /home/node/app


COPY --chown=node:node --chmod=544 --from=builder /home/node/app/node_modules /home/node/app/node_modules
COPY --chown=node:node --chmod=544 --from=builder /home/node/app/dist /home/node/app
COPY --chown=node:node --chmod=544 api /home/node/api
COPY --chown=node:node --chmod=544 package.json /home/node/app

CMD ["dumb-init", "node", "server.js"]
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 CMD curl --fail --max-time 5 http://localhost:3000/api/health || exit 1

# Build
#RUN npm run build

#EXPOSE 3000
#CMD [ "npm", "start" ]
