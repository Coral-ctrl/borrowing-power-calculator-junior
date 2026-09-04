/**
 * Borrowing Power Calculator
 *
 * Gen's incomplete prototype.
 * This currently calculates what a user can borrow over 30 years.
 * Currently this code uses placeholder methods for Tax and HEM values.
 *
 * TODO: Refactor the code to pull Tax and HEM values from an API call.
 * A server.js has been provided to supply these values.
 */

class BorrowingCalculator {
  constructor({
    loanTermMonths = 360, // 30 Years
    interestRate = 7.0, // 7.0% baseline interest rate
    assessmentRateBuffer = 3.0, // 3.0% buffer added to interest rates
    apiToken = "pat_abcdefghijklmnopqrstuvwxyz0123456789", // dev PAT, see server.md
    apiBaseUrl = "http://localhost:3000", // local dev API
  } = {}) {
    this.loanTermMonths = loanTermMonths;
    this.interestRate = interestRate;
    this.assessmentRateBuffer = assessmentRateBuffer;
    this.apiToken = apiToken;
    this.apiBaseUrl = apiBaseUrl;
  }

  // Banks assess loans using base rate + buffer for safety
  get annualAssessmentRate() {
    return this.interestRate + this.assessmentRateBuffer;
  }

  // Fetches the annual tax owed for this income from the dev API.
  async getTax(income) {
    const response = await fetch(
      `${this.apiBaseUrl}/api/tax?income=${income}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.tax;
  }

  // Fetches the standardised HEM for this income/dependents.
  async getHEM(income, dependents) {
    const response = await fetch(
      `${this.apiBaseUrl}/api/hem?income=${income}&dependents=${dependents}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.hem;
  }

  /**
   * Calculates the total borrowing power amount and the monthly repayment configuration
   */
  async calculateBorrowingPower(income, dependents, expenses, creditLimits) {
    // 1. Calculate Net Monthly Income after tax deductions
    const annualTax = await this.getTax(income);
    const netMonthlyIncome = (income - annualTax) / 12;

    // 2. Determine living expenses (User declared expenses vs HEM baseline, whichever is higher)
    const baselineHEM = await this.getHEM(income, dependents);
    const totalLivingExpenses = Math.max(expenses, baselineHEM);

    // 3. Calculate credit card liability (~3% of total limits)
    const creditCardLiability = creditLimits * 0.03;

    // 4. Calculate monthly repayment capacity
    const maxMonthlyRepayment =
      netMonthlyIncome - totalLivingExpenses - creditCardLiability;

    // Return early if user cannot afford a loan at all
    if (maxMonthlyRepayment <= 0) {
      return { maxLoanAmount: 0, monthlyRepayment: 0 };
    }

    // 5. Calculate the monthly interest rate
    const monthlyRate = this.annualAssessmentRate / 100 / 12;

    // 6. Calculate maximum borrowing power using the following formula:
    // P = M * (1 - (1 + R)^-N) / R
    const maxLoanAmount =
      maxMonthlyRepayment *
      ((1 - Math.pow(1 + monthlyRate, -this.loanTermMonths)) / monthlyRate);

    return {
      maxLoanAmount: Number(maxLoanAmount.toFixed(2)),
      monthlyRepayment: Number(maxMonthlyRepayment.toFixed(2)),
    };
  }
}

function runConsoleMode() {
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const calculator = new BorrowingCalculator();

  console.log("Mortgage Borrowing Power Calculator");
  console.log("===================================");

  rl.question("Gross Annual Income: $", (income) => {
    rl.question("Number of Dependents: ", (dependents) => {
      rl.question("Declared Monthly Expenses: $", (expenses) => {
        rl.question("Total Credit Card Limits: $", async (creditLimits) => {
          try {
            const result = await calculator.calculateBorrowingPower(
              parseFloat(income),
              parseInt(dependents),
              parseFloat(expenses),
              parseFloat(creditLimits)
            );

            console.log("\n--- Calculation Summary ---");
            console.log(
              `Maximum Borrowing Power at ${
                calculator.interestRate
              }%: $${result.maxLoanAmount.toLocaleString()}`
            );
            console.log(
              `Assumed Monthly Mortgage Repayment: $${result.monthlyRepayment.toLocaleString()} over ${
                calculator.loanTermMonths / 12
              } years`
            );
          } catch (err) {
            console.log(`\nSorry, something went wrong: ${err.message}`);
          } finally {
            rl.close();
          }
        });
      });
    });
  });
}

if (require.main === module) {
  runConsoleMode();
}

module.exports = { BorrowingCalculator };
