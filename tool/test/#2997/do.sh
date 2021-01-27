#!/bin/bash
set -e

# Move to self directory
cd $(dirname $(realpath $0))

export DB_PATH="/tmp/berty/failing"

if [[ ! -d "$(dirname $DB_PATH)" ]]; then mkdir -p $(dirname $DB_PATH); fi

# Check if the faulty db is there
if [[ ! -d "$DB_PATH" ]]; then
	# Download the faulty DB
	wget -O - --no-check-certificate https://jorropo.net/failing.tar.xz | tee >(sha256sum -b > failing.tar.xz.sum) | xz -d | tar -C "$(dirname $DB_PATH)" -xf -

	# Verify that the download is good
	if [[ "$(cat failing.tar.xz.sum | cut -f1 -d' ')" != "685ba84a8dc8abd78af5ad2ce226c90a95fdb69c366600b69a298450eb9efe89" ]]; then rm -rf "$DB_PATH"; echo "Download failed !"; exit 1; fi
fi

cd ../../../go/cmd/berty

go run . mini -store.dir /tmp/berty/failing &
export CPID=$!

killer() {
	sleep 60
	kill -n 9 $CPID
}

killer &
export CCPID=$!

wait -n $CPID
export RESULT=$?

kill $CCPID

if [[ "$RESULT" == "0" ]]; then
	echo "Worked !"
	exit $RESULT
fi
echo "Not worked :'("
exit $RESULT
