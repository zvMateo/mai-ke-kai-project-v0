# AGENTS.md - Coding Agent Guidelines

This file provides essential information for AI coding agents working on the Mai Ke Kai Surf House PMS project.

## Project Overview

**Type:** Full-stack Next.js web application  
**Purpose:** Property Management System for a boutique surf hostel in Costa Rica  
**Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Supabase, Tailwind CSS v4  
**Package Manager:** pnpm

## Build, Lint & Test Commands

### Essential Commands

```bash
# Development
pnpm dev                  # Start dev server (default: http://localhost:3000)
pnpm build               # Build for production
pnpm start               # Start production server
pnpm preview             # Build and start production server

# Code Quality
pnpm lint                # Run ESLint
pnpm lint:fix            # Auto-fix ESLint issues
pnpm type-check          # Run TypeScript compiler without emitting

# Utilities
pnpm clean               # Clean build artifacts and cache
pnpm build:analyze       # Analyze bundle size with @next/bundle-analyzer
```

### Testing

**Status:** No testing framework currently configured.  
When adding tests, consider Jest/Vitest + React Testing Library for unit/integration tests, and Playwright/Cypress for E2E tests.

### Running Single Tests

N/A - No test framework configured yet.

## Code Style Guidelines

### TypeScript

#### Type Safety

- **Strict mode enabled** - All code must pass strict TypeScript checks
- Use explicit type annotations for function parameters and return types
- Prefer `interface` over `type` for object shapes
- Use `type` for unions, intersections, and utility types
- Import types with `type` keyword: `import type { User } from '@/types'`

#### Example

```typescript
interface CreateBookingInput {
  checkIn: string
  checkOut: string
  guestsCount: number
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  // Implementation
}
```

### File Organization & Naming

#### Naming Conventions

- **Components:** PascalCase - `BookingCard.tsx`, `UserProfile.tsx`
- **Files:** kebab-case - `booking-utils.ts`, `user-actions.ts`
- **Functions/Variables:** camelCase - `getUserBookings`, `totalAmount`
- **Constants:** SCREAMING_SNAKE_CASE - `MAX_GUESTS`, `DEFAULT_CURRENCY`
- **Types/Interfaces:** PascalCase - `User`, `BookingStatus`

#### Directory Structure

```
app/                     # Next.js App Router (routes)
components/              # React components
  ├── admin/            # Admin-specific components
  ├── ui/               # shadcn/ui primitives
  └── [feature]/        # Feature-based components
lib/                    # Core business logic
  ├── actions/          # Server actions (use server)
  ├── queries/          # TanStack Query hooks
  ├── stores/           # Zustand state stores
  └── supabase/         # Supabase clients
types/                  # TypeScript definitions
hooks/                  # Custom React hooks
```

### Import Organization

Organize imports in this order:

1. Type imports (with `type` keyword)
2. React and React-related imports
3. Third-party libraries
4. Local imports (using `@/` alias)

```typescript
import type { Database } from '@/types/database'
import * as React from 'react'
import { useState } from 'react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
```

### React & Next.js Patterns

#### Component Structure

```typescript
'use client' // Only for client components (interactive, hooks, browser APIs)

import type { ComponentProps } from 'react'
import { useState } from 'react'

interface MyComponentProps {
  title: string
  onSubmit?: () => void
}

export function MyComponent({ title, onSubmit }: MyComponentProps) {
  const [state, setState] = useState(false)
  
  return (
    <div>
      {/* Component content */}
    </div>
  )
}
```

#### Server Actions

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Booking } from '@/types/database'

export async function createBooking(input: CreateBookingInput) {
  const supabase = await createClient()
  
  // Business logic
  const { data, error } = await supabase
    .from('bookings')
    .insert(input)
    .select()
    .single()
  
  if (error) {
    throw new Error('Failed to create booking')
  }
  
  revalidatePath('/bookings')
  return data
}
```

#### Server Components (Default)

- Components are Server Components by default (no directive needed)
- Use for non-interactive content, data fetching, SEO
- Cannot use hooks or browser APIs

### Styling with Tailwind CSS

#### Class Ordering

Use the `cn()` utility for conditional classes:

```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  "base-class-1 base-class-2",
  condition && "conditional-class",
  variant === "primary" && "variant-class",
  className // Allow prop override
)} />
```

#### Component Variants

Use `class-variance-authority` for variant patterns:

```typescript
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  "base-classes", // Base styles
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-white",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### Error Handling

