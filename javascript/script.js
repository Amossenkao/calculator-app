class Calculator {
	#inputScreen;
	#buttons;
	#deleteButton;
	#resetButton;
	#equalButton;
	#themeElement;
	#digits;
	#dot;
	#_isInvalid;
	#operations;
	#operators;
	#customEvent;
	constructor() {
		this.#inputScreen = document.querySelector('.input-field input');
		this.#buttons = document.querySelectorAll('.btn');
		this.#deleteButton = document.querySelector('.delete');
		this.#resetButton = document.querySelector('.reset');
		this.#equalButton = document.querySelector('.equal-sign');
		this.#themeElement = document.querySelector('.theme');
		this.#digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
		this.#dot = '.';
		this.#_isInvalid = false;
		this.#operations = {
			'*': (a, b) => a * b,
			'/': (a, b) => a / b,
			'-': (a, b) => a - b,
			'+': (a, b) => a + b,
		};
		this.#operators = ['*', '/', '-', '+'];
		this.#setTheme();
		this.#addListeners();
	}

	get #isInvalid() {
		return this.#_isInvalid;
	}

	set #isInvalid(value) {
		this.#_isInvalid = value;
		window.dispatchEvent(this.#customEvent);
	}

	#setTheme = (newTheme) => {
		const theme = newTheme ?? (localStorage.theme ??= '1');
		this.#themeElement.value = theme;
		document.body.className = `theme-${theme}`;
		newTheme && localStorage.setItem('theme', theme);
	};

	#addListeners() {
		this.#customEvent = new CustomEvent('invalidvaluechange');
		window.addEventListener('invalidvaluechange', () => {
			const parentElement = this.#inputScreen.parentElement;
			this.#isInvalid
				? parentElement.classList.add('invalid')
				: parentElement.classList.remove('invalid');
		});

		document.addEventListener('keydown', (evt) =>
			this.#processInput(null, evt.key)
		);

		this.#themeElement.addEventListener('click', (evt) => {
			this.#setTheme(evt.target.value);
		});

		this.#buttons.forEach((btn) => {
			btn.addEventListener('click', () => this.#processInput(btn));
		});
	}

	#processInput(button, key = null) {
		let re = /[\d.]+[-+/*]+[\d.]+/g;
		let char = key ? key : button.textContent;
		if ([...this.#operators, ...this.#digits, this.#dot].includes(char)) {
			if (this.#isInvalid) {
				this.#inputScreen.value = char === this.#dot ? '0' + char : char;
				this.#isInvalid = false;
				return;
			}
			if (this.#operators.includes(char)) {
				re.test(this.#inputScreen.value) &&
					this.#calculate(this.#inputScreen.value, this.#inputScreen);
				if (this.#isInvalid) return;
				/\.\+/g.test(this.#inputScreen.value + '+') &&
					(this.#inputScreen.value += '0');
			} else if (char === this.#dot) {
				if (/^\.|[-+*/]\./g.test(this.#inputScreen.value + this.#dot)) {
					this.#inputScreen.value += '0';
				} else if (/(\d*\.){2}/g.test(this.#inputScreen.value + this.#dot))
					return;
			}
			this.#inputScreen.value += char;
		} else if (button === this.#deleteButton || char === 'Backspace') {
			this.#isInvalid
				? ((this.#inputScreen.value = ''), (this.#isInvalid = false))
				: (this.#inputScreen.value = this.#inputScreen.value.slice(0, -1));
		} else if (button === this.#resetButton || char === ' ') {
			this.#inputScreen.value = '';
			this.#isInvalid = false;
		} else if (button === this.#equalButton || char === 'Enter') {
			this.#inputScreen.value &&
				this.#calculate(this.#inputScreen.value, this.#inputScreen);
		}
	}

	#calculate(userInput, outputElement) {
		this.#isInvalid = /[*/]{2,}|[-+]{3,}|[-+*/]$/g.test(userInput);
		if (this.#isInvalid) {
			outputElement.value = 'Invalid operation';
			return;
		}

		userInput = userInput
			.replace(/--|\+\+/g, '+')
			.replace(/\+-|-\+/g, '-')
			.replace(/,/g, '');
		let inputArray = [...userInput]
			.reduce((str, char, index, arr) => {
				str +=
					this.#operators.includes(char) &&
					index !== 0 &&
					!this.#operators.includes(arr[index - 1])
						? ` ${char} `
						: char;
				return str;
			}, '')
			.split(' ');

		for (let operator of this.#operators) {
			inputArray.includes(operator) &&
				inputArray.splice(
					inputArray.indexOf(operator) - 1,
					3,
					this.#operations[operator](
						Number(inputArray[inputArray.indexOf(operator) - 1]),
						Number(inputArray[inputArray.indexOf(operator) + 1])
					)
				);
		}

		let result = inputArray[0];
		outputElement.value =
			result === Infinity || result === -Infinity || isNaN(result)
				? ((this.#isInvalid = true),
				  isNaN(result) ? 'Invalid operation' : 'zero division error')
				: this.#formatNumber(`${result}`);
	}

	#formatNumber(numberString) {
		numberString = numberString.replace(',', '');
		let decimalPlaces = numberString.split('.')[1]?.length;
		let formattedNumber =
			decimalPlaces >= 1
				? Number(numberString).toFixed(decimalPlaces <= 5 ? decimalPlaces : 5)
				: Number(numberString);

		function addSeparator(number) {
			let wholeNumber = number.split('.')[0];
			let decimal = number.split('.')[1];

			return decimal
				? wholeNumber
						.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
						.concat('.' + decimal)
				: wholeNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		}
		return addSeparator(`${formattedNumber}`);
	}
}

const calc = new Calculator();
