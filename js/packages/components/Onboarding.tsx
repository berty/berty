import React, { useState, useRef } from 'react'
import {
	View,
	ActivityIndicator as Spinner,
	KeyboardAvoidingView,
	Text,
	TextInput,
	TouchableHighlight,
	TouchableOpacity,
	ViewStyle,
	Switch,
	Vibration,
} from 'react-native'
import { useLayout } from 'react-native-hooks'
import { Translation } from 'react-i18next'
import Swiper from 'react-native-swiper'
import { Card, TouchableCard } from './shared-components/Card'
import { ColorsTypes, useStyles } from '@berty-tech/styles'
import { useNavigation, Routes } from '@berty-tech/berty-navigation'
import { Chat } from '@berty-tech/hooks'
import { useNavigation as useReactNavigation } from '@react-navigation/native'
import { useDispatch } from 'react-redux'
import { chat } from '@berty-tech/store'
import { SafeAreaView } from 'react-native-safe-area-context'
import Logo from './berty_gradient_square.svg'
import {
	defaultBridgeOpts,
	BertyNodeConfig,
	defaultExternalBridgeConfig,
} from '@berty-tech/store/protocol/client'

type Navigation = () => void
type Form<T> = (arg0: T) => Promise<void>

const Button: React.FC<{
	children: string
	onPress: () => Promise<void> | void
	style?: ViewStyle
}> = ({ children, onPress, style = null }) => {
	const [{ margin, padding, background, color, text, border }] = useStyles()
	const [loading, setLoading] = React.useState(false)
	return (
		<TouchableHighlight
			style={[
				padding.horizontal.big,
				margin.top.medium,
				padding.medium,
				loading ? background.light.blue : background.blue,
				border.radius.small,
				style,
			]}
			underlayColor={color.light.blue}
			onPress={async () => {
				try {
					setLoading(true)
					await onPress()
				} finally {
					setLoading(false)
				}
			}}
		>
			{loading ? (
				<Spinner style={[text.size.medium]} color={color.white} />
			) : (
				<Text style={[text.size.medium, text.color.white, text.align.center, text.bold.medium]}>
					{children}
				</Text>
			)}
		</TouchableHighlight>
	)
}

