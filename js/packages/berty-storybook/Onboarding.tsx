import React, { useState, useRef, useContext } from 'react'
import {
	Platform,
	SafeAreaView,
	View,
	StyleSheet,
	ActivityIndicator as Spinner,
	KeyboardAvoidingView,
} from 'react-native'
import { useLayout } from 'react-native-hooks'
import { Text, Button, Layout, Input } from 'react-native-ui-kitten'
import { Translation } from 'react-i18next'
import { Grid, Row, Col } from 'react-native-easy-grid'
import Swiper from 'react-native-swiper'
import { Card, TouchableCard } from '@berty-tech/shared-storybook'
import styles from './styles'
import { useNavigation } from '@berty-tech/berty-navigation'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'

type Navigation = () => void
type Form<T> = (arg0: T) => Promise<void>

const _styles = StyleSheet.create({
	swiperCard: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 32,
	},
})

export const GetStarted: React.FC = () => {
	const { navigate } = useNavigation()
	return (
		<Translation>
			{(t) => (
				<Layout style={[styles.flex]}>
					<Grid>
						<Row size={5} />
						<Row size={2}>
							<Col>
								<Text style={[styles.textCenter, styles.padding]}>
									{t('onboarding.getstarted')}
								</Text>
							</Col>
						</Row>
						<Row size={2}>
							<Col>
								<Button style={[styles.center]} onPress={navigate.onboarding.selectMode}>
									GET STARTED
								</Button>
							</Col>
						</Row>
					</Grid>
				</Layout>
			)}
		</Translation>
	)
}

export const SelectMode: React.FC = () => {
	const { navigate } = useNavigation()
	return (
		<Translation>
			{(t) => (
				<Layout style={[styles.flex]}>
					<SafeAreaView style={styles.flex}>
						<Text style={[styles.center, styles.textCenter, styles.paddingTop]} category='h4'>
							Select your app mode
						</Text>
						<View
							style={[
								styles.padding,
								styles.flex,
								styles.wrap,
								styles.center,
								styles.col,
								{ justifyContent: 'space-evenly' },
							]}
						>
							<TouchableCard
								style={[styles.bgBlue, styles.stretch]}
								onPress={navigate.onboarding.performance}
							>
								<Text category='h5' style={[styles.textWhite]}>
									{t('onboarding.select-mode.performance.title')}
								</Text>
								<Text category='s2' style={[styles.textWhite]}>
									{t('onboarding.select-mode.performance.desc')}
								</Text>
								<Text category='c1' style={[styles.textWhite]}>
									{t('onboarding.select-mode.performance.push-notif')}
								</Text>
								<Text category='c1' style={[styles.textWhite]}>
									{t('onboarding.select-mode.performance.offline-message')}
								</Text>
								<Text category='c1' style={[styles.textWhite]}>
									{t('onboarding.select-mode.performance.add-contact')}
								</Text>
								<Text category='c1' style={[styles.textWhite]}>
									{t('onboarding.select-mode.performance.fast-message')}
								</Text>
							</TouchableCard>
							<TouchableCard
								style={[styles.bgRed, styles.stretch]}
								onPress={navigate.onboarding.privacy}
							>
								<Text category='h5' style={[styles.textWhite]}>
									{t('onboarding.select-mode.high-level.title')}
								</Text>
								<Text category='s2' style={[styles.textWhite]}>
									{t('onboarding.select-mode.high-level.desc')}
								</Text>
								<Text category='c1' style={[styles.textWhite]}>
									{t('onboarding.select-mode.high-level.disable-push-notif')}
								</Text>
								<Text category='c1' style={[styles.textWhite]}>
									{t('onboarding.select-mode.high-level.disable-local-peer-discovery')}
								</Text>
								<Text category='c1' style={[styles.textWhite]}>
									{t('onboarding.select-mode.high-level.disable-contact-request')}
								</Text>
							</TouchableCard>
						</View>
						<Text style={[styles.textCenter, styles.paddingVertical]} category='c1'>
							All this presets can be modified at any time in the settings
						</Text>
					</SafeAreaView>
				</Layout>
			)}
		</Translation>
	)
}

const CreateYourAccount: React.FC<{
	next: Navigation
}> = ({ next }) => {
	const store = useContext(Store.Context)
	const [name, setName] = useState('')
	const [loading, setLoading] = useState(false)
	const [, setErr] = useState(null)
	return (
		<Translation>
			{(t) => (
				<Card style={[styles.bgWhite, _styles.swiperCard]}>
					<Text status='danger' style={styles.textRight}>
						{t('onboarding.create-account.required')}
					</Text>
					<Text category='h4' style={[styles.paddingTop, styles.textCenter]}>
						{t('onboarding.create-account.title')}
					</Text>
					<Text category='c1' style={[styles.paddingVertical, styles.textCenter]}>
						{t('onboarding.create-account.desc')}
					</Text>
					<Input
						placeholder={t('onboarding.create-account.placeholder')}
						style={styles.marginTop}
						onChangeText={setName}
					/>
					<Button
						style={styles.marginTop}
						disabled={loading ? true : false}
						onPress={async (): Promise<void> => {
							try {
								setLoading(true)
								await store.accountCreate({ name })
								next()
							} catch (err) {
								setErr(err)
							} finally {
								setLoading(false)
							}
						}}
					>
						{loading ? '' : t('onboarding.create-account.button')}
					</Button>
				</Card>
			)}
		</Translation>
	)
}

