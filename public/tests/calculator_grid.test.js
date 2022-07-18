const fs = require("fs");

window.document.body.innerHTML = fs.readFileSync('./public/calculator_grid.html');

const {validateDuplicateOperators, createOperationPhrase, saveLastOperation, calculate} = require("../javascripts/calculator_grid");

describe('The calculator', () => {
    it('can create a simple calculation string', () => {
        let calculation = '1×2';
        let operationPhrase = createOperationPhrase(calculation);

        expect(operationPhrase).toBe('1*2');
    });

    it('can eliminate duplicate operators', () => {
        let calculation = '2+';
        let currentInput = '+';

        let validatedCalculation = validateDuplicateOperators(calculation, currentInput);

        expect(validatedCalculation).toBe('2+');
    });


})