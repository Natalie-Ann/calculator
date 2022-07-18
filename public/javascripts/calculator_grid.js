"use strict"

let calculator = document.querySelector('.calculator-box');
let resultScreen = document.querySelector('.calculation');
let memoryValue = 0;

const operators = ['+', '-', '×', '÷', '*', '/'];
const extraFunctions = ['+/-', '%', '√', '±'];
const memoryFunctions = ['MRC', 'M-', 'M+'];

let currentCharacter = '';
let calculation = '';
let currentlyCalculating = false;

let mrcClickedTwice = false;
let memoryClicked = false;
let memoryRecord = [];
let justFinishedCalculating = false;

let lastOperator;
let lastNumber;
let lastOperation;

calculator.addEventListener('click', (e) => {
    currentCharacter = e.target.textContent;
    if (e.target.matches('.number-button')) {
        saveCharacter();
        composeNumber();
        saveCurrentNumber();
        checkOverFlow();
    } else if (e.target.matches('#calculate')) {
        saveCharacter();
        currentlyCalculating = true;
        calculate();
        updateScreenResult();
        checkOverFlow();
    } else if (e.target.matches('#clear')) {
        clearScreenAndCalculation();
    } else if (e.target.matches('.operators')) {
        justFinishedCalculating = false;
        saveCharacter();
        currentlyCalculating = true;
        lastOperator = currentCharacter;
        calculation = validateDuplicateOperators(calculation, currentCharacter);
    } else if (e.target.matches('.extras')) {
        saveCharacter();
        let changedNumber = Function('return ' + calculateWithExtraButtons(resultScreen.value, currentCharacter))();
        //replace last number from calculation with new number
        updateLastNumber(changedNumber);
        resultScreen.value = changedNumber;
    } else if (e.target.matches('.memory')) {
        saveCharacter();
        updateMemory(currentCharacter);
    }
});

document.addEventListener('keydown', (e) => {
    e.preventDefault();
    currentCharacter = e.key;
    if (currentCharacter.match(/[0-9.]/gi)) {
        saveCharacter();
        simulateButtonPress();
        composeNumber();
        saveCurrentNumber();
        checkOverFlow();
    } else if (operators.includes(currentCharacter)) {
        justFinishedCalculating = false;
        saveCharacter();
        simulateButtonPress();
        currentlyCalculating = true;
        lastOperator = currentCharacter;
        calculation = validateDuplicateOperators(calculation, currentCharacter);
    } else if (currentCharacter === '=' || currentCharacter === 'Enter') {
        saveCharacter();
        currentlyCalculating = true;
        simulateButtonPress();
        calculate();
        updateScreenResult();
        checkOverFlow();
    } else if (currentCharacter === 'Clear' || currentCharacter === 'Backspace') {
        saveCharacter();
        simulateButtonPress();
        clearScreenAndCalculation();
    } else if (extraFunctions.includes(currentCharacter)) {
        saveCharacter();
        simulateButtonPress();
        let changedNumber = Function('return ' + calculateWithExtraButtons(resultScreen.value, currentCharacter))();
        updateLastNumber(changedNumber);
        //update currentNumber to changed number in calculation
        resultScreen.value = changedNumber;

        // resultScreen.value = Function('return ' + calculateWithExtraButtons(resultScreen.value, currentCharacter))();
    } else if (memoryFunctions.includes(currentCharacter)) {
        saveCharacter();
        updateMemory(currentCharacter);
    }
});

document.addEventListener('keyup', (e) => {
    //remove active from all buttons
    document.querySelectorAll('button').forEach(button => button.classList.remove('active'));
});

function findButton(currentCharacter) {
    let button = [...document.querySelectorAll('button')].find(button => button.textContent === currentCharacter);

    if (!button) {
        switch(currentCharacter) {
            case 'Clear':
                button = document.getElementById('clear');
                break;
            case 'Backspace':
                button = document.getElementById('clear');
                break;
            case 'Enter':
                button = document.getElementById('calculate');
                break;
            case '/':
                button = document.getElementById('divide');
                break;
            case '*':
                button = document.getElementById('multiply');
                break;
            case '±':
                button = document.getElementById('negpos');
                break;
        }

    }
    return button;
}

function simulateButtonPress() {
    let currentButton = findButton(currentCharacter);
    currentButton.classList.add('active');
}

function composeNumber() {
    if (resultScreen.value === '0' || currentlyCalculating) {
        clearScreenBetweenNumbers();
    }

    if (memoryClicked) {
        clearScreenBetweenNumbers();
        memoryClicked = false;
    }

    if (justFinishedCalculating) {
        calculation = '';
        justFinishedCalculating = false;
    }

    //if previous button pressed was memory button
    // if (memoryFunctions.includes(memoryRecord.slice(-2))) {
    //     if (memoryRecord.slice(-2) === 'MRC') {
    //         calculation = '';
    //     } else if (memoryRecord.slice(-2) === 'M+' || memoryRecord.slice(-2) === 'M-') {
    //         clearScreenAndCalculation();
    //     }

    // }

    // do not allow duplicate decimal points
    if (resultScreen.value.includes('.') && currentCharacter === '.') {
        return;
    } else {  
        calculation += currentCharacter;
        resultScreen.value += currentCharacter;
    }
}

