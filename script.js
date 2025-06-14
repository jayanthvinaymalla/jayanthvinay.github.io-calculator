class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear(); // Initialize calculator state
    }

    /**
     * Resets the calculator to its initial state, clearing all operands, operation, and error state.
     */
    clear() {
        this.currentOperand = '0'; // Current number displayed, starts at '0'
        this.previousOperand = ''; // Stored number for calculation
        this.operation = undefined; // The selected arithmetic operation (+, -, *, ÷)
        this.errorState = false; // Flag to indicate if the calculator is in an error state
    }

    /**
     * Deletes the last digit from the current operand.
     * If the calculator is in an error state, it will clear the calculator first.
     */
    delete() {
        if (this.errorState) {
            this.clear(); // If an error occurred, clear it before deleting
            return;
        }
        if (this.currentOperand === '0') return; // Don't delete if it's just '0'
        
        // Remove the last character from the string
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        
        // If the current operand becomes empty after deletion, set it back to '0'
        if (this.currentOperand === '') {
            this.currentOperand = '0';
        }
    }

    /**
     * Appends a number or decimal point to the current operand.
     * Handles cases like preventing multiple decimal points and replacing initial '0'.
     * If in an error state, starts a new calculation.
     */
    appendNumber(number) {
        if (this.errorState) {
            this.clear(); // Clear any previous error before accepting new input
        }
        // Prevent adding multiple decimal points
        if (number === '.' && this.currentOperand.includes('.')) return;

        // If current operand is '0' and a non-decimal number is pressed, replace '0'
        // Otherwise, append the number to the current operand string
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    /**
     * Sets the operation for the calculation. If there's a pending operation and a previous operand,
     * it first computes the intermediate result.
     * Handles cases where the user changes the operation.
     */
    chooseOperation(operation) {
        if (this.errorState) {
            this.clear(); // Clear error first
            // Now, set the new operation with a cleared state
            this.operation = operation;
            this.previousOperand = this.currentOperand; // currentOperand would be '0' here
            this.currentOperand = '';
            return;
        }

        if (this.currentOperand === '') {
            // If no current number is entered, allow changing the operation if one was already set
            if (this.previousOperand !== '' && this.operation !== undefined) {
                this.operation = operation; // User wants to change the operator (e.g., 5 + * -> 5 * )
                this.updateDisplay(); // Update display to show new operator
            }
            return; // Otherwise, do nothing if there's no number to operate on
        }

        // If there's a previous operand and a pending operation, compute the intermediate result
        if (this.previousOperand !== '') {
            this.compute();
            if (this.errorState) return; // If compute resulted in an error, stop further actions
        }
        
        this.operation = operation; // Store the chosen operation
        this.previousOperand = this.currentOperand; // Move current operand to previous
        this.currentOperand = ''; // Clear current operand for the next number input
    }

    /**
     * Performs the arithmetic computation based on the stored operation and operands.
     * Includes robust error handling for invalid inputs and division by zero.
     */
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        // --- Error Handling: Invalid Number Input (NaN) or insufficient operands ---
        // Case 1: Trying to compute with non-numeric values
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
        
        // Case 2: User presses '=' without enough input
        if (isNaN(prev) || isNaN(current)) {
            // If calculator is in initial/cleared state and '=' is pressed, do nothing.
            if (this.previousOperand === '' && this.currentOperand === '0' && this.operation === undefined) {
                 return;
            }
            // If an operation was selected but no second number was entered, pressing '='
            // should just show the previous number and clear the operation.
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
                // If compute is called without a defined operation (e.g., multiple '=' presses)
                // Just keep the current operand as is.
                return;
        }

        // Apply a small rounding to prevent floating-point inaccuracies
        // (e.g., 0.1 + 0.2 often results in 0.30000000000000004 without this)
        computation = Math.round(computation * 10000000000000) / 10000000000000;


        this.currentOperand = computation.toString(); // Store result as a string
        this.operation = undefined; // Clear the operation
        this.previousOperand = ''; // Clear the previous operand
    }

    /**
     * Formats a number for display, adding locale-specific separators (e.g., commas for thousands).
     * Also handles direct display of error messages.
     */
    getDisplayNumber(number) {
        // If in an error state, display the stored error string directly
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
            // Format integer part with locale-specific separators (e.g., 'en-IN' for lakhs/crores)
            integerDisplay = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(integerDigits);
        }
        
        // Combine integer and decimal parts
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    /**
     * Updates the text content of the display elements (`previousOperandTextElement` and `currentOperandTextElement`).
     */
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

// --- DOM Element Selection ---
// Select all buttons with a 'data-number' attribute
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
// Create a new instance of the Calculator class
const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// --- Event Listeners for Button Clicks ---

// Add event listeners to all number buttons
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    });
});

// Add event listeners to all operation buttons
operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.innerText);
        calculator.updateDisplay();
    });
});

// Add event listener for the equals button
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