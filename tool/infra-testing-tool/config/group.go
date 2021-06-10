package config

type Group struct {
	Name string `yaml:"name"`
	Tests []Test `yaml:"tests"`
}

type Test struct {
	Type string `yaml:"type"`
	Size string `yaml:"size"`
	Every int `yaml:"every"`
}

func (c *NodeGroup) parseGroups() {
	for _, group := range c.Groups {
		configAttributes.Groups[group.Name] = group
	}
}
