# # base node image
FROM node:16-bullseye-slim as base

# # Build the dev image
FROM base as build
RUN mkdir /app/
WORKDIR /app/
COPY . /app
RUN npm install
RUN npm run build

# # Get the production modules
FROM base as production-deps
RUN mkdir /app/
WORKDIR /app/
COPY --from=build /app/node_modules /app/node_modules

ADD prisma .
RUN npx prisma generate

ADD package.json package-lock.json .npmrc /app/
RUN npm prune --production

# Pull out the build files and do a production install
FROM base
ENV NODE_ENV=production
RUN mkdir /app/
WORKDIR /app/
ADD package.json package-lock.json .npmrc /app/

COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/public /app/public
COPY --from=build /app/build /app/build
COPY --from=build /app/server.js /app/server.js
COPY --from=build /app/prisma /app/prisma
COPY --from=production-deps /app/node_modules /app/node_modules

RUN npx prisma migrate deploy
RUN npx prisma db seed
CMD ["npm", "start"]