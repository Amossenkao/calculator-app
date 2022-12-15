// TODO: Select DOM elements and declare global variables
const inputScreen = document.querySelector('.input-field input');
const buttons = document.querySelectorAll('.btn');
const deleteButton = document.querySelector('.delete');
const resetButton = document.querySelector('.reset');
const equalButton = document.querySelector('.equal-sign');
const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const dot = '.';
let isInvalid = false;
let currentTheme;

function getCurrentTheme() {
	currentTheme = `theme-${$('.theme-picker input').val()}`;
	$('body').removeClass('theme-1 theme-2 theme-3').addClass(currentTheme);
}

getCurrentTheme();
$('.theme-picker input').change(function () {
	getCurrentTheme();
});

//TODO: Add an event listener to each button
buttons.forEach((btn) => {
	btn.addEventListener('click', () => processInput(btn));
});

//TODO: Add a keypress event listener to support keyboard operations
document.addEventListener('keydown', (evt) => processInput(null, evt.key));

//TODO: Create a handler function that processes the user input and shows what is being typed into the output screen
function processInput(button, key = null) {
	let re = /[\d.]+[-+/*]+[\d.]+/g; // Checks if the user input is in the appropiate format : (num1 operator num2)
	let char = key ? key : button.firstElementChild.textContent;
	if ([...operators, ...digits, dot].includes(char)) {
		if (isInvalid) {
			inputScreen.value = char === dot ? '0' + char : char;
			isInvalid = false;
			return;
		}
		if (operators.includes(char)) {
			re.test(inputScreen.value) && calculate(inputScreen.value, inputScreen);
			if (isInvalid) return;
			/\.\+/g.test(inputScreen.value + '+') && (inputScreen.value += '0');
		} else if (char === dot) {
			if (/^\.|[-+*/]\./g.test(inputScreen.value + dot)) {
				//Automatically add a leading zero at the start of a decimal number if the screen is empty and the user enters the decimal point
				inputScreen.value += '0';
			} else if (/(\d*\.){2}/g.test(inputScreen.value + dot)) return; // Prevents the user from entering more than one decimal points in a single number
		}
		inputScreen.value += char;
	} else if (button === deleteButton || char === 'Backspace') {
		isInvalid
			? ((inputScreen.value = ''), (isInvalid = false))
			: (inputScreen.value = inputScreen.value.slice(0, -1));
	} else if (button === resetButton || char === ' ') {
		inputScreen.value = '';
		isInvalid = false;
	} else if (button === equalButton || char === 'Enter') {
		// When the user clicks the equal button or presses the enter key, if the screen is empty, do nothing. Else, perform the calculation
		inputScreen.value && calculate(inputScreen.value, inputScreen);
	}
}

//TODO: Create the core functions that will perform the arimethic operations
const operations = {
	'*': (a, b) => a * b,
	'/': (a, b) => a / b,
	'-': (a, b) => a - b,
	'+': (a, b) => a + b,
};
let operators = Object.keys(operations);

//TODO: Create a function that calculates the user's input and displays the result
function calculate(userInput, outputElement) {
	// If the user input is invalid, alert them and return
	isInvalid = /[*/]{2,}|[-+]{3,}|[-+*/]$/g.test(userInput);
	if (isInvalid) {
		outputElement.value = 'Invalid operation';
		return;
	}

	/* Change the user input into an array consisting of each operand and the operator.
	 Eg: '56-45' => [56, -, 45];  '-36.5/-8' => [-36.5, /, -8] */
	userInput = userInput
		.replace(/--|\+\+/g, '+')
		.replace(/\+-|-\+/g, '-')
		.replace(/,/g, '');
	let inputArray = [...userInput]
		.reduce((str, char, index, arr) => {
			str +=
				operators.includes(char) &&
				index !== 0 &&
				!operators.includes(arr[index - 1])
					? ` ${char} `
					: char;
			return str;
		}, '')
		.split(' ');
	console.log(inputArray);

	// Use the array generated from the user input to perform the calculation by calling the appropiate function from the operations object
	for (let operator of operators) {
		inputArray.includes(operator) &&
			inputArray.splice(
				inputArray.indexOf(operator) - 1,
				3,
				operations[operator](
					Number(inputArray[inputArray.indexOf(operator) - 1]),
					Number(inputArray[inputArray.indexOf(operator) + 1])
				)
			);
	}
	// Finally display the result of the calculation
	let result = inputArray[0];
	outputElement.value =
		result === Infinity || result === -Infinity || isNaN(result)
			? ((isInvalid = true),
			  isNaN(result) ? 'Invalid operation' : 'zero division error')
			: formatNumber(`${result}`);
}

//TODO: Create a function that formats the output: round long decimal numbers and insert a number separator for long whole numbers
function formatNumber(numberString) {
	//Rounds the decimal part of the number if there is any
	numberString = numberString.replace(',', '');
	let decimalPlaces = numberString.split('.')[1]?.length;
	let formattedNumber =
		decimalPlaces >= 1
			? Number(numberString).toFixed(decimalPlaces <= 5 ? decimalPlaces : 5)
			: Number(numberString);

	//Inserts the number separator in the whole number part if needed
	function addSeparator(number) {
		let wholeNumber = number.split('.')[0];
		let decimal = number.split('.')[1];

		return decimal
			? wholeNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',').concat('.' + decimal)
			: wholeNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}
	return addSeparator(`${formattedNumber}`);
}

// TODO: Listen for a change in the value of the isInvalid variable and add the invalid class to the input elemnt for styling purposes
setInterval(() => {
	isInvalid
		? inputScreen.parentElement.classList.add('invalid')
		: inputScreen.parentElement.classList.remove('invalid');
}, 0);
