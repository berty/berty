import React, { useState } from 'react'
import { View, ScrollView } from 'react-native'
import { Layout, Input } from '@ui-kitten/components'
import { useStyles } from '@berty-tech/styles'
import { HeaderSettings, ButtonSetting, FactionButtonSetting } from '../shared-components'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { useMsgrContext } from '@berty-tech/store/hooks'
import {
	servicesAuthViaURL,
	servicesAuthViaDefault,
	useAccountServices,
	serviceNames,
} from '@berty-tech/store/services'

const BodyServicesAuth = () => {
	const [{ flex, padding, margin, color }] = useStyles()

	const [url, setURL] = useState('')
	const ctx = useMsgrContext()
	const accountServices = useAccountServices()

	return (
		<View style={[flex.tiny, padding.medium, margin.bottom.medium]}>
			<ButtonSetting
				name='Use Berty operated services'
				icon='plus-circle-outline'
				iconSize={30}
				iconColor={color.blue}
				alone={true}
				onPress={async () => {
					await servicesAuthViaDefault(ctx)
				}}
			/>
			<FactionButtonSetting
				name='Register a custom service provider'
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
						await servicesAuthViaURL(ctx, url)
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
				{accountServices.length === 0 ? (
					<ButtonSetting name='No services registered' disabled alone={false} />
				) : (
					accountServices.map((t) => {
						return (
							<ButtonSetting
								key={`${t.tokenId}-${t.serviceType}`}
								name={`${
									(typeof t.serviceType === 'string' && serviceNames[t.serviceType]) ||
									'Unknown service'
								}\n${t.authenticationUrl}`}
								disabled
								alone={false}
							/>
						)
					})
				)}
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