function saveCurrentNumber() {
    lastNumber = document.querySelector('.calculation').value;
}

function saveCharacter() {
    memoryRecord.push(currentCharacter);
    console.log(memoryRecord);
}

function updateLastNumber(changedNumber) {
    let lastNumberIndex = String(calculation).lastIndexOf(lastNumber);
    calculation = calculation.slice(0, lastNumberIndex);
    calculation += changedNumber;
    //replace last number with changed number in calculation
}

function saveLastOperator() {
    lastOperator = currentCharacter;
}

function saveLastOperation() {
    lastOperation = calculation.slice(calculation.indexOf(lastOperator));

    if (operators.includes(lastOperation)) {
        lastOperation = lastOperator + lastNumber;
    }
}

function validateDuplicateOperators(calculation, currentInput) {
    let lastInput = String(calculation).slice(-1);

    if (operators.includes(lastInput)) return calculation;

    return calculation += currentInput;
}

function createOperationPhrase(calculation) {
    let numbersAndOperators = calculation.split('').map((input) => {
        switch(input) {
            case '÷':
                return '/';
            case '×':
                return '*';
            default:
                return input;
        }
    });
    return numbersAndOperators.join('');
}

function clearScreenBetweenNumbers() {
    resultScreen.value = '';
    currentlyCalculating = false;
}

function clearScreenAndCalculation() {
    resultScreen.value = '0';
    calculation = '';
    currentlyCalculating = false;
    memoryRecord = [];
}

function calculate() {
    console.log(calculation);
    if (typeof calculation === 'string') {
        saveLastOperation();
        calculation = Function('return ' + createOperationPhrase(calculation))();
        console.log(calculation);   
    } else {
        calculation += lastOperation;
        console.log(calculation);
        calculation = Function('return ' + createOperationPhrase(calculation))();
        //repeat last calculation on current result
    }
}

function updateScreenResult() {
    resultScreen.value = toFixedDigits(calculation);
    justFinishedCalculating = true;
    memoryRecord = [];
}

function calculateWithExtraButtons(number, buttonType) {
    switch(buttonType) {
        case '%':
            let percentage = number/100;
            // console.log(percentage);
            // console.log(calculation);
            //if calculaiton includes operator, return % of previous number
            if ([...calculation].filter((current) => operators.includes(current)).length > 0) {
                // console.log([...calculation].filter((current) => operators.includes(current)));
                let lastOperatorIndex = calculation.lastIndexOf(lastOperator);
                let calculationWithLastOperationRemoved = calculation.slice(0, lastOperatorIndex);
                let previousNumber = calculationWithLastOperationRemoved.match(/[0-9]+/gi).pop();
                //get previous number
                //get %number of first number
                percentage = previousNumber * percentage;
                // console.log(percentage);
            } 

            return `${percentage}`
            //else return number/100
            // if using multiplication means of "X% of first number; 900 x 15% --> 15% of 900 = 90"
            //if using addition, means total, 900 + 15% = 990
        case '√':
            return `Math.sqrt(${number})`;
        case '+/-':
            if (number > 0) {

                return `-${number}`;
            } else {
                return `${number} * -1`;
            };
        case '±':
            if (number > 0) {
                return `-${number}`;
            } else {
                return `${number} * -1`;
            };
        default:
            return number;
    }
}

//detect Clicking MRC Twice
function detectDoubleMRCClick() {
    let lastTwoInputs = memoryRecord.slice(-2);
    if (lastTwoInputs.every(element => element === 'MRC') && lastTwoInputs.length === 2) {
        console.log('MRC clicked twice!');
        mrcClickedTwice = true;
        memoryRecord = [];
        console.log(memoryRecord);
    }
}

function displayMemory() {
        //change display to show memory value
    resultScreen.value = memoryValue;
}

function updateMemory(buttonType) {
    memoryClicked = true;
    //if MRC clicked twice, update memory value to 0
    switch(buttonType) {
        case 'MRC':
            detectDoubleMRCClick();
            if (mrcClickedTwice) {
                memoryValue = 0;
                mrcClickedTwice = false;
            } else {
                displayMemory();
                //if next character is an operator, clear calculation, replace calculation with memoryvalue
                //if next character is number, clear calculation, continue as normal
            }
            break;
        case 'M+':
            memoryValue = memoryValue + Number(resultScreen.value);
            break;
        case 'M-':
            memoryValue = memoryValue - Number(resultScreen.value);
            break;
    }
}

//truncates number to 12 digits that can show on the screen; if number greater than 10e11, then display error E shown on left(not scientific calculator)
function toFixedDigits(number) {
    // if (String(number).length > 12) {
    //     number = Number(String(number).slice(0, 12));
    // };
    // return number;
    return +(number).toFixed(12);
}

function checkOverFlow() {
    //display 'E' for overflow error if number goes off screen 
        if (String(resultScreen.value).length > 12) {
            alert('overflow error');
    }
}

module.exports = {
    validateDuplicateOperators,
    createOperationPhrase,
    saveLastOperation,
    calculate,
}

