import React, { useEffect, useState } from 'react'
import { Text as TextNative, View } from 'react-native'
import { Translation } from 'react-i18next'
import { Icon, Text } from '@ui-kitten/components'

import beapi from '@berty-tech/api'
import { useStyles } from '@berty-tech/styles'
import { useMsgrContext } from '@berty-tech/store/context'
import { useClient, useThemeColor } from '@berty-tech/store/hooks'

import { pbDateToNum, timeFormat } from './helpers'
import { ContactAvatar } from './avatars'
import { MessageSystemWrapper } from './chat/message/MessageSystemWrapper'
import { MessageInvitationButton } from './chat/message/MessageInvitation'
import { ChatDate } from './chat/common'

const useStylesOneToOne = () => {
	const [{ text }] = useStyles()
	const colors = useThemeColor()

	return {
		dateMessage: [text.size.scale(11), text.bold.small, { color: colors['secondary-text'] }],
	}
}

const InfosContactState: React.FC<{ state: any }> = ({ state }) => {
	const [{ text, border, padding, margin }] = useStyles()
	const colors = useThemeColor()

	const textColor = colors['background-header']
	return (
		<View
			style={[
				border.radius.medium,
				padding.tiny,
				padding.horizontal.medium,
				margin.top.tiny,
				{
					flexDirection: 'row',
					justifyContent: 'space-evenly',
					alignItems: 'center',
					backgroundColor: colors['main-background'],
				},
			]}
		>
			<Icon name='info-outline' fill={textColor} width={25} height={25} />
			<Text style={[text.italic, text.bold.small, padding.left.small, { color: textColor }]}>
				{state}
			</Text>
		</View>
	)
}

const ContactRequestBox: React.FC<{ contact: any; isAccepted: boolean }> = ({
	contact,
	isAccepted,
}) => {
	const { publicKey, displayName } = contact
	const [{ row, flex, text, margin }] = useStyles()
	const colors = useThemeColor()

	const [acceptDisabled, setAcceptDisabled] = useState<boolean>(false)
	const { playSound } = useMsgrContext()

	const client = useClient()
	const decline: any = () => {}

	useEffect(() => {
		if (isAccepted) {
			setAcceptDisabled(true)
		}
	}, [isAccepted])

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View>
					<View style={[row.left, flex.align.center, flex.justify.center]}>
						<TextNative
							style={[
								text.size.scale(15),
								text.bold.medium,
								{ fontFamily: 'Open Sans', color: colors['main-text'] },
							]}
						>
							{t('chat.one-to-one.contact-request-box.title')}
						</TextNative>
					</View>
					<View style={[margin.top.small, flex.align.center, flex.justify.center]}>
						<View style={margin.bottom.small}>
							<ContactAvatar publicKey={publicKey} size={40} />
						</View>
						<TextNative
							style={[
								text.size.scale(13),
								text.bold.small,
								margin.bottom.small,
								{ fontFamily: 'Open Sans', color: colors['main-text'] },
							]}
						>
							{displayName}
						</TextNative>
					</View>
					<View
						style={[row.center, flex.justify.spaceEvenly, flex.align.center, margin.top.medium]}
					>
						<MessageInvitationButton
							onPress={() => decline()}
							activeOpacity={!acceptDisabled ? 0.2 : 1}
							icon='close-outline'
							color={colors['secondary-text']}
							title={t('chat.one-to-one.contact-request-box.refuse-button')}
							backgroundColor={colors['main-background']}
							styleOpacity={0.6}
							disabled
						/>
						<MessageInvitationButton
							onPress={() =>
								client &&
								client
									.contactAccept({ publicKey })
									.then(() => {
										playSound('contactRequestAccepted')
									})
									.catch((err: any) => console.warn('Failed to accept contact request:', err))
							}
							activeOpacity={!acceptDisabled ? 0.2 : 1}
							icon='checkmark-outline'
							color={!acceptDisabled ? colors['background-header'] : colors['secondary-text']}
							title={
								!acceptDisabled
									? t('chat.one-to-one.contact-request-box.accept-button')
									: t('chat.one-to-one.contact-request-box.accepted-button')
							}
							backgroundColor={
								!acceptDisabled ? colors['positive-asset'] : colors['secondary-text']
							}
							styleOpacity={acceptDisabled ? 0.6 : undefined}
							disabled={acceptDisabled}
						/>
					</View>
				</View>
			)}
		</Translation>
	)
}

export const InfosChat: React.FC<beapi.messenger.IConversation> = ({
	createdDate: createdDateStr,
	publicKey,
}) => {
	const [{ flex, text, padding, margin }] = useStyles()
	const colors = useThemeColor()

	const { dateMessage } = useStylesOneToOne()
	const createdDate = pbDateToNum(createdDateStr) || Date.now()
	const ctx = useMsgrContext()
	const contact =
		Object.values(ctx.contacts).find((c: any) => c.conversationPublicKey === publicKey) || null

	const isAccepted = contact?.state === beapi.messenger.Contact.State.Accepted
	const isIncoming = contact?.state === beapi.messenger.Contact.State.IncomingRequest
	const textColor = colors['background-header']

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View style={[padding.medium, flex.align.center]}>
					<ChatDate date={createdDate} />
					{!isIncoming ? (
						<MessageSystemWrapper styleContainer={[margin.bottom.small, margin.top.large]}>
							<Text style={[text.align.center, { color: textColor }]}>
								{isAccepted
									? t('chat.one-to-one.infos-chat.connection-confirmed')
									: t('chat.one-to-one.infos-chat.request-sent')}
							</Text>
						</MessageSystemWrapper>
					) : (
						<MessageSystemWrapper>
							<ContactRequestBox contact={contact} isAccepted={isAccepted} />
						</MessageSystemWrapper>
					)}
					{!isAccepted && contact?.state !== beapi.messenger.Contact.State.Undefined && (
						<>
							<View style={[flex.align.center]}>
								<Text style={[margin.top.tiny, dateMessage]}>
									{timeFormat.fmtTimestamp1(pbDateToNum(createdDate))}
								</Text>
							</View>
							<InfosContactState
								state={
									isIncoming
										? t('chat.one-to-one.infos-chat.incoming')
										: t('chat.one-to-one.infos-chat.outgoing')
								}
							/>
						</>
					)}
				</View>
			)}
		</Translation>
	)
}
