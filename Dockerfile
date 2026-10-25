# syntax=docker/dockerfile:1

# Stage 1: build the static site with Jekyll.
FROM ruby:3.3-slim AS build

RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential \
 && rm -rf /var/lib/apt/lists/*

RUN gem install jekyll -v 4.4.1 --no-document

WORKDIR /site
COPY . .
RUN jekyll build

# Stage 2: serve the generated files with nginx only.
FROM nginx:alpine
COPY --from=build /site/_site /usr/share/nginx/html
