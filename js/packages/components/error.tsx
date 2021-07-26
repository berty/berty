import React from 'react'
import { View, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import { setJSExceptionHandler } from 'react-native-exception-handler'
import RNRestart from 'react-native-restart'

import { useStyles } from '@berty-tech/styles'
import { useThemeColor, useMsgrContext } from '@berty-tech/store/hooks'

import AppInspector from './debug/AppInspector'

const Label: React.FC<{ title: string; type: 'error' }> = ({ title, type }) => {
	const [{ padding, border }] = useStyles()
	const colors = useThemeColor()

	let generatedColors = {
		background: colors['main-background'],
		text: colors['main-text'],
	}
	switch (type) {
		case 'error':
			generatedColors = {
				background: colors['input-background'],
				text: colors['warning-asset'],
			}
			break
	}
	return (
		<View
			style={[
				padding.vertical.small,
				padding.horizontal.large,
				border.radius.large,
				{ backgroundColor: generatedColors.background },
			]}
		>
			<Text style={[{ color: generatedColors.text, textTransform: 'uppercase' }]}>{title}</Text>
		</View>
	)
}

const Body: React.FC<{ children: React.ReactElement[] }> = ({ children }) => {
	const [{ border, padding }] = useStyles()
	const colors = useThemeColor()

	return (
		<View
			style={[border.radius.large, padding.large, { backgroundColor: colors['main-background'] }]}
		>
			{children}
		</View>
	)
}

const RestartButton: React.FC<{}> = ({}) => {
	const [{ border, margin, padding }] = useStyles()
	const colors = useThemeColor()
	const { t }: { t: any } = useTranslation()

	return (
		<TouchableOpacity
			onPress={() => RNRestart.Restart()}
			activeOpacity={0.7}
			style={[
				margin.top.big,
				margin.bottom.medium,
				border.radius.small,
				padding.medium,
				{
					backgroundColor: colors['positive-asset'],
					alignItems: 'center',
					width: '100%',
				},
			]}
		>
			<Text
				style={{
					color: colors['background-header'],
					fontWeight: '700',
					textTransform: 'uppercase',
				}}
			>
				{t('error.restart-app')}
			</Text>
		</TouchableOpacity>
	)
}

const ErrorScreenContainer: React.FC<{ labelTitle: string; children: React.ReactElement[] }> = ({
	labelTitle,
	children,
}) => {
	const [{ padding }] = useStyles()
	const colors = useThemeColor()

	return (
		<SafeAreaView
			style={[
				{
					backgroundColor: colors['background-header'],
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				},
			]}
		>
			<StatusBar barStyle='light-content' />
			<View style={[padding.large, { width: '100%' }]}>
				<Body>
					<View style={{ alignSelf: 'flex-end' }}>
						<Label title={labelTitle} type='error' />
					</View>
					<View style={[padding.horizontal.large, { alignItems: 'center' }]}>
						{children}
						<RestartButton />
					</View>
				</Body>
			</View>
		</SafeAreaView>
	)
}

const WTFScreen: React.FC<{}> = ({}) => {
	const [{ margin }] = useStyles()
	const colors = useThemeColor()
	const { t }: { t: any } = useTranslation()
	return (
		<ErrorScreenContainer labelTitle={t('error.labels.bug')}>
			<View
				style={[
					margin.top.big,
					{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center',
						marginLeft: -65,
					},
				]}
			>
				<Icon
					name='question-mark-circle'
					fill={colors['background-header']}
					height={45}
					width={45}
					style={{
						marginRight: 20,
					}}
				/>
				<Text style={{ color: colors['background-header'], fontSize: 30, fontWeight: '700' }}>
					WTF?!
				</Text>
			</View>
			<Text
				style={[
					{
						color: colors['secondary-text'],
						fontWeight: '700',
						textAlign: 'center',
					},
					margin.top.big,
					margin.bottom.small,
				]}
			>
				{t('error.wtf-screen.title')}
			</Text>
			<Text style={{ color: colors['secondary-text'], textAlign: 'center', lineHeight: 24 }}>
				{t('error.wtf-screen.desc')}
			</Text>
			<Text style={{ color: colors['secondary-text'], textAlign: 'center', lineHeight: 24 }}>
				{t('error.wtf-screen.desc-report')}
			</Text>
		</ErrorScreenContainer>
	)
}

const SorryScreen: React.FC<{}> = ({}) => {
	const [{ margin }] = useStyles()
	const colors = useThemeColor()
	const { t }: { t: any } = useTranslation()

	return (
		<ErrorScreenContainer labelTitle={t('error.labels.crash')}>
			<Icon
				name='wrong-man'
				fill={colors['background-header']}
				pack='custom'
				height={100}
				width={100}
				style={[margin.top.large]}
			/>
			<View style={{ marginHorizontal: -15 }}>
				<Text
					style={[
						{
							color: colors['secondary-text'],
							fontWeight: '700',
							textAlign: 'center',
						},
						margin.top.big,
						margin.bottom.small,
					]}
				>
					{t('error.sorry-screen.title')}
				</Text>
				<Text style={{ color: colors['secondary-text'], textAlign: 'center', lineHeight: 24 }}>
					{t('error.sorry-screen.desc')}
				</Text>
				<Text
					style={[
						margin.top.large,
						{
							color: colors['secondary-text'],
							textAlign: 'center',
							lineHeight: 24,
							fontStyle: 'italic',
						},
					]}
				>
					{t('error.sorry-screen.desc-em')}
				</Text>
				<Text
					style={{
						color: colors['secondary-text'],
						textAlign: 'center',
						lineHeight: 24,
						fontWeight: '700',
					}}
				>
					{t('error.sorry-screen.desc-report')}
				</Text>
			</View>
		</ErrorScreenContainer>
	)
}
export const ErrorScreen: React.FC<{ children: React.ReactElement }> = ({ children }) => {
	const components = [<WTFScreen />, <SorryScreen />]

	const [error, setError] = React.useState<Error | null>(null)

	const { debugMode, embedded } = useMsgrContext()

	const errorHandler = (err: Error) => {
		setError(err)
	}

	React.useEffect(() => {
		setJSExceptionHandler(errorHandler)
	}, [])

	if (debugMode) {
		return <AppInspector embedded={embedded} error={error} />
	}

	if (error !== null) {
		return components[Math.floor(Math.random() * components.length)]
	}
	return children
}
