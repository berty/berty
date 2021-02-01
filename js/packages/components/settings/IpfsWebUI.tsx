import React from 'react'
import { View, ScrollView } from 'react-native'
import { Layout } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import { HeaderSettings } from '../common/Header'
import { WebView } from 'react-native-webview'
import { useStyles } from '@berty-tech/styles'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'

//
// IpfsWebUI
//

const BodyIpfsWebUI: React.FC<{}> = () => {
	const [{ padding, flex, margin }] = useStyles()
	return (
		<View style={[padding.medium, flex.tiny, margin.bottom.small]}>
			<WebView
				source={{ uri: 'http://127.0.0.1:3000' }}
				//TODO: remove fixed height
				style={[{ height: 1000 }]}
			/>
		</View>
	)
}

export const IpfsWebUI: React.FC<ScreenProps.Settings.IpfsWebUI> = () => {
	const { t } = useTranslation()
	const { goBack } = useNavigation()
	const [{ background, flex, color, padding }] = useStyles()

	return (
		<Layout style={[background.white, flex.tiny]}>
			<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
				<HeaderSettings
					title={t('settings.ipfs-webui.title')}
					bgColor={color.dark.grey}
					undo={goBack}
				/>
				<BodyIpfsWebUI />
			</ScrollView>
		</Layout>
	)
}
