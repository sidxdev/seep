# Build react ########################################################
FROM node:16-slim as react-builder

WORKDIR /home/app/src/react
COPY src/react/package*.json /home/app/src/react/
RUN npm ci --only=production

# Copy project source code
COPY src/react /home/app/src/react/

# Build react
RUN npm run build


# Build node ########################################################
FROM node:16-slim as node-builder

WORKDIR /home/app/src/node
COPY src/node/package*.json /home/app/src/node/
RUN npm ci --only=production

# Copy project source code
COPY src /home/app/src/


# Runtime image ####################################################
FROM node:16-slim as runtime

# Node running port
ENV PORT=8000
EXPOSE 8000

WORKDIR /home/app/src/node

# Copy project source code
COPY src /home/app/src/
# Copy build results
COPY --from=node-builder /home/app/src/node/node_modules /home/app/src/node/node_modules
COPY --from=react-builder /home/app/src/react/build /home/app/src/node/public

# Start node server
ENTRYPOINT [ "npm", "start" ]