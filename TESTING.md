# Test Setup Documentation

## Overview
The test files are configured to run with Jest and TypeScript. The setup includes unit tests and API integration tests.

## Files Structure

```
tests/
├── __mocks__/
│   └── prisma.ts           # Prisma client mock
├── withdraw.service.test.ts # Unit tests for withdrawal service
├── withdrawals.api.test.ts   # API integration tests
├── setup.ts                 # Jest setup file
├── globals.d.ts             # Global type definitions
└── tsconfig.json            # TypeScript config for tests
```

## Configuration Files

### jest.config.ts (root)
- Main Jest configuration
- Specifies test environment as 'node'
- Configures ts-jest transformer
- Handles ES module imports with .js extensions

### tsconfig.json (tests/)
- Extends root TypeScript configuration
- Includes Jest and Node.js types
- Configured for ES modules with verbatimModuleSyntax

## Test Files

### withdrawal.service.test.ts
- Tests the `requestWithdrawal()` function
- Validates deposit status checks
- Verifies database updates
- Uses mocked Prisma and Stacks services

### withdrawals.api.test.ts
- Tests the withdrawals API endpoint
- Validates error handling
- Uses supertest for HTTP request simulation

## Running Tests

```bash
npm test
```

## Mock Setup

Prisma client is mocked in `__mocks__/prisma.ts` to allow isolated testing without a database.

Mock functions available:
- `prisma.deposit.findUnique()`
- `prisma.deposit.update()`
- `prisma.deposit.findMany()`
- `prisma.deposit.create()`

## Type Safety

- All test files use TypeScript for type safety
- Jest globals (describe, it, expect) are properly typed
- Mock functions have proper Jest.Mock type annotations

## Notes

- Tests require `@types/jest` and `@types/supertest` to be installed
- All imports use `.js` extensions for ES module compatibility
- Use `jest.mock()` before importing mocked modules
