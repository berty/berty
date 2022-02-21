package aws

const (
	BucketTagKey   = "Berty"
	BucketTagValue = "infra"

	BucketNamePrefix = "bertylogs"

	ErrBucketNotFound = "bucket with right tag key not found"

	ErrTagRespNil = "tagResp is nil"

	ErrNoRegion      = "no region specified in config"
	ErrInvalidRegion = "region specified in config is invalid"

	InfoNoKeyPair     = "no keypair has been specified in config"
	ErrInvalidKeypair = "keypair specified in config is invalid. note: keypairs are region dependant"

	// Ec2TagName tag used to identify peers by name
	Ec2TagName = "Name"
	// value is a variable

	// Ec2TagType tag used to identify peers by tag
	Ec2TagType = "Type"
	//value is a variable

	// Ec2TagBerty tag used to identify if instance is created by infra-testing-tool
	Ec2TagBerty = "Berty"
	// Ec2TagBertyValue value used to double check if instance are actually created by infra-testing-tool
	// (in case some other instances on the account have a tag with the key "berty")
	Ec2TagBertyValue = "infra"
)

var Regions = []string{
	"af-south-1",
	"ap-east-1",
	"ap-northeast-1",
	"ap-northeast-2",
	"ap-south-1",
	"ap-southeast-1",
	"ap-southeast-2",
	"ca-central-1",
	"eu-central-1",
	"eu-north-1",
	"eu-south-1",
	"eu-west-1",
	"eu-west-2",
	"eu-west-3",
	"me-south-1",
	"sa-east-1",
	"us-east-1",
	"us-east-2",
	"us-west-1",
	"us-west-2",
}
