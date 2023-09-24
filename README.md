# What is this

Simple toy project to experiment with Server Sent Events in node.

A node server keeps track of the known clients and an array of words. The server also serves a simple html file to interact with the server.

## Endpoints

- `GET /status`

  returns the current state of the server

- `GET /events`

  provides an endpoint for clients to connect and listen to new events. Whenever a client connects to this endpoint, it is added to an array of connected clients and the stored data will be sent to it

- `POST /add-word`

  The purpose of this endpoint is to receive new words, once a new word is received, it will be pushed to all the connected clients. Not strictly necessary since events can come from different sources (timer, database, etc) but it makes debugging easier
