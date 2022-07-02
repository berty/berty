import { Icon } from '@ui-kitten/components'
import base64 from 'base64-js'
import Long from 'long'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import beapi from '@berty/api'
import { useStyles } from '@berty/contexts/styles'
import {
	useMessengerClient,
	useOneToOneContact,
	usePlaySound,
	useProtocolClient,
	useThemeColor,
} from '@berty/hooks'
import { pbDateToNum, timeFormat } from '@berty/utils/convert/time'

import { ContactAvatar } from './avatars'
import { SecondaryButtonIconLeft, TertiaryButtonIconLeft, PrimaryButton } from './buttons'
import { ChatDate } from './chat/ChatDate'
import { MessageSystemWrapper } from './chat/message/MessageSystemWrapper'
import { HorizontalDuo } from './layout'
import { UnifiedText } from './shared-components/UnifiedText'

const useStylesOneToOne = () => {
	const { text } = useStyles()
	const colors = useThemeColor()

	return {
		dateMessage: [text.size.tiny, text.light, { color: colors['secondary-text'] }],
	}
}

const InfosContactState: React.FC<{ state: any }> = ({ state }) => {
	const { text, border, padding, margin } = useStyles()
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
			<UnifiedText style={[text.light, padding.left.small, text.italic, { color: textColor }]}>
				{state}
			</UnifiedText>
		</View>
	)
}

const ContactRequestBox: React.FC<{ contact: beapi.messenger.IContact; isAccepted: boolean }> = ({
	contact,
	isAccepted,
}) => {
	const { publicKey, displayName } = contact
	const { row, flex, text, margin } = useStyles()
	const { t } = useTranslation()

	const [accepting, setAccepting] = useState(false)
	const playSound = usePlaySound()

	const client = useMessengerClient()
	const decline = () => {}
	const acceptDisabled = isAccepted || accepting

	return (
		<View>
			<View style={[row.left, flex.align.center, flex.justify.center]}>
				<UnifiedText style={[text.bold, { textTransform: 'uppercase' }]}>
					{t('chat.one-to-one.contact-request-box.title')}
				</UnifiedText>
			</View>
			<View style={[margin.top.small, flex.align.center, flex.justify.center]}>
				<View style={margin.bottom.small}>
					<ContactAvatar publicKey={publicKey} size={40} />
				</View>
				<UnifiedText style={[text.size.small, text.light, margin.bottom.small]}>
					{displayName}
				</UnifiedText>
			</View>
			<View style={[margin.top.small, margin.horizontal.large]}>
				<HorizontalDuo>
					<TertiaryButtonIconLeft name='close-outline' onPress={decline} disabled>
						{t('chat.one-to-one.contact-request-box.refuse-button')}
					</TertiaryButtonIconLeft>
					<SecondaryButtonIconLeft
						disabled={acceptDisabled}
						loading={accepting}
						onPress={async () => {
							try {
								if (!client || accepting) {
									return
								}
								setAccepting(true)
								await client.contactAccept({ publicKey })
								playSound('contactRequestAccepted')
							} catch (err) {
								console.warn('Failed to accept contact request:', err)
							}
							setAccepting(false)
						}}
					>
						{!acceptDisabled
							? t('chat.one-to-one.contact-request-box.accept-button')
							: t('chat.one-to-one.contact-request-box.accepted-button')}
					</SecondaryButtonIconLeft>
				</HorizontalDuo>
			</View>
		</View>
	)
}

export const InfosChat: React.FC<beapi.messenger.IConversation> = ({
	createdDate: createdDateStr,
	publicKey,
}) => {
	const { flex, text, padding, margin } = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()

	const { dateMessage } = useStylesOneToOne()
	const createdDate = pbDateToNum(createdDateStr) || Date.now()
	const contact = useOneToOneContact(publicKey || '')
	const protocolClient = useProtocolClient()

	const isAccepted = contact?.state === beapi.messenger.Contact.State.Accepted
	const isIncoming = contact?.state === beapi.messenger.Contact.State.IncomingRequest
	const textColor = colors['background-header']

	const [isRefresh, setIsRefresh] = useState<boolean>(false)
	const handleRefreshButton = useCallback(async () => {
		if (!contact?.publicKey) {
			console.warn("Failed to refresh: contact.publicKey doesn't exist.")
			return
		}
		setIsRefresh(true)
		try {
			// this function takes 20sec max
			await protocolClient?.refreshContactRequest({
				contactPk: new Uint8Array(base64.toByteArray(contact?.publicKey)),
				timeout: Long.fromInt(5),
			})
		} catch (e) {
			console.warn(e)
		}

		setIsRefresh(false)
	}, [contact?.publicKey, protocolClient])

	return (
		<View style={[padding.medium]}>
			<View style={[flex.align.center]}>
				<ChatDate date={createdDate} />
				{!isIncoming ? (
					<MessageSystemWrapper styleContainer={[margin.bottom.small, margin.top.large]}>
						<UnifiedText style={[text.align.center, { color: textColor }]}>
							{isAccepted
								? t('chat.one-to-one.infos-chat.connection-confirmed')
								: t('chat.one-to-one.infos-chat.request-sent')}
						</UnifiedText>
					</MessageSystemWrapper>
				) : (
					<MessageSystemWrapper>
						<ContactRequestBox contact={contact} isAccepted={isAccepted} />
					</MessageSystemWrapper>
				)}
				{!isAccepted && contact?.state !== beapi.messenger.Contact.State.Undefined && (
					<>
						<View style={[flex.align.center]}>
							<UnifiedText style={[margin.top.tiny, dateMessage]}>
								{timeFormat.fmtTimestamp1(pbDateToNum(createdDate))}
							</UnifiedText>
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
			<View style={[flex.tiny, margin.top.small]}>
				<PrimaryButton loading={isRefresh} onPress={handleRefreshButton} disabled={isRefresh}>
					{t('chat.one-to-one.infos-chat.refresh-button')}
				</PrimaryButton>
			</View>
		</View>
	)
}
