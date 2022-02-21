# shellcheck disable=SC2155
export publicIp=$(curl -s 'http://169.254.169.254/latest/meta-data/public-ipv4')

macs=$(curl -s http://169.254.169.254/latest/meta-data/network/interfaces/macs)
COUNTER=0
for mac in $macs; do
	# shellcheck disable=SC2046
	export "localIp${COUNTER}"=$(curl -s http://169.254.169.254/latest/meta-data/network/interfaces/macs/"${mac%?}"/local-ipv4s)
	((COUNTER++))
done
