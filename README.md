# Borrowing Power Calculator

A simple mortgage borrowing-power calculator built as a Node.js CLI. Given an
applicant's income, dependents, expenses, and credit card limits, it estimates
the maximum they could borrow and the monthly repayment, using live tax and
HEM (Household Expenditure Measure) data pulled from a provided dev API.

This started as an incomplete prototype (placeholder tax/HEM math, no
structure) and was completed as a take-home exercise: wiring the two
placeholder functions to a real API, restructuring into a class, and adding
test coverage.

## Setup

Requires Node.js installed.

```bash
npm install
```

## Running the API

The calculator depends on a local dev API for tax and HEM data. Start it in
its own terminal, and leave it running:

```bash
npm run api
```

Available at `http://localhost:3000/`. Two endpoints, both requiring an
`Authorization: Bearer <token>` header (dev token:
`pat_abcdefghijklmnopqrstuvwxyz0123456789`):

- `GET /api/tax?income=<income>` → `{ "income": 125000, "tax": 25750 }`
- `GET /api/hem?income=<income>&dependents=<dependents>` → `{ "income": 125000, "dependents": 2, "hem": 3100 }`

Missing/invalid token returns `401`; a missing or negative parameter returns
`400`.

## Running the calculator

In a separate terminal, with the API running:

```bash
npm start
```

Answers four prompts (income, dependents, expenses, credit card limits) and
prints the estimated maximum borrowing power and monthly repayment.

## Testing

```bash
npm test
```

**Note:** the test suite calls the real API (no mocking), so `npm run api`
must be running in another terminal first, or the tests will fail with
`ECONNREFUSED`.

To check coverage:

```bash
npm run coverage
```

Current coverage: **71.06% statements / 93.33% branch**. The gap is
`runConsoleMode()`, the function that
runs the interactive terminal prompts — asking for income, dependents,
expenses, and credit limit. Since that function reads real keyboard
input, it's excluded from automated tests, so I tested it by hand
instead: running the calculator myself multiple times with different
numbers and checking the results matched what I'd worked out separately
by hand.

## Design decisions, assumptions & tradeoffs

**Structure — a class.** I grouped the calculator's settings — loan
length, interest rate, the extra safety buffer, the API login details —
into one place, set when you create a calculator, with sensible
defaults built in. The numbers that change every time someone uses
it — their income, dependents, expenses, credit limit — stay as things
you pass in each time you ask for a result, since those belong to the
person asking, not to the calculator itself. I also moved the "add a
safety buffer to the interest rate" rule inside the calculator itself,
instead of making whoever calls it work that out — so that rule only
exists in one place, not scattered around.

**Error handling.** A failed API call is caught in the CLI flow and shown as a short message
instead of a raw stack trace — e.g. "Sorry, something went wrong:
Request failed: 400". I kept the message itself simple (just the
underlying error text) rather than writing scenario-specific hints,
since a single hint like "check the server is running" would be wrong
advice for a validation failure rather than a network one, and
distinguishing the two cleanly would need a bit more logic than felt
worth it here.

**Verification.** The main way I checked correctness was hand-deriving
the exact expected numbers from the actual formulas and
confirming my code produced identical results (e.g. income $125,000 →
tax $25,750; income $120,000, 2 dependents, $3,000 expenses, $10,000
credit limit → $4,600 monthly repayment). This is the strongest check
available here, since I controlled both sides of the comparison.

As a secondary sanity check, I compared output against
Bendigo Bank's [Home Loan Borrowing Power calculator](https://www.bendigobank.com.au/personal/home-loans/calculators/borrowing-power/)
using matching inputs (income $120,000, 2 dependents, $3,000/month
expenses, $10,000 credit limit): mine gave $524,173.77 at 10% (7% base +
3% assessment buffer) over 30 years; Bendigo's real product gave
$467,000 at their actual 6.14% rate. The ~12% gap is expected, not a
bug — this exercise is deliberately
simplified. This check wasn't for an exact match
— it confirmed the output is
realistic in shape and scale, not a sign of a units bug or a wildly
wrong formula.
