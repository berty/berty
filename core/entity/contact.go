package entity

func (c *Contact) Validate() error {
	if c == nil {
		return ErrInvalidEntity
	}
	return nil
}

func (c *Contact) Filtered() *Contact {
	return &Contact{
		DisplayName:   c.DisplayName,
		DisplayStatus: c.DisplayStatus,
		// FIXME: share sigchain
	}
}

func (c *Contact) PeerID() string {
	return c.ID // FIXME: use sigchain
}
