package gofakeit

import "strconv"

// ImageURL will generate a random Image Based Upon Height And Width. Images Provided by LoremPixel (http://lorempixel.com/)
func ImageURL(width int, height int) string {
	return "http://lorempixel.com/" + strconv.Itoa(width) + "/" + strconv.Itoa(height)
}
