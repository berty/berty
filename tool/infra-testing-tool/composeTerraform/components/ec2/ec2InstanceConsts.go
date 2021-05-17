package ec2

const (
	// Ec2HCLTemplate is the Ec2 template
	// refer to https://golang.org/pkg/text/template/ for templating syntax
	Ec2HCLTemplate = `
resource "aws_instance" "{{.Name }}" {
  ami = "{{.Ami }}"
  instance_type = "{{.InstanceType }}"
  key_name = "{{.KeyName}}"

  // root block device
  root_block_device {
    volume_type = "{{.RootBlockDevice.VolumeType }}"
    volume_size = {{.RootBlockDevice.VolumeSize }}
  }

  // networking
  {{- range $ni := .NetworkInterfaceAttachment }}
  network_interface {
	device_index = {{$ni.DeviceIndex}}
	network_interface_id = {{$ni.NetworkInterfaceId }}
  }
  {{- end }}
{{if .UserData }}
  user_data = <<EOF
{{.UserData }}
EOF
{{- end}}
}
`
	// Default Ec2 Values
	Ec2InstanceAmiDefault     = "ami-018917cd40aae0c4e"
	Ec2InstanceCountDefault   = 1
	Ec2InstanceTypeDefault    = "t2.micro"
	Ec2InstanceKeyNameDefault = "berty_key"

	// Ec2NamePrefix is the prefix for the Ec2 type
	Ec2NamePrefix = "ec2"

	Ec2Type = "ec2"

	// Ec2ErrNoNetworkConfigured means there is no correct networking configured
	Ec2ErrNoNetworkConfigured = "ec2 has no proper networking configured. please attach a 'NetworkInterface' type'"
	// Ec2ErrRootBlockDeviceTooSmall means the attached rbd is smaller than 6Gb
	Ec2ErrRootBlockDeviceTooSmall = "the root block storage attached to the ec2 instance is too small. needs to be >= 8"
)
