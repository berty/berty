.PHONY: all
all: up logs

up:
	docker-compose up -d

logs:
	docker-compose logs --tail=100 -f

down:
	docker-compose down
