import { Layout, Input } from '@ui-kitten/components'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, ScrollView } from 'react-native'
import { withInAppNotification } from 'react-native-in-app-notification'
import { useSelector } from 'react-redux'

import { ButtonSetting, FactionButtonSetting } from '@berty/components/shared-components'
import { useStyles } from '@berty/contexts/styles'
import { useAccountServices, useRestartAfterClosing } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import { selectProtocolClient } from '@berty/redux/reducers/ui.reducer'
import { useThemeColor } from '@berty/store'
import { showNeedRestartNotification } from '@berty/utils/notification/notif-in-app'
import {
	serviceNames,
	servicesAuthViaDefault,
	servicesAuthViaURL,
} from '@berty/utils/remote-services/remote-services'

const BodyServicesAuth = withInAppNotification(({ showNotification }: any) => {
	const { flex, padding, margin } = useStyles()
	const colors = useThemeColor()
	const { t }: any = useTranslation()
	const protocolClient = useSelector(selectProtocolClient)
	const [url, setURL] = useState('')
	const restart = useRestartAfterClosing()
	const accountServices = useAccountServices()

	return (
		<View style={[flex.tiny, padding.medium, margin.bottom.medium]}>
			<ButtonSetting
				name={t('settings.services-auth.operated-services-button')}
				icon='plus-circle-outline'
				iconSize={30}
				iconColor={colors['background-header']}
				alone={true}
				onPress={async () => {
					await servicesAuthViaDefault(protocolClient)
				}}
			/>
			<FactionButtonSetting
				name={t('settings.services-auth.register-service-button.title')}
				icon='plus-circle-outline'
				iconSize={30}
				iconColor={colors['background-header']}
				style={[margin.top.medium]}
			>
				<Input
					textContentType={'URL'}
					autoCorrect={false}
					autoCapitalize={'none'}
					value={url}
					placeholder={t('settings.services-auth.register-service-button.input-placeholder')}
					onChange={({ nativeEvent }) => {
						setURL(nativeEvent.text)
					}}
				/>
				<ButtonSetting
					name={t('settings.services-auth.register-service-button.action')}
					iconSize={30}
					iconColor={colors['background-header']}
					alone={false}
					onPress={async () => {
						try {
							await servicesAuthViaURL(protocolClient, url)
							showNeedRestartNotification(showNotification, restart, t)
						} catch (e) {
							// ignoring
						}
					}}
				/>
			</FactionButtonSetting>
			<FactionButtonSetting
				name={t('settings.services-auth.registered-services-button.title')}
				icon='cube-outline'
				iconSize={30}
				iconColor={colors['background-header']}
				style={[margin.top.medium]}
			>
				{accountServices.length === 0 ? (
					<ButtonSetting
						name={t('settings.services-auth.registered-services-button.sample-no-services')}
						disabled
						alone={false}
					/>
				) : (
					accountServices.map(a => {
						return (
							<ButtonSetting
								key={`${a.tokenId}-${a.serviceType}`}
								name={`${
									(typeof a.serviceType === 'string' && serviceNames[a.serviceType]) ||
									a.serviceType
								}\n${a.authenticationUrl}`}
								disabled
								alone={false}
							/>
						)
					})
				)}
			</FactionButtonSetting>
		</View>
	)
})

export const ServicesAuth: ScreenFC<'Settings.ServicesAuth'> = () => {
	const colors = useThemeColor()

	return (
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<ScrollView bounces={false}>
				<BodyServicesAuth />
			</ScrollView>
		</Layout>
	)
}
