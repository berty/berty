import { Icon } from '@ui-kitten/components'
import LottieView from 'lottie-react-native'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, StatusBar, Text, TouchableOpacity, Vibration, View } from 'react-native'

import { ScreenFC, useNavigation } from '@berty-tech/navigation'
import rnutil from '@berty-tech/rnutil'
import {
	useMessengerContext,
	useMountEffect,
	useNotificationsInhibitor,
	useThemeColor,
} from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'

import { importAccountFromDocumentPicker } from '../pickerUtils'
import { CreateAccountBox } from './CreateAccountBox'
import OnboardingWrapper from './OnboardingWrapper'

const AdvancedButton: React.FC<{
	icon: string
	title: string
	pack?: string
	onPress?: () => void
}> = ({ icon, title, pack, onPress }) => {
	const colors = useThemeColor()
	const [{ text, padding, margin, border }, { scaleSize }] = useStyles()
	return (
		<TouchableOpacity
			onPress={onPress ? () => onPress() : () => {}}
			style={[
				padding.scale(10),
				border.radius.small,
				margin.vertical.scale(1),
				{
					width: 250 * scaleSize,
					backgroundColor: colors['main-background'],
					flexDirection: 'row',
					alignItems: 'center',
					flex: 1,
				},
			]}
		>
			<View style={{ justifyContent: 'flex-start', flex: 1 }}>
				<Icon
					pack={pack}
					name={icon}
					fill={colors['main-text']}
					width={25 * scaleSize}
					height={25 * scaleSize}
				/>
			</View>
			<View style={{ justifyContent: 'center', flex: 10 }}>
				<Text
					style={[
						text.size.medium,
						{ fontWeight: '600', fontFamily: 'Open Sans', textAlign: 'center' },
					]}
				>
					{title}
				</Text>
			</View>
		</TouchableOpacity>
	)
}

const Advanced = () => {
	const colors = useThemeColor()
	const [{ text, margin }, { scaleSize }] = useStyles()
	const [isCollapsed, setCollapsed] = useState(true)
	const { navigate } = useNavigation()
	const ctx = useMessengerContext()
	const { t } = useTranslation()

	return (
		<SafeAreaView style={{ position: 'absolute', right: 15 * scaleSize }}>
			<View>
				<TouchableOpacity
					onPress={() => setCollapsed(!isCollapsed)}
					style={[
						margin.bottom.small,
						{ flexDirection: 'row', alignItems: 'center', flex: 1, alignSelf: 'flex-end' },
					]}
				>
					<Text
						style={[
							text.size.medium,
							{ fontFamily: 'Open Sans', color: colors['reverted-main-text'], fontWeight: '700' },
						]}
					>
						{t('onboarding.create-account.advanced')}
					</Text>
					<Icon
						style={[margin.left.small]}
						name={isCollapsed ? 'arrow-ios-downward' : 'arrow-ios-upward'}
						fill={colors['reverted-main-text']}
						width={25 * scaleSize}
						height={25 * scaleSize}
					/>
				</TouchableOpacity>
				{!isCollapsed ? (
					<View style={{ flexDirection: 'column', flex: 1 }}>
						<AdvancedButton
							icon='settings'
							pack='custom'
							title={t('onboarding.create-account.expert-setup')}
							onPress={() => navigate('Onboarding.ExpertSetup')}
						/>
						{/*<AdvancedButton icon='smartphone-outline' title='LINK DEVICE' />*/}
						<AdvancedButton
							icon='folder-outline'
							title={t('onboarding.create-account.import-account')}
							onPress={() => importAccountFromDocumentPicker(ctx)}
						/>
						{/*<AdvancedButton icon='info-outline' title={t('onboarding.create-account.more')} />*/}
					</View>
				) : null}
			</View>
		</SafeAreaView>
	)
}

const CreateAccountBody = () => {
	const ctx = useMessengerContext()
	const [{ padding, margin, border }] = useStyles()
	const colors = useThemeColor()
	const [defaultName, setDefaultName] = React.useState('')
	const [isFinished, setIsFinished] = useState(false)
	const { navigate } = useNavigation()
	const { t } = useTranslation()

	useMountEffect(() => {
		ctx
			.getUsername()
			.then(reply => reply && setDefaultName(reply.username))
			.catch(err2 => console.warn('Failed to fetch username:', err2))
	})

	return (
		<View style={{ flex: 1 }}>
			<View style={{ flex: 5 }}>
				<LottieView
					source={require('./Berty_onboard_animation_assets2/Startup animation assets/Berty BG.json')}
					autoPlay
					loop
					style={{ width: '100%' }}
				/>
				{!isFinished ? (
					<LottieView
						source={require('./Berty_onboard_animation_assets2/Startup animation assets/Shield appear.json')}
						autoPlay
						loop={false}
					/>
				) : (
					<LottieView
						source={require('./Berty_onboard_animation_assets2/Startup animation assets/Shield dissapear.json')}
						autoPlay
						loop={false}
						onAnimationFinish={async () => {
							Vibration.vibrate(500)
							await rnutil.checkPermissions('p2p', navigate, {
								isToNavigate: false,
							})
						}}
					/>
				)}
				<Advanced />
			</View>
			{defaultName ? (
				<View style={{ flex: 6 }}>
					<CreateAccountBox defaultName={defaultName} setIsFinished={setIsFinished} />
				</View>
			) : null}
			<View
				style={[
					padding.medium,
					margin.medium,
					border.radius.large,
					{ backgroundColor: colors['main-background'] },
				]}
			>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<View style={{ flex: 1, flexDirection: 'column', alignItems: 'center' }}>
						<Text style={[{ fontFamily: 'Open Sans', fontWeight: '600' }]}>
							{t('onboarding.create-account.good-to-know.title')}
						</Text>
						<Text style={{ fontFamily: 'Open Sans' }}>
							{t('onboarding.create-account.good-to-know.first-point')}
						</Text>
						<Text style={{ fontFamily: 'Open Sans' }}>
							{t('onboarding.create-account.good-to-know.second-point')}
						</Text>
					</View>
				</View>
			</View>
		</View>
	)
}

export const CreateAccount: ScreenFC<'Onboarding.CreateAccount'> = () => {
	useNotificationsInhibitor(() => true)
	const colors = useThemeColor()

	return (
		<OnboardingWrapper>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<CreateAccountBody />
		</OnboardingWrapper>
	)
}
