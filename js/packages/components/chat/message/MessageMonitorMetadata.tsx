import React from 'react'
import { View } from 'react-native'
import { Icon, Text } from '@ui-kitten/components'

import { useStyles } from '@berty-tech/styles'
import beapi from '@berty-tech/api'

import { pbDateToNum, timeFormat } from '../../helpers'
import { InteractionMonitorMetadata } from '@berty-tech/store/types.gen'

const eventMonitorTypes = beapi.protocol.MonitorGroup.TypeEventMonitor

export const MessageMonitorMetadata: React.FC<{ inte: InteractionMonitorMetadata }> = ({
	inte,
}) => {
	const [{ padding, text, margin }] = useStyles()
	const sentDate = pbDateToNum(inte?.sentDate)

	const me = inte.payload.event

	let monitorPayloadTitle: string
	let monitorPayloadSubtitle: string[] | undefined
	switch (me?.type) {
		case eventMonitorTypes.TypeEventMonitorAdvertiseGroup:
			const msgAdvertise = `local peer advertised ${me.advertiseGroup?.peerId?.substr(
				me.advertiseGroup.peerId.length - 10,
			)} on ${me.advertiseGroup?.driverName}, with ${me.advertiseGroup?.maddrs?.length} maddrs:`
			monitorPayloadSubtitle = me.advertiseGroup?.maddrs?.map((addr: string) => `--${addr}`)
			monitorPayloadTitle = msgAdvertise
			break
		case eventMonitorTypes.TypeEventMonitorPeerFound:
			monitorPayloadTitle = `new peer found ${me.peerFound?.peerId?.substr(
				me.peerFound.peerId.length - 10,
			)} on ${me.peerFound?.driverName}, with ${me.peerFound?.maddrs?.length} maddrs:`
			monitorPayloadSubtitle = me.peerFound?.maddrs?.map((addr: string) => `--${addr}`)
			break
		case eventMonitorTypes.TypeEventMonitorPeerJoin:
			if (me.peerJoin?.isSelf) {
				monitorPayloadTitle = 'you just joined this group'
			} else {
				let activeAddr = '<unknown>'
				if (me.peerJoin?.maddrs?.length) {
					activeAddr = me.peerJoin?.maddrs[0]
				}
				monitorPayloadTitle = `peer joined ${me.peerJoin?.peerId?.substr(
					me.peerJoin.peerId.length - 10,
				)} on: ${activeAddr}`
			}
			break
		case eventMonitorTypes.TypeEventMonitorPeerLeave:
			if (me.peerLeave?.isSelf) {
				monitorPayloadTitle = 'you just leaved this group'
			} else {
				monitorPayloadTitle = `peer leaved ${me.peerLeave?.peerId?.substr(
					me.peerLeave.peerId.length - 10,
				)}`
			}
			break
		default:
			console.log('undefined event type', me)
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
					monitorPayloadSubtitle.map((subtitle: string, index: number) => (
						<Text
							key={index}
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
