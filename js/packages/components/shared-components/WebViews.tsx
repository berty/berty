import React from 'react'
import { useTranslation } from 'react-i18next'
import { StatusBar, Platform, ActivityIndicator, Linking } from 'react-native'
import { WebView } from 'react-native-webview'

import { ActionCard } from '@berty/components'
import { useThemeColor } from '@berty/hooks'
import { useNavigation } from '@berty/navigation'

export const WebViews: React.FC<{ url: string }> = ({ url }) => {
	const [isModal, setIsModal] = React.useState(true)
	const [isAccept, setIsAccept] = React.useState(false)
	const [isLoading, setIsLoading] = React.useState<boolean>()
	const { goBack } = useNavigation()
	const colors = useThemeColor()
	const { t } = useTranslation()

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
			{isModal && (
				<ActionCard
					title={t('onboarding.web-views.title')}
					description={t('onboarding.web-views.desc')}
					onClose={() => setIsModal(false)}
					onConfirm={() => setIsAccept(true)}
					cancelText={t('onboarding.web-views.first-button')}
					confirmText={t('onboarding.web-views.second-button')}
				/>
			)}
		</>
	)
}
