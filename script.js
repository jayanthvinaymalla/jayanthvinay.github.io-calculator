class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear(); 
    }

    clear() {
        this.currentOperand = '0'; 
        this.previousOperand = ''; 
        this.operation = undefined; 
        this.errorState = false; 
    }

    
    delete() {
        if (this.errorState) {
            this.clear(); 
            return;
        }
        if (this.currentOperand === '0') return; 
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') {
            this.currentOperand = '0';
        }
    }


    appendNumber(number) {
        if (this.errorState) {
            this.clear(); 
        }

        if (number === '.' && this.currentOperand.includes('.')) return;

        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    
    chooseOperation(operation) {
        if (this.errorState) {
            this.clear(); 
            this.operation = operation;
            this.previousOperand = this.currentOperand; 
            this.currentOperand = '';
            return;
        }

        if (this.currentOperand === '') {
           
            if (this.previousOperand !== '' && this.operation !== undefined) {
                this.operation = operation; 
                this.updateDisplay(); 
            }
            return; 
        }

        
        if (this.previousOperand !== '') {
            this.compute();
            if (this.errorState) return; 
        }
        
        this.operation = operation; 
        this.previousOperand = this.currentOperand; 
        this.currentOperand = ''; 
    }

    
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        
        if (isNaN(prev) && this.previousOperand !== '') {
            this.currentOperand = 'Error';
            this.errorState = true;
            return;
        }
        if (isNaN(current) && this.currentOperand !== '') {
             this.currentOperand = 'Error';
             this.errorState = true;
             return;
        }
        
        if (isNaN(prev) || isNaN(current)) {
            // If calculator is in initial/cleared state and '=' is pressed, do nothing.
            if (this.previousOperand === '' && this.currentOperand === '0' && this.operation === undefined) {
                 return;
            }
        
            if (this.previousOperand !== '' && this.operation !== undefined && isNaN(current)) {
                 this.currentOperand = this.previousOperand; // Restore previous operand as result
                 this.operation = undefined;
                 this.previousOperand = '';
                 return;
            }
            // General error for other unexpected NaN scenarios
            this.currentOperand = 'Error';
            this.errorState = true;
            return;
        }


        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '÷':
                // --- Error Handling: Division by Zero ---
                if (current === 0) {
                    this.currentOperand = 'Can\'t divide by 0';
                    this.errorState = true;
                    return;
                }
                computation = prev / current;
                break;
            default:
            
                return;
        }

        
        computation = Math.round(computation * 10000000000000) / 10000000000000;


        this.currentOperand = computation.toString(); // Store result as a string
        this.operation = undefined; // Clear the operation
        this.previousOperand = ''; // Clear the previous operand
    }

 
    getDisplayNumber(number) {
        if (this.errorState) {
            return number;
        }

        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;

        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(integerDigits);
        }
        
        // Combine integer and decimal parts
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandTextElement.innerText =
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = ''; // Clear previous display if no operation
        }
    }
}


const numberButtons = document.querySelectorAll('[data-number]');
// Select all buttons with a 'data-operation' attribute
const operationButtons = document.querySelectorAll('[data-operation]');
// Select the equals button
const equalsButton = document.querySelector('[data-equals]');
// Select the delete button
const deleteButton = document.querySelector('[data-delete]');
// Select the all clear button
const allClearButton = document.querySelector('[data-all-clear]');
// Select the display element for the previous operand (top line)
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
// Select the display element for the current operand (bottom line)
const currentOperandTextElement = document.querySelector('[data-current-operand]');

// --- Calculator Initialization ---

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    });
});


operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.innerText);
        calculator.updateDisplay();
    });
});


equalsButton.addEventListener('click', () => { // Changed 'button' to '()' as 'button' parameter isn't used
    calculator.compute();
    calculator.updateDisplay();
});

// Add event listener for the all clear button
allClearButton.addEventListener('click', () => { // Changed 'button' to '()'
    calculator.clear();
    calculator.updateDisplay();
});

// Add event listener for the delete button
deleteButton.addEventListener('click', () => { // Changed 'button' to '()'
    calculator.delete();
    calculator.updateDisplay();
});

// --- Keyboard Support Event Listener ---
document.addEventListener('keydown', e => {
    // Handle number and decimal point inputs
    if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }
    // Handle operation inputs (+, -, *, /)
    else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        calculator.chooseOperation(e.key === '/' ? '÷' : e.key); // Convert '/' to '÷' for display
        calculator.updateDisplay();
    }
    // Handle Enter or Equals key for computation
    else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault(); // Prevent default browser behavior (e.g., form submission)
        calculator.compute();
        calculator.updateDisplay();
    }
    // Handle Backspace key for deletion
    else if (e.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    }
    // Handle Escape key for clearing the calculator
    else if (e.key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
    }
});
