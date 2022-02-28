all:
	docker-compose down --remove-orphans
	docker-compose run integration || \
		(docker-compose logs testbot_daemon1 && docker-compose logs testbot_daemon2)
	docker-compose down --remove-orphans
