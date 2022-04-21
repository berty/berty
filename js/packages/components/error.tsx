import React from 'react'
import { View, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native'
import { Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import { setJSExceptionHandler } from 'react-native-exception-handler'
import RNRestart from 'react-native-restart'

import { useThemeColor } from '@berty/store'
import { useAppSelector } from '@berty/hooks'
import { selectDebugMode, selectEmbedded } from '@berty/redux/reducers/ui.reducer'
import { useStyles } from '@berty/contexts/styles'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

import AppInspector from './debug/AppInspector'
import { UnifiedText } from './shared-components/UnifiedText'

const Label: React.FC<{ title: string; type: 'error' }> = ({ title, type }) => {
	const { padding, border } = useStyles()
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
			<UnifiedText style={[{ color: generatedColors.text, textTransform: 'uppercase' }]}>
				{title}
			</UnifiedText>
		</View>
	)
}

const Body: React.FC<{ children: React.ReactElement[] }> = ({ children }) => {
	const { border, padding } = useStyles()
	const colors = useThemeColor()

	return (
		<View
			style={[border.radius.large, padding.large, { backgroundColor: colors['main-background'] }]}
		>
			{children}
		</View>
	)
}

const RestartButton: React.FC = () => {
	const { border, margin, padding, text } = useStyles()
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
			<UnifiedText
				style={[text.bold, { color: colors['background-header'], textTransform: 'uppercase' }]}
			>
				{t('error.restart-app')}
			</UnifiedText>
		</TouchableOpacity>
	)
}

const ErrorDetails: React.FC<{ error: Error }> = ({ error }) => {
	const [collapsed, setCollapsed] = React.useState(true)
	const { margin } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const handlePress = React.useCallback(() => {
		setCollapsed(!collapsed)
	}, [collapsed])
	return (
		<View style={margin.top.big}>
			<TouchableOpacity style={{ flexDirection: 'row' }} onPress={handlePress}>
				<Icon
					name={collapsed ? 'arrow-forward-outline' : 'arrow-downward-outline'}
					width={25 * scaleSize}
					height={25 * scaleSize}
					fill={colors['background-header']}
				/>
				<UnifiedText>Details</UnifiedText>
			</TouchableOpacity>
			{collapsed || <UnifiedText>{error.message}</UnifiedText>}
		</View>
	)
}

const ErrorScreenContainer: React.FC<{
	labelTitle: string
	children: React.ReactElement[]
	error: Error
}> = ({ labelTitle, children, error }) => {
	const { padding } = useStyles()
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
						<ErrorDetails error={error} />
						<RestartButton />
					</View>
				</Body>
			</View>
		</SafeAreaView>
	)
}

type ErrorScreenProps = {
	error: Error
}

const WTFScreen: React.FC<ErrorScreenProps> = ({ error }) => {
	const { margin, text } = useStyles()
	const colors = useThemeColor()
	const { t }: { t: any } = useTranslation()
	return (
		<ErrorScreenContainer error={error} labelTitle={t('error.labels.bug')}>
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
				<UnifiedText style={[text.bold, { color: colors['background-header'], fontSize: 30 }]}>
					WTF?!
				</UnifiedText>
			</View>
			<UnifiedText
				style={[
					text.bold,
					{ color: colors['secondary-text'], textAlign: 'center' },
					margin.top.big,
					margin.bottom.small,
				]}
			>
				{t('error.wtf-screen.title')}
			</UnifiedText>
			<UnifiedText style={{ color: colors['secondary-text'], textAlign: 'center', lineHeight: 24 }}>
				{t('error.wtf-screen.desc')}
			</UnifiedText>
			<UnifiedText style={{ color: colors['secondary-text'], textAlign: 'center', lineHeight: 24 }}>
				{t('error.wtf-screen.desc-report')}
			</UnifiedText>
		</ErrorScreenContainer>
	)
}

const SorryScreen: React.FC<ErrorScreenProps> = ({ error }) => {
	const { margin, text } = useStyles()
	const colors = useThemeColor()
	const { t }: { t: any } = useTranslation()

	return (
		<ErrorScreenContainer error={error} labelTitle={t('error.labels.crash')}>
			<Icon
				name='wrong-man'
				fill={colors['background-header']}
				pack='custom'
				height={100}
				width={100}
				style={[margin.top.large]}
			/>
			<View style={{ marginHorizontal: -15 }}>
				<UnifiedText
					style={[
						text.bold,
						{
							color: colors['secondary-text'],
							textAlign: 'center',
						},
						margin.top.big,
						margin.bottom.small,
					]}
				>
					{t('error.sorry-screen.title')}
				</UnifiedText>
				<UnifiedText
					style={{ color: colors['secondary-text'], textAlign: 'center', lineHeight: 24 }}
				>
					{t('error.sorry-screen.desc')}
				</UnifiedText>
				<UnifiedText
					style={[
						margin.top.large,
						text.italic,
						{
							color: colors['secondary-text'],
							textAlign: 'center',
							lineHeight: 24,
						},
					]}
				>
					{t('error.sorry-screen.desc-em')}
				</UnifiedText>
				<UnifiedText
					style={[
						text.bold,
						{
							color: colors['secondary-text'],
							textAlign: 'center',
							lineHeight: 24,
						},
					]}
				>
					{t('error.sorry-screen.desc-report')}
				</UnifiedText>
			</View>
		</ErrorScreenContainer>
	)
}

export const ErrorScreen: React.FC = ({ children }) => {
	const components = [WTFScreen, SorryScreen]

	const [error, setError] = React.useState<Error | null>(null)

	const debugMode = useAppSelector(selectDebugMode)
	const embedded = useAppSelector(selectEmbedded)

	const errorHandler = (err: Error) => {
		setError(err)
	}

	React.useEffect(() => {
		setJSExceptionHandler(errorHandler)
	}, [])

	React.useEffect(() => {
		console.log('Error crash js', error)
	}, [error])

	if (debugMode) {
		return <AppInspector embedded={embedded} error={error} />
	}

	if (error !== null) {
		const Component = components[Math.floor(Math.random() * components.length)]
		return <Component error={error} />
	}
	return <>{children}</>
}
