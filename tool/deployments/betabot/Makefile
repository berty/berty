.PHONY: all
all: up ps logs

up:
	docker-compose up -d

logs:
	docker-compose logs --tail=100 -f

ps pull down:
	docker-compose $@

stats:
	# Conversations
	@cat data/betabot/betabot.store | jq '.Convs[].ConversationPublicKey' | wc -l

restorecleandb: down
	# this command trashes the runtime db and restores a clean db that only has the same private key
	rm -rf data/bkp-current
	mkdir -p data/bkp-current data/bkps
	mv data/daemon/run data/bkp-current/daemon
	mv data/betabot data/bkp-current/betabot
	mv data/bkp-current data/bkps/`date +%s`
	cp -rf data/daemon/clean data/daemon/run

initdb:
	docker-compose run daemon -xec "berty share-invite"
	cp -rf data/daemon/run data/daemon/clean

