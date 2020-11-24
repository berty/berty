import React from 'react'
import { View } from 'react-native'
import { Icon, Text } from '@ui-kitten/components'

import { useStyles } from '@berty-tech/styles'
import { pbDateToNum, timeFormat } from '../../helpers'
import beapi from '@berty-tech/api'

const getMonitorEventKeys = () => {
	return ['undefined', 'advertiseGroup', 'peerFound', 'peerJoin', 'peerLeave']
}

const eventMonitorTypes = beapi.types.MonitorGroup.TypeEventMonitor

export const MessageMonitorMetadata: React.FC<{ inte: beapi.messenger.IInteraction }> = ({
	inte,
}) => {
	const [{ padding, text, margin }] = useStyles()
	const sentDate = pbDateToNum(inte?.sentDate)

	/* beapi.types.MonitorGroup.TypeEventMonitor */
	const monitorEvent = (inte.payload as any)?.event
	const monitorEventKeys = getMonitorEventKeys()
	const { peerId, driverName, maddrs, isSelf } = monitorEvent[monitorEventKeys[monitorEvent.type]]

	let monitorPayloadTitle
	let monitorPayloadSubtitle
	switch (monitorEvent.type) {
		case eventMonitorTypes.TypeEventMonitorAdvertiseGroup:
			const msgAdvertise = `local peer advertised ${peerId.substr(
				peerId.length - 10,
			)} on ${driverName}, with ${maddrs.length} maddrs:`
			monitorPayloadSubtitle = maddrs.map((addr: string) => `--${addr}`)
			monitorPayloadTitle = msgAdvertise
			break
		case eventMonitorTypes.TypeEventMonitorPeerFound:
			monitorPayloadTitle = `new peer found ${peerId.substr(
				peerId.length - 10,
			)} on ${driverName}, with ${maddrs.length} maddrs:`
			monitorPayloadSubtitle = maddrs.map((addr: string) => `--${addr}`)
			break
		case eventMonitorTypes.TypeEventMonitorPeerJoin:
			if (isSelf) {
				monitorPayloadTitle = 'you just joined this group'
			} else {
				let activeAddr = '<unknown>'
				if (maddrs.length) {
					activeAddr = maddrs[0]
				}
				monitorPayloadTitle = `peer joined ${peerId.substr(peerId.length - 10)} on: ${activeAddr}`
			}
			break
		case eventMonitorTypes.TypeEventMonitorPeerLeave:
			if (isSelf) {
				monitorPayloadTitle = 'you just leaved this group'
			} else {
				monitorPayloadTitle = `peer leaved ${peerId.substr(peerId.length - 10)}`
			}
			break
		default:
			console.log('undefined event type', monitorEvent)
			monitorPayloadTitle = 'undefined'
	}
	return (
		<View style={[padding.vertical.tiny, padding.horizontal.medium]}>
			<View style={[{ justifyContent: 'center', alignItems: 'flex-start' }, padding.small]}>
				<View
					style={[
						{
							alignItems: 'center',
							justifyContent: 'center',
							width: '100%',
						},
						margin.bottom.small,
					]}
				>
					<Icon name='monitor-outline' fill='#4E58BF' width={25} height={25} />
				</View>
				<Text
					style={[
						{ textAlign: 'left', fontFamily: 'Open Sans', color: '#4E58BF' },
						text.bold.small,
						text.italic,
						text.size.scale(14),
					]}
				>
					{monitorPayloadTitle}
				</Text>

				{monitorPayloadSubtitle &&
					monitorPayloadSubtitle.map((subtitle: string) => (
						<Text
							style={[
								{ textAlign: 'left', fontFamily: 'Open Sans', color: '#4E58BF' },
								text.bold.small,
								text.italic,
								text.size.scale(14),
								margin.top.tiny,
							]}
						>
							{subtitle}
						</Text>
					))}
			</View>
			<Text
				style={[
					{ fontFamily: 'Open Sans', alignSelf: 'flex-end', color: '#4E58BF' },
					text.bold.small,
					text.italic,
					text.size.small,
				]}
			>
				{timeFormat.fmtTimestamp3(sentDate)}
			</Text>
		</View>
	)
}
