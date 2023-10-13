.PHONY: build build-api build-ui deploy-api start-api-local start-ui-local start-local

build: build-api build-ui

build-ui:
	cd ui; \
	npm run build

build-api:
	cd api; \
	sam build

deploy-api: build-api
	cd api; \
	sam deploy

deploy-ui: build-ui
	aws s3 cp ui/build/ s3://yer-song-ui-production/ --recursive

start-ui-local: build-ui
	cd ui; \
	npm start

start-api-local: build-api
	cd api; \
	DOCKER_HOST=unix:///Users/danielsomerfield/.docker/run/docker.sock sam local start-api

build-table-local: # TODO: make this only run if the table doesn't exist
	aws --endpoint-url http://localhost:4566 dynamodb create-table \
			--table-name song \
			--attribute-definitions AttributeName=id,AttributeType=S \
			--key-schema AttributeName=id,KeyType=HASH \
			--provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1

start-local: start-api-local start-ui-local
