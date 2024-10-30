export interface ModalCardProps {
	onClose: () => void
	onConfirm: () => void
	title: string
	description: string
}

export interface ActionButtonsProps {
	confirmText: string
	cancelText: string
}
