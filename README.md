# TODO
See [roadmap](./roadmap.md)

## About TODO items
There are two types of TODOs. Regular ones and those marked as TODO (MVP). The latter category need to be fixed
before going live.


# Developer Setup

## Requirements
docker
python
aws-cli
aws-sam cli
npm

## Running

There are a lot of pieces to make this run locally. In order to start everything up in development you can do the following from the
repository root directory:

1. Log in to aws via SSO
    
        aws sso login
    

2. Start local stack (for Dynamo) by running

        docker-compose up

3. Start lambda emulation

        make start-api-local

4. Start the UI

        make start-ui-local

5. Build the database schema

        make build-table-local

6. Populate the starter data

        make populate-table-local

At this point, you should be able to use the application. For example, if you go to `http://localhost:3001/genres` you should
see a list of song genres.

## Tips and tricks:
* The db script will fail if your table already exists. It has to be deleted if you need to change it. You can do that either by
  restarting localstack via docker-compose or by manually deleting the table. Localstack is not configured to save data between runs.
* The UI will reload automatically when you change the code. The API service will not. You need to run make build-api to
  see changes reflected.
* If you want instant feedback, you can have api and ui unit tests run automatically by running the following commands:
  In `api/songs`:
*
          npm run unit:dev

In `ui/`:

          npm test

* To run all tests, including integration run the following command from the repository root:

            make test

