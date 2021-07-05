package ec2

type RootBlockDevice struct {
	VolumeType string
	VolumeSize int
}

func NewRootBlockDevice() RootBlockDevice {
	return RootBlockDevice{
		VolumeType: rootBlockDeviceTypeSlow,
		VolumeSize: rootBlockDeviceSizeDefault,
	}
}

func NewRootBlockDeviceWithAttributes(t string, size int) (c RootBlockDevice) {
	c = NewRootBlockDevice()
	c.VolumeType = t
	c.VolumeSize = size

	return c
}

func NewRootBlockDeviceWithSize(size int) (c RootBlockDevice) {
	c = NewRootBlockDevice()
	c.VolumeSize = size

	return c
}
