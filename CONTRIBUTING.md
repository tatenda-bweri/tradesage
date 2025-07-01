# Contributing to TradeSage

Thank you for your interest in contributing to TradeSage! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)
- [Documentation](#documentation)
- [Community Guidelines](#community-guidelines)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- SQLite (for local development)
- Basic knowledge of React, TypeScript, and Next.js

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/yourusername/tradesage.git
   cd tradesage
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/tradesage/tradesage.git
   ```

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
```

### 3. Database Setup

```bash
# Initialize database
npm run db:init

# Run migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 5. Development Tools

```bash
# Database browser
npm run db:studio

# Type checking
npm run type-check

# Linting
npm run lint

# Formatting
npm run format

# Testing
npm run test
```

## Code Standards

### TypeScript

- Use strict TypeScript configuration
- Define proper interfaces and types
- Avoid `any` type - use proper typing
- Use generics where appropriate

```typescript
// Good
interface TradeRecord {
  id: string
  symbol: string
  type: 'BUY' | 'SELL'
  profit: number
}

// Bad
const trade: any = { id: '123', symbol: 'EURUSD' }
```

### React Components

- Use functional components with hooks
- Follow naming conventions (PascalCase for components)
- Implement proper prop interfaces
- Use React.memo for performance optimization when needed

```typescript
interface TradeCardProps {
  trade: TradeRecord
  onEdit?: (trade: TradeRecord) => void
  className?: string
}

const TradeCard: React.FC<TradeCardProps> = ({ trade, onEdit, className }) => {
  // Component implementation
}
```

### File Organization

- Use kebab-case for file names
- Group related files in directories
- Use index.ts files for clean exports
- Follow the established folder structure

```
src/
├── components/
│   ├── ui/
│   ├── dashboard/
│   └── index.ts
├── lib/
│   ├── parsers/
│   ├── utils/
│   └── types/
└── pages/
```

### Styling

- Use Tailwind CSS for styling
- Follow the design system colors
- Use CSS custom properties for theming
- Implement responsive design

```typescript
// Use design system colors
className="bg-surface text-text-primary border border-surface-light"

// Responsive design
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

### Error Handling

- Use error boundaries for component errors
- Implement proper try-catch blocks
- Provide meaningful error messages
- Log errors appropriately

```typescript
try {
  const result = await apiCall()
  return result
} catch (error) {
  console.error('API call failed:', error)
  throw new Error('Failed to fetch data')
}
```

## Testing

### Unit Tests

- Write tests for all utility functions
- Test component rendering and interactions
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
describe('calculateProfitLoss', () => {
  it('should calculate positive profit correctly', () => {
    // Arrange
    const openPrice = 1.0850
    const closePrice = 1.0870
    const volume = 0.1

    // Act
    const result = calculateProfitLoss(openPrice, closePrice, volume)

    // Assert
    expect(result).toBe(20.00)
  })
})
```

### Integration Tests

- Test complete workflows
- Test API integrations
- Test database operations
- Use test databases

### E2E Tests

- Test critical user journeys
- Test import workflows
- Test dashboard functionality
- Use Playwright for E2E testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=parser

# Run E2E tests
npm run test:e2e
```

## Pull Request Process

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clean, well-documented code
- Add tests for new functionality
- Update documentation if needed
- Follow the coding standards

### 3. Commit Your Changes

Use conventional commit messages:

```bash
git commit -m "feat(dashboard): add profit factor gauge component"
git commit -m "fix(import): handle malformed Exness HTML dates"
git commit -m "test(trades): add filtering validation tests"
```

Commit types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### 4. Push Your Changes

```bash
git push origin feature/your-feature-name
```

### 5. Create a Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your feature branch
4. Fill out the PR template
5. Submit the PR

### 6. PR Review Process

- All PRs require at least one review
- Address review comments promptly
- Ensure all tests pass
- Update documentation if needed

### 7. Merge

- PRs are merged after approval
- Use squash and merge for clean history
- Delete feature branches after merge

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Environment details** (OS, browser, Node.js version)
5. **Screenshots** if applicable
6. **Console errors** if any

### Issue Template

```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 120]
- Node.js: [e.g. 18.17.0]

## Additional Information
Any other context about the problem
```

## Feature Requests

### Guidelines

- Check existing issues first
- Provide clear use case
- Explain the benefit
- Consider implementation complexity

### Feature Request Template

```markdown
## Feature Description
Brief description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other approaches you've considered

## Additional Information
Any other relevant information
```

## Documentation

### Code Documentation

- Use JSDoc for functions and components
- Document complex algorithms
- Explain business logic
- Keep documentation up to date

```typescript
/**
 * Calculates the profit/loss for a trade
 * @param openPrice - The opening price of the trade
 * @param closePrice - The closing price of the trade
 * @param volume - The volume/lot size of the trade
 * @returns The calculated profit/loss amount
 */
function calculateProfitLoss(openPrice: number, closePrice: number, volume: number): number {
  // Implementation
}
```

### API Documentation

- Document all API endpoints
- Include request/response examples
- Explain error codes
- Keep OpenAPI specs updated

### User Documentation

- Write clear user guides
- Include screenshots
- Provide step-by-step instructions
- Update when features change

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Help others learn
- Provide constructive feedback
- Follow the project's code of conduct

### Communication

- Use GitHub issues for discussions
- Be clear and concise
- Ask questions when needed
- Share knowledge and experiences

### Recognition

- Contributors are recognized in the README
- Significant contributions get special mention
- All contributors are appreciated

## Getting Help

### Resources

- [Project README](../README.md)
- [API Documentation](../API.md)
- [Deployment Guide](../DEPLOYMENT.md)
- [GitHub Issues](https://github.com/tradesage/tradesage/issues)
- [GitHub Discussions](https://github.com/tradesage/tradesage/discussions)

### Contact

- Create an issue for bugs or feature requests
- Use discussions for questions
- Email: contributors@tradesage.com

## Development Workflow

### Daily Workflow

1. Pull latest changes: `git pull upstream main`
2. Create feature branch: `git checkout -b feature/name`
3. Make changes and test locally
4. Commit with conventional messages
5. Push and create PR

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console errors
- [ ] Responsive design works
- [ ] Accessibility standards met

### Release Process

1. Create release branch from main
2. Update version numbers
3. Update changelog
4. Run full test suite
5. Create release on GitHub
6. Deploy to production

## Thank You

Thank you for contributing to TradeSage! Your contributions help make this project better for everyone in the trading community. 