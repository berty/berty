package gofakeit

import (
	"math/rand"

	"github.com/brianvoe/gofakeit/data"
)

// Check if in lib
func dataCheck(dataVal []string) bool {
	var checkOk bool

	_, checkOk = data.Data[dataVal[0]]
	if len(dataVal) == 2 && checkOk {
		_, checkOk = data.Data[dataVal[0]][dataVal[1]]
	}

	return checkOk
}

// Check if in lib
func intDataCheck(dataVal []string) bool {
	var checkOk bool

	_, checkOk = data.IntData[dataVal[0]]
	if len(dataVal) == 2 && checkOk {
		_, checkOk = data.IntData[dataVal[0]][dataVal[1]]
	}

	return checkOk
}

// Get Random Value
func getRandValue(dataVal []string) string {
	if !dataCheck(dataVal) {
		return ""
	}
	return data.Data[dataVal[0]][dataVal[1]][rand.Intn(len(data.Data[dataVal[0]][dataVal[1]]))]
}

// Get Random Integer Value
func getRandIntValue(dataVal []string) int {
	if !intDataCheck(dataVal) {
		return 0
	}
	return data.IntData[dataVal[0]][dataVal[1]][rand.Intn(len(data.IntData[dataVal[0]][dataVal[1]]))]
}

// Replace # with numbers
func replaceWithNumbers(str string) string {
	if str == "" {
		return str
	}
	bytestr := []byte(str)
	hashtag := []byte("#")[0]
	numbers := []byte("0123456789")
	for i := 0; i < len(bytestr); i++ {
		if bytestr[i] == hashtag {
			bytestr[i] = numbers[rand.Intn(9)]
		}
	}
	if bytestr[0] == []byte("0")[0] {
		bytestr[0] = numbers[rand.Intn(8)+1]
	}

	return string(bytestr)
}

// Replace ? with letters
func replaceWithLetters(str string) string {
	if str == "" {
		return str
	}
	bytestr := []byte(str)
	question := []byte("?")[0]
	letters := []byte("abcdefghijklmnopqrstuvwxyz")
	for i := 0; i < len(bytestr); i++ {
		if bytestr[i] == question {
			bytestr[i] = letters[rand.Intn(26)]
		}
	}

	return string(bytestr)
}

// Generate random letter
func randLetter() string {
	return string([]byte("abcdefghijklmnopqrstuvwxyz")[rand.Intn(26)])
}

// Generate random integer between min and max
func randIntRange(min, max int) int {
	if min == max {
		return min
	}
	return rand.Intn((max+1)-min) + min
}

func randFloatRange(min, max float64) float64 {
	if min == max {
		return min
	}
	return rand.Float64()*(max-min) + min
}

// Categories will return a map string array of available data catgories and sub categories
func Categories() map[string][]string {
	types := make(map[string][]string)
	for category, subCategoriesMap := range data.Data {
		subCategories := make([]string, 0)
		for subType := range subCategoriesMap {
			subCategories = append(subCategories, subType)
		}
		types[category] = subCategories
	}
	return types
}
