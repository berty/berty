import React from 'react'
import { Vibration } from 'react-native'
import { Text } from 'react-native-ui-kitten'
import { Translation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useStyles } from '@berty-tech/styles'
import { useNavigation } from '@berty-tech/navigation'

import { TouchableCard } from './shared-components/Card'
import SwiperCard from './onboarding/SwiperCard'

type Navigation = () => void
type Form<T> = (arg0: T) => Promise<void>

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

export const Notifications: React.FC<{
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

export const Bluetooth: React.FC<{
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