#### Server Actions

```typescript
export async function someAction(input: Input) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('table').select()
    
    if (error) {
      console.error('Database error:', error)
      throw new Error('User-friendly error message')
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Action failed:', error)
    return { success: false, error: 'Failed to perform action' }
  }
}
```

#### Client Components

- Use error boundaries for component-level errors
- Display user-friendly messages with toast notifications (sonner)
- Log errors for debugging but don't expose internal details

### State Management

#### Server State (TanStack Query)

```typescript
import { useQuery } from '@tanstack/react-query'
import { bookingKeys } from '@/lib/queries/keys'

export function useBookings() {
  return useQuery({
    queryKey: bookingKeys.all,
    queryFn: fetchBookings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

#### Client State (Zustand)

For global client state (UI state, temporary data):

```typescript
import { create } from 'zustand'

interface BookingStore {
  currentStep: number
  setCurrentStep: (step: number) => void
}

export const useBookingStore = create<BookingStore>((set) => ({
  currentStep: 1,
  setCurrentStep: (step) => set({ currentStep: step }),
}))
```

### Forms

Use React Hook Form + Zod:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
})

type FormData = z.infer<typeof schema>

export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', name: '' },
  })
  
  async function onSubmit(data: FormData) {
    // Handle submission
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

## Additional Guidelines

### Performance

- Use Server Components by default
- Add `'use client'` only when necessary (interactivity, hooks)
- Implement proper loading states with Suspense
- Use `revalidatePath()` after mutations
- Leverage Next.js image optimization

### Internationalization

- Use `next-intl` for translations
- Support 4 languages: en, es, fr, de
- Translation keys in `/messages/[locale].json`

### Database

- Use Supabase client from `@/lib/supabase/server` (Server Components/Actions)
- Use Supabase client from `@/lib/supabase/client` (Client Components)
- Respect Row Level Security policies
- Type database operations with types from `@/types/database`

### Path Alias

Use `@/` for all local imports:

```typescript
import { Button } from '@/components/ui/button'
import { createBooking } from '@/lib/actions/bookings'
```

### No Console Logs

Remove all `console.log()` statements before committing. Use proper error handling instead.

### Comments

- Write self-documenting code (clear names)
- Add comments only for complex business logic
- Use JSDoc for public API functions
- Explain "why" not "what"

## Key Dependencies

- **Next.js 16.0.10** - App Router with React 19
- **Supabase** - Database, Auth, Storage
- **TanStack Query 5.90.16** - Server state management
- **Zustand 5.0.9** - Client state management
- **Tailwind CSS 4.1.9** - Styling
- **shadcn/ui** - UI component library (New York style)
- **React Hook Form 7.60.0** - Form handling
- **Zod 3.25.76** - Schema validation
- **next-intl 4.6.1** - Internationalization

## Environment Variables

Required environment variables (see `.env.local`):

- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Payment (Tab.travel):
  - `NEXT_PUBLIC_TAB_PAYMENT_LINK` - Public Tab.travel payment link
  - `NEXT_PUBLIC_BASE_URL` - Your site URL (e.g., <https://maikekaihouse.com>)
- Cron:
  - `CRON_SECRET` - Secret for Vercel Cron job authentication
- Email: Resend API key
- Image: Cloudinary credentials

## Resources

- Project docs: See `PROYECTO_MAI_KE_KAI.md`, `PROJECT_STATUS_REPORT.md`
- Deployment: See `DEPLOYMENT_GUIDE.md`
- Next.js: <https://nextjs.org/docs>
- Supabase: <https://supabase.com/docs>
