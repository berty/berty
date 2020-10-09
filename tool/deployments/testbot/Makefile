.PHONY: all
all: up ps logs

up:
	docker-compose up -d daemon1
	docker-compose stop bot1 || true
	docker-compose up -d --force-recreate bot1

logs:
	docker-compose logs --tail=100 -f

down:
	docker-compose down --remove-orphans

ps pull:
	docker-compose $@

initdb:
	# initialize a daemon and quit
	docker-compose run daemon1 -c "berty share-invite"
	# rename run dir to clean dir
	mv data/testbot1/daemon/run data/testbot1/daemon/clean