const GeneratingYourKey: React.FC<{}> = () => (
	<Translation>
		{(t) => (
			<Card style={[styles.bgWhite, _styles.swiperCard]}>
				<Text />
				<Text category='h4' style={[styles.paddingTop, styles.textCenter]}>
					{t('onboarding.generate-key.title')}
				</Text>
				<Text category='c1' style={[styles.paddingVertical, styles.textCenter]}>
					{t('onboarding.generate-key.desc')}
				</Text>
				<Spinner size='large' />
			</Card>
		)}
	</Translation>
)

const Notifications: React.FC<{
	submit: Form<{}>
	next: Navigation
}> = ({ submit, next }) => (
	<Translation>
		{(t) => (
			<>
				<Text category='h5' style={[StyleSheet.absoluteFill, styles.textWhite, styles.textCenter]}>
					{t('onboarding.notifications.header')}
				</Text>
				<Card style={[styles.bgWhite, _styles.swiperCard, styles.end]}>
					<Text status='success' style={styles.textRight}>
						{t('onboarding.notifications.recommanded')}
					</Text>
					<Text category='h4' style={[styles.paddingTop, styles.textCenter]}>
						{t('onboarding.notifications.title')}
					</Text>
					<Text category='c1' style={[styles.paddingVertical, styles.textCenter]}>
						{t('onboarding.notifications.desc')}
					</Text>
					<Button
						style={styles.marginTop}
						onPress={async (): Promise<void> => {
							try {
								await submit({})
								next()
							} catch (err) {
								next()
							}
						}}
					>
						{t('onboarding.notifications.button')}
					</Button>
					<Button appearance='ghost' size='tiny' style={styles.marginTop} onPress={next}>
						{t('onboarding.notifications.skip')}
					</Button>
				</Card>
			</>
		)}
	</Translation>
)

const Bluetooth: React.FC<{
	submit: Form<{}>
	next: Navigation
}> = ({ submit, next }) => (
	<Translation>
		{(t) => (
			<>
				<Text category='h5' style={[styles.textWhite, styles.textCenter]}>
					{t('onboarding.bluetooth.header')}
				</Text>
				<Card style={[styles.bgWhite, _styles.swiperCard]}>
					<Text status='warning' style={styles.textRight}>
						{t('onboarding.bluetooth.optional')}
					</Text>
					<Text category='h4' style={[styles.paddingTop, styles.textCenter]}>
						{t('onboarding.bluetooth.title')}
					</Text>
					<Text category='c1' style={[styles.paddingVertical, styles.textCenter]}>
						{t('onboarding.bluetooth.desc')}
					</Text>
					<Button
						style={styles.marginTop}
						onPress={async (): Promise<void> => {
							try {
								await submit({})
								next()
							} catch (err) {
								next()
							}
						}}
					>
						{t('onboarding.bluetooth.button')}
					</Button>
					<Button appearance='ghost' size='tiny' style={styles.marginTop} onPress={next}>
						{t('onboarding.bluetooth.skip')}
					</Button>
				</Card>
			</>
		)}
	</Translation>
)

const SetupFinished: React.FC = () => {
	const { navigate } = useNavigation()
	return (
		<Translation>
			{(t) => (
				<>
					<Card style={[styles.bgWhite, _styles.swiperCard]}>
						<Text />
						<Text category='h4' style={[styles.paddingTop, styles.textCenter]}>
							{t('onboarding.setup-finished.title')}
						</Text>
						<Text category='c1' style={[styles.paddingVertical, styles.textCenter]}>
							{t('onboarding.setup-finished.desc')}
						</Text>
						<Button style={styles.marginTop} onPress={navigate.tab.main}>
							{t('onboarding.setup-finished.button')}
						</Button>
					</Card>
				</>
			)}
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
	return (
		<Layout style={[StyleSheet.absoluteFill, styles.bgBlue]}>
			<SafeAreaView style={[StyleSheet.absoluteFill]}>
				<View style={styles.flex} onLayout={onLayout}>
					<KeyboardAvoidingView style={[StyleSheet.absoluteFill]} behavior='padding'>
						<Swiper
							height={height}
							index={0}
							ref={swiperRef}
							activeDotStyle={[styles.bgWhite, styles.relative]}
							scrollEnabled={false}
						>
							<CreateYourAccount
								next={(): void => {
									next(2)()
									setTimeout(() => next(3)(), 1000)
								}}
							/>
							<GeneratingYourKey />
							<SafeAreaView style={StyleSheet.absoluteFill}>
								<Notifications submit={authorizeNotifications} next={next(4)} />
							</SafeAreaView>
							<Bluetooth submit={authorizeBluetooth} next={next(5)} />
							<SetupFinished />
						</Swiper>
					</KeyboardAvoidingView>
				</View>
			</SafeAreaView>
		</Layout>
	)
}

export const Privacy: React.FC<{}> = () => {
	const { onLayout, ...layout } = useLayout()
	const swiperRef = useRef<Swiper>(null)
	const next: (index: number) => () => void = (index) => (): void => {
		swiperRef && swiperRef.current && swiperRef.current.scrollTo(index, true)
		return
	}
	return (
		<Layout style={[styles.flex, styles.bgRed]}>
			<SafeAreaView style={[styles.flex]} onLayout={onLayout}>
				<View style={styles.flex} onLayout={onLayout}>
					<KeyboardAvoidingView style={[StyleSheet.absoluteFill]} behavior='padding'>
						<Swiper
							height={layout.height}
							ref={swiperRef}
							activeDotStyle={[styles.bgWhite, styles.relative]}
							scrollEnabled={false}
						>
							<CreateYourAccount
								next={(): void => {
									next(2)()
									setTimeout(() => next(3)(), 1000)
								}}
							/>
							<GeneratingYourKey />
							<SetupFinished />
						</Swiper>
					</KeyboardAvoidingView>
				</View>
			</SafeAreaView>
		</Layout>
	)
}
