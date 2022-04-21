import React from 'react'
import { View } from 'react-native'
import { Icon } from '@ui-kitten/components'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store/hooks'
import beapi from '@berty/api'
import { pbDateToNum } from '@berty/store/convert'

import { timeFormat } from '../../helpers'
import { InteractionMonitorMetadata } from '@berty/store/types.gen'
import { UnifiedText } from '../../shared-components/UnifiedText'

const eventMonitorTypes = beapi.protocol.MonitorGroup.TypeEventMonitor

export const MessageMonitorMetadata: React.FC<{ inte: InteractionMonitorMetadata }> = ({
	inte,
}) => {
	const { padding, text, margin } = useStyles()
	const colors = useThemeColor()
	const sentDate = pbDateToNum(inte?.sentDate)

	const me = inte.payload?.event

	let monitorPayloadTitle: string
	let monitorPayloadSubtitle: string[] | undefined
	switch (me?.type) {
		case eventMonitorTypes.TypeEventMonitorAdvertiseGroup:
			const msgAdvertise = `local peer advertised ${me.advertiseGroup?.peerId?.substr(
				me.advertiseGroup.peerId.length - 10,
			)} on ${me.advertiseGroup?.driverName}, with ${me.advertiseGroup?.maddrs?.length} maddrs`
			// monitorPayloadSubtitle = me.advertiseGroup?.maddrs?.map((addr: string) => `--${addr}`)  // @NOTE(gfanton): disable this for the moment (too much verbose)
			monitorPayloadTitle = msgAdvertise
			break
		case eventMonitorTypes.TypeEventMonitorPeerFound:
			monitorPayloadTitle = `new peer found ${me.peerFound?.peerId?.substr(
				me.peerFound.peerId.length - 10,
			)} on ${me.peerFound?.driverName}, with ${me.peerFound?.maddrs?.length} maddrs:`
			// monitorPayloadSubtitle = me.peerFound?.maddrs?.map((addr: string) => `--${addr}`) // @NOTE(gfanton): disable this for the moment (too much verbose)
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
				monitorPayloadTitle = 'you just left this group'
			} else {
				monitorPayloadTitle = `peer left ${me.peerLeave?.peerId?.substr(
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
					<Icon name='monitor-outline' fill={colors['background-header']} width={25} height={25} />
				</View>
				<UnifiedText
					style={[text.lightItalic, { textAlign: 'left', color: colors['background-header'] }]}
				>
					{monitorPayloadTitle}
				</UnifiedText>

				{monitorPayloadSubtitle &&
					monitorPayloadSubtitle.map((subtitle: string, index: number) => (
						<UnifiedText
							key={index}
							style={[
								{
									textAlign: 'left',
									color: colors['background-header'],
								},
								text.lightItalic,
								margin.top.tiny,
							]}
						>
							{subtitle}
						</UnifiedText>
					))}
			</View>
			<UnifiedText
				style={[
					{ alignSelf: 'flex-end', color: colors['background-header'] },
					text.lightItalic,
					text.size.small,
				]}
			>
				{timeFormat.fmtTimestamp3(sentDate)}
			</UnifiedText>
		</View>
	)
}
