import React, { useState, useRef } from 'react'
import {
	View,
	ActivityIndicator as Spinner,
	KeyboardAvoidingView,
	Text,
	TextInput,
	Switch,
	Vibration,
} from 'react-native'
import { useLayout } from '@react-native-community/hooks'
import { Translation } from 'react-i18next'
import Swiper from 'react-native-swiper'
import { SafeAreaView } from 'react-native-safe-area-context'
import LottieView from 'lottie-react-native'
import { useNavigation as useReactNavigation, CommonActions } from '@react-navigation/native'

import { useStyles } from '@berty-tech/styles'
import { useNavigation, Routes } from '@berty-tech/navigation'
import { useMsgrContext } from '@berty-tech/store/context'

import { TouchableCard } from './shared-components/Card'
import Logo from './berty_gradient_square.svg'
import ServicesAuth from './onboarding/ServicesAuth'
import SwiperCard from './onboarding/SwiperCard'
import Button from './onboarding/Button'

type Navigation = () => void
type Form<T> = (arg0: T) => Promise<void>

export const GetStarted: React.FC = () => {
	const { navigate } = useNavigation()
	const [{ absolute, background, column, flex, padding, text }] = useStyles()
	return (
		<Translation>
			{(t) => (
				<SafeAreaView style={[absolute.fill, background.white, column.justify, padding.medium]}>
					<View style={[flex.medium]} />
					<View style={[flex.big, { flexDirection: 'row', justifyContent: 'center' }]}>
						<Logo height='60%' width='65%' />
					</View>
					<View style={[flex.medium]}>
						<Text style={[padding.horizontal.medium, text.align.center, text.align.bottom]}>
							{t('onboarding.getstarted')}
						</Text>
					</View>
					<View style={[flex.medium]}>
						<Button style={column.item.center} onPress={navigate.onboarding.performance}>
							GET STARTED
						</Button>
					</View>
				</SafeAreaView>
			)}
		</Translation>
	)
}

export const SelectMode: React.FC = () => {
	const { navigate } = useNavigation()
	const [{ flex, absolute, background, column, padding, text, margin }] = useStyles()
	return (
		<Translation>
			{(t) => (
				<SafeAreaView style={[absolute.fill, background.white]}>
					<Text
						style={[
							text.align.center,
							text.align.justify,
							text.size.huge,
							padding.top.huge,
							text.bold.medium,
						]}
					>
						Select your app mode
					</Text>
					<TouchableCard
						style={[
							background.blue,
							column.fill,
							margin.top.huge,
							margin.horizontal.huge,
							flex.medium,
							column.justify,
						]}
						onPress={() => navigate.onboarding.performance()}
					>
						<Text style={[text.bold.medium, text.size.big, text.color.white, text.align.justify]}>
							{t('onboarding.select-mode.performance.title')}
						</Text>
						<Text style={[text.size.medium, text.color.white]}>
							{t('onboarding.select-mode.performance.desc')}
						</Text>
						<Text style={[text.size.medium, text.color.white]}>
							{t('onboarding.select-mode.performance.push-notif')}
						</Text>
						<Text style={[text.size.medium, text.color.white]}>
							{t('onboarding.select-mode.performance.offline-message')}
						</Text>
						<Text style={[text.size.medium, text.color.white]}>
							{t('onboarding.select-mode.performance.add-contact')}
						</Text>
						<Text style={[text.size.medium, text.color.white]}>
							{t('onboarding.select-mode.performance.fast-message')}
						</Text>
					</TouchableCard>
					<TouchableCard
						style={[background.red, column.fill, margin.huge, flex.medium, column.justify]}
						onPress={() => navigate.onboarding.privacy()}
					>
						<Text style={[text.bold.medium, text.size.big, text.color.white]}>
							{t('onboarding.select-mode.high-level.title')}
						</Text>
						<Text style={[text.size.medium, text.color.white]}>
							{t('onboarding.select-mode.high-level.desc')}
						</Text>
						<Text style={[text.size.medium, text.color.white]}>
							{t('onboarding.select-mode.high-level.disable-push-notif')}
						</Text>
						<Text style={[text.size.medium, text.color.white]}>
							{t('onboarding.select-mode.high-level.disable-local-peer-discovery')}
						</Text>
						<Text style={[text.size.medium, text.color.white]}>
							{t('onboarding.select-mode.high-level.disable-contact-request')}
						</Text>
					</TouchableCard>
					<Text style={[text.size.tiny, flex.tiny, column.fill, text.align.center]}>
						All this presets can be modified at any time in the settings
					</Text>
				</SafeAreaView>
			)}
		</Translation>
	)
}

