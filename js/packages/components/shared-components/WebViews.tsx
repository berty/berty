import { BlurView } from '@react-native-community/blur'
import { Text, Icon } from '@ui-kitten/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
	StyleSheet,
	View,
	TouchableOpacity,
	StatusBar,
	Platform,
	ActivityIndicator,
	Linking,
} from 'react-native'
import { WebView } from 'react-native-webview'

import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStyles } from '@berty/contexts/styles'
import { useNavigation } from '@berty/navigation'
import { useThemeColor } from '@berty/store'

import { TwoHorizontalButtons, SecondaryButtonIconLeft, TertiaryButtonIconLeft } from '../buttons'
import { UnifiedText } from './UnifiedText'

const ModalWebviewBody: React.FC<{
	closeModal: () => void
	accept: () => void
}> = ({ closeModal, accept }) => {
	const { row, text, margin, padding, border } = useStyles()
	const { scaleHeight } = useAppDimensions()
	const colors = useThemeColor()
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
				<View style={[margin.top.scale(50 * scaleHeight)]}>
					<Icon
						name='info-outline'
						fill={colors['background-header']}
						width={60 * scaleHeight}
						height={60 * scaleHeight}
						style={[row.item.justify, padding.top.large]}
					/>
					<UnifiedText style={[text.align.center, padding.top.small, text.size.large, text.bold]}>
						{t('onboarding.web-views.title')}
					</UnifiedText>
					<Text style={[text.align.center, padding.top.scale(20), padding.horizontal.medium]}>
						<UnifiedText style={[text.light]}>{t('onboarding.web-views.desc')}</UnifiedText>
					</Text>
				</View>
				<View style={[margin.horizontal.medium, margin.top.medium]}>
					<TwoHorizontalButtons>
						<TertiaryButtonIconLeft name='close' onPress={closeModal}>
							{t('onboarding.web-views.first-button')}
						</TertiaryButtonIconLeft>
						<SecondaryButtonIconLeft
							onPress={() => {
								accept()
								closeModal()
							}}
							accessibilityLabel={t('onboarding.web-views.second-button')}
						>
							{t('onboarding.web-views.second-button')}
						</SecondaryButtonIconLeft>
					</TwoHorizontalButtons>
				</View>
			</View>
		</View>
	)
}

const ModalWebview: React.FC<{
	closeModal: React.Dispatch<React.SetStateAction<boolean>>
	accept: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ closeModal, accept }) => {
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
				onPress={() => closeModal(false)}
			>
				{Platform.OS === 'ios' && <BlurView style={[StyleSheet.absoluteFill]} blurType='light' />}
			</TouchableOpacity>
			<ModalWebviewBody closeModal={() => closeModal(false)} accept={() => accept(true)} />
		</View>
	)
}

export const WebViews: React.FC<{ url: string }> = ({ url }) => {
	const [isModal, setIsModal] = React.useState<boolean>(true)
	const [isAccept, setIsAccept] = React.useState<boolean>(false)
	const [isLoading, setIsLoading] = React.useState<boolean>()
	const { goBack } = useNavigation()
	const colors = useThemeColor()

	React.useEffect(() => {
		if (!isAccept && !isModal) {
			goBack()
		}
		if (isAccept && !isModal && Platform.OS === 'web') {
			Linking.openURL(url)
			goBack()
		}
	}, [isAccept, isModal, goBack, url])

	return (
		<>
			<StatusBar barStyle='light-content' />
			{isLoading === true && (
				<ActivityIndicator size='large' style={{ flex: 1 }} color={colors['main-text']} />
			)}
			{isAccept && !isModal && Platform.OS !== 'web' ? (
				<WebView
					onLoadStart={() => setIsLoading(true)}
					onLoadEnd={() => setIsLoading(false)}
					source={{ uri: url }}
				/>
			) : null}
			{isModal ? <ModalWebview accept={setIsAccept} closeModal={setIsModal} /> : null}
		</>
	)
}
