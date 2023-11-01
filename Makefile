.PHONY: build build-api build-ui-production deploy-api start-api-local start-ui-local start-local

AUTHZ_SECRET := $(shell cat ./.authz_secret)

build-production: build-api build-ui-production

build-ui-production:
	cd ui; \
	npm run build:production

build-api:
	cd api; \
	sam validate && sam build

deploy-infrastructure:
	cd infrastructure/production; \
	terraform init; \
	terraform apply

# TODO: the following origin isn't going to work with new CORS security restrictions.
#   Need to add cloudfront with TLS and a valid host name.
deploy-api: build-api
	pwd;
	cd api; \
	sam deploy --parameter-overrides AllowOrigin="https://yersong.danielsomerfield.com" DynamoDbEndpoint="''" AuthzSecret="'${AUTHZ_SECRET}'"

deploy-ui: build-ui-production
	aws s3 cp ui/build/ s3://yer-song-ui-production/ --recursive

start-local: start-api-local start-ui-local

start-ui-local:
	cd ui; \
	npm start

start-api-local: build-api
	cd api; \
	AUTHZ_SECRET="LOCAL_SECRET" DOCKER_HOST=unix:~/.docker/run/docker.sock sam local start-api --docker-network lambda_local

build-table-local: # TODO: make this only run if the table doesn't exist
	aws --no-paginate --no-cli-pager --endpoint-url http://localhost:4566 dynamodb create-table \
		--cli-input-json file://./api/tables/song.table.json

build-table-production: # TODO: make this only run if the table doesn't exist
	aws --no-paginate --no-cli-pager dynamodb create-table \
		--cli-input-json file://./api/tables/song.table.json

start-local: start-api-local start-ui-local

populate-table-local: seed/*
	for file in $^; do \
	  	aws --no-paginate --no-cli-pager --endpoint-url http://localhost:4566 dynamodb batch-write-item \
	      --request-items file://$${file}; \
  	done



populate-table-production: seed/*
	for file in $^; do \
	  	aws --no-paginate --no-cli-pager dynamodb batch-write-item \
	      --request-items file://$${file}; \
  	done

test: test-ui test-api

test-api:
	cd api/songs; \
	npm test

test-ui:
	cd ui;\
	npm test -- --watchAll=false