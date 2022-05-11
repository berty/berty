package config

import (
	"infratesting/aws"
	"infratesting/iac"
	"infratesting/iac/components/ec2"
	"infratesting/iac/components/various"
	"infratesting/logging"

	"gopkg.in/yaml.v3"
)

// Parse parses the config bytes.
// it does this in multiple steps.
// first it converts it to a map containing nodes
// then it figures out the different servers and networks
// then it creates the network stacks (internet, lan_1, lan_2, etc)
// then it ranges over the nodes and composes a config for them
// then it iterates over every component in Components and generates HCL
// for now it just gets printed out to console

func Parse(b []byte) (components []iac.Component, err error) {
	logging.Log("loading config")

	// unmarshal into Config struct
	err = yaml.Unmarshal(b, &config)
	if err != nil {
		return components, err
	}

	err = config.Validate()
	if err != nil {
		return components, err
	}

	logging.Log("parsing config")

	// gathering information about networking and servers
	// this needs to be done in a separate pass
	// to make sure we don't create multiple networking stacks for the same connection type
	err = config.parseGroupsAndConnections()
	if err != nil {
		return components, err
	}

	logging.Log("generating components")

	// iterate over connections and compose appropriate HCL components
	for i := range config.Attributes.Connections {
		err = config.Attributes.Connections[i].validate()

		if err != nil {
			panic(err)
		}
		config.Attributes.Connections[i].composeComponents()
	}

	// iterate over network stacks
	for _, networkStack := range config.Attributes.connectionComponents {
		// add networkStack to Components
		components = append(components, networkStack...)
	}

	for i := range config.RDVP {
		config.RDVP[i].composeComponents()
		components = append(components, config.RDVP[i].components...)
	}

	for i := range config.Relay {
		config.Relay[i].composeComponents()
		components = append(components, config.Relay[i].components...)
	}

	for i := range config.Bootstrap {
		config.Bootstrap[i].composeComponents()
		components = append(components, config.Bootstrap[i].components...)
	}

	for i := range config.Replication {
		config.Replication[i].composeComponents()
		components = append(components, config.Replication[i].components...)
	}

	for i := range config.Peer {
		config.Peer[i].composeComponents()
		components = append(components, config.Peer[i].components...)
	}

	bucket, err := aws.GetBucketName()
	if err != nil {
		return nil, logging.LogErr(err)
	}

	// iam role
	iamRole := ec2.NewIamRole()
	iamRole.S3Bucket = bucket
	components = prependComponents(components, iamRole)

	// prepend AMI
	ami := various.NewAmi()
	ami.Region = GetRegion()
	amiComponents, err := ami.Validate()
	if err != nil {
		return nil, err
	}
	components = prependComponents(components, amiComponents)

	// prepend new provider (provider aws)
	// this is always required!
	provider := various.NewProvider()
	provider.Region = GetRegion()
	components = prependComponents(components, provider)

	return components, err
}

func prependComponents(array []iac.Component, item iac.Component) []iac.Component {
	return append([]iac.Component{item}, array...)
}

func ToHCL(components []iac.Component) (_ []iac.Component, hcl string) {
	logging.Log("converting components to HCL")

	for i, component := range components {
		// convert the components into HCL compatible strings
		c, s, err := iac.ToHCL(component)
		if err != nil {
			panic(err)
		}

		components[i] = c
		hcl += s

	}

	return components, hcl
}

func (c *Config) parseGroupsAndConnections() (err error) {
	// RDVP
	for i := range c.RDVP {
		err = c.RDVP[i].parseConnections()
		if err != nil {
			return err
		}

		err = c.RDVP[i].parseGroups()
		if err != nil {
			return err
		}
	}

	// RELAY
	for i := range c.Relay {
		err = c.Relay[i].parseConnections()
		if err != nil {
			return err
		}

		err = c.Relay[i].parseGroups()
		if err != nil {
			return err
		}
	}

	// BOOTSTRAP
	for i := range c.Bootstrap {
		err = c.Bootstrap[i].parseConnections()
		if err != nil {
			return err
		}

		err = c.Bootstrap[i].parseGroups()
		if err != nil {
			return err
		}
	}

	// REPLICATION
	for i := range c.Replication {
		err = c.Replication[i].parseConnections()
		if err != nil {
			return err
		}

		err = c.Replication[i].parseGroups()
		if err != nil {
			return err
		}
	}

	// PEER
	for i := range c.Peer {
		err = c.Peer[i].parseConnections()
		if err != nil {
			return err
		}

		err = c.Peer[i].parseGroups()
		if err != nil {
			return err
		}
	}

	return nil
}
