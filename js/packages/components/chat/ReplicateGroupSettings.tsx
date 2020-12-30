import React from 'react'
import { ScrollView, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { Layout } from '@ui-kitten/components'
import { colors } from 'react-native-elements'

import { useStyles } from '@berty-tech/styles'
import { useConversation, useMsgrContext, Maybe } from '@berty-tech/store/hooks'
import { ScreenProps } from '@berty-tech/navigation'
import {
	servicesAuthViaDefault,
	useAccountServices,
	serviceTypes,
	replicateGroup,
} from '@berty-tech/store/services'
import beapi from '@berty-tech/api'

import HeaderSettings from '../shared-components/Header'
import { ButtonSetting, FactionButtonSetting } from '../shared-components'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'

enum replicationServerStatus {
	KnownServerEnabled,
	KnownServerNotEnabled,
	UnknownServerEnabled,
}

type TokenUsageStatus = {
	service: beapi.messenger.IServiceToken
	status: replicationServerStatus
}

const getAllReplicationStatusForConversation = (
	conversation: beapi.messenger.IConversation | undefined,
	services: Array<beapi.messenger.IServiceToken>,
): Array<TokenUsageStatus> => {
	const allServers =
		conversation?.replicationInfo?.reduce<{
			[key: string]: { service: beapi.messenger.IServiceToken; status: replicationServerStatus }
		}>((servers, r) => {
			if (typeof r.authenticationUrl !== 'string') {
				return servers
			}

			return {
				...servers,
				[r.authenticationUrl]: {
					service: {
						authenticationUrl: r.authenticationUrl,
					},
					status: replicationServerStatus.UnknownServerEnabled,
				},
			}
		}, {}) || {}

	for (const s of services.filter((t) => t.serviceType === serviceTypes.Replication)) {
		if (typeof s.authenticationUrl !== 'string') {
			continue
		}

		allServers[s.authenticationUrl] = {
			status:
				allServers[s.authenticationUrl] !== undefined
					? replicationServerStatus.KnownServerEnabled
					: replicationServerStatus.KnownServerNotEnabled,
			service: s,
		}
	}

	return Object.values(allServers).sort((a, b) => a.status - b.status)
}

const getReplicationStatusIcon = (status: replicationServerStatus): string => {
	switch (status) {
		case replicationServerStatus.KnownServerEnabled:
			return 'checkmark-circle-2'
		case replicationServerStatus.KnownServerNotEnabled:
			return 'plus-circle-outline'
		case replicationServerStatus.UnknownServerEnabled:
			return 'question-mark-circle-outline'
	}

	return ''
}

const getReplicationStatusColor = (status: replicationServerStatus): string => {
	switch (status) {
		case replicationServerStatus.KnownServerEnabled:
			return colors.success
		case replicationServerStatus.KnownServerNotEnabled:
			return colors.disabled
		case replicationServerStatus.UnknownServerEnabled:
			return colors.success
	}

	return ''
}

const ReplicateGroupContent: React.FC<{
	conversationPublicKey?: Maybe<string>
}> = ({ conversationPublicKey }) => {
	const ctx = useMsgrContext()
	const conversation = ctx.conversations[conversationPublicKey as string]
	const services = useAccountServices()
	const navigation = useNavigation()
	const [{ margin, color, flex, padding }] = useStyles()
	const { t } = useTranslation()

	const replicationStatus = getAllReplicationStatusForConversation(conversation, services)

	return (
		<View style={[flex.tiny, padding.medium, margin.bottom.medium]}>
			{replicationStatus.length > 0 ? (
				<FactionButtonSetting style={[margin.top.medium]}>
					{replicationStatus.map((t) => (
						<ButtonSetting
							key={`${t.service.authenticationUrl}`}
							name={`${t.service.authenticationUrl}`}
							alone={false}
							actionIcon={getReplicationStatusIcon(t.status)}
							actionIconColor={getReplicationStatusColor(t.status)}
							onPress={() => {
								if (t.status === replicationServerStatus.UnknownServerEnabled) {
									return
								}

								return replicateGroup(ctx, conversationPublicKey || '', t.service.tokenId || '')
							}}
						/>
					))}
				</FactionButtonSetting>
			) : (
				<ButtonSetting
					name={t('chat.replicate-group-settings.no-registered-button')}
					disabled
					alone={true}
				/>
			)}
			<ButtonSetting
				name={t('chat.replicate-group-settings.connect-button')}
				icon='berty'
				iconSize={28}
				iconPack='custom'
				iconColor={color.blue}
				alone={true}
				onPress={async () => {
					await servicesAuthViaDefault(ctx)
				}}
			/>
			<ButtonSetting
				name={t('chat.replicate-group-settings.manage-add-button')}
				icon='plus-circle-outline'
				iconSize={30}
				iconColor={color.blue}
				alone={true}
				onPress={() => navigation.navigate('Settings.ServicesAuth')}
			/>
		</View>
	)
}

export const ReplicateGroupSettings: React.FC<ScreenProps.Chat.ReplicateGroupSettings> = ({
	route,
}) => {
	const { convId } = route.params
	const [{ padding, flex }] = useStyles()
	const { goBack } = useNavigation()
	const conv = useConversation(convId)
	const { t } = useTranslation()

	if (!conv) {
		goBack()
		return null
	}

	return (
		<Layout style={[flex.tiny]}>
			<SwipeNavRecognizer>
				<ScrollView contentContainerStyle={[padding.bottom.huge]} bounces={false}>
					<HeaderSettings
						actionIcon='edit-outline'
						undo={goBack}
						title={t('chat.replicate-group-settings.title')}
					/>
					<ReplicateGroupContent conversationPublicKey={conv.publicKey} />
				</ScrollView>
			</SwipeNavRecognizer>
		</Layout>
	)
}

export default ReplicateGroupSettings
