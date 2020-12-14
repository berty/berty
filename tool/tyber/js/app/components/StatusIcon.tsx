import React, { ReactElement } from "react";
import { withStyles } from "@ui-kitten/components";
import { Status } from "../types/StatusType";
import {
	CheckOutlined,
	CloseOutlined,
	SyncOutlined,
	QuestionOutlined,
} from "@ant-design/icons";

export class statusIcon extends React.Component<any> {
	private defaultIcon = (
		<QuestionOutlined
			style={{
				...this.props.eva.style.iconMargin,
				...this.props.eva.style.iconWarning,
				fontSize: this.props.size,
			}}
		/>
	);

	private iconMap: { [key in Status]: ReactElement } = {
		running: (
			<SyncOutlined
				style={{
					...this.props.eva.style.iconMargin,
					...this.props.eva.style.iconWarning,
					fontSize: this.props.size,
				}}
				spin
			/>
		),
		succeeded: (
			<CheckOutlined
				style={{
					...this.props.eva.style.iconMargin,
					...this.props.eva.style.iconSuccess,
					fontSize: this.props.size,
				}}
			/>
		),
		failed: (
			<CloseOutlined
				style={{
					...this.props.eva.style.iconMargin,
					...this.props.eva.style.iconDanger,
					fontSize: this.props.size,
				}}
			/>
		),
	};

	render() {
		return this.iconMap[this.props.status as Status] || this.defaultIcon;
	}
}

export const StatusIcon = withStyles(statusIcon, (theme) => ({
	iconMargin: {
		marginLeft: 10,
		marginRight: 10,
	},
	iconWarning: {
		color: theme["color-warning-500"],
	},
	iconSuccess: {
		color: theme["color-success-500"],
	},
	iconDanger: {
		color: theme["color-danger-500"],
	},
}));
