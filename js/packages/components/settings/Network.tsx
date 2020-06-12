import React from 'react'
import { View, ScrollView } from 'react-native'
import { Layout } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'

//
// Network
//

// Styles
const useStylesNetwork = () => {
	const [{ margin, height }] = useStyles()
	return {
		buttonRow: [margin.right.scale(20), height(90)],
		lastButtonRow: height(90),
		buttonRowMarginTop: margin.top.scale(20),
	}
}

const HeaderNetwork: React.FC<{}> = () => {
	const _styles = useStylesNetwork()
	const [{ color, text }] = useStyles()
	const { navigate } = useNavigation()

	return (
		<View>
			<ButtonSettingRow
				state={[
					{
						name: 'Ipfs WebUI',
						icon: 'smartphone-outline',
						color: color.dark.grey,
						style: _styles.buttonRow,
						onPress: navigate.settings.ipfsWebUI,
					},
				]}
				style={[_styles.buttonRowMarginTop]}
				styleText={[text.bold.medium]}
			/>
		</View>
	)
}

export const Network: React.FC<ScreenProps.Settings.Network> = () => {
	const { goBack } = useNavigation()
	const [{ background, flex, color, padding }] = useStyles()
	return (
		<Layout style={[background.white, flex.tiny]}>
			<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
				<HeaderSettings title='Network' bgColor={color.dark.grey} undo={goBack}>
					<HeaderNetwork />
				</HeaderSettings>
			</ScrollView>
		</Layout>
	)
}
