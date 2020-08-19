import React, { useState } from 'react'
import { View, ScrollView, TextInput, Alert } from 'react-native'
import { Layout } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { HeaderSettings, ButtonSetting, FactionButtonSetting } from '../shared-components'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { useMsgrContext } from '@berty-tech/store/hooks'
import InAppBrowser from 'react-native-inappbrowser-reborn'
import { EOF } from '@berty-tech/grpc-bridge'

//
// Notifications
//

const BodyServicesAuth = () => {
	const [{ flex, padding, margin, color }] = useStyles()

	const [url, setURL] = useState('')
	const [tokens, setTokens] = useState({})
	const ctx: any = useMsgrContext()
	const fetchedToken = []

	Object.values(tokens) // TODO: remove me

	ctx.client
		?.servicesTokenList({})
		.then(async (stream) => {
			stream.onMessage((msg, err) => {
				if (err) {
					console.warn('events stream onMessage error:', err)
					return
				}

				fetchedToken[msg.tokenId] = msg
			})

			await stream.start()
		})
		.catch((err: Error) => {
			if (err === EOF) {
				setTokens(
					fetchedToken.reduce(
						(t, curr) => ({
							...t,
							[curr.tokenId]: curr.service,
						}),
						{},
					),
				)
			} else if (err) {
				console.warn(err)
			}
		})

	return (
		<View style={[flex.tiny, padding.medium, margin.bottom.medium]}>
			<FactionButtonSetting
				name='Add a new storage service'
				icon='plus-circle-outline'
				iconSize={30}
				iconColor={color.blue}
				style={[margin.top.medium]}
			>
				<TextInput
					textContentType={'URL'}
					value={url}
					placeholder={'Storage service URL'}
					onChange={({ nativeEvent }) => {
						setURL(nativeEvent.text)
					}}
				/>
				<ButtonSetting
					name='Add'
					icon='plus-circle-outline'
					actionIcon={'more-horizontal-outline'}
					iconSize={30}
					iconColor={color.blue}
					alone={false}
					onPress={async () => {
						let parsedURL: URL

						try {
							parsedURL = new URL(url)
						} catch (e) {
							console.warn(e)
							Alert.alert('The provided URL is not valid')
							return
						}

						if (parsedURL.protocol === 'http:') {
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
						} else if (parsedURL.protocol !== 'https:') {
							Alert.alert('The provided URL is not using a supported protocol')
							return
						}

						// PKCE OAuth flow
						const resp = await ctx.client?.authServiceInitFlow({
							authUrl: url,
						})

						if (await InAppBrowser.isAvailable()) {
							InAppBrowser.openAuth(resp.url, 'berty://', {
								dismissButtonStyle: 'cancel',
								readerMode: false,
								modalPresentationStyle: 'pageSheet',
								modalEnabled: true,
								showTitle: true,
								enableDefaultShare: false,
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
				name='Currently available services'
				icon='cube-outline'
				iconSize={30}
				iconColor={color.blue}
				style={[margin.top.medium]}
				disabled
			>
				<ButtonSetting
					name='TODO: list currently available services'
					toggled
					disabled
					alone={false}
				/>
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
