.PHONY: all
all: up ps logs

up:
	docker-compose up -d

logs:
	docker-compose logs --tail=100 -f

down ps:
	docker-compose $@

genkey:
	echo RDVP_PK=`docker-compose run server genkey` > .env

ip:
	curl ifconfig.co
