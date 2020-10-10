.PHONY: all
all: up ps logs

up:
	docker-compose up -d daemon1 daemon2
	docker-compose stop bot || true
	docker-compose up -d --force-recreate bot

logs:
	docker-compose logs --tail=100 -f

down:
	docker-compose down --remove-orphans

ps pull:
	docker-compose $@

initdb:
	# initialize a daemon and quit
	docker-compose run daemon1 -xec "berty share-invite"
	docker-compose run daemon2 -xec "berty share-invite"
	# rename run dir to clean dir
	mv data/daemon1/run data/daemon1/clean
	mv data/daemon2/run data/daemon2/clean
