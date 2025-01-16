import { StatusBar, View } from "react-native";
import { useTranslation } from 'react-i18next'
import BertyGradientSquareSvg from "@berty/assets/logo/berty-gradient-square-svg";
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from "@berty/hooks";
import { UnifiedText } from "@berty/components/shared-components/UnifiedText";
import { PrimaryButton } from "@berty/components";

export default function GetStarted() {
	const { margin, padding, text } = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()

return (
	<View
		style={[
			padding.medium,
			{ backgroundColor: colors['main-background'], flex: 1, justifyContent: 'center' },
		]}
		>
			<StatusBar backgroundColor={colors['main-background']} barStyle='dark-content' />
			<View style={[margin.bottom.big, { flexDirection: 'row', justifyContent: 'center' }]}>
				<BertyGradientSquareSvg />
			</View>
			<View>
				<View>
					<UnifiedText
						style={[
							padding.horizontal.medium,
							text.align.center,
							text.size.large,
							text.bold,
							{ color: colors['background-header'], textTransform: 'uppercase' },
						]}
					>
						{t('onboarding.getstarted.title')}
					</UnifiedText>
				</View>
				<View style={[margin.top.small]}>
					<UnifiedText
						style={[padding.horizontal.medium, text.align.center, text.align.bottom, text.italic]}
					>
						{t('onboarding.getstarted.desc')}
					</UnifiedText>
				</View>
				<View style={{ marginHorizontal: 60 }}>
					<View style={[margin.top.huge]}>
						<PrimaryButton
							onPress={() => console.log('navigate')}
						>
							{t('onboarding.getstarted.create-button')}
						</PrimaryButton>
					</View>
				</View>
			</View>
		</View>
	);
}
