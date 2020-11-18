import { messenger as messengerpb, types as typespb } from '@berty-tech/api/index.js'
import {
	useClient,
	useConversation,
	useInteraction,
	useMsgrContext,
	useOneToOneContact,
	useLastConvInteraction,
} from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'
import Color from 'color'
import palette from 'google-palette'
import React, { useMemo, useState } from 'react'
import { Linking, Text as TextNative, TouchableOpacity, View } from 'react-native'
import Hyperlink from 'react-native-hyperlink'
import { Icon, Text } from '@ui-kitten/components'
import { SHA3 } from 'sha3'
import Logo from '../../main/1_berty_picto.svg'
import { ProceduralCircleAvatar } from '../../shared-components'
import { useNavigation as useNativeNavigation } from '@react-navigation/core'
import { pbDateToNum, timeFormat } from '../../helpers'
import { Buffer } from 'buffer'
import { PersistentOptionsKeys } from '@berty-tech/store/context'

const pal = palette('tol-rainbow', 256)

//
// Message => All messages (group/contact)
//

async function isBertyDeepLink(client: any, url: String): Promise<boolean> {
	return new Promise((resolve) => {
		client
			.parseDeepLink({
				link: url,
			})
			.then(() => {
				resolve(true)
			})
			.catch(() => {
				resolve(false)
			})
	})
}

// Types
// Styles
const useStylesMessage = () => {
	const [{ row, text, padding, width }] = useStyles()
	return {
		isMeMessage: [row.item.bottom, { maxWidth: '90%' }],
		isOtherMessage: [row.item.top, { maxWidth: '90%' }],
		circleAvatarUserMessage: [row.item.bottom, width(40)],
		messageItem: [],
		personNameInGroup: text.size.tiny,
		dateMessage: [text.size.scale(11), text.bold.small, text.color.grey],
		stateMessageValueMe: [padding.left.scale(1.5), text.size.scale(11), text.color.blue],
	}
}

export const MessageInvitationButton: React.FC<{
	onPress?: any
	activeOpacity: any
	backgroundColor: any
	icon: any
	color: any
	title: any
	styleOpacity?: any
	disabled?: boolean
}> = ({
	onPress,
	activeOpacity,
	backgroundColor,
	icon,
	color,
	title,
	styleOpacity,
	disabled = false,
}) => {
	const [{ flex, padding, border, width, row, text, opacity }] = useStyles()
	return (
		<TouchableOpacity
			style={[flex.align.center]}
			activeOpacity={activeOpacity}
			onPress={onPress}
			disabled={disabled}
		>
			<View
				style={[
					padding.tiny,
					padding.vertical.small,
					border.radius.tiny,
					width(120),
					row.center,
					flex.align.center,
					padding.right.small,
					{ backgroundColor },
				]}
			>
				<Icon name={icon} width={24} height={24} fill={color} style={[opacity(styleOpacity)]} />
				<TextNative
					style={[
						text.align.center,
						text.size.scale(14),
						text.bold.medium,
						opacity(styleOpacity),
						{ fontFamily: 'Open Sans', color },
					]}
				>
					{title}
				</TextNative>
			</View>
		</TouchableOpacity>
	)
}

const MessageSystemLogo = () => {
	const [{ border, flex, margin, width, background, height }, { scaleSize }] = useStyles()
	const logoDiameter = 28
	const diffSize = 6
	return (
		<View
			style={{
				transform: [{ translateY: -logoDiameter * 1.15 * scaleSize }],
				alignSelf: 'center',
				marginBottom: -logoDiameter * scaleSize, // compensate for transformed logo
			}}
		>
			<View
				style={[
					flex.align.center,
					flex.justify.center,
					width(logoDiameter + diffSize * scaleSize),
					height(logoDiameter + diffSize * scaleSize),
					background.white,
					border.radius.scale((logoDiameter + diffSize) / 2),
					{
						borderWidth: 2,
						borderColor: 'rgba(215, 217, 239, 1)',
					},
				]}
			>
				<Logo
					width={scaleSize * logoDiameter - diffSize}
					height={scaleSize * logoDiameter - diffSize}
					style={[margin.left.tiny]} // nudge logo to appear centered
				/>
			</View>
		</View>
	)
}

