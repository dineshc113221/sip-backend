# Sustainable Innovation Profiler - BS MS

## Description

Sustainable Innovation Profiler - BS MS

## Requirements

Node.js LTS is required.

## Background

This application is based on a Palladium template of a Node.js API using Express. This example application runs Express.js and has endpoints which demonstrate best practices for processing requests, logging, and
API documentation.

All endpoints are documented in `api/openapi.yaml` and they are validated in the build.

## Endpoints

Once running, these endpoints are available:

* GET <http://localhost:3000/api/health>
* GET <http://localhost:3000/api/v1/example>

## Sequence of events

The template demonstrates using a Correlation Id for logging in a distributed system -- this id is used for tracing from the very first request, to other services, and other applications, to draw an overall picture of events.

## Run the service locally

### Install dependencies

```bash
$ npm install
```

### Start the service

Start your local development server with hot reload

```bash
$ npm run dev
```

## Code, Build, Test

Format your code

```bash
$ npm run format
```

Build and check your code with build, lint, and test

```bash
$ npm run build
$ npm run lint
$ npm run test
```

From within VS Code you can run, debug, execute unit tests, scan code...

### TechDocs

This project's technical documentation is in `/docs` using MKDocs and markdown formatting. These docs integrate with Palladium so be sure to use this structure to organize the project documentation.

### OpenAPI

This service's API schema is located in `api/openapi.yaml`. It can be manually updated. The API appears in Palladium so be sure to keep it up-to-date.

## Build a Container Image

The docker configuration is used by the pipeline to build a container image for deployment. You can test this locally if you have docker installed. Docker Compose streamlines building the image and running it.

### Setup Artifactory

Some of the Docker base images used in Palladium are stored in Kenvue's private Artifactory.

Follow these steps for access:

1. Login to Kenvue Artifactory at <https://kenvue.jfrog.io/> (choose SAML SSO)
2. In the top-right most user menu, choose "Set Me Up"
3. In the next screen choose "Docker" type
4. In the repo drop-down make sure `ts-base-images-docker` is selected
5. Click 'Generate Token'; **copy your Token** so you can use it in the next step
6. On your dev environment execute `docker login kenvue.jfrog.io`, then specify your Token
7. Verify a success message

### Use Docker

```bash
docker build . -t node-express-template
```

Run the container image with docker compose:

```bash
docker compose up --build
```
