import { Messenger } from '@berty-tech/hooks'
import { messenger } from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import Color from 'color'
import palette from 'google-palette'
import React from 'react'
import { Text as TextNative, TouchableOpacity, View } from 'react-native'
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

const formatTimestamp = (date: Date) => {
	const arr = date.toString().split(' ')
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
}> = ({ onPress, activeOpacity, backgroundColor, icon, color, title, styleOpacity }) => {
	const [{ flex, padding, border, width, row, text, opacity }] = useStyles()
	return (
		<TouchableOpacity style={[flex.align.center]} activeOpacity={activeOpacity} onPress={onPress}>
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

const MessageInvitationWrapper: React.FC<{ message: any; children: any }> = ({ children }) => {
	const [{ padding, border, flex, margin, width, background, height }, { scaleSize }] = useStyles()
	const logoDiameter = 40
	const diffSize = 10
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
					transform: [{ translateY: -logoDiameter * 1.3 * scaleSize }],
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

export const MessageInvitation: React.FC<{ message: any }> = ({ message }) => {
	const [{ row, padding, flex, text, margin, color }] = useStyles()
	const acceptGroupInvitation = Messenger.useAcceptGroupInvitation()
	const conv = Messenger.useGetConversation(message.group.publicKey)

	return (
		<View
			style={[row.center, padding.horizontal.medium, margin.bottom.scale(11), { paddingTop: 2 }]}
		>
			{message.isMe ? (
				<MessageInvitationWrapper message={message}>
					<View style={[row.center, flex.justify.spaceEvenly, flex.align.center]}>
						<Text style={[text.size.scale(14)]}>
							You have sent an invitation to join {message.name}!
						</Text>
					</View>
				</MessageInvitationWrapper>
			) : (
				<MessageInvitationWrapper message={message}>
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
						<ProceduralCircleAvatar
							seed={message.group.publicKey}
							size={40}
							style={[margin.bottom.small]}
						/>
						<TextNative
							style={[
								text.color.black,
								text.size.scale(13),
								text.bold.small,
								margin.bottom.small,
								{ fontFamily: 'Open Sans' },
							]}
						>
							{message.name}
						</TextNative>
					</View>
					<View
						style={[row.center, flex.justify.spaceEvenly, flex.align.center, margin.top.medium]}
					>
						<MessageInvitationButton
							onPress={undefined} // TODO: Command to refuse invitation
							activeOpacity={!conv ? 0.2 : 1}
							icon='close-outline'
							color={color.grey}
							title='REFUSE'
							backgroundColor={color.white}
							styleOpacity={0.6}
						/>
						<MessageInvitationButton
							onPress={
								!conv
									? () => {
											acceptGroupInvitation({ message })
									  }
									: undefined
							}
							activeOpacity={!conv ? 0.2 : 1}
							icon='checkmark-outline'
							color={!conv ? color.blue : color.green}
							title={!conv ? 'ACCEPT' : 'ACCEPTED'}
							backgroundColor={!conv ? color.light.blue : color.light.green}
						/>
					</View>
				</MessageInvitationWrapper>
			)}
		</View>
	)
}

export const Message: React.FC<{
	id: string
	convKind: '1to1' | 'multi'
	membersNames?: { [key: string]: string | undefined }
	previousMessageId: string
}> = ({ id, convKind, membersNames, previousMessageId }) => {
	const message = Messenger.useGetMessage(id)
	const previousMessage = Messenger.useGetMessage(previousMessageId)

	const _styles = useStylesMessage()
	const [{ row, margin, padding, column, text, border, color, width }] = useStyles()
	if (!message) {
		return null
	}
	const isGroup = convKind === 'multi'
	const styleMsg = null
	let name
	let baseColor = color.blue
	let isFollowupMessage = false
	let isWithinTenMinsAfter = false
	if (message.type === messenger.AppMessageType.UserMessage) {
		if (message.memberPk && membersNames) {
			name = membersNames[message.memberPk]
		}
		const payload = message
		const cmd = messenger.message.isCommandMessage(payload.body)
		let msgTextColor, msgBackgroundColor, msgBorderColor, msgSenderColor
		if (convKind === '1to1') {
			msgTextColor = payload.isMe
				? payload.acknowledged
					? color.white
					: cmd
					? color.grey
					: color.blue
				: color.blue
			msgBackgroundColor = payload.isMe
				? payload.acknowledged
					? color.blue
					: color.white
				: '#CED2FF99'
			msgBorderColor = payload.isMe && (cmd ? border.color.grey : border.color.blue)
		} else {
			isFollowupMessage =
				previousMessage && !payload.isMe && payload.memberPk === previousMessage.memberPk

			isWithinTenMinsAfter =
				previousMessage &&
				payload?.memberPk === previousMessage?.memberPk &&
				payload.sentDate &&
				previousMessage.sentDate &&
				Math.abs((payload?.sentDate || 0) - (previousMessage?.sentDate || 0)) < 10 * 6000

			if (!message.isMe && message.memberPk) {
				const h = new SHA3(256).update(message.memberPk).digest()
				baseColor = '#' + pal[h[0]]
			}
			msgTextColor = payload.isMe
				? payload.acknowledged
					? color.white
					: cmd
					? color.grey
					: baseColor
				: baseColor
			msgBackgroundColor = payload.isMe
				? payload.acknowledged
					? baseColor
					: color.white
				: Color(baseColor).alpha(0.1)
			msgBorderColor = payload.isMe && (cmd ? border.color.grey : { borderColor: baseColor })
			msgSenderColor = payload.isMe ? 'red' : Color(baseColor).alpha(0.4)
		}

		return (
			<View
				style={[
					row.left,
					payload.isMe ? _styles.isMeMessage : _styles.isOtherMessage,
					padding.horizontal.medium,
					padding.top.scale(2),
				]}
			>
				{!payload.isMe && isGroup && !isFollowupMessage && (
					<ProceduralCircleAvatar style={_styles.circleAvatar} seed={message.memberPk} size={35} />
				)}
				<View style={[column.top, _styles.messageItem]}>
					<View
						style={[
							padding.small,
							border.radius.top.medium,
							payload.isMe ? border.radius.left.medium : border.radius.right.medium,
							styleMsg,
							msgBorderColor,
							payload.isMe && border.scale(2),
							padding.horizontal.scale(payload.isMe ? 11 : 13),
							padding.vertical.scale(payload.isMe ? 7 : 9),
							payload.isMe ? column.item.right : column.item.right,
							isFollowupMessage && margin.left.scale(35),
							{
								backgroundColor: msgBackgroundColor,
							},
						]}
					>
						{!payload.isMe && isGroup && name && !isFollowupMessage && (
							<View>
								<Text
									style={[text.bold.medium, _styles.personNameInGroup, { color: msgSenderColor }]}
								>
									{name}
								</Text>
							</View>
						)}
						<Text
							style={[
								{
									color: msgTextColor,
									fontSize: 12,
									lineHeight: 17,
								},
							]}
						>
							{payload.body}
						</Text>
					</View>
					<View style={[payload.isMe && row.item.bottom]}>
						<View style={[row.left, { alignItems: 'center' }]}>
							{!isWithinTenMinsAfter && (
								<Text
									style={[
										text.color.grey,
										padding.right.scale(5),
										_styles.dateMessage,
										isFollowupMessage && margin.left.scale(35),
										{ fontSize: 9 },
									]}
								>
									{formatTimestamp(new Date(payload.sentDate))}{' '}
								</Text>
							)}
							{!cmd && (
								<>
									{payload.isMe && (
										<Icon
											name={payload.acknowledged ? 'navigation-2' : 'navigation-2-outline'}
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
										{payload.isMe ? (payload.acknowledged ? 'sent' : 'sending...') : ''}
									</Text>
								</>
							)}
						</View>
					</View>
				</View>
			</View>
		)
	} else if (message.type === messenger.AppMessageType.GroupInvitation) {
		return <MessageInvitation message={message} />
	} else {
		return null
	}
}
