import React from "react";
import Feather from "@expo/vector-icons/Feather";

type FeatherGlyphs = keyof typeof Feather.glyphMap;

const FeatherIcon: React.FC<{
	name: FeatherGlyphs;
	width: number;
	height: number;
	fill: string;
	style: any;
}> = ({ name, width, height, fill, style = [] }) => {
	return (
		<Feather name={name} size={width || height} color={fill} style={style} />
	);
};

const IconProvider = (name: string) => ({
	toReactElement: (props: any) => FeatherIcon({ name, ...props }),
});

function createIconsMap() {
	return new Proxy(
		{},
		{
			get(_, name: string) {
				return IconProvider(name);
			},
		},
	);
}

export const FeatherIconsPack = {
	name: "feather",
	icons: createIconsMap(),
};
