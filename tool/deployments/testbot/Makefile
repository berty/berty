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

restorecleandb: down
	# this command trashes the runtime db and restores a clean db that only has the same private key
	rm -rf data/bkp-current
	mkdir -p data/bkp-current data/bkps
	mv data/daemon1/run data/bkp-current/daemon1
	mv data/daemon2/run data/bkp-current/daemon2
	mv data/bkp-current data/bkps/`date +%s`
	cp -rf data/daemon1/clean data/daemon1/run
	cp -rf data/daemon2/clean data/daemon2/run

initdb:
	# initialize a daemon and quit
	docker-compose run daemon1 -xec "berty share-invite -store.dir=/store/run"
	docker-compose run daemon2 -xec "berty share-invite -store.dir=/store/run"
	# rename run dir to clean dir
	mv data/daemon1/run data/daemon1/clean
	mv data/daemon2/run data/daemon2/clean
