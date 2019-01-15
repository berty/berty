#! /bin/bash

TAGS=(
	'advertise'
	'ble_manager'
	'connect_activity'
	'device'
	'device_manager'
	'gatt_client'
	'gatt_server'
	'main_activity'
	'scan'
)

TAG_SUFFIX='chat.berty.io.client.rn.gomobile.ble.'

DEVICES=($(adb devices | grep '\tdevice' | cut -d'	' -f1))
CHOICE=""

if [ ${#DEVICES[@]} -eq 0 ]; then
	echo "No Android device found"
	exit
elif [ ${#DEVICES[@]} -eq 1 ]; then
	echo "One device found: ${DEVICES[0]}"
	CHOICE=${DEVICES[0]}
else
	echo "More than one device found:"

	while true; do
		echo
		COUNT=1
		for DEVICE in "${DEVICES[@]}"; do
			echo "	$COUNT. $DEVICE"
			COUNT=$((COUNT + 1))
		done

		echo
		echo -n "Your choice: "
		read INPUT

		REGEX='^[0-9]+$'
		if [[ !($INPUT =~ $REGEX) || $INPUT -eq 0 || $INPUT -gt ${#DEVICES[@]} ]] ; then
		   echo "Error: wrong choice!"
		else
			CHOICE=${DEVICES[((INPUT - 1))]}
			break
		fi
	done
fi

COMMAND="pidcat -s $CHOICE"
FILTERED=false

for ARG; do
	if [ "$ARG" == "--filtered" ]; then
		FILTERED=true
	else
		COMMAND="$COMMAND $ARG"
	fi
done

if [ $FILTERED == true ]; then
	for TAG in "${TAGS[@]}"; do
		COMMAND="$COMMAND -t $TAG_SUFFIX$TAG"
	done
fi

echo
echo $COMMAND

$COMMAND
