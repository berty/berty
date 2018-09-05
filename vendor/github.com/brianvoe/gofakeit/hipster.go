package gofakeit

import "strings"

// HipsterWord will return a single hipster word
func HipsterWord() string {
	return getRandValue([]string{"hipster", "word"})
}

// HipsterSentence will generate a random sentence
func HipsterSentence(wordCount int) string {
	words := []string{}
	var sentence string
	for i := 0; i < wordCount; i++ {
		words = append(words, getRandValue([]string{"hipster", "word"}))
	}

	sentence = strings.Join(words, " ")
	return strings.ToUpper(sentence[:1]) + sentence[1:] + "."
}

// HipsterParagraph will generate a random paragraph
// Set Paragraph Count
// Set Sentence Count
// Set Word Count
// Set Paragraph Separator
func HipsterParagraph(paragraphCount int, sentenceCount int, wordCount int, separator string) string {
	var sentences []string
	paragraphs := []string{}
	for i := 0; i < paragraphCount; i++ {
		sentences = []string{}
		for e := 0; e < sentenceCount; e++ {
			sentences = append(sentences, HipsterSentence(wordCount))
		}
		paragraphs = append(paragraphs, strings.Join(sentences, " "))
	}

	return strings.Join(paragraphs, separator)
}
