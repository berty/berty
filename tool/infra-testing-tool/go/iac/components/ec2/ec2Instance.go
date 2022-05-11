package ec2

import (
	"errors"
	"fmt"
	"github.com/google/uuid"
	"infratesting/aws"
	"infratesting/iac"
	"infratesting/iac/components/networking"
)

type Instance struct {
	Name         string
	InstanceType string
	KeyName      string

	AvailabilityZone string

	IamInstanceProfile string

	RootBlockDevice RootBlockDevice

	NodeType string
	UserData string

	// NETWORKING
	NetworkInterfaces          []*networking.NetworkInterface
	NetworkInterfaceAttachment []NetworkInterfaceAttachment

	Tags []Tag
}

type NetworkInterfaceAttachment struct {
	Name               string
	DeviceIndex        int
	NetworkInterfaceId string
}

type Tag struct {
	Key   string
	Value string
}

func NewInstance() Instance {
	// with defaults in place
	return Instance{
		Name:            fmt.Sprintf("%s-%s", Ec2NamePrefix, uuid.NewString()),
		InstanceType:    Ec2InstanceTypeDefault,
		RootBlockDevice: NewRootBlockDevice(),

		IamInstanceProfile: IamInstanceProfileDefaultName,
	}
}

func NewInstanceWithAttributes(ni *networking.NetworkInterface) (c Instance) {
	c = NewInstance()
	c.NetworkInterfaces = []*networking.NetworkInterface{
		ni,
	}

	return c
}

// GetTemplate returns Ec2 template
func (c Instance) GetTemplate() string {
	return Ec2HCLTemplate
}

// GetType returns Ec2 type
func (c Instance) GetType() string {
	return Ec2Type
}

// GetPrivateIp returns the terraform formatting of this instances' ip
func (c Instance) GetPrivateIp() string {
	if len(c.NetworkInterfaceAttachment) == 1 {
		return fmt.Sprintf("aws_network_interface.%s.private_ip", c.NetworkInterfaceAttachment[0].NetworkInterfaceId)
	}
	return fmt.Sprintf("aws_instance.%s.private_ip", c.Name)
}

// SetNodeType sets the node type
func (c *Instance) SetNodeType(s string) {
	c.NodeType = s
}

// Validate validates the component
func (c Instance) Validate() (iac.Component, error) {
	// checks if NetworkInterface is attached/configured
	if len(c.NetworkInterfaces) > 0 {
		// generates NetworkInterfaceAttachment form c.NetworkInterfaces
		for i, ni := range c.NetworkInterfaces {
			var nia = NetworkInterfaceAttachment{
				Name:               ni.Name,
				DeviceIndex:        i,
				NetworkInterfaceId: ni.GetId(),
			}
			c.NetworkInterfaceAttachment = append(c.NetworkInterfaceAttachment, nia)
		}
	} else if len(c.NetworkInterfaces) > 2 && c.InstanceType == Ec2InstanceTypeDefault {
		// more than 2 network interfaces on a t2.micro is not allowed
		return c, errors.New(Ec2ErrTooManyNetworkInterfaces)
	} else {
		// can't have no network interfaces, there is just no point
		return c, errors.New(Ec2ErrNoNetworkInterfaceConfigured)
	}

	// checks if all network interfaces are on the same Availability Zone
	for _, networkInterface := range c.NetworkInterfaces {
		if c.AvailabilityZone == "" {
			c.AvailabilityZone = networkInterface.GetAvailabilityZone()
		} else if c.AvailabilityZone != networkInterface.GetAvailabilityZone() {
			return c, errors.New(Ec2ErrNetworkInterfaceAZMismatch)
		}

	}

	// checks RootBlockDevice size
	// we don't check the VolumeType because it doesn't really matter for now
	if c.RootBlockDevice.VolumeSize < 8 {
		return c, errors.New(Ec2ErrRootBlockDeviceTooSmall)
	}

	// used to identify which tags were launched by the infra tool (in case the account has other instance running
	// that we don't want to interfere with).
	c.Tags = append(c.Tags, Tag{
		Key:   aws.Ec2TagBerty,
		Value: aws.Ec2TagBertyValue,
	})

	// name tag
	c.Tags = append(c.Tags, Tag{
		Key:   aws.Ec2TagName,
		Value: c.Name,
	})

	// type tag
	c.Tags = append(c.Tags, Tag{
		Key:   aws.Ec2TagType,
		Value: c.NodeType,
	})

	return c, nil
}