export const GetStarted: React.FC = () => {
	const { navigate } = useNavigation()
	const [{ absolute, background, column, row, flex, padding, text }] = useStyles()
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
						onPress={navigate.onboarding.performance}
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
						onPress={navigate.onboarding.privacy}
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

const SwiperCard: React.FC<{
	label?: 'required' | 'optional' | 'recommanded' | ''
	header?: string
	title: string
	description: string
	button?: { text: string; onPress: () => Promise<void> | void }
	skip?: { text: string; onPress: () => void }
}> = ({ children, header, label, title, description, button, skip }) => {
	const [{ absolute, text, padding, margin, background, border, color, column }] = useStyles()
	let labelColor: ColorsTypes
	switch (label) {
		default:
			labelColor = 'white'
			break
		case 'required':
			labelColor = 'red'
			break
		case 'optional':
			labelColor = 'yellow'
			break
		case 'recommanded':
			labelColor = 'green'
			break
	}
	return (
		<SafeAreaView style={[margin.bottom.huge, absolute.fill]}>
			<Text
				style={[
					absolute.fill,
					margin.big,
					padding.vertical.big,
					text.size.large,
					text.color.white,
					text.align.center,
				]}
			>
				{header}
			</Text>
			<Card
				style={[
					background.white,
					absolute.bottom,
					absolute.left,
					absolute.right,
					border.shadow.large,
				]}
			>
				<View
					style={[
						padding.tiny,
						column.item.right,
						background.light[labelColor],
						border.radius.tiny,
					]}
				>
					{label ? (
						<Text style={[text.size.small, text.color[labelColor], text.align.right]}>{label}</Text>
					) : null}
				</View>
				<Text
					style={[
						text.size.huge,
						padding.top.medium,
						text.align.center,
						text.bold.medium,
						text.color.blue,
					]}
				>
					{title}
				</Text>
				<Text
					style={[text.size.medium, padding.vertical.medium, text.align.center, text.color.grey]}
				>
					{description}
				</Text>
				{children}
				{button ? <Button onPress={button.onPress}>{button.text}</Button> : null}
				{skip ? (
					<TouchableOpacity style={[margin.top.medium]} onPress={skip.onPress}>
						<Text style={[text.size.small, text.color.grey, text.align.center]}>{skip.text}</Text>
					</TouchableOpacity>
				) : null}
			</Card>
		</SafeAreaView>
	)
}

const defaultEmbeddedConfig: BertyNodeConfig = {
	type: 'embedded',
	opts: defaultBridgeOpts,
}

const NodeConfigInput: React.FC<{
	config: BertyNodeConfig
	onConfigChange: (config: BertyNodeConfig) => void
}> = ({ config, onConfigChange }) => {
	const [{ text, padding, margin, background, border }] = useStyles()
	const toggleNodeType = () =>
		onConfigChange(config.type === 'external' ? defaultEmbeddedConfig : defaultExternalBridgeConfig)
	let content: Element
	if (config.type === 'external') {
		content = (
			<>
				<TextInput
					placeholder={'Bridge port'}
					style={[
						margin.top.medium,
						background.light.grey,
						padding.medium,
						text.size.large,
						border.radius.small,
						text.color.black,
					]}
					value={`${config.port}`}
					onChangeText={(text) => onConfigChange({ ...config, port: parseInt(text, 10) })}
				/>
			</>
		)
	} else {
		content = (
			<>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Text>Persist: </Text>
					<Switch
						value={config.opts.persistance}
						onValueChange={() =>
							onConfigChange({
								...config,
								opts: { ...config.opts, persistance: !config.opts.persistance },
							})
						}
					/>
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Text>Trace: </Text>
					<Switch
						value={config.opts.tracing}
						onValueChange={() =>
							onConfigChange({
								...config,
								opts: { ...config.opts, tracing: !config.opts.tracing },
							})
						}
					/>
				</View>
			</>
		)
	}
	return (
		<>
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<Switch value={config.type === 'external'} onValueChange={toggleNodeType} />
				<Text> {config.type}</Text>
			</View>
			{content}
		</>
	)
}

const CreateYourAccount: React.FC<{
	next: Navigation
}> = ({ next }) => {
	const [name, setName] = useState('')
	const [nodeConfig, setNodeConfig] = useState(
		__DEV__ ? defaultExternalBridgeConfig : defaultEmbeddedConfig,
	)
	const [{ text, padding, margin, background, border }] = useStyles()
	const createAccount = Chat.useAccountCreate()
	return (
		<Translation>
			{(t) => (
				<SwiperCard
					label='required'
					title={t('onboarding.create-account.required')}
					description={t('onboarding.create-account.desc')}
					button={{
						text: t('onboarding.create-account.button'),
						onPress: async (): Promise<void> => {
							createAccount({ name: name || 'Anonymous 1337', nodeConfig })
							Vibration.vibrate(500)
							// @TODO: Error handling
							next()
						},
					}}
				>
					<TextInput
						placeholder={t('onboarding.create-account.placeholder')}
						style={[
							margin.top.medium,
							background.light.grey,
							padding.medium,
							text.size.large,
							border.radius.small,
							text.color.black,
						]}
						onChangeText={setName}
					/>
					{__DEV__ && <NodeConfigInput onConfigChange={setNodeConfig} config={nodeConfig} />}
				</SwiperCard>
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
				label={t('onboarding.notifications.recommanded')}
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
	const account = Chat.useAccount()
	const dispatch = useDispatch()
	return (
		<Translation>
			{(t) =>
				account ? (
					<SwiperCard
						title={t('onboarding.setup-finished.title')}
						description={t('onboarding.setup-finished.desc')}
						button={{
							text: t('onboarding.setup-finished.button'),
							onPress: () => {
								dispatch(chat.account.commands.onboard({ id: account.id }))
								Vibration.vibrate([500])
								navigation.navigate(Routes.Root.Tabs, { screen: Routes.Main.List })
							},
						}}
					/>
				) : (
					<SwiperCard
						title={t('onboarding.generate-key.title')}
						description={t('onboarding.generate-key.desc')}
					>
						<Spinner size='large' />
					</SwiperCard>
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
						{/*<SafeAreaView style={absolute.fill}>
							<Notifications submit={authorizeNotifications} next={next(4)} />
						</SafeAreaView>
						<Bluetooth submit={authorizeBluetooth} next={next(5)} />*/}
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
