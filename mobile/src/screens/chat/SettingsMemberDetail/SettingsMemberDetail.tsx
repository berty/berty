import { Layout } from '@ui-kitten/components'
import React, { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { View, ScrollView, StatusBar } from 'react-native'

import { MemberAvatar } from '@berty/components/avatars'
import UserDevicesList from '@berty/components/chat/DeviceList'
import { FactionButtonSetting } from '@berty/components/shared-components/SettingsButtons'
import { useStyles } from '@berty/contexts/styles'
import { useMember, useThemeColor } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import { Maybe } from '@berty/utils/type/maybe'

const SettingsMemberDetailHeader: React.FC<{
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

const SettingsMemberDetailBody: React.FC<{
	convId: string
	memberPk: string
	navigation: ComponentProps<typeof SettingsMemberDetail>['navigation']
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

export const SettingsMemberDetail: ScreenFC<'Chat.SettingsMemberDetail'> = ({
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
					<SettingsMemberDetailHeader convId={convId} memberPk={memberPk} />
				</View>
				<SettingsMemberDetailBody
					convId={convId || ''}
					memberPk={memberPk || ''}
					navigation={navigation}
				/>
			</ScrollView>
		</Layout>
	)
}
