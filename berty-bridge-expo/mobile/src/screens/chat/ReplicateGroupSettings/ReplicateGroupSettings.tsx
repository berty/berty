import { Layout } from '@ui-kitten/components'
import React, { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'

import beapi from '@berty/api'
import { ButtonSetting, FactionButtonSetting } from '@berty/components/shared-components'
import { useStyles } from '@berty/contexts/styles'
import {
	useAccountServices,
	useConversation,
	useMessengerClient,
	useThemeColor,
} from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import {
	replicateGroup,
	servicesAuthViaDefault,
	serviceTypes,
} from '@berty/utils/remote-services/remote-services'
import { Maybe } from '@berty/utils/type/maybe'

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
	tokens: Array<beapi.messenger.IServiceToken>,
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

	for (const t of tokens.filter(t =>
		t.supportedServices?.some(ss => ss.type === serviceTypes.Replication),
	)) {
		if (typeof t.authenticationUrl !== 'string') {
			continue
		}

		allServers[t.authenticationUrl] = {
			status:
				allServers[t.authenticationUrl] !== undefined
					? replicationServerStatus.KnownServerEnabled
					: replicationServerStatus.KnownServerNotEnabled,
			service: t,
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
}

const getReplicationStatusColor = (status: replicationServerStatus): string => {
	switch (status) {
		case replicationServerStatus.KnownServerEnabled:
			return 'green'
		case replicationServerStatus.KnownServerNotEnabled:
			return 'red'
		case replicationServerStatus.UnknownServerEnabled:
			return 'green'
	}
}

const ReplicateGroupContent: React.FC<{
	conversationPublicKey?: Maybe<string>
	navigation: ComponentProps<typeof ReplicateGroupSettings>['navigation']
}> = ({ conversationPublicKey }) => {
	const client = useMessengerClient()
	const conversation = useConversation(conversationPublicKey)
	const services = useAccountServices()
	const { margin, flex, padding } = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()

	const replicationStatus = getAllReplicationStatusForConversation(conversation, services)

	return (
		<View style={[flex.tiny, padding.medium, margin.bottom.medium]}>
			{replicationStatus.length > 0 ? (
				<FactionButtonSetting style={[margin.top.medium]}>
					{replicationStatus.map(t => (
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

								return replicateGroup(conversationPublicKey || '', t.service.tokenId || '', client)
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
				iconColor={colors['background-header']}
				alone={true}
				onPress={async () => {
					await servicesAuthViaDefault(client, [serviceTypes.Replication])
				}}
			/>
			<ButtonSetting
				name={t('chat.replicate-group-settings.manage-add-button')}
				icon='plus-circle-outline'
				iconSize={30}
				iconColor={colors['background-header']}
				alone={true}
				// onPress={() => navigation.navigate('Settings.BertyServices')}
			/>
		</View>
	)
}

export const ReplicateGroupSettings: ScreenFC<'Chat.ReplicateGroupSettings'> = ({
	route,
	navigation,
}) => {
	const { convId } = route.params
	const { padding } = useStyles()
	const conv = useConversation(convId)

	if (!conv) {
		navigation.goBack()
		return null
	}

	return (
		<Layout style={{ flex: 1 }}>
			<ScrollView contentContainerStyle={[padding.bottom.huge]} bounces={false}>
				<ReplicateGroupContent conversationPublicKey={conv.publicKey} navigation={navigation} />
			</ScrollView>
		</Layout>
	)
}
