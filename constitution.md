# Project Constitution

**Project**: Expense Tracker  
**Version**: 2.0  
**Last Updated**: December 5, 2025

## Vision & Purpose

Build a simple, reliable, and user-friendly expense tracking application that helps individuals take control of their personal finances through clear visualization, easy data management, and secure cloud synchronization across devices.

## Core Principles

### 1. User-Centric Design
- **Simplicity First**: Interface should be intuitive enough for first-time use without tutorials
- **Mobile-First**: Optimize for mobile devices as primary interface, scale up for desktop
- **Accessibility**: WCAG 2.1 AA compliance minimum for all interactive elements
- **Performance**: < 2s initial page load, < 100ms for user interactions

### 2. Data Privacy & Ownership
- **Cloud-First with Ownership**: Data stored in user's own Supabase account with full ownership and control
- **User Isolation**: Row Level Security (RLS) ensures users can only access their own data
- **No Third-Party Tracking**: Zero analytics, tracking, or data sharing with external services
- **User Control**: Users own 100% of their data with easy export (CSV) and complete deletion capabilities
- **Transparent Storage**: Clear documentation of database schema, RLS policies, and data location
- **Multi-Device Sync**: Seamless synchronization across all user's devices via cloud backend

### 3. Code Quality Standards

#### Architecture
- **Composition API First**: Use Vue 3 Composition API exclusively for better TypeScript integration
- **Type Safety**: Strict TypeScript with no `any` types except where absolutely necessary
- **Modularity**: Single Responsibility Principle - each component/composable does one thing well
- **Auto-imports**: Leverage Nuxt 3 auto-imports for cleaner code

#### Component Design
- **Atomic Design**: Follow atoms → molecules → organisms → templates pattern
- **Props Validation**: All component props must have TypeScript types
- **Composables Over Mixins**: Extract reusable logic to composables
- **Presentational vs Logic**: Separate UI components from business logic

#### State Management
- **Centralized Stores**: Use Pinia stores for shared state
- **Immutability**: Never mutate state directly, use actions
- **Persistence**: Automatic LocalStorage sync via VueUse
- **Computed Getters**: Derive state with computed properties, not duplicate data

### 4. Testing Philosophy
- **Type Safety as First Test**: TypeScript catches errors at compile time
- **Manual Testing Priority**: For MVP, thorough manual testing over automated tests
- **Critical Path Coverage**: Focus testing on: data persistence, calculations, export/import
- **Future-Ready**: Structure code to be easily testable when adding automated tests

### 5. Development Workflow

#### Version Control
- **Conventional Commits**: Use format: `type(scope): description`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - Example: `feat(transactions): add CSV export functionality`
- **Feature Branches**: One feature = one branch = one PR
- **Small Commits**: Commit logical units of work, not entire features

#### Code Review Standards
- **Self-Review First**: Review your own code before requesting review
- **Test Locally**: Verify changes work in all supported browsers
- **Documentation**: Update README/docs with user-facing changes
- **Breaking Changes**: Clearly document in commit message and PR

### 6. Performance Requirements
- **Bundle Size**: Target < 500KB initial bundle (gzipped)
- **Lighthouse Score**: 90+ on Performance, Accessibility, Best Practices
- **Time to Interactive**: < 3 seconds on 3G connection
- **Memory Usage**: < 50MB RAM for typical usage (100 transactions)

### 7. Browser & Device Support
- **Modern Browsers**: Latest 2 versions of Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **No IE Support**: Focus on modern web standards
- **Progressive Enhancement**: Core features work without JavaScript (where possible)

### 8. Dependency Management
- **Minimal Dependencies**: Prefer native solutions over libraries
- **Trusted Sources**: Only use well-maintained, popular packages
- **Regular Updates**: Monthly dependency audit and updates
- **No Bloat**: Bundle size analysis before adding new dependencies

### 9. Security Practices
- **Authentication Required**: All features require valid user authentication
- **Row Level Security**: Database-level access control via Supabase RLS policies
- **Input Validation**: Sanitize all user input (descriptions, amounts)
- **XSS Prevention**: Escape user-generated content in templates
- **CSP Headers**: Content Security Policy in production
- **No Secrets in Code**: Environment variables for Supabase credentials
- **HTTPS Only**: All connections encrypted via TLS
- **Password Requirements**: Minimum 8 characters, email verification required
- **Session Management**: Secure JWT tokens with automatic refresh

### 10. Documentation Standards
- **README-Driven**: Update README before starting features
- **Code Comments**: Explain "why", not "what" - code should be self-documenting
- **TypeScript as Documentation**: Types should clearly indicate intent
- **User Guide**: Maintain simple, screenshot-based user documentation

## Technology Constraints

### Approved Stack
- **Framework**: Nuxt 3 (Vue 3)
- **Language**: TypeScript (strict mode)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: TailwindCSS
- **State**: Pinia
- **Utilities**: VueUse, date-fns
- **Charts**: Chart.js
- **Data**: PapaParse (CSV)

