/**
 * Borrowing Power Calculator Test Suite
 */

const assert = require("assert");
const { BorrowingCalculator } = require("./borrowingCalculator");

describe("Borrowing Power Calculator Tests", () => {
  it("should calculate borrowing power for standard values", async () => {
    const calculator = new BorrowingCalculator();
    const result = await calculator.calculateBorrowingPower(
      120000,
      2,
      3000,
      10000
    );
    assert.ok(
      result.maxLoanAmount > 0,
      "Should yield a positive borrowing power amount"
    );
    assert.strictEqual(result.monthlyRepayment, 4600);
    assert.strictEqual(result.maxLoanAmount, 524173.77);
  });

  it("should return 0 for low income", async () => {
    const calculator = new BorrowingCalculator();
    const result = await calculator.calculateBorrowingPower(
      30000,
      3,
      4000,
      5000
    );
    assert.strictEqual(result.maxLoanAmount, 0);
    assert.strictEqual(result.monthlyRepayment, 0);
  });

  it("should throw an error for invalid negative income", async () => {
    const calculator = new BorrowingCalculator();
    await assert.rejects(
      calculator.calculateBorrowingPower(-30000, 3, 4000, 5000)
    );
  });

  it("should throw an error for invalid negative dependents", async () => {
    const calculator = new BorrowingCalculator();
    await assert.rejects(
      calculator.calculateBorrowingPower(30000, -3, 4000, 5000)
    );
  });

  it("should use declared expenses when they are higher than HEM", async () => {
    const calculator = new BorrowingCalculator();
    const result = await calculator.calculateBorrowingPower(
      120000,
      2,
      4000, // Higher than HEM of $3,100
      0
    );
    assert.strictEqual(result.monthlyRepayment, 4000);
  });

  it("should calculate credit card liability as 3% of the total limit", async () => {
    const calculator = new BorrowingCalculator();
    const resultWithoutCreditCard = await calculator.calculateBorrowingPower(
      120000,
      2,
      3000,
      0
    );
    const resultWithCreditCard = await calculator.calculateBorrowingPower(
      120000,
      2,
      3000,
      10000
    );
    assert.strictEqual(resultWithoutCreditCard.monthlyRepayment, 4900);
    assert.strictEqual(resultWithCreditCard.monthlyRepayment, 4600);
    assert.strictEqual(
      resultWithoutCreditCard.monthlyRepayment -
        resultWithCreditCard.monthlyRepayment,
      300
    );
  });

  it("should return zero when monthly repayment capacity is exactly zero", async () => {
    const calculator = new BorrowingCalculator();
    const result = await calculator.calculateBorrowingPower(30000, 0, 2375, 0);
    assert.strictEqual(result.maxLoanAmount, 0);
    assert.strictEqual(result.monthlyRepayment, 0);
  });
});
