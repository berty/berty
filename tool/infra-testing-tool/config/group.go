package config

type Group struct {
	Name string `yaml:"name"`
}

func (c Node) parseGroups() {
	for _, group := range c.Groups {
		configAttributes.Groups[group.Name] = group
	}

}
