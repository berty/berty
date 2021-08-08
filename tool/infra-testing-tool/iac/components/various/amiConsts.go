package various

const (
	// AmiTemplate is the Ami template
	// refer to https://golang.org/pkg/text/template/ for templating syntax
	AmiTemplate = `
variable "ami" {
    type = string
	default = "{{.AmiID}}"
}
`
	AmiDefaultName = "berty-ami"

	AmiType = "ami"

	ErrNoAMI = "no valid AMI found, use packer to make one"
)
