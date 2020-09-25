import React, { useState } from 'react'
import { View, ScrollView, Alert } from 'react-native'
import { Layout, Input } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { HeaderSettings, ButtonSetting, FactionButtonSetting } from '../shared-components'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { useMsgrContext } from '@berty-tech/store/hooks'
import InAppBrowser from 'react-native-inappbrowser-reborn'
import { Messenger } from '@berty-tech/store/oldhooks'

//
// Notifications
//

const serviceNames = {
	rpl: 'Replication service', // TODO: i18n
}

const BodyServicesAuth = () => {
	const [{ flex, padding, margin, color }] = useStyles()

	const [url, setURL] = useState('')
	const ctx: any = useMsgrContext()
	const account = Messenger.useAccount()

	return (
		<View style={[flex.tiny, padding.medium, margin.bottom.medium]}>
			<FactionButtonSetting
				name='Register a service provider'
				icon='plus-circle-outline'
				iconSize={30}
				iconColor={color.blue}
				style={[margin.top.medium]}
			>
				<Input
					textContentType={'URL'}
					autoCorrect={false}
					autoCapitalize={'none'}
					value={url}
					placeholder={'Service URL'}
					onChange={({ nativeEvent }) => {
						setURL(nativeEvent.text)
					}}
				/>
				<ButtonSetting
					name='Add'
					iconSize={30}
					iconColor={color.blue}
					alone={false}
					onPress={async () => {
						let authURL = ''

						try {
							// PKCE OAuth flow
							const resp = await ctx.client?.authServiceInitFlow({
								authUrl: url,
							})

							authURL = resp.url

							if (!resp.secureUrl) {
								let allowNonSecure = false
								await new Promise((resolve) => {
									Alert.alert(
										'Security warning',
										'The provided URL is using a non secure connection, do you want to continue?',
										[
											{
												text: 'Access page',
												onPress: () => {
													allowNonSecure = true
													resolve()
												},
											},
											{ text: 'Go back', onPress: resolve },
										],
									)
								})

								if (!allowNonSecure) {
									return
								}
							}
						} catch {
							Alert.alert('The provided URL is not supported')
							return
						}

						if (await InAppBrowser.isAvailable()) {
							InAppBrowser.openAuth(authURL, 'berty://', {
								dismissButtonStyle: 'cancel',
								readerMode: false,
								modalPresentationStyle: 'pageSheet',
								modalEnabled: true,
								showTitle: true,
								enableDefaultShare: false,
								ephemeralWebSession: true,
								// forceCloseOnRedirection: false,
							})
								.then(async (response) => {
									if (response.url) {
										await ctx.client?.authServiceCompleteFlow({
											callbackUrl: response.url,
										})
									}
								})
								.catch((e) => {
									console.warn(e)
								})
						}
					}}
				/>
			</FactionButtonSetting>
			<FactionButtonSetting
				name='Currently registered services'
				icon='cube-outline'
				iconSize={30}
				iconColor={color.blue}
				style={[margin.top.medium]}
			>
				{account.serviceTokens.length === 0 ? (
					<ButtonSetting name='No services are currently registered' disabled alone={false} />
				) : null}
				{/*FIXME: An extra separator is shown when the component above is not displayed*/}
				{account.serviceTokens.map((t) => (
					<ButtonSetting
						key={`${t.tokenId}-${t.serviceType}`}
						name={`${serviceNames[t.serviceType] || 'Unknown service'}\n${t.authenticationUrl}`}
						disabled
						alone={false}
					/>
				))}
			</FactionButtonSetting>
		</View>
	)
}

export const ServicesAuth: React.FC<ScreenProps.Settings.ServicesAuth> = () => {
	const { goBack } = useNavigation()
	const [{ padding, flex, background }] = useStyles()
	return (
		<Layout style={[flex.tiny, background.white]}>
			<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
				<HeaderSettings title='External services' undo={goBack} />
				<BodyServicesAuth />
			</ScrollView>
		</Layout>
	)
}