const CreateYourAccount: React.FC<{
	next: Navigation
}> = ({ next }) => {
	const ctx: any = useMsgrContext()
	const [{ text, padding, margin, background, border }] = useStyles()
	const [name, setName] = React.useState('')
	const [error, setError] = React.useState()
	const [isPressed, setIsPressed] = useState<boolean>(false)
	const onPress = React.useCallback(() => {
		const displayName = name || `anon#${ctx.account.publicKey.substr(0, 4)}`
		ctx.client
			.accountUpdate({ displayName })
			.then(() => {
				// TODO: check that account is in "ready" state
				setIsPressed(true)
			})
			.catch((err: any) => setError(err))
	}, [ctx.client, ctx.account.publicKey, name])
	return (
		<Translation>
			{(t) => (
				<>
					<View style={{ flex: 1 }}>
						<LottieView
							source={require('./Berty_onboard_animation_assets2/Startup animation assets/Berty BG.json')}
							autoPlay
							loop
							style={{ width: '100%' }}
						/>

						{!isPressed ? (
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
								onAnimationFinish={async (): Promise<void> => {
									//createAccount({ name: name || 'Anonymous 1337', nodeConfig })
									Vibration.vibrate(500)
									// @TODO: Error handling
									next()
								}}
							/>
						)}
					</View>
					<View style={{ flex: 1 }}>
						<SwiperCard
							label='required'
							title={t('onboarding.create-account.required')}
							description={t('onboarding.create-account.desc')}
							button={{
								text: t('onboarding.create-account.button'),
								onPress,
							}}
						>
							<TextInput
								autoCapitalize='none'
								autoCorrect={false}
								value={name}
								onChangeText={setName}
								placeholder={t('onboarding.create-account.placeholder')}
								style={[
									margin.top.medium,
									background.light.grey,
									padding.medium,
									text.size.large,
									border.radius.small,
									text.color.black,
								]}
							/>
							{error && <Text>{error.toString()}</Text>}
						</SwiperCard>
					</View>
				</>
			)}
		</Translation>
	)
}

const Notifications: React.FC<{
	submit: Form<{}>
	next: Navigation
}> = ({ submit, next }) => (
	<Translation>
		{(t) => (
			<SwiperCard
				header={t('onboarding.notifications.header')}
				label={t('onboarding.notifications.recommended')}
				title={t('onboarding.notifications.title')}
				description={t('onboarding.notifications.desc')}
				button={{
					text: t('onboarding.notifications.button'),
					onPress: async (): Promise<void> => {
						try {
							await submit({})
							Vibration.vibrate(500)
							next()
						} catch (err) {
							next()
						}
					},
				}}
				skip={{
					text: t('onboarding.notifications.skip'),
					onPress: next,
				}}
			/>
		)}
	</Translation>
)

const Bluetooth: React.FC<{
	submit: Form<{}>
	next: Navigation
}> = ({ submit, next }) => (
	<Translation>
		{(t) => (
			<SwiperCard
				header={t('onboarding.bluetooth.header')}
				label={t('onboarding.bluetooth.optional')}
				title={t('onboarding.bluetooth.title')}
				description={t('onboarding.bluetooth.desc')}
				button={{
					text: t('onboarding.bluetooth.button'),
					onPress: async (): Promise<void> => {
						try {
							await submit({})
							Vibration.vibrate(500)
							next()
						} catch (err) {
							next()
						}
					},
				}}
				skip={{
					text: t('onboarding.bluetooth.skip'),
					onPress: next,
				}}
			/>
		)}
	</Translation>
)

