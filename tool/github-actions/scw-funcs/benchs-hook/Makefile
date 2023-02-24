test:
	go test -v .

invoke:
	npx serverless invoke --function benchshook

deploy:
	npx serverless deploy --conceal

deps:
	npm i
	npx serverless plugin install -n serverless-scaleway-functions
