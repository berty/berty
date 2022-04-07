export type ColorsTypes = string
export type Colors<T> = {
	white: T
	black: T
	blue: T
	red: T
	yellow: T
	green: T
	grey: T
}

export type ColorsBrightness<T> = {
	default: Colors<T>
	light: Colors<T>
	dark: Colors<T>
}

export type ColorsDeclaration = ColorsBrightness<string>
export type ColorsStyles<T> = Colors<T> &
	ColorsBrightness<T> & {
		transparent: Colors<T> & ColorsBrightness<T>
		blur: Colors<T> & ColorsBrightness<T>
		opaque: Colors<T> & ColorsBrightness<T>
	}

type Sides<T> = {
	top: T
	left: T
	right: T
	bottom: T
	vertical: T
	horizontal: T
}

export type SizesDeclaration<T> = {
	tiny: T
	small: T
	medium: T
	large: T
	big: T
	huge: T
}
export type Sizes<T> = SizesDeclaration<T> & {
	scale: (size: number) => T
}

type AlignHorizontal<T> = {
	left: T
	right: T
	center: T
	fill: T
}

type AlignVertical<T> = {
	top: T
	bottom: T
	justify: T
	fill: T
	center?: T
}

type Align<T> = AlignHorizontal<T> & AlignVertical<T>

type Text = {
	color: Colors<{}> & ColorsBrightness<{}>
	size: Sizes<{}>
	light: {}
	lightItalic: {}
	bold: {}
	italic: {}
	extraBold: {}
	align: Align<{}>
}

type BorderRadiusscale<T> = (size: number) => T
type BorderRadius<T> = Sizes<T> &
	Sides<Sizes<{}>> & {
		scale: BorderRadiusscale<T>
	} & Sides<{
		scale: BorderRadiusscale<T>
	}>

type BorderShadow<T> = Sizes<T>

type Border<T> = Sizes<T> &
	Sides<Sizes<T>> & {
		radius: BorderRadius<T>
		shadow: BorderShadow<T>
		color: Colors<T> & ColorsBrightness<T>
	}

type FlexJustifyTypes =
	| 'center'
	| 'flex-end'
	| 'flex-start'
	| 'space-around'
	| 'space-between'
	| 'space-evenly'
type FlexJustifyType = { justifyContent: FlexJustifyTypes }
type FlexJustify<FlexJustifyType> = {
	center: FlexJustifyType
	end: FlexJustifyType
	spaceAround: FlexJustifyType
	spaceBetween: FlexJustifyType
	spaceEvenly: FlexJustifyType
	start: FlexJustifyType
}

type FlexAlignTypes = 'stretch' | 'center' | 'flex-start' | 'flex-end' | 'baseline'
type FlexAlignType = { alignItems: FlexAlignTypes }
type FlexAlign<FlexAlignType> = {
	baseline: FlexAlignType
	center: FlexAlignType
	end: FlexAlignType
	start: FlexAlignType
	stretch: FlexAlignType
}

type FlexDirectionTypes = 'row' | 'column'
type FlexDirectionType = { flexDirection: FlexDirectionTypes }
type FlexDirection<FlexDirectionType> = {
	row: FlexDirectionType
	column: FlexDirectionType
}

export type Declaration = {
	colors: ColorsDeclaration
	sides: SizesDeclaration<number>
	text: {
		sizes: SizesDeclaration<number>
	}
}

export type Styles = {
	color: ColorsStyles<string>
	background: ColorsStyles<{}>
	padding: Sizes<{}> & Sides<Sizes<{}>>
	margin: Sizes<{}> & Sides<Sizes<{}>>
	border: Border<{}>
	text: Text
	absolute: Align<{}> & {
		scale: (values: { top?: number; left?: number; right?: number; bottom?: number }) => {}
	}
	column: AlignVertical<{}> & {
		item: AlignHorizontal<{}>
	}
	row: AlignHorizontal<{}> & {
		item: AlignVertical<{}>
	}
	flex: Sizes<{}> & {
		align: FlexAlign<FlexAlignType>
		justify: FlexJustify<FlexJustifyType>
		direction: FlexDirection<FlexDirectionType>
	}
	width: (width: number) => {}
	height: (height: number) => {}
	maxWidth: (maxWidth: number) => {}
	maxHeight: (maxHeight: number) => {}
	opacity: (opacity: number) => {}
	minWidth: (minWidth: number) => {}
	minHeight: (minHeight: number) => {}
	overflow: {}
}

export type ScaleSizes = { fontScale: number; scaleSize: number; scaleHeight: number }

export type Emoji = {
	short_name: string
	unified: string
	short_names: string[]
	sheet_x: number
	sheet_y: number
	skin_variations?: { [key: string]: Emoji }
	category: string
	char: string
	image_url: string
	image: string
}
