import React, { useEffect } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { Buffer } from 'buffer'

import { useStyles } from '@berty/contexts/styles'
import messengerMethodsHooks from '@berty/store/methods'
import { useThemeColor } from '@berty/store'
import { BlurView } from '@react-native-community/blur'

import Avatar from '@berty/assets/logo/buck_berty_icon_card.svg'
import { base64ToURLBase64 } from '@berty/components/utils'
import { useSelector } from 'react-redux'
import {
	PersistentOptionsKeys,
	selectPersistentOptions,
	setPersistentOption,
} from '@berty/redux/reducers/persistentOptions.reducer'
import { useAppDispatch, useStylesDefaultModal } from '@berty/hooks'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

const AddBotBody: React.FC<{
	displayName: string
	link: string
	closeModal: () => void
}> = ({ displayName, link, closeModal }) => {
	const { row, text, margin, padding, border, opacity } = useStyles()
	const { scaleHeight } = useAppDimensions()
	const colors = useThemeColor()
	const _styles = useStylesDefaultModal()
	const persistentOptions = useSelector(selectPersistentOptions)
	const dispatch = useAppDispatch()
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
					top: '25%',
				},
				margin.big,
			]}
		>
			<View
				style={[
					{
						width: 110 * scaleHeight,
						height: 110 * scaleHeight,
						backgroundColor: colors['main-background'],
						justifyContent: 'center',
						alignItems: 'center',
						position: 'relative',
						top: 50 * scaleHeight,
						zIndex: 1,
						elevation: 7,
						shadowOpacity: 0.1,
						shadowRadius: 5,
						shadowColor: colors.shadow,
						shadowOffset: { width: 0, height: 3 },
					},
					border.radius.scale(60),
				]}
			>
				<Avatar width={125 * scaleHeight} height={125 * scaleHeight} />
			</View>
			<View
				style={[
					padding.horizontal.medium,
					padding.bottom.medium,
					border.radius.large,
					border.shadow.huge,
					{ backgroundColor: colors['main-background'], shadowColor: colors.shadow },
				]}
			>
				<View style={[margin.top.scale(70 * scaleHeight)]}>
					<Icon
						name='info-outline'
						fill={colors['background-header']}
						width={60 * scaleHeight}
						height={60 * scaleHeight}
						style={[row.item.justify, padding.top.large]}
					/>
					<UnifiedText style={[text.align.center, padding.top.small, text.size.large, text.bold]}>
						{`👋 ADD ${displayName}?`}
					</UnifiedText>
					<Text style={[text.align.center, padding.top.scale(20), padding.horizontal.medium]}>
						<UnifiedText style={[text.light]}>
							You don't have any contacts yet would you like to add the
						</UnifiedText>
						<UnifiedText style={[text.bold]}>{` ${displayName} `}</UnifiedText>
						<UnifiedText style={[text.light]}>to discover and test conversations?</UnifiedText>
					</Text>
				</View>
				<View style={[row.center, padding.top.medium]}>
					<TouchableOpacity
						style={[
							margin.bottom.medium,
							opacity(0.5),
							_styles.skipButton,
							{ flexDirection: 'row', justifyContent: 'center' },
						]}
						onPress={() => {
							dispatch(
								setPersistentOption({
									type: PersistentOptionsKeys.Suggestions,
									payload: {
										...persistentOptions.suggestions,
										[displayName]: {
											...persistentOptions.suggestions[displayName],
											state: 'skipped',
										},
									},
								}),
							)
							closeModal()
						}}
					>
						<Icon
							name='close'
							width={30}
							height={30}
							fill={colors['negative-asset']}
							style={row.item.justify}
						/>
						<UnifiedText
							style={[
								padding.left.small,
								row.item.justify,
								text.size.scale(16),
								text.bold,
								{ color: colors['negative-asset'] },
							]}
						>
							SKIP
						</UnifiedText>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							margin.bottom.medium,
							_styles.addButton,
							{
								flexDirection: 'row',
								justifyContent: 'center',
								backgroundColor: colors['positive-asset'],
							},
						]}
						onPress={() => {
							if (pdlDone && !pdlError && pdlReply.link?.bertyId?.accountPk) {
								dispatch(
									setPersistentOption({
										type: PersistentOptionsKeys.Suggestions,
										payload: {
											...persistentOptions.suggestions,
											[displayName]: {
												...persistentOptions.suggestions[displayName],
												state: 'added',
												pk: base64ToURLBase64(
													Buffer.from(pdlReply.link.bertyId.accountPk).toString('base64'),
												),
											},
										},
									}),
								)
								requestContact({
									link,
								})
							}
						}}
					>
						<Icon
							name='checkmark-outline'
							width={30}
							height={30}
							fill={colors['background-header']}
							style={row.item.justify}
						/>
						<UnifiedText
							style={[
								padding.left.small,
								row.item.justify,
								text.size.scale(16),
								text.bold,
								{ color: colors['background-header'] },
							]}
						>
							ADD !
						</UnifiedText>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	) : null
}

export const AddBot: React.FC<{ displayName: string; link: string; closeModal: () => void }> = ({
	link,
	displayName,
	closeModal,
}) => {
	const { windowHeight } = useAppDimensions()

	return (
		<View style={[StyleSheet.absoluteFill, { elevation: 6, zIndex: 6 }]}>
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
