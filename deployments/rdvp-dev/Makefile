.PHONY: all
all: up logs

genkey:
	echo RDVP_PK=`docker-compose run server genkey` > .env

ip:
	curl ifconfig.co

up:
	docker-compose up -d

logs:
	docker-compose logs --tail=100 -f

down:
	docker-compose down

genkey:
	echo RDVP_PK=`docker-compose run server genkey` > .env

ip:
	curl ifconfig.co
