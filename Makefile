.PHONY: build build-api build-ui-production deploy-api start-api-local start-ui-local start-local

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
	sam deploy --parameter-overrides=AllowOrigin="https://d2jzo5ab0uypii.cloudfront.net,https://yersong.danielsomerfield.com" DynamoDbEndpoint="''"

deploy-ui: build-ui-production
	aws s3 cp ui/build/ s3://yer-song-ui-production/ --recursive

start-local: start-api-local start-ui-local

start-ui-local:
	cd ui; \
	npm start

start-api-local: build-api
	cd api; \
	DOCKER_HOST=unix:///Users/danielsomerfield/.docker/run/docker.sock sam local start-api --docker-network lambda_local

build-table-local: # TODO: make this only run if the table doesn't exist
	aws --endpoint-url http://localhost:4566 dynamodb create-table \
			--table-name song \
			--attribute-definitions AttributeName=PK,AttributeType=S AttributeName=SK,AttributeType=S \
			--key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE \
			--provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1


start-local: start-api-local start-ui-local

populate-table-local:
	aws --endpoint-url http://localhost:4566 dynamodb batch-write-item \
    --request-items file://sample-dynamo-db.json

populate-table-production:
	aws dynamodb batch-write-item --request-items file://sample-dynamo-db.json

test: test-ui test-api

test-api:
	cd api/songs; \
	npm test

test-ui:
	cd ui;\
	npm test -- --watchAll=false