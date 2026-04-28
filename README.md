# Playwright Test Suite

A comprehensive Playwright test suite for SauceDemo application with TypeScript, Page Object Model, and multi-environment support.

## Features

- ✅ TypeScript support
- ✅ Page Object Model
- ✅ Multi-environment configuration (dev/stage/prod)
- ✅ Global authentication setup
- ✅ Visual regression testing
- ✅ Parallel test execution
- ✅ CI/CD ready with retries and JUnit reporting
- ✅ ESLint and Prettier code quality
- ✅ Test coverage reporting
- ✅ Docker support
- ✅ Screenshot and video capture on failure

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npm run install:browsers
   ```

## Configuration

### Environment Setup

1. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

2. Update test data in `config/` directory for your environments

### Test Data Validation

Validate your test data configuration:
```bash
npm run validate:data
```

## Usage

### Running Tests

```bash
# Run all tests in dev environment
npm run test:dev

# Run tests in stage environment
npm run test:stage

# Run tests in production environment
npm run test:prod

# Run specific test file
npx playwright test tests/saucedemo-purchase.spec.ts

# Run tests with UI mode
npm run test:ui

# Run with multiple workers
npm run test:test -- tests/api.spec.ts --headed=false -- --workers=4

# Run tests in debug mode
npm run test:debug

# Run tests in headed mode
npm run test:headed
```

### Test Tagging

```bash
# Run smoke tests
npm run test:smoke

# Run regression tests
npm run test:regression
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check code formatting
npm run format:check
```

### Coverage

```bash
# Run tests with coverage
npm run test:coverage
```

### Docker

```bash
# Build and run tests in Docker
docker-compose up playwright-tests

# Run tests with UI in Docker
docker-compose up playwright-ui
```

## Project Structure

```
├── config/                 # Test data configurations
├── scripts/                # Utility scripts
├── tests/
│   ├── fixtures/          # Test fixtures
│   ├── pages/            # Page Object Models
│   ├── snapshots/        # Visual regression snapshots
│   ├── utils/            # Test utilities
│   └── *.spec.ts         # Test specifications
├── test-results/          # Test execution results
├── playwright-report/     # HTML test reports
└── .auth/                # Authentication state
```

## CI/CD Integration

The project is configured for CI/CD with:
- JUnit XML reports for CI systems
- Automatic retries on failure
- Screenshot and video capture on failure
- Parallel execution control

## Health Checks

Run health checks before test execution:
```bash
npm run health:check
```

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Run linting and formatting before committing
4. Update documentation as needed

## Troubleshooting

### Common Issues

1. **Browser installation fails**: Run `npm run update:browsers`
2. **Authentication issues**: Check `.auth/user.json` and re-run global setup
3. **Test data issues**: Run `npm run validate:data`

### Debug Mode

Use debug mode to step through tests:
```bash
npm run test:debug
```

### View Reports

```bash
npm run report
```