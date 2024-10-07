# syntax=docker/dockerfile:1


ARG NODE_VERSION=18.19.1

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine as base

# Set working directory for all build stages.
WORKDIR /usr/src/app

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

# Copy the rest of the source files into the image.
COPY . .
# Run the build script.
RUN npm run build --prod

FROM nginx:alpine



COPY --from=base /usr/src/app/dist/cintelcore-staff-web-app/browser /usr/share/nginx/cintelcore-staff-web-app/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]


