FROM node:18 AS build

WORKDIR /saltedfish-web

COPY . /saltedfish-web

RUN \
alias npm="npm --registry=https://registry.npmmirror.com"; \
rm ./node_modules -rf; \
rm ./dist -rf; \
npm install && \
npm run build-ext-video-player && \
npm run build-ext-demo && \
npm run build

FROM nginx:latest

# ENV \
# MAX_BODY_SIZE=8192m \
# SERVER_NAME=_ \
# API_ADDR=http://127.0.0.1:8087 \
# HTTP_PORT=80


COPY --from=build /saltedfish-web/dist /var/www/saltefish-web
COPY ./conf/web.conf /etc/nginx/conf.d/saltedfish-web.conf.template

CMD rm /etc/nginx/conf.d/*.conf && \
envsubst "$(env | sed -e 's/=.*//' -e 's/^/\$/g')" < /etc/nginx/conf.d/saltedfish-web.conf.template > /etc/nginx/conf.d/saltedfish-web.conf && \
nginx -g "daemon off;"