import React from 'react'
import { StyleSheet, View, TouchableOpacity, Text as TextNative } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { WebView } from 'react-native-webview'
import { BlurView } from '@react-native-community/blur'

import { useThemeColor } from '@berty-tech/store'
import { useNavigation } from '@berty-tech/navigation'
import { useStyles } from '@berty-tech/styles'
import { useTranslation } from 'react-i18next'

export const useStylesModalWebView = () => {
	const [{ width, border, padding, margin }] = useStyles()
	const colors = useThemeColor()

	return {
		skipButton: [
			border.scale(2),
			border.radius.small,
			margin.top.scale(15),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
			width(120),
			{ borderColor: colors['negative-asset'] },
		],
		addButton: [
			border.scale(2),
			border.radius.small,
			margin.top.scale(15),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
			width(120),
			{ borderColor: colors['positive-asset'] },
		],
	}
}

export const ModalWebviewBody: React.FC<{
	closeModal: () => void
	accept: () => void
}> = ({ closeModal, accept }) => {
	const [{ row, text, margin, padding, border, opacity }, { scaleHeight }] = useStyles()
	const colors = useThemeColor()
	const _styles = useStylesModalWebView()
	const { t } = useTranslation()
	return (
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
					<TextNative
						style={[
							text.align.center,
							padding.top.small,
							text.size.large,
							text.bold.medium,
							{ fontFamily: 'Open Sans', color: colors['main-text'] },
						]}
					>
						{t('onboarding.web-views.title')}
					</TextNative>
					<Text style={[text.align.center, padding.top.scale(20), padding.horizontal.medium]}>
						<TextNative
							style={[
								text.bold.small,
								text.size.medium,
								{ fontFamily: 'Open Sans', color: colors['main-text'] },
							]}
						>
							{t('onboarding.web-views.desc')}
						</TextNative>
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
						onPress={async () => {
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
						<TextNative
							style={[
								padding.left.small,
								row.item.justify,
								text.size.scale(16),
								text.bold.medium,
								{ fontFamily: 'Open Sans', color: colors['negative-asset'] },
							]}
						>
							{t('generic.cancel')}
						</TextNative>
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
						onPress={async () => {
							accept()
							closeModal()
						}}
					>
						<Icon
							name='checkmark-outline'
							width={30}
							height={30}
							fill={colors['background-header']}
							style={row.item.justify}
						/>
						<TextNative
							style={[
								padding.left.small,
								row.item.justify,
								text.size.scale(16),
								text.bold.medium,
								{ color: colors['background-header'] },
							]}
						>
							{t('onboarding.web-views.second-button')}
						</TextNative>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	)
}

const ModalWebview: React.FC<{
	closeModal: React.Dispatch<React.SetStateAction<boolean>>
	accept: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ closeModal, accept }) => {
	const [{}, { windowHeight }] = useStyles()

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
				onPress={() => closeModal(false)}
			>
				<BlurView style={[StyleSheet.absoluteFill]} blurType='light' />
			</TouchableOpacity>
			<ModalWebviewBody closeModal={() => closeModal(false)} accept={() => accept(true)} />
		</View>
	)
}

export const WebViews: React.FC<{ url: string }> = ({ url }) => {
	const [isModal, setIsModal] = React.useState<boolean>(true)
	const [isAccept, setIsAccept] = React.useState<boolean>(false)
	const { goBack } = useNavigation()

	React.useEffect(() => {
		if (!isAccept && !isModal) {
			goBack()
		}
	}, [isAccept, isModal, goBack])

	return (
		<>
			{isAccept && !isModal ? <WebView source={{ uri: url }} /> : null}
			{isModal ? <ModalWebview accept={setIsAccept} closeModal={setIsModal} /> : null}
		</>
	)
}
