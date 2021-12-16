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
	@cat data/welcomebot/welcomebot.store | jq '.Convs[].ConversationPublicKey' | wc -l

restorecleandb: _backup-and-clean
	# this command trashes the runtime db and restores a clean db that only has the same private key
	cp -rf data/daemon/clean data/daemon/run
	make print-qr

_backup-and-clean: down
	rm -rf data/bkp-current
	mkdir -p data/bkp-current data/bkps
	mv data/daemon/run data/bkp-current/daemon || true
	mv data/welcomebot data/bkp-current/welcomebot || true
	mv data/bkp-current data/bkps/`date +%s` || true

initdb:
	@if [ -d data/daemon/clean ]; then echo "[-] init already done"; exit 1; fi
	mkdir -p data/daemon/run
	docker-compose run daemon share-invite -store.dir=/store/run
	make exportdb
	cp -rf data/daemon/run data/daemon/clean
	make print-qr

exportdb:
	docker-compose run daemon export \
	  -store.dir=/store/run \
	  -export-path=/store/run/export.tar \
	  -log.filters=info+*,-ipfs.*
	ls -la data/daemon/run/export.tar

importcleandb: _backup-and-clean
	ls -la data/daemon
	docker-compose run daemon share-invite \
	  -store.dir=/store/run \
	  -node.restore-export-path=/store/clean/export.tar \
	  -log.filters=info+*,-ipfs.*

print-qr:
	docker-compose run daemon share-invite \
	  -store.dir=/store/run \
	  -log.filters=none \
	  -name=Welcomebot
