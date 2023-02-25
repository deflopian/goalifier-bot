ARG NODE_VERSION_ARG="lts"

FROM node:${NODE_VERSION_ARG}-alpine AS app
WORKDIR /var/www/app/
COPY ./package*.json /var/www/app/
RUN npm ci
RUN npm run build
COPY ./ /var/www/app/
EXPOSE 3000
COPY ./docker/app/docker-command.sh /bin/docker-command.sh
RUN sed -i ':a;N;$!ba;s/\r//g' /bin/docker-command.sh \
    && chmod +x /bin/docker-command.sh
CMD ["/bin/docker-command.sh"]
