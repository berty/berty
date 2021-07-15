package ec2

const (
	// IamRoleTemplate is the IamRole template
	// refer to https://golang.org/pkg/text/template/ for templating syntax
	IamRoleTemplate = `
resource "aws_iam_role" "{{.Name}}" {
	name = "{{.Name}}"

	assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy" "{{.PolicyName}}" {
	name = "{{.PolicyName}}"
	role = aws_iam_role.{{.Name}}.id

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action   = [
			"s3:PutObject",
		  ]
          Effect   = "Allow"
          Resource = [
			"arn:aws:s3:::{{.S3Bucket}}/*"
          ]
        },
      ]
    })
}

resource "aws_iam_instance_profile" "{{.ProfileName}}" {
	name = "{{.ProfileName}}"
	role = aws_iam_role.{{.Name}}.name
}
`

	IamRoleDefaultName = "berty-s3-logs"
	IamRolePolicyDefaultName = "berty-s3-logs"
	IamInstanceProfileDefaultName = "berty-s3-logs"

	IamRoleType = "ami"

)