export const MessageSystemWrapper: React.FC<{
	children: any
	styleContainer?: any
	logo?: boolean
}> = ({ children, styleContainer = {}, logo = true }) => {
	const [{ padding, border, margin, width }] = useStyles()
	const logoDiameter = 28
	return (
		<View
			style={[
				{ backgroundColor: '#EDEEF8' },
				padding.medium,
				logo && margin.top.scale(logoDiameter * 0.75), // make room for logo
				width(350),
				border.radius.scale(10),
				{ shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2.5 } },
				styleContainer,
			]}
		>
			{logo && <MessageSystemLogo />}
			{children}
		</View>
	)
}

const MessageInvitationSent: React.FC<{ message: any }> = ({ message }) => {
	const [{ text }] = useStyles()
	const conversationContact = useOneToOneContact(message.conversationPublicKey)
	return (
		<Text style={[text.size.scale(14), text.align.center]}>
			You invited {conversationContact.displayName || 'this contact'} to a group! 💌
		</Text>
	)
}

const base64ToURLBase64 = (str: string) =>
	str.replace(/\+/, '-').replace(/\//, '_').replace(/\=/, '')

const MessageInvitationReceived: React.FC<{ message: any }> = ({ message }) => {
	const [{ row, flex, text, margin, color }] = useStyles()
	const client: any = useClient()
	const [error, setError] = useState(false)
	const [{ convPk, displayName }, setPdlInfo] = useState({ convPk: '', displayName: '' })
	const [accepting, setAccepting] = useState(false)
	const conv = useConversation(convPk)
	const { link } = message.payload || {}
	const acceptDisabled = useMemo(() => accepting || conv || !convPk || error, [
		accepting,
		conv,
		convPk,
		error,
	])

	// Parse deep link
	React.useEffect(() => {
		if (!convPk && link && !conv) {
			setError(false)
			client
				.parseDeepLink({
					link,
				})
				.then((reply: any) => {
					setPdlInfo({
						displayName: reply.bertyGroup.displayName,
						convPk: base64ToURLBase64(
							new Buffer(reply?.bertyGroup?.group?.publicKey || '').toString('base64'),
						),
					})
				})
				.catch((err: any) => {
					console.warn(err)
					setError(true)
				})
		}
	}, [convPk, conv, link, client])

	const handleAccept = React.useCallback(() => {
		if (convPk && !conv && !accepting && !error) {
			setAccepting(true)
			client
				.conversationJoin({ link })
				.catch((err: any) => {
					console.warn(err)
					setError(true)
				})
				.finally(() => {
					setAccepting(false)
				})
		}
	}, [client, link, conv, convPk, accepting, error])

	return (
		<React.Fragment>
			<View style={[row.left, flex.align.center, flex.justify.center]}>
				<TextNative
					style={[
						text.color.black,
						text.size.scale(15),
						text.bold.medium,
						{ fontFamily: 'Open Sans' },
					]}
				>
					GROUP INVITATION
				</TextNative>
			</View>
			<View style={[margin.top.small, flex.align.center, flex.justify.center]}>
				<ProceduralCircleAvatar seed={convPk || '42'} size={40} style={[margin.bottom.small]} />
				<TextNative
					style={[
						text.color.black,
						text.size.scale(13),
						text.bold.small,
						margin.bottom.small,
						{ fontFamily: 'Open Sans' },
					]}
				>
					{displayName}
				</TextNative>
			</View>
			<View style={[row.center, flex.justify.spaceEvenly, flex.align.center, margin.top.medium]}>
				<MessageInvitationButton
					onPress={undefined} // TODO: Command to refuse invitation
					activeOpacity={!conv ? 0.2 : 1}
					icon='close-outline'
					color={color.grey}
					title='REFUSE'
					backgroundColor={color.white}
					styleOpacity={0.6}
					disabled
				/>
				<MessageInvitationButton
					onPress={handleAccept}
					activeOpacity={!conv ? 0.2 : 1}
					icon='checkmark-outline'
					color={error ? color.grey : !conv ? color.blue : color.green}
					title={!conv ? 'ACCEPT' : 'ACCEPTED'}
					backgroundColor={error ? color.white : !conv ? color.light.blue : color.light.green}
					styleOpacity={acceptDisabled ? 0.6 : undefined}
					disabled={acceptDisabled}
				/>
			</View>
			{error && (
				<Text
					style={[
						margin.top.small,
						margin.horizontal.small,
						text.size.small,
						text.bold.small,
						text.color.red,
						text.align.center,
					]}
				>
					Error adding you to the group ☹️ Our bad!
				</Text>
			)}
		</React.Fragment>
	)
}

export const MessageInvitation: React.FC<{ message: any }> = ({ message }) => {
	const [{ row, padding, margin }] = useStyles()

	return (
		<View style={[row.center, padding.horizontal.medium, margin.bottom.small, { paddingTop: 2 }]}>
			{message.isMe ? (
				<MessageSystemWrapper logo={false}>
					<MessageInvitationSent message={message} />
				</MessageSystemWrapper>
			) : (
				<MessageSystemWrapper>
					<MessageInvitationReceived message={message} />
				</MessageSystemWrapper>
			)}
		</View>
	)
}

const interactionsFilter = (inte: any) =>
	inte.type === messengerpb.AppMessage.Type.TypeUserMessage && inte.isMe

const eventMonitorTypes = typespb.MonitorGroup.TypeEventMonitor
export const Message: React.FC<{
	id: string
	convKind: any
	members?: { [key: string]: any }
	convPK: string
	previousMessageId: string
	nextMessageId: string
}> = ({ id, convKind, members, previousMessageId, nextMessageId, convPK }) => {
	const ctx = useMsgrContext()
	const inte = useInteraction(id, convPK)
	const previousMessage = useInteraction(previousMessageId, convPK)
	const nextMessage = useInteraction(nextMessageId, convPK)
	const client: any = useClient()
	const navigation = useNativeNavigation()
	const _styles = useStylesMessage()
	const [{ row, margin, padding, column, text, border, color, flex }, { scaleSize }] = useStyles()
	const lastInte = useLastConvInteraction(convPK, interactionsFilter)
	if (!inte) {
		return null
	}
	let monitorPayload
	if (inte.type === messengerpb.AppMessage.Type.TypeMonitorMetadata) {
		/* typespb.MonitorGroup.TypeEventMonitor */
		const monitorEvent = inte.payload.event
		switch (monitorEvent.type) {
			case eventMonitorTypes.TypeEventMonitorAdvertiseGroup:
				const msgAdvertise = `local peer advertised ${monitorEvent.advertiseGroup.peerId.substr(
					monitorEvent.advertiseGroup.peerId.length - 10,
				)} on ${monitorEvent.advertiseGroup.driverName}, with ${
					monitorEvent.advertiseGroup.maddrs.length
				} maddrs:`
				const addrsAdvertise = monitorEvent.advertiseGroup.maddrs.map((addr: string) => `--${addr}`)
				monitorPayload = [msgAdvertise, ...addrsAdvertise].join('\n')
				break
			case eventMonitorTypes.TypeEventMonitorPeerFound:
				const msgPeerFound = `new peer found ${monitorEvent.peerFound.peerId.substr(
					monitorEvent.peerFound.peerId.length - 10,
				)} on ${monitorEvent.peerFound.driverName}, with ${
					monitorEvent.peerFound.maddrs.length
				} maddrs:`
				const addrsPeerFound = monitorEvent.peerFound.maddrs.map((addr: string) => `--${addr}`)
				monitorPayload = [msgPeerFound, ...addrsPeerFound].join('\n')
				break
			case eventMonitorTypes.TypeEventMonitorPeerJoin:
				if (monitorEvent.peerJoin.isSelf) {
					monitorPayload = 'you just joined this group'
				} else {
					let activeAddr = '<unknown>'
					if (monitorEvent.peerJoin.maddrs.length) {
						activeAddr = monitorEvent.peerJoin.maddrs[0]
					}
					monitorPayload = `peer joined ${monitorEvent.peerJoin.peerId.substr(
						monitorEvent.peerJoin.peerId.length - 10,
					)} on: ${activeAddr}`
				}
				break
			case eventMonitorTypes.TypeEventMonitorPeerLeave:
				if (monitorEvent.peerLeave.isSelf) {
					monitorPayload = 'you just leaved this group'
				} else {
					monitorPayload = `peer leaved ${monitorEvent.peerLeave.peerId.substr(
						monitorEvent.peerLeave.peerId.length - 10,
					)}`
				}
				break
			default:
				console.log('undefined event type', monitorEvent)
				monitorPayload = 'undefined'
		}
	}
	const isGroup = convKind === messengerpb.Conversation.Type.MultiMemberType
	let name
	let baseColor = color.blue
	let isFollowupMessage = false
	let isFollowedMessage = false
	let isWithinCollapseDuration = false
	const sentDate = pbDateToNum(inte?.sentDate)
	if (inte.type === messengerpb.AppMessage.Type.TypeUserMessage) {
		if (inte.memberPublicKey && members && members[inte.memberPublicKey]) {
			name = members[inte.memberPublicKey].displayName
		}
		const cmd = null /*messenger.message.isCommandMessage(payload.body)*/
		let msgTextColor, msgBackgroundColor, msgBorderColor, msgSenderColor
		if (convKind === messengerpb.Conversation.Type.ContactType) {
			msgTextColor = inte.isMe
				? inte.acknowledged
					? color.white
					: cmd
					? color.grey
					: color.blue
				: color.blue
			msgBackgroundColor = inte.isMe ? (inte.acknowledged ? color.blue : color.white) : '#CED2FF99'
			msgBorderColor = inte.isMe && (cmd ? border.color.grey : border.color.blue)

			isWithinCollapseDuration =
				nextMessage &&
				inte?.isMe === nextMessage?.isMe &&
				sentDate &&
				nextMessage.sentDate &&
				(parseInt(nextMessage?.sentDate, 10) || 0) - (sentDate || 0) < 60000 // one minute
		} else {
			isFollowupMessage =
				previousMessage && !inte.isMe && inte.memberPublicKey === previousMessage.memberPublicKey
			isFollowedMessage =
				nextMessage && !inte.isMe && inte.memberPublicKey === nextMessage.memberPublicKey

			isWithinCollapseDuration =
				nextMessage &&
				inte?.memberPublicKey === nextMessage?.memberPublicKey &&
				sentDate &&
				nextMessage.sentDate &&
				(parseInt(nextMessage?.sentDate, 10) || 0) - (sentDate || 0) < 60000 // one minute

			if (!inte.isMe && inte.memberPublicKey) {
				const h = new SHA3(256).update(inte.memberPublicKey).digest()
				baseColor = '#' + pal[h[0]]
			}
			msgTextColor = inte.isMe
				? inte.acknowledged
					? color.white
					: cmd
					? color.grey
					: baseColor
				: baseColor
			msgBackgroundColor = inte.isMe
				? inte.acknowledged
					? baseColor
					: color.white
				: Color(baseColor).alpha(0.1).string()
			msgBorderColor = inte.isMe && (cmd ? border.color.grey : { borderColor: baseColor })
			msgSenderColor = inte.isMe ? 'red' : baseColor
			console.log('State', inte.isMe, isGroup, name, isFollowupMessage)
		}

		return (
			<View
				style={[
					row.left,
					inte.isMe ? _styles.isMeMessage : _styles.isOtherMessage,
					padding.horizontal.medium,
					padding.top.scale(2),
				]}
			>
				{!inte.isMe && isGroup && !isFollowedMessage && (
					<ProceduralCircleAvatar
						style={_styles.circleAvatarUserMessage}
						seed={inte.memberPublicKey}
						size={40 * scaleSize}
					/>
				)}
				<View style={[column.top, _styles.messageItem]}>
					{!inte.isMe && isGroup && !isFollowupMessage && (
						<View style={[isFollowedMessage && margin.left.scale(40)]}>
							<Text
								style={[text.bold.medium, _styles.personNameInGroup, { color: msgSenderColor }]}
							>
								{name || ''}
							</Text>
						</View>
					)}
					<View
						style={[
							border.radius.top.medium,
							inte.isMe ? border.radius.left.medium : border.radius.right.medium,
							msgBorderColor,
							inte.isMe && border.scale(2),
							padding.horizontal.scale(inte.isMe ? 11 : 13),
							padding.vertical.scale(inte.isMe ? 7 : 9),
							inte.isMe ? column.item.right : column.item.left,
							isFollowedMessage && margin.left.scale(35),
							{
								backgroundColor: msgBackgroundColor,
							},
						]}
					>
						<Hyperlink
							onPress={async (url) => {
								if (await isBertyDeepLink(client, url)) {
									navigation.navigate('Modals', {
										screen: 'ManageDeepLink',
										params: { type: 'link', value: url },
									})
									return
								}

								Linking.canOpenURL(url).then((supported) => supported && Linking.openURL(url))
							}}
							linkStyle={{ textDecorationLine: 'underline' }}
						>
							<Text
								style={[
									{
										color: msgTextColor,
										fontSize: 12,
										lineHeight: 17,
									},
								]}
							>
								{inte.payload.body}
							</Text>
						</Hyperlink>
					</View>
					{/* Timestamp & status */}
					{!isWithinCollapseDuration && (
						<View
							style={[
								row.left,
								flex.align.center,
								margin.top.tiny,
								margin.bottom.tiny,
								inte.isMe && row.item.bottom,
							]}
						>
							<Text style={[_styles.dateMessage, isFollowedMessage && margin.left.scale(35)]}>
								{sentDate > 0 ? timeFormat.fmtTimestamp3(sentDate) : ''}{' '}
							</Text>
							{!cmd && lastInte?.cid.toString() === id.toString() && (
								<>
									{inte.isMe && (
										<Icon
											name={inte.acknowledged ? 'navigation-2' : 'navigation-2-outline'}
											width={12}
											height={12}
											fill={color.blue}
											style={[padding.left.tiny, { marginTop: 1 * scaleSize }]}
										/>
									)}
									{inte.isMe && (
										<Text style={[_styles.stateMessageValueMe]}>
											{inte.acknowledged ? 'sent' : 'sending...'}
										</Text>
									)}
								</>
							)}
						</View>
					)}
				</View>
			</View>
		)
	} else if (
		inte.type === messengerpb.AppMessage.Type.TypeGroupInvitation &&
		convKind === messengerpb.Conversation.Type.ContactType
	) {
		return (
			<>
				<View style={[padding.horizontal.medium]}>
					<Text
						style={[
							inte.isMe ? text.align.right : text.align.left,
							text.color.grey,
							_styles.dateMessage,
						]}
					>
						{sentDate ? timeFormat.fmtTimestamp3(sentDate) : ''}{' '}
					</Text>
				</View>
				<MessageInvitation message={inte} />
			</>
		)
	} else if (inte.type === messengerpb.AppMessage.Type.TypeReplyOptions) {
		return (
			<>
				<View style={[padding.horizontal.medium]}>
					<QuickReplyOptions convPk={convPK} options={inte.payload.options} />
				</View>
			</>
		)
	} else if (
		inte.type === messengerpb.AppMessage.Type.TypeMonitorMetadata &&
		ctx?.persistentOptions[PersistentOptionsKeys.Debug].enable
	) {
		return (
			<View style={[padding.vertical.tiny, padding.horizontal.medium]}>
				<Text
					style={[
						{ textAlign: 'center', fontFamily: 'Open Sans' },
						text.color.black,
						text.bold.small,
						text.size.scale(14),
					]}
				>
					{monitorPayload}
				</Text>
				<Text
					style={[
						{ fontFamily: 'Open Sans', alignSelf: 'flex-end' },
						text.bold.small,
						text.color.black,
						text.size.small,
					]}
				>
					{timeFormat.fmtTimestamp3(sentDate)}
				</Text>
			</View>
		)
	} else {
		return null
	}
}

export const QuickReplyOptions: React.FC<{
	convPk: string
	options: Array<{ display: string; payload: string }>
}> = ({ convPk, options }) => {
	const [{ flex }] = useStyles()

	return (
		<View style={[flex.align.start]}>
			{(options || []).map((opt) => (
				<QuickReplyOption key={opt.display} convPk={convPk} option={opt} />
			))}
		</View>
	)
}

const QuickReplyOption: React.FC<{
	convPk: string
	option: { display: string; payload: string }
}> = ({ convPk, option }) => {
	const ctx: any = useMsgrContext()
	const [{ padding, border, margin }] = useStyles()

	return (
		<TouchableOpacity
			onPress={() => {
				const usermsg = { body: option.payload, sentDate: Date.now() }
				const buf = messengerpb.AppMessage.UserMessage.encode(usermsg).finish()

				ctx.client
					?.interact({
						conversationPublicKey: convPk,
						type: messengerpb.AppMessage.Type.TypeUserMessage,
						payload: buf,
					})
					.catch((e: any) => {
						console.warn('e sending message:', e)
					})
			}}
		>
			<View
				style={[
					border.radius.top.small,
					border.radius.left.small,
					border.radius.right.small,
					margin.top.tiny,
					border.color.grey,
					border.scale(2),
					padding.horizontal.scale(8),
					padding.vertical.scale(4),
				]}
			>
				<Text>{option.display}</Text>
			</View>
		</TouchableOpacity>
	)
}
