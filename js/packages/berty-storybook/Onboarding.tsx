import React, { useState, useRef } from 'react'
import { SafeAreaView, View, StyleSheet, ActivityIndicator as Spinner } from 'react-native'
import { Text, Button, Layout, Input } from 'react-native-ui-kitten'
import { Translation } from 'react-i18next'
import { Grid, Row, Col } from 'react-native-easy-grid'
import Swiper from 'react-native-swiper'
import { Card, TouchableCard } from '@berty-tech/shared-storybook'
import styles from './styles'

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

export const GetStarted: React.FC<{
	selectMode?: Navigation
}> = ({ selectMode }) => {
	return (
		<Translation>
			{(t) => (
				<Layout style={[styles.flex]}>
					<Grid>
						<Row size={5} />
						<Row size={2}>
							<Col>
								<Text style={[styles.textCenter, styles.padding]}>{t('onboarding.getstarted')}</Text>
							</Col>
						</Row>
						<Row size={2}>
							<Col>
								<Button style={[styles.center]} onPress={selectMode}>
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

export const SelectMode: React.FC<{
	privacy?: Navigation
	performance?: Navigation
}> = ({ privacy, performance }) => (
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
						<TouchableCard style={[styles.bgBlue, styles.stretch]} onPress={performance}>
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
						<TouchableCard style={[styles.bgRed, styles.stretch]} onPress={privacy}>
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

const CreateYourAccount: React.FC<{
	submit: Form<{ name: string }>
	next: Navigation
}> = ({ submit, next }) => {
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
								await submit({ name })
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
				<Text category='h5' style={[styles.textWhite, styles.textCenter, styles.padding, styles.margin]}>
					{t('onboarding.notifications.header')}
				</Text>
				<Card style={[styles.bgWhite, _styles.swiperCard]}>
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
				<Text category='h5' style={[styles.textWhite, styles.textCenter, styles.padding, styles.margin]}>
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

const SetupFinished: React.FC<{ next: Navigation }> = ({ next }) => (
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
					<Button style={styles.marginTop} onPress={next}>
						{t('onboarding.setup-finished.button')}
					</Button>
				</Card>
			</>
		)}
	</Translation>
)

export const Performance: React.FC<{
	createAccount: Form<{ name: string }>
	generateKey: Form<{}>
	authorizeNotifications: Form<null>
	authorizeBluetooth: Form<null>
	startApp: Navigation
}> = ({ createAccount, generateKey, authorizeNotifications, authorizeBluetooth, startApp }) => {
	const swiperRef = useRef<Swiper>(null)
	const next: (index: number) => () => void = (index) => (): void => {
		swiperRef && swiperRef.current && swiperRef.current.scrollTo(index, true)
		return
	}
	return (
		<Layout style={[styles.flex, styles.bgBlue]}>
			<SafeAreaView style={[styles.flex]}>
				<Swiper index={0} ref={swiperRef} activeDotStyle={[styles.bgWhite, styles.relative]} scrollEnabled={false}>
					<CreateYourAccount
						submit={createAccount}
						next={(): void => {
							next(2)()
							generateKey({})
								.then(() => next(3)())
								.catch(() => next(1)())
						}}
					/>
					<GeneratingYourKey />
					<Notifications submit={authorizeNotifications} next={next(4)} />
					<Bluetooth submit={authorizeBluetooth} next={next(5)} />
					<SetupFinished next={startApp} />
				</Swiper>
			</SafeAreaView>
		</Layout>
	)
}

export const Privacy: React.FC<{
	createAccount: Form<{ name: string }>
	generateKey: Form<{}>
	startApp: Navigation
}> = ({ createAccount, generateKey, startApp }) => {
	const swiperRef = useRef<Swiper>(null)
	const next: (index: number) => () => void = (index) => (): void => {
		swiperRef && swiperRef.current && swiperRef.current.scrollTo(index, true)
		return
	}
	return (
		<Layout style={[styles.flex, styles.bgRed]}>
			<SafeAreaView style={[styles.flex]}>
				<Swiper ref={swiperRef} activeDotStyle={[styles.bgWhite, styles.relative]} scrollEnabled={false}>
					<CreateYourAccount
						submit={createAccount}
						next={(): void => {
							next(2)()
							generateKey({})
								.then(() => next(3)())
								.catch(() => next(1)())
						}}
					/>
					<GeneratingYourKey />
					<SetupFinished next={startApp} />
				</Swiper>
			</SafeAreaView>
		</Layout>
	)
}