### Prohibited
- ❌ jQuery or legacy Vue 2 patterns
- ❌ CSS-in-JS libraries (use Tailwind)
- ❌ Heavy UI frameworks (Bootstrap, Material UI)
- ❌ Custom backend servers (use Supabase BaaS only)
- ❌ Third-party analytics or tracking services
- ❌ Unencrypted data transmission (HTTPS/TLS required)

## Engineering Practices

### Definition of Done
A feature is complete when:
1. ✅ TypeScript compiles with zero errors
2. ✅ Works on mobile and desktop viewports
3. ✅ Data persists correctly to Supabase with RLS enforced
4. ✅ Authentication and authorization working correctly
5. ✅ No console errors or warnings
6. ✅ README updated if user-facing
7. ✅ Committed with conventional commit message

### Code Style
- **Formatting**: Prettier with default config
- **Linting**: ESLint with Nuxt recommended rules
- **Line Length**: 100 characters max
- **Naming**:
  - Components: PascalCase (`TransactionForm.vue`)
  - Composables: camelCase with `use` prefix (`useFormatters.ts`)
  - Stores: camelCase with `Store` suffix (`transactionsStore`)
  - Constants: UPPER_SNAKE_CASE (`DEFAULT_CATEGORIES`)

### Error Handling
- **User-Facing Errors**: Clear, actionable messages (no stack traces)
- **Validation Errors**: Inline, real-time feedback
- **Data Loss Prevention**: Confirm before destructive actions
- **Graceful Degradation**: App remains usable even if features fail

## User Experience Principles

### Interaction Design
- **Instant Feedback**: Visual confirmation for all actions (< 100ms)
- **Undo Support**: For destructive actions where possible
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Loading States**: Clear indicators for async operations

### Visual Design
- **Consistent Spacing**: Use Tailwind spacing scale consistently
- **Color Purpose**: 
  - Green = Income/Success
  - Red = Expense/Danger
  - Blue = Primary actions
  - Gray = Neutral/disabled
- **Typography Hierarchy**: Clear heading levels (h1-h3)
- **Icons**: Consistent style, meaningful, not decorative

### Data Entry
- **Smart Defaults**: Pre-fill date to today, type to expense
- **Minimal Required Fields**: Only require: amount, category, date
- **Format Flexibility**: Accept various number formats (1000, 1,000, 1.000)
- **Quick Actions**: Common operations accessible in ≤ 2 taps/clicks

## Iteration & Evolution

### MVP vs Future
- **MVP Focus**: Core features working perfectly > many features working okay
- **Feature Flags**: Ready code for future features but keep disabled
- **User Feedback**: Gather feedback before building advanced features
- **Incremental**: Ship small, working increments frequently

### Migration Path
- **Data Schema Versioning**: Include version field in stored data
- **Backward Compatibility**: New versions read old data formats
- **Migration Scripts**: Provide clear upgrade path for users
- **Export/Import**: Always support data portability

## Success Metrics

### Technical Health
- ✅ Zero TypeScript errors
- ✅ Zero console errors in production
- ✅ Lighthouse Performance score > 90
- ✅ Bundle size < 500KB (gzipped)

### User Success
- ✅ User can add first transaction in < 1 minute
- ✅ User understands financial summary without help
- ✅ User can export data successfully on first try
- ✅ Zero data loss incidents

### Development Velocity
- ✅ P1 features complete in 1-2 days
- ✅ P2 features complete in 2-3 days
- ✅ Bugs fixed within 24 hours of discovery
- ✅ Code review completed within 1 business day

## Constraints & Trade-offs

### Accepted Trade-offs
- **No Backend**: Accept LocalStorage limitations for simplicity
- **Modern Browsers Only**: Better DX and UX over legacy support
- **Manual Testing MVP**: Speed over comprehensive test coverage initially
- **Basic Charts**: Simple visualizations over complex analytics

### Non-Negotiable
- **Data Privacy**: Never compromise user data ownership
- **Type Safety**: No shipping code with TypeScript errors
- **Accessibility**: All core features must be accessible
- **Performance**: User interactions must feel instant

## Deployment & Environment

### Production Hosting
- **Platform**: Netlify (static site deployment)
- **Database**: Supabase (managed PostgreSQL)
- **Environment Variables**: Stored securely in Netlify dashboard
- **SSL/TLS**: Automatic HTTPS via Netlify
- **CDN**: Global content delivery for performance

### Environment Management
- **Development**: Local Nuxt dev server + Supabase dev project
- **Staging**: Optional staging environment for testing
- **Production**: Netlify production + Supabase production project
- **Secrets**: Never commit API keys or credentials to git

## Compliance & Legal

### Open Source
- **License**: MIT License
- **Attribution**: Credit all dependencies
- **No Warranty**: Clear disclaimer in README

### Data Protection
- **Minimal PII**: Only email address collected for authentication
- **No Telemetry**: Zero usage tracking or analytics
- **User Control**: Users can export and delete all their data
- **Data Encryption**: Encryption at rest (Supabase) and in transit (HTTPS)
- **GDPR Compliant**: Right to access, export, and deletion
- **Data Isolation**: RLS ensures complete user data separation

---

**This constitution guides all technical and product decisions. When in doubt, refer back to these principles.**
