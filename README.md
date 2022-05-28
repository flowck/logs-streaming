# `logs-streaming`

Demo implementation of a service that streams the output of a spawned child process using Web Sockets.

## Requirements

- Create a job from the client;
- Subscribe to a job's output logs;
- The job's output logs must be processed without blocking new requests to the service;
- At any given point any client must be able to subscribe to a job's output logs created by another client;

## How to run

1 - Install the dependencies of `client` and `server` app;
2 - Run `npm run start` on each app;
3 - Open the client from the following URL: [http://localhost:8080](http://localhost:8080)
