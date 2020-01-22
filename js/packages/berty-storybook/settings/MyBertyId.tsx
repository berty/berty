import React from 'react'
import {
	SafeAreaView,
	View,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	Dimensions,
} from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { ScreenProps } from '@berty-tech/berty-navigation'
import { TabBar } from '../shared-components/TabBar'
import { RequestAvatar } from '../shared-components/Request'
import { SDTSModalComponent } from '../shared-components/SDTSModalComponent'
import { berty } from '@berty-tech/api'

//
// Settings My Berty ID Vue
//

// Style
const useStylesBertyId = () => {
	const [{ margin, padding, maxHeight, minHeight }] = useStyles()
	return {
		bodyMarginTop: margin.top.scale(60),
		bodyContent: [margin.bottom.scale(40), padding.top.scale(50)],
		scrollViewMaxHeight: maxHeight(400),
		contentMinHeight: minHeight(400),
	}
}
const _bertyIdStyles = StyleSheet.create({
	headerToggleBar: {
		borderWidth: 2.5,
		width: '12%',
		borderRadius: 4,
	},
	bertyLayout: { borderTopLeftRadius: 25, borderTopRightRadius: 25, height: '100%' },
	bertyIdButton: { width: 60, height: 60, borderRadius: 60 / 2, marginRight: 60, bottom: 30 },
})

const BertyIdContent: React.FC<{}> = () => {
	const _styles = useStylesBertyId()
	const [{ padding, column, text }] = useStyles()
	return (
		<ScrollView
			style={[_styles.scrollViewMaxHeight]}
			contentContainerStyle={[padding.vertical.medium]}
		>
			<View style={[column.justify, _styles.contentMinHeight]}>
				<Text style={text.align.center}>Yo</Text>
			</View>
		</ScrollView>
	)
}

const BertIdBody: React.FC<{ user: berty.chatmodel.IContact }> = ({ user }) => {
	const _styles = useStylesBertyId()
	const [{ background, border, margin, padding }] = useStyles()
	return (
		<View
			style={[
				background.white,
				border.radius.scale(30),
				margin.horizontal.medium,
				_styles.bodyMarginTop,
			]}
		>
			<RequestAvatar {...user} size={90} />
			<View style={[padding.horizontal.big, _styles.bodyContent]}>
				<TabBar tabType='contact' />
				<BertyIdContent />
			</View>
		</View>
	)
}

const BertyIdShare: React.FC<{}> = () => {
	const [{ row, border, background, flex, color }] = useStyles()
	return (
		<TouchableOpacity
			style={[
				row.item.bottom,
				background.light.blue,
				border.shadow.medium,
				_bertyIdStyles.bertyIdButton,
			]}
		>
			<View style={[flex.tiny, { justifyContent: 'center' }]}>
				<Icon
					style={row.item.justify}
					name='share-outline'
					width={40}
					height={40}
					fill={color.blue}
				/>
			</View>
		</TouchableOpacity>
	)
}

const Screen = Dimensions.get('window')

const MyBertyIdComponent: React.FC<{ user: berty.chatmodel.IContact }> = ({ user }) => (
	<View style={{ height: Screen.height }}>
		<BertIdBody user={user} />
		<BertyIdShare />
	</View>
)

export const MyBertyId: React.FC<ScreenProps.Settings.MyBertyId> = ({ route: { params } }) => {
	const firstNotToggledPoint = Screen.height - 120
	const firstToggledPoint = 20

	const [{ flex, color }] = useStyles()

	return (
		<Layout style={[flex.tiny]}>
			<SafeAreaView style={[flex.tiny]}>
				<SDTSModalComponent
					rows={[
						{
							toggledPoint: firstToggledPoint,
							notToggledPoint: firstNotToggledPoint,
							initialPoint: firstToggledPoint,
							title: 'My Berty ID',
							titleColor: color.white,
							icon: 'person',
							iconColor: color.white,
							bgColor: color.blue,
							maxHeight: Screen.height - 90,
						},
					]}
				>
					<MyBertyIdComponent user={params} />
				</SDTSModalComponent>
			</SafeAreaView>
		</Layout>
	)
}
