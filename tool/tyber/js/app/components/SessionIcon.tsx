import React, { ReactElement } from "react";
import { withStyles } from "@ui-kitten/components";
import { SessionType } from "../types/NodeType";
import {
	ApartmentOutlined,
	FileTextOutlined,
	QuestionOutlined,
} from "@ant-design/icons";

export class sessionIcon extends React.Component<any> {
	private defaultIcon = (
		<QuestionOutlined
			style={{
				...this.props.eva.style.iconMargin,
				...this.props.eva.style.iconWarning,
				fontSize: this.props.size,
			}}
		/>
	);

	private iconMap: { [key in SessionType]: ReactElement } = {
		file: (
			<FileTextOutlined
				style={{
					...this.props.eva.style.iconMargin,
					...this.props.eva.style.iconNormal,
					fontSize: this.props.size,
				}}
			/>
		),
		network: (
			<ApartmentOutlined
				style={{
					...this.props.eva.style.iconMargin,
					...this.props.eva.style.iconNormal,
					fontSize: this.props.size,
				}}
			/>
		),
	};

	render() {
		return this.iconMap[this.props.type as SessionType] || this.defaultIcon;
	}
}

export const SessionIcon = withStyles(sessionIcon, (theme) => ({
	iconMargin: {
		marginLeft: 10,
		marginRight: 10,
	},
	iconWarning: {
		color: theme["color-warning-500"],
	},
	iconNormal: {
		color: theme["text-basic-color"],
	},
}));
