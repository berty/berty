package testing

// CountMessages counts the messages in a group that were part of a test
func (p *Peer) CountMessages(groupName string, testn int) (count int) {
	//for _, message := range p.Messages[groupName] {
	//	if message.PartOfTest == testn {
	//		count += 1
	//	}
	//}

	return count
}

// CountSize returns the average size of messages in a group that were part of a test
func (p *Peer) CountSize(groupName string, testn int) (size int) {
	//for _, message := range p.Messages[groupName] {
	//	if message.PartOfTest == testn {
	//		size += message.PayloadSize
	//	}
	//}

	return size
}
