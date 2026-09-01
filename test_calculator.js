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
});
