import { messenger as messengerpb } from '@berty-tech/api/index.js'
import {
	useClient,
	useConversation,
	useInteraction,
	useOneToOneContact,
} from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'
import Color from 'color'
import palette from 'google-palette'
import React, { useMemo, useState } from 'react'
import { Text as TextNative, TouchableOpacity, View } from 'react-native'
import Hyperlink from 'react-native-hyperlink'
import { Icon, Text } from 'react-native-ui-kitten'
import { SHA3 } from 'sha3'
import Logo from '../../main/1_berty_picto.svg'
import { ProceduralCircleAvatar } from '../../shared-components'

const pal = palette('tol-rainbow', 256)

//
// Message => All messages (group/contact)
//

// Types
// Styles
const useStylesMessage = () => {
	const [{ row, text, padding }] = useStyles()
	return {
		isMeMessage: [row.item.bottom, { maxWidth: '90%' }],
		isOtherMessage: [row.item.top, { maxWidth: '90%' }],
		circleAvatar: [row.item.center],
		messageItem: [],
		personNameInGroup: text.size.tiny,
		dateMessage: text.size.tiny,
		dateMessageWithState: [padding.right.scale(5), text.size.tiny],
		stateMessageValue: [padding.left.scale(1.5), text.size.tiny],
	}
}

const formatTimestamp = (date: Date | number) => {
	let d = date
	if (typeof date === 'number') {
		d = new Date()
		d.setTime(date)
	}
	if (!d) {
		return 'x'
	}
	const arr = d.toString().split(' ')
	if (!arr[4]) {
		return '?'
	}
	const hours = arr[4].split(':')
	const hour = hours[0] + ':' + hours[1]
	return hour
}

const MessageInvitationButton: React.FC<{
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

const MessageInvitationWrapper: React.FC<{ children: any }> = ({ children }) => {
	const [{ padding, border, flex, margin, width, background, height }, { scaleSize }] = useStyles()
	const logoDiameter = 28
	const diffSize = 6
	return (
		<View
			style={[
				{ backgroundColor: '#EDEEF8' },
				padding.medium,
				margin.top.scale(logoDiameter), // make room for logo
				width(350),
				border.radius.scale(10),
				{ shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2.5 } },
			]}
		>
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
			{children}
		</View>
	)
}

const MessageInvitationSent: React.FC<{ message: any }> = ({ message }) => {
	const [{ row, flex, text }] = useStyles()
	const conversationContact = useOneToOneContact(message.conversationPublicKey)
	return (
		<View style={[row.center, flex.justify.spaceEvenly, flex.align.center]}>
			<Text style={[text.size.scale(14)]}>
				You have sent an invitation to {conversationContact.displayName || '<unnamed user!>'}!
			</Text>
		</View>
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
					color={!conv ? color.blue : color.green}
					title={!conv ? 'ACCEPT' : 'ACCEPTED'}
					backgroundColor={!conv ? color.light.blue : color.light.green}
					styleOpacity={acceptDisabled ? 0.6 : undefined}
					disabled={acceptDisabled}
				/>
			</View>
		</React.Fragment>
	)
}

export const MessageInvitation: React.FC<{ message: any }> = ({ message }) => {
	const [{ row, padding, margin }] = useStyles()

	return (
		<View
			style={[row.center, padding.horizontal.medium, margin.bottom.scale(11), { paddingTop: 2 }]}
		>
			{message.isMe ? (
				<MessageInvitationWrapper>
					<MessageInvitationSent message={message} />
				</MessageInvitationWrapper>
			) : (
				<MessageInvitationWrapper>
					<MessageInvitationReceived message={message} />
				</MessageInvitationWrapper>
			)}
		</View>
	)
}

export const Message: React.FC<{
	id: string
	convKind: any
	members?: { [key: string]: any }
	convPK: string
	previousMessageId: string
	nextMessageId: string
}> = ({ id, convKind, members, previousMessageId, nextMessageId, convPK }) => {
	const inte = useInteraction(id, convPK)
	const previousMessage = useInteraction(previousMessageId, convPK)
	const nextMessage = useInteraction(nextMessageId, convPK)
	const _styles = useStylesMessage()
	const [{ row, margin, padding, column, text, border, color }] = useStyles()
	if (!inte) {
		return null
	}
	const isGroup = convKind === messengerpb.Conversation.Type.MultiMemberType
	let name
	let baseColor = color.blue
	let isFollowupMessage = false
	let isFollowedMessage = false
	let isWithinCollapseDuration = false
	const sentDate = inte?.sentDate && parseInt(inte.sentDate, 10)
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
						style={(_styles.circleAvatar, { alignSelf: 'flex-end' })}
						seed={inte.memberPublicKey}
						size={35}
					/>
				)}
				<View style={[column.top, _styles.messageItem]}>
					{!inte.isMe && isGroup && !isFollowupMessage && (
						<View style={[{ paddingLeft: 10 }, isFollowedMessage && margin.left.scale(35)]}>
							<Text
								style={[text.bold.medium, _styles.personNameInGroup, { color: msgSenderColor }]}
							>
								{name || ''}
							</Text>
						</View>
					)}
					<View
						style={[
							padding.small,
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
						<Hyperlink linkDefault={true} linkStyle={{ textDecorationLine: 'underline' }}>
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
					<View style={[inte.isMe && row.item.bottom]}>
						<View style={[row.left, { alignItems: 'center' }]}>
							{!isWithinCollapseDuration && (
								<Text
									style={[
										text.color.grey,
										padding.right.scale(5),
										_styles.dateMessage,
										isFollowedMessage && margin.left.scale(35),
										{ fontSize: 9 },
									]}
								>
									{sentDate ? formatTimestamp(sentDate) : ''}{' '}
								</Text>
							)}
							{!cmd && !isWithinCollapseDuration && (
								<>
									{inte.isMe && (
										<Icon
											name={inte.acknowledged ? 'navigation-2' : 'navigation-2-outline'}
											width={12}
											height={12}
											fill={color.blue}
										/>
									)}
									<Text
										style={[
											text.color.blue,
											padding.left.scale(2),
											_styles.dateMessage,
											{ fontSize: 10, lineHeight: 11, textAlignVertical: 'center' },
										]}
									>
										{inte.isMe ? (inte.acknowledged ? 'sent' : 'sending...') : ''}
									</Text>
								</>
							)}
						</View>
					</View>
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
						{sentDate ? formatTimestamp(sentDate) : ''}{' '}
					</Text>
				</View>
				<MessageInvitation message={inte} />
			</>
		)
	} else {
		return null
	}
}
