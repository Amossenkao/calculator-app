const inputScreen = $('.input-field input');
const buttons = $('.button');
let currentTheme;
function getCurrentTheme() {
	currentTheme = `theme-${$('.theme-picker input').val()}`;
	$('.root').removeClass('theme-1 theme-2 theme-3').addClass(currentTheme);
}

getCurrentTheme();
$('.theme-picker input').change(function () {
	getCurrentTheme();
});

buttons.mousedown(function () {
	if (inputScreen.hasClass('invalid') && !$(this).hasClass('equal-sign')) {
		inputScreen.val('').removeClass('invalid');
	}
});

buttons.click(function () {
	if ($(this).hasClass('digit') || $(this).hasClass('operator')) {
		inputScreen.val(inputScreen.val() + $(this).children().text());
	} else if ($(this).hasClass('delete')) {
		inputScreen.val(inputScreen.val().slice(0, -1));
	} else if ($(this).hasClass('reset')) {
		inputScreen.val('');
	} else if ($(this).hasClass('equal-sign')) {
		if (
			/[-.+/x]$/.test(inputScreen.val()) ||
			/^[x/]/.test(inputScreen.val()) ||
			/[\/x]{2}/.test(inputScreen.val())
		) {
			invalid();
		} else {
			try {
				if (/[^-0-9+./x]+/.test(inputScreen.val())) {
					invalid();
				} else {
					if (
						eval(inputScreen.val().replace(/x/gi, '*')) === Infinity
					) {
						invalid(true);
					} else {
						inputScreen.val(
							eval(inputScreen.val().replace(/x/gi, '*'))
						);
					}
				}
			} catch {
				invalid();
			}
		}
	}
});

function invalid(infinity = false) {
	// Show the invalid message if the user input evaluates to an invalid result
	inputScreen
		.val(infinity ? "can't divide by zero" : 'Invalid operation')
		.addClass('invalid');
}

// Prevent the user from entering anything that is does not fall in the range of acceptable characters (0-9-+./*)
document
	.querySelector('.input-field input')
	.addEventListener('input', function () {
		let re = /[^-0-9+./x]+/;
		if (re.test(this.value)) {
			this.value = this.value.replace(re, '');
		}
	});

this.onkeydown = function (event) {
	if (event.key === 'Enter') {
		$('.equal-sign').click();
	}
};
