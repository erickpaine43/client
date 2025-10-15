# PenguinMails Client

A modern email marketing platform built with Next.js, featuring real-time analytics, multi-tenant architecture, and edge deployment. Designed for scalability, performance, and developer experience.

## \U0001f680 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare
npm run deploy
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## \U0001f3d7\ufe0f Architecture

### Core Stack

- **Frontend**: Next.js 14 with App Router and TypeScript
- **Backend**: Convex for real-time data and server functions
- **Database**: NileDB for multi-tenant data isolation
- **Authentication**: NileDB integrated auth with role-based permissions
- **Deployment**: Cloudflare Workers with OpenNext adapter
- **Styling**: Tailwind CSS with shadcn/ui components

### Key Features

- **Multi-tenant Architecture**: Complete data isolation between organizations
- **Real-time Analytics**: Live campaign performance tracking and reporting
- **Edge Deployment**: Global CDN with sub-100ms response times
- **Type Safety**: End-to-end TypeScript with strict validation
- **Modern UI**: Responsive design with dark/light mode support

## \U0001f4da Documentation

### Getting Started

- **Development Guide**: [`docs/README.md`](./docs/README.md) - Complete development setup and workflows
- **Architecture Overview**: [`docs/analytics/README.md`](./docs/analytics/README.md) - System design and data flow
- **Best Practices**: [`docs/development/README.md`](./docs/development/README.md) - Coding standards and patterns

### Development Resources

- **Authentication Guide**: [`docs/development/authentication.md`](./docs/development/authentication.md) - Auth patterns and security
- **Testing Strategies**: [`docs/development/testing.md`](./docs/development/testing.md) - Testing approaches and tools
- **Troubleshooting**: [`docs/development/troubleshooting.md`](./docs/development/troubleshooting.md) - Common issues and solutions
- **Migration Patterns**: [`docs/development/migration-patterns.md`](./docs/development/migration-patterns.md) - Data migration strategies

### Infrastructure

- **Cloudflare Setup**: [`docs/infrastructure/cloudflare.md`](./docs/infrastructure/cloudflare.md) - Deployment and configuration
- **Convex Integration**: [`docs/infrastructure/convex.md`](./docs/infrastructure/convex.md) - Backend setup and patterns

## \U0001f6e0\ufe0f Development

### Prerequisites

- Node.js 18+ and npm
- Git for version control
- [Convex CLI](https://docs.convex.dev/cli) for backend development

### Environment Setup

1. **Clone and install dependencies**:

   ```bash
   git clone <repository-url>
   cd penguinmails-client
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development services**:

   ```bash
   # Start Convex backend
   npm run convex:dev

   # Start Next.js frontend (in another terminal)
   npm run dev
   ```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run convex:dev       # Start Convex backend
npm run convex:dashboard # Open Convex dashboard

# Building
npm run build            # Build Next.js application
npm run build:open-next  # Build for Cloudflare Workers
npm run build:dry        # Test build without deployment

# Testing & Quality
npm run test             # Run test suite
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript compiler

# Deployment
npm run preview          # Preview Cloudflare deployment locally
npm run deploy           # Deploy to Cloudflare Workers
npm run docs:maintenance # Validate documentation
```

### Project Structure

```
\u251c\u2500\u2500 app/                 # Next.js App Router pages and layouts
\u251c\u2500\u2500 components/          # Reusable UI components
\u251c\u2500\u2500 lib/                 # Utilities, actions, and business logic
\u2502   \u251c\u2500\u2500 actions/         # Server actions (modular architecture)
\u2502   \u251c\u2500\u2500 services/        # Business logic services
\u2502   \u2514\u2500\u2500 utils/           # Shared utilities
\u251c\u2500\u2500 convex/              # Convex backend functions and schema
\u251c\u2500\u2500 types/               # TypeScript type definitions
\u251c\u2500\u2500 docs/                # Comprehensive documentation
\u2514\u2500\u2500 scripts/             # Build and maintenance scripts
```

## \U0001f680 Deployment

### Cloudflare Workers (Recommended)

The application is optimized for Cloudflare Workers with global edge deployment:

```bash
# Build and deploy
npm run build:open-next
npm run deploy

# Preview deployment locally
npm run preview
```

**Live Application**: https://penguin-mails.mailspenguin.workers.dev

### CI/CD Pipeline

Automated deployment via GitHub Actions:

- **Production**: Deploys on push to `main` branch
- **Preview**: Deploys on pull requests
- **Manual**: Deploy via GitHub Actions workflow

### Environment Configuration

Required environment variables:

```bash
# Cloudflare
CLOUDFLARE_API_TOKEN=your-api-token
CLOUDFLARE_ACCOUNT_ID=your-account-id

# Database & Auth
DATABASE_URL=your-niledb-url
NEXTAUTH_SECRET=your-auth-secret

# External Services
STRIPE_SECRET_KEY=your-stripe-key
RESEND_API_KEY=your-resend-key
```

For complete setup instructions, see [`docs/infrastructure/cloudflare.md`](./docs/infrastructure/cloudflare.md).

## \U0001f9ea Testing & Quality

### Testing Strategy

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API and database interaction testing
- **E2E Tests**: Full user workflow testing
- **Performance Tests**: Load testing and optimization validation

### Code Quality

- **TypeScript**: Strict type checking with zero compilation errors
- **ESLint**: Code quality and consistency enforcement
- **Prettier**: Automated code formatting
- **Husky**: Pre-commit hooks for quality gates

### Performance Monitoring

- **Build Performance**: Sub-15 second build times
- **Runtime Performance**: <100ms API response times
- **Bundle Analysis**: Optimized bundle sizes and tree shaking
- **Core Web Vitals**: Lighthouse performance scoring

## \U0001f91d Contributing

### Development Workflow

1. **Fork** the repository and create a feature branch
2. **Follow** the coding standards and patterns in [`docs/development/README.md`](./docs/development/README.md)
3. **Test** your changes with `npm run test` and `npm run typecheck`
4. **Document** any new features or changes
5. **Submit** a pull request with a clear description

### Code Standards

- Use TypeScript for all new code
- Follow the established component and utility patterns
- Add tests for new functionality
- Update documentation for user-facing changes
- Ensure accessibility compliance (WCAG 2.1 AA)

## \U0001f4c4 License & Support

### Documentation Maintenance

- **Automated Validation**: Links, references, and content freshness
- **Ownership Model**: Clear responsibility assignments per feature area
- **Regular Updates**: Monthly reviews and quarterly architecture updates

### Getting Help

- **Documentation**: Comprehensive guides in [`docs/`](./docs/) directory
- **Troubleshooting**: Common issues in [`docs/development/troubleshooting.md`](./docs/development/troubleshooting.md)
- **Architecture**: System design in [`docs/analytics/README.md`](./docs/analytics/README.md)

Built with ❤️ for modern email marketing workflows.

<!-- CONTRIBUTORS START -->
<!-- CONTRIBUTORS END -->
