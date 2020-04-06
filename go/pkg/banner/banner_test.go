package banner

import (
	"fmt"
)

func ExampleSay() {
	fmt.Println(Say("hello world!"))
	// Output:
	//           /\
	//      /\  / /\  ______
	//     / /\/ /  \/  |   \                     hello world!
	//    | |  \/   | ()|    |
	//     \ \      |   |____|
	//      \ \      \____/ __           __
	//       \/       /    / /  ___ ____/ /___ __
	//       /     __/    / _ \/ -_) __/ __/ // /
	//      /_____/      /____/\__/_/  \__/\__ /
	//     /__/                           /___/
}

func ExampleSay_long() {
	fmt.Println(Say(`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`))
	// Output:
	//           /\
	//      /\  / /\  ______         Lorem ipsum dolor sit amet, consectetur
	//     / /\/ /  \/  |   \        adipiscing elit, sed do eiusmod tempor
	//    | |  \/   | ()|    |   incididunt ut labore et dolore magna aliqua.
	//     \ \      |   |____|     Ut enim ad minim veniam, quis nostrud [...]
	//      \ \      \____/ __           __
	//       \/       /    / /  ___ ____/ /___ __
	//       /     __/    / _ \/ -_) __/ __/ // /
	//      /_____/      /____/\__/_/  \__/\__ /
	//     /__/                           /___/
}

func ExampleOfTheDay() {
	fmt.Println(OfTheDay())
}
