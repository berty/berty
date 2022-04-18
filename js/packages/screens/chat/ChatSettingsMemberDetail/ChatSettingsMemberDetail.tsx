import React, { ComponentProps } from 'react'
import { View, ScrollView, StatusBar } from 'react-native'
import { Layout } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty/contexts/styles'
import { ScreenFC } from '@berty/navigation'
import { Maybe, useThemeColor } from '@berty/store'
import { useMember } from '@berty/hooks'

import { FactionButtonSetting } from '@berty/components/shared-components/SettingsButtons'
import { MemberAvatar } from '@berty/components/avatars'
import UserDevicesList from '@berty/components/chat/DeviceList'

const ChatSettingsMemberDetailHeader: React.FC<{
	convId: Maybe<string>
	memberPk: Maybe<string>
}> = ({ convId, memberPk }) => {
	const member = useMember(convId, memberPk)
	const { padding, row, absolute, border } = useStyles()

	return (
		<View style={[padding.medium, padding.top.scale(50)]}>
			<View style={[border.radius.scale(30), padding.horizontal.medium, padding.bottom.medium]}>
				<View style={[row.item.justify, absolute.scale({ top: -65 })]}>
					<MemberAvatar publicKey={member!.publicKey} conversationPublicKey={convId} size={100} />
				</View>
			</View>
		</View>
	)
}

const ChatSettingsMemberDetailBody: React.FC<{
	convId: string
	memberPk: string
	navigation: ComponentProps<typeof ChatSettingsMemberDetail>['navigation']
}> = ({ convId, memberPk }) => {
	const { padding, margin } = useStyles()
	const { t } = useTranslation()

	return (
		<View style={[padding.medium]}>
			<FactionButtonSetting
				name={t('chat.devices.title')}
				icon='smartphone-outline'
				style={[margin.top.medium]}
				isDropdown
			>
				<UserDevicesList memberPk={memberPk} conversationPk={convId} />
			</FactionButtonSetting>
		</View>
	)
}

export const ChatSettingsMemberDetail: ScreenFC<'Group.ChatSettingsMemberDetail'> = ({
	route,
	navigation,
}) => {
	const { convId, memberPk, displayName } = route.params
	const member = useMember(convId, memberPk)
	const colors = useThemeColor()
	const { padding } = useStyles()

	React.useLayoutEffect(() => {
		navigation.setOptions({
			title: displayName,
		})
	})

	if (!member) {
		navigation.goBack()
		return null
	}

	return (
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<ScrollView bounces={false}>
				<View style={[padding.medium, { backgroundColor: colors['background-header'] }]}>
					<ChatSettingsMemberDetailHeader convId={convId} memberPk={memberPk} />
				</View>
				<ChatSettingsMemberDetailBody
					convId={convId || ''}
					memberPk={memberPk || ''}
					navigation={navigation}
				/>
			</ScrollView>
		</Layout>
	)
}
