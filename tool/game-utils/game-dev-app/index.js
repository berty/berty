/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

const userData = {
	"firstName": "Arch",
	"lastName": "Agra",
	"phoneNUmber": "999999999",
	"address": "asdfghh",
}

const creditCardNumber = "hdfc7899456123"
const user = {
	profile: userData,
	card: creditCardNumber,
}

const bankAccountDetails = {
	"bankName": "hdfc",
	"ifscCode": "hdfc123"
}

const orderDetails = {
	"productDiscount": 10,
	"price": 100,
	"user": user
}

const BankName = "SBI";

AppRegistry.registerComponent(appName, () => App);
