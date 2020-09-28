import React, { useEffect } from 'react'
import { View, TouchableOpacity, Text as TextNative, StyleSheet, SafeAreaView } from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { useNavigation } from '@react-navigation/native'
import { useStyles } from '@berty-tech/styles'
import messengerMethodsHooks from '@berty-tech/store/methods'
import { useMsgrContext } from '@berty-tech/store/hooks'

import Avatar from './Buck_Berty_Icon_Card.svg'
import BlurView from '../shared-components/BlurView'

const useStylesAddBetabot = () => {
	const [{ width, border, padding, margin }] = useStyles()
	return {
		skipButton: [
			border.color.light.grey,
			border.scale(2),
			border.radius.small,
			margin.top.scale(15),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
			width(120),
		],
		addButton: [
			border.color.light.blue,
			border.scale(2),
			border.radius.small,
			margin.top.scale(15),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
			width(120),
		],
	}
}

export const AddBetabotBody = () => {
	const [
		{ row, text, margin, color, padding, background, border, opacity },
		{ scaleHeight },
	] = useStyles()
	const _styles = useStylesAddBetabot()
	const navigation = useNavigation()
	const { setPersistentOption } = useMsgrContext()
	const { refresh: requestContact, error, done } = messengerMethodsHooks.useContactRequest()

	useEffect(() => {
		if (done && !error) {
			navigation.goBack()
		}
	}, [done, error, navigation])

	return (
		<View
			style={[
				{
					justifyContent: 'center',
					alignItems: 'center',
					height: '100%',
					position: 'relative',
					top: -60,
				},
				padding.big,
			]}
		>
			<View
				style={[
					{
						width: 110 * scaleHeight,
						height: 110 * scaleHeight,
						backgroundColor: 'white',
						justifyContent: 'center',
						alignItems: 'center',
						position: 'relative',
						top: 40,
						zIndex: 1,
						shadowOpacity: 0.1,
						shadowRadius: 5,
						shadowOffset: { width: 0, height: 3 },
					},
					background.white,
					border.radius.scale(60),
				]}
			>
				<Avatar width={125 * scaleHeight} height={125 * scaleHeight} />
			</View>
			<View
				style={[
					background.white,
					padding.horizontal.medium,
					padding.bottom.medium,
					border.radius.large,
					border.shadow.huge,
					{ width: '100%' },
				]}
			>
				<View style={[padding.top.scale(60 * scaleHeight)]}>
					<Icon
						name='info-outline'
						fill={color.blue}
						width={60 * scaleHeight}
						height={60 * scaleHeight}
						style={[row.item.justify, padding.top.large]}
					/>
					<TextNative
						style={[
							text.align.center,
							padding.top.small,
							text.size.large,
							text.bold.small,
							text.color.black,
							{ fontFamily: 'Open Sans' },
						]}
					>
						👋 ADD BETA BOT?
					</TextNative>
					<Text style={[text.align.center, padding.top.scale(20), padding.horizontal.medium]}>
						<Text>You don't have any contacts yet would you like to add the</Text>
						<TextNative style={[text.bold.medium, text.color.black, { fontFamily: 'Open Sans' }]}>
							{' '}
							Beta Bot
						</TextNative>
						<Text> to discover and test conversations?</Text>
					</Text>
				</View>
				<View style={[row.center, padding.top.medium]}>
					<TouchableOpacity
						style={[row.fill, margin.bottom.medium, opacity(0.5), _styles.skipButton]}
						onPress={() => navigation.goBack()}
					>
						<Icon name='close' width={30} height={30} fill={color.grey} style={row.item.justify} />
						<TextNative
							style={[
								text.color.grey,
								padding.left.small,
								row.item.justify,
								text.size.scale(16),
								text.bold.medium,
								{ fontFamily: 'Open Sans' },
							]}
						>
							SKIP
						</TextNative>
					</TouchableOpacity>
					<TouchableOpacity
						style={[row.fill, margin.bottom.medium, background.light.blue, _styles.addButton]}
						onPress={() => {
							setPersistentOption('betabot', { added: true })
							requestContact({
								link:
									'https://berty.tech/id#key=CiC785nzAfSUbSKuO1j4nrEbnQ21xL3a62cC9F8YI-tUyBIgAsCOIrk-BL0vzFVU_xUEM0E6CNhPOoe13yotQ1m_64U&name=BetaBot',
							})
						}}
					>
						<Icon
							name='checkmark-outline'
							width={30}
							height={30}
							fill={color.blue}
							style={row.item.justify}
						/>
						<TextNative
							style={[
								text.color.blue,
								padding.left.small,
								row.item.justify,
								text.size.scale(16),
								text.bold.medium,
							]}
						>
							ADD !
						</TextNative>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	)
}

export const AddBetabot = () => {
	return (
		<>
			<BlurView style={[StyleSheet.absoluteFill]} blurType='light' />
			<SafeAreaView>
				<AddBetabotBody />
			</SafeAreaView>
		</>
	)
}

export default AddBetabot
