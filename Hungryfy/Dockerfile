FROM node:8.16.0-alpine

RUN cd /home/node

RUN git clone https://github.com/purigot/Hungrify.git

RUN cd Hungrify

RUN npm i

WORKDIR /home/node/Hungrify

EXPOSE 8080