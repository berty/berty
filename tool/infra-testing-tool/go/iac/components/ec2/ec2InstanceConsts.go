package ec2

const (
	// Ec2HCLTemplate is the Ec2 template
	// refer to https://golang.org/pkg/text/template/ for templating syntax
	Ec2HCLTemplate = `
resource "aws_instance" "{{.Name }}" {
  ami = var.ami
  instance_type = "{{.InstanceType }}"

{{if .KeyName }}
  key_name = "{{.KeyName}}"
{{- end}}

  // availability zone
{{if .AvailabilityZone }}
  availability_zone = "{{.AvailabilityZone}}"
{{- end}}

  // root block device
  root_block_device {
    volume_type = "{{.RootBlockDevice.VolumeType }}"
    volume_size = {{.RootBlockDevice.VolumeSize }}
  }

  iam_instance_profile = "{{.IamInstanceProfile }}"

  // networking
  {{- range $ni := .NetworkInterfaceAttachment }}
  network_interface {
	device_index = {{$ni.DeviceIndex}}
	network_interface_id = {{$ni.NetworkInterfaceId }}
  }
  {{- end }}
{{if .UserData }}
  user_data = <<EOF{{.UserData }}EOF
{{- end}}

   tags = {
{{- range $tag := .Tags }}
       {{$tag.Key}} = "{{$tag.Value }}"
{{- end}}
   }
}
`
	// Default Ec2 Values
	Ec2InstanceTypeDefault = "t3.micro"

	// Ec2NamePrefix is the prefix for the Ec2 type
	Ec2NamePrefix = "ec2"

	Ec2Type = "ec2"

	// Ec2ErrNoNetworkInterfaceConfigured means there is no correct networking configured
	Ec2ErrNoNetworkInterfaceConfigured = "ec2 has no proper networking configured. please attach a 'NetworkInterface' type'"

	// Ec2ErrTooManyNetworkInterfaces means the ec2 instance has more network interfaces than it can handle
	// more information here:
	// https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-eni.html
	Ec2ErrTooManyNetworkInterfaces = "ec2 type t2.micro can only have 2 'NetworkInterfaces'"

	// Ec2ErrNetworkInterfaceAZMismatch means that one or more network interfaces are on a different AZ's. this is not allowed and is probably a mistake
	Ec2ErrNetworkInterfaceAZMismatch = "one or more network interfaces are on a different Availability Zone from your instance. this is not allowed"

	// Ec2ErrRootBlockDeviceTooSmall means the attached rbd is smaller than 6Gb
	Ec2ErrRootBlockDeviceTooSmall = "the root block storage attached to the ec2 instance is too small. needs to be >= 8"
)