const SetupFinished: React.FC = () => {
	const navigation = useReactNavigation()
	//const client = Messenger.useClient()
	//const dispatch = useDispatch()
	const [isGeneration, setIsGeneration] = useState<number>(1)
	const [isGenerated, setIsGenerated] = useState<boolean>(false)
	const [isFinished, setIsFinished] = useState<boolean>(false)
	const [isAccount, setIsAccount] = useState<boolean>(false)
	const client = {}
	return (
		<Translation>
			{(t) =>
				isAccount ? (
					<>
						<View style={{ flex: 1 }}>
							<LottieView
								source={require('./Berty_onboard_animation_assets2/Startup animation assets/Berty BG.json')}
								autoPlay
								loop
								style={{ width: '100%' }}
							/>
							{!isGenerated ? (
								<>
									<LottieView
										source={require('./Berty_onboard_animation_assets2/Startup animation assets/Circle spin.json')}
										autoPlay
										loop={false}
									/>
									<LottieView
										source={require('./Berty_onboard_animation_assets2/Startup animation assets/Code Generated.json')}
										autoPlay
										loop={false}
										onAnimationFinish={() => {
											setIsGenerated(true)
										}}
									/>
								</>
							) : (
								<>
									{!isFinished ? (
										<LottieView
											source={require('./Berty_onboard_animation_assets2/Startup animation assets/Finish appear.json')}
											autoPlay
											loop={false}
											onAnimationFinish={() => {
												setIsFinished(true)
											}}
										/>
									) : (
										<LottieView
											source={require('./Berty_onboard_animation_assets2/Startup animation assets/Finish loop.json')}
											autoPlay
											loop
										/>
									)}
								</>
							)}
						</View>
						<View style={{ flex: 1 }}>
							<SwiperCard
								title={t('onboarding.setup-finished.title')}
								description={t('onboarding.setup-finished.desc')}
								button={{
									text: t('onboarding.setup-finished.button'),
									onPress: () => {
										Vibration.vibrate([500])
										navigation.dispatch(
											CommonActions.reset({
												routes: [{ name: Routes.Root.Tabs, params: { screen: Routes.Main.Home } }],
											}),
										)
									},
								}}
							/>
						</View>
					</>
				) : (
					<>
						<View style={{ flex: 1 }}>
							<LottieView
								source={require('./Berty_onboard_animation_assets2/Startup animation assets/Berty BG.json')}
								autoPlay
								loop
								style={{ width: '100%' }}
							/>
							{isGeneration === 1 && (
								<LottieView
									source={require('./Berty_onboard_animation_assets2/Startup animation assets/Code generation row 1.json')}
									autoPlay
									loop={false}
									speed={2}
									onAnimationFinish={() => {
										client ? setIsAccount(true) : setIsGeneration(2)
									}}
								/>
							)}
							{isGeneration === 2 && (
								<LottieView
									source={require('./Berty_onboard_animation_assets2/Startup animation assets/Code generation row 2.json')}
									autoPlay
									loop={false}
									speed={2}
									onAnimationFinish={() => {
										client ? setIsAccount(true) : setIsGeneration(3)
									}}
								/>
							)}
							{isGeneration === 3 && (
								<LottieView
									source={require('./Berty_onboard_animation_assets2/Startup animation assets/Code generation row 3.json')}
									autoPlay
									loop={false}
									speed={2}
									onAnimationFinish={() => {
										client ? setIsAccount(true) : setIsGeneration(4)
									}}
								/>
							)}
							{isGeneration === 4 && (
								<LottieView
									source={require('./Berty_onboard_animation_assets2/Startup animation assets/Code generation row 4.json')}
									autoPlay
									loop={false}
									speed={2}
									onAnimationFinish={() => {
										client ? setIsAccount(true) : setIsGeneration(1)
									}}
								/>
							)}
						</View>
						<View style={{ flex: 1 }}>
							<SwiperCard
								title={t('onboarding.generate-key.title')}
								description={t('onboarding.generate-key.desc')}
							>
								<Spinner size='large' />
							</SwiperCard>
						</View>
					</>
				)
			}
		</Translation>
	)
}

export const Performance: React.FC<{
	authorizeNotifications: Form<{}>
	authorizeBluetooth: Form<{}>
}> = ({ authorizeNotifications, authorizeBluetooth }) => {
	const { onLayout, height } = useLayout()
	const swiperRef = useRef<Swiper>(null)
	const next: (index: number) => () => void = (index) => (): void => {
		swiperRef && swiperRef.current && swiperRef.current.scrollTo(index, true)
	}
	const [{ absolute, background }] = useStyles()
	return (
		<SafeAreaView style={[absolute.fill, background.blue]}>
			<View style={absolute.fill} onLayout={onLayout}>
				<KeyboardAvoidingView style={[absolute.fill]} behavior='padding'>
					<Swiper
						height={height}
						index={0}
						ref={swiperRef}
						activeDotStyle={[background.white]}
						scrollEnabled={false}
					>
						<CreateYourAccount next={next(2)} />
						<ServicesAuth next={next(3)} />
						<SetupFinished />
					</Swiper>
				</KeyboardAvoidingView>
			</View>
		</SafeAreaView>
	)
}

export const Privacy: React.FC<{}> = () => {
	const { onLayout, ...layout } = useLayout()
	const swiperRef = useRef<Swiper>(null)
	const next: (index: number) => () => void = (index) => (): void => {
		swiperRef && swiperRef.current && swiperRef.current.scrollTo(index, true)
		return
	}
	const [{ absolute, background }] = useStyles()
	return (
		<SafeAreaView style={[absolute.fill, background.red]} onLayout={onLayout}>
			<View style={absolute.fill} onLayout={onLayout}>
				<KeyboardAvoidingView style={[absolute.fill]} behavior='padding'>
					<Swiper
						height={layout.height}
						ref={swiperRef}
						activeDotStyle={[background.white]}
						scrollEnabled={false}
					>
						<CreateYourAccount next={next(2)} />
						<SetupFinished />
					</Swiper>
				</KeyboardAvoidingView>
			</View>
		</SafeAreaView>
	)
}
