import React, { useEffect } from 'react'
import {
	View,
	TouchableOpacity,
	TouchableWithoutFeedback,
	Text as TextNative,
	StyleSheet,
} from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { useStyles } from '@berty-tech/styles'
import messengerMethodsHooks from '@berty-tech/store/methods'
import { useMsgrContext } from '@berty-tech/store/hooks'
import { useNavigation } from '@react-navigation/native'

import Avatar from './Buck_Berty_Icon_Card.svg'
import BlurView from '../shared-components/BlurView'
import { PersistentOptionsKeys } from '@berty-tech/store/context'
import { base64ToURLBase64 } from '@berty-tech/components/utils'
import { Buffer } from 'buffer'

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

export const AddBotBody = ({ displayName, link, closeModal }) => {
	const [
		{ row, text, margin, color, padding, background, border, opacity },
		{ scaleHeight },
	] = useStyles()
	const _styles = useStylesAddBetabot()
	const { setPersistentOption, persistentOptions } = useMsgrContext()
	const { call: requestContact, done, error } = messengerMethodsHooks.useContactRequest()
	const {
		reply: pdlReply,
		error: pdlError,
		call,
		done: pdlDone,
	} = messengerMethodsHooks.useParseDeepLink()

	useEffect(() => {
		call({ link })
	}, [call, link])

	useEffect(() => {
		if (done && !error) {
			closeModal()
		}
	}, [done, error, closeModal])

	return pdlReply?.link?.bertyId?.accountPk ? (
		<View
			style={[
				{
					justifyContent: 'center',
					alignItems: 'center',
					height: 250 * scaleHeight,
					top: 140,
				},
				margin.big,
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
						top: 50,
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
				]}
			>
				<View style={[margin.top.scale(60)]}>
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
							text.bold.medium,
							text.color.black,
							{ fontFamily: 'Open Sans' },
						]}
					>
						{`👋 ADD ${displayName}?`}
					</TextNative>
					<Text style={[text.align.center, padding.top.scale(20), padding.horizontal.medium]}>
						<TextNative
							style={[
								text.bold.small,
								text.size.medium,
								text.color.black,
								{ fontFamily: 'Open Sans' },
							]}
						>
							You don't have any contacts yet would you like to add the
						</TextNative>
						<TextNative
							style={[
								text.bold.medium,
								text.size.medium,
								text.color.black,
								{ fontFamily: 'Open Sans' },
							]}
						>
							{displayName}
						</TextNative>
						<TextNative
							style={[
								text.bold.small,
								text.color.black,
								text.size.medium,
								{ fontFamily: 'Open Sans' },
							]}
						>
							to discover and test conversations?
						</TextNative>
					</Text>
				</View>
				<View style={[row.center, padding.top.medium]}>
					<TouchableOpacity
						style={[row.fill, margin.bottom.medium, opacity(0.5), _styles.skipButton]}
						onPress={async () => {
							await setPersistentOption({
								type: PersistentOptionsKeys.Suggestions,
								payload: {
									...persistentOptions.suggestions,
									[displayName]: {
										...persistentOptions.suggestions[displayName],
										state: 'skipped',
									},
								},
							})
							closeModal()
						}}
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
						onPress={async () => {
							if (pdlDone && !pdlError) {
								console.log('heeere')
								await setPersistentOption({
									type: PersistentOptionsKeys.Suggestions,
									payload: {
										...persistentOptions.suggestions,
										[displayName]: {
											...persistentOptions.suggestions[displayName],
											state: 'added',
											pk: base64ToURLBase64(
												new Buffer(pdlReply.link.bertyId.accountPk).toString('base64'),
											),
										},
									},
								})
								await requestContact({
									link,
								})
							}
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
	) : null
}

export const AddBot = ({ link, displayName, closeModal }) => {
	const [{}, { windowHeight }] = useStyles()

	return (
		<View style={[StyleSheet.absoluteFill]}>
			<TouchableOpacity
				activeOpacity={0}
				style={[
					StyleSheet.absoluteFill,
					{
						position: 'absolute',
						top: 0,
						bottom: 0,
						left: 0,
						right: 0,
						height: windowHeight,
					},
				]}
				onPress={() => closeModal()}
			>
				<BlurView style={[StyleSheet.absoluteFill]} blurType='light' />
			</TouchableOpacity>
			<AddBotBody displayName={displayName} link={link} closeModal={closeModal} />
		</View>
	)
}

export default AddBot
