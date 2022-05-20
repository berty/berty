package aws

// all AWS SDK related things / things that interface directly with AWS should reside here

import (
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ec2"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/sts"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

var (
	region         string
	sess           *session.Session
	callerIdentity *sts.GetCallerIdentityOutput
)

func SetRegion(r string) {
	region = r
}

func GetSess() *session.Session {
	sess = session.Must(session.NewSessionWithOptions(session.Options{
		Config: aws.Config{
			Region: aws.String(region),
		},
		SharedConfigState: session.SharedConfigEnable,
	}))

	return sess
}

func GetEc2Session() ec2.EC2 {
	if sess == nil {
		sess = GetSess()
	}

	return *ec2.New(sess)
}

func GetStsSession() sts.STS {
	if sess == nil {
		sess = GetSess()
	}

	return *sts.New(sess)
}

func GetS3Session() s3.S3 {
	if sess == nil {
		sess = GetSess()
	}

	return *s3.New(sess)
}

// DescribeInstances returns all ec2 instances
func DescribeInstances() (instances []*ec2.Instance, err error) {
	ec2sess := GetEc2Session()

	//get all running/pending instances
	diResp, err := ec2sess.DescribeInstances(&ec2.DescribeInstancesInput{
		Filters: []*ec2.Filter{
			{
				Name: aws.String("instance-state-name"),
				Values: []*string{
					aws.String("running"),
					aws.String("pending"),
					aws.String("shutting-down"),
					aws.String("stopped"),
					aws.String("terminated"),
				},
			},
		},
	})

	if err != nil {
		return instances, fmt.Errorf("unable to describe instance: %w", err)
	}

	// check if instance has "berty - infra" key-value tag
	for _, reservation := range diResp.Reservations {
		for _, instance := range reservation.Instances {
			for _, tag := range instance.Tags {
				if *tag.Key == Ec2TagBerty && *tag.Value == Ec2TagBertyValue {
					instances = append(instances, instance)
				}
			}
		}
	}

	return instances, nil
}

// DescribeAMIs gets all valid berty AMI id's from amazon.
func DescribeAMIs(name string) (r *ec2.DescribeImagesOutput, err error) {
	ec2sess := GetEc2Session()

	if callerIdentity == nil {
		callerIdentity, err = GetCallerIdentity()
		if err != nil {
			return nil, fmt.Errorf("unable to get caller identity: %w", err)
		}
	}

	// describes all AMI's
	resp, err := ec2sess.DescribeImages(&ec2.DescribeImagesInput{
		Filters: []*ec2.Filter{
			{
				Name: aws.String("name"),
				Values: []*string{
					aws.String(name),
				},
			},
		},
		Owners: []*string{callerIdentity.Account},
	})

	return resp, nil
}

func GetLatestAMI(name string) (AmiID string, err error) {
	amis, err := DescribeAMIs(name)
	if err != nil {
		return AmiID, err
	}

	if len(amis.Images) == 0 {
		return AmiID, fmt.Errorf("no AMIs found, please us packer to create one")
	}

	var latestAMI string
	var latestTime int64

	for _, ami := range amis.Images {
		t, err := creationDateToUnix(*ami.CreationDate)
		if err != nil {
			return AmiID, fmt.Errorf("unable to convert date to unix: %w", err)
		}

		if latestTime == 0 || t < latestTime {
			latestTime = t
			latestAMI = *ami.ImageId
		}
	}

	return latestAMI, nil
}

func creationDateToUnix(date string) (unix int64, err error) {
	t, err := time.Parse(time.RFC3339, date)
	if err != nil {
		return unix, err
	}

	unix = t.Unix()

	return unix, nil
}

// GetCallerIdentity gets the caller identity from AWS
// used to get AWS AMI's
func GetCallerIdentity() (*sts.GetCallerIdentityOutput, error) {
	if callerIdentity == nil {
		// logger.("getting CalledIdentity & AMI's (AWS)")

		stssess := GetStsSession()

		r, err := stssess.GetCallerIdentity(&sts.GetCallerIdentityInput{})
		if err != nil {
			return nil, fmt.Errorf("unable to get caller identity: %w", err)
		}
		callerIdentity = r

		return r, nil
	}

	return callerIdentity, nil
}

// GetUserId is a wrapper around GetCallerIdentity and only returns the UserId
func GetUserId() (id string, err error) {
	if callerIdentity == nil {
		callerIdentity, err = GetCallerIdentity()
		if err != nil {
			return "", fmt.Errorf("unable to get caller identity: %w", err)
		}
	}

	return *callerIdentity.UserId, nil
}

// UploadFile uploads file/log to AWS bucket
// with path `path` and key `key`
func UploadFile(logger *zap.Logger, path, key string) error {
	f, err := os.Open(path)
	if err != nil {
		return fmt.Errorf("unable to open path(%s): %w", path, err)
	}

	s3session := GetS3Session()

	bucketName, err := GetBucketName(logger)
	if err != nil {
		return fmt.Errorf("unable to get bucket name: %w", err)
	}

	_, err = s3session.PutObject(&s3.PutObjectInput{
		Body:   f,
		Bucket: &bucketName,
		Key:    &key,
	})
	if err != nil {
		return fmt.Errorf("unable to put object: %w", err)
	}

	return nil
}

// CreateBucket creates an s3 bucket
func CreateBucket(logger *zap.Logger) error {
	s3session := GetS3Session()

	name := fmt.Sprintf("%s-%s-%s", BucketNamePrefix, uuid.NewString()[:8], region)

	logger.Debug("creating s3 bucket for logging", zap.String("bucket_name", name))
	_, err := s3session.CreateBucket(&s3.CreateBucketInput{
		Bucket: aws.String(name),
	})
	if err != nil {
		return fmt.Errorf("unable to create bucket: %w", err)
	}

	logger.Debug("waiting for s3 bucket to be created")

	var created bool
	for i := 0; i <= 3; i += 1 {
		err = s3session.WaitUntilBucketExists(&s3.HeadBucketInput{
			Bucket: aws.String(name),
		})

		if err == nil {
			created = true
			break
		}
	}
	if created == false {
		logger.Debug("tried waiting for s3 bucket to be created 3 times. still failed")
		return fmt.Errorf("unable to create bucket: %w", err)
	}

	logger.Debug("tagging newly created bucket")

	_, err = s3session.PutBucketTagging(&s3.PutBucketTaggingInput{
		Bucket: aws.String(name),
		Tagging: &s3.Tagging{
			TagSet: []*s3.Tag{
				{
					Key:   aws.String(BucketTagKey),
					Value: aws.String(BucketTagValue),
				},
			},
		},
	})
	if err != nil {
		return fmt.Errorf("unable to tag bucket: %w", err)
	}

	logger.Debug("bucket successfully created", zap.String("bucket_name", name))

	return nil
}

// BucketExists checks if the bucket with tag.Key 'Berty' exists on the current account
// returns false if not found, true if found
func BucketExists(logger *zap.Logger) (bool, error) {
	_, err := GetBucketName(logger)
	if err != nil {
		if err.Error() == ErrBucketNotFound {
			return false, nil
		}

		return false, err
	}

	return true, nil

}

// GetBucketName returns the name of the bucket with the tag.Key 'Berty'
// returns error if it doesn't exist
func GetBucketName(logger *zap.Logger) (string, error) {
	s3session := GetS3Session()

	resp, err := s3session.ListBuckets(&s3.ListBucketsInput{})
	if err != nil {
		return "", fmt.Errorf("unable to list buckets: %w", err)
	}

	for _, bucket := range resp.Buckets {
		locationResp, err := s3session.GetBucketLocation(&s3.GetBucketLocationInput{
			Bucket: bucket.Name,
		})
		if err != nil {
			continue
		}

		if *locationResp.LocationConstraint == *sess.Config.Region {
			tagResp, err := s3session.GetBucketTagging(&s3.GetBucketTaggingInput{
				Bucket: bucket.Name,
			})

			if err != nil {
				if !strings.Contains(err.Error(), "NoSuchTagSet") {
					return "", fmt.Errorf("unable to get bucket by tag: %w", err)
				}
			}

			if tagResp == nil {
				return "", fmt.Errorf("no tag resp: %w", errors.New(ErrTagRespNil))
			}

			for _, tags := range tagResp.TagSet {
				if *tags.Key == BucketTagKey {
					return *bucket.Name, nil
				}
			}
		}
	}

	// bucket doesn't exist, create it!
	err = CreateBucket(logger)
	if err != nil {
		return "", fmt.Errorf("unable to create bucket: %w", err)
	} else {
		logger.Debug("bucket created, retrying to get name")
		return GetBucketName(logger)
	}

}

func IsValidRegion(region string) bool {
	for _, r := range Regions {
		if region == r {
			return true
		}
	}

	return false
}

func IsValidKeyPair(keyName string) (bool, error) {
	ec2sess := GetEc2Session()

	result, err := ec2sess.DescribeKeyPairs(&ec2.DescribeKeyPairsInput{
		KeyNames: []*string{
			aws.String(keyName),
		},
	})
	if err != nil {
		if strings.Contains(err.Error(), "InvalidKeyPair.NotFound") {
			return false, nil
		}
		return false, fmt.Errorf("unable to describe key pairs: %w", err)
	}

	for _, key := range result.KeyPairs {
		if *key.KeyName == keyName {
			return true, nil
		}
	}

	return false, nil
}
