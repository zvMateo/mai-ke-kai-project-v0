/**
 * Query Key Factory
 *
 * Centralized query keys for React Query cache management.
 * Using factory pattern for type-safe, hierarchical keys.
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/community/lukemorales-query-key-factory
 */

export const queryKeys = {
  bookingFlow: {
    all: ["booking-flow"] as const,
    payment: () => [...queryKeys.bookingFlow.all, "payment"] as const,
    draft: () => [...queryKeys.bookingFlow.all, "draft"] as const,
    summary: () => [...queryKeys.bookingFlow.all, "summary"] as const,
  },
  // Rooms
  rooms: {
    all: ["rooms"] as const,
    lists: () => [...queryKeys.rooms.all, "list"] as const,
    list: (filters?: { isActive?: boolean }) =>
      [...queryKeys.rooms.lists(), filters] as const,
    details: () => [...queryKeys.rooms.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.rooms.details(), id] as const,
    withPricing: (checkInDate: string) =>
      [...queryKeys.rooms.all, "pricing", checkInDate] as const,
  },

  // Services
  services: {
    all: ["services"] as const,
    lists: () => [...queryKeys.services.all, "list"] as const,
    list: (filters?: { category?: string; isActive?: boolean }) =>
      [...queryKeys.services.lists(), filters] as const,
    details: () => [...queryKeys.services.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.services.details(), id] as const,
    byCategory: (category: string) =>
      [...queryKeys.services.all, "category", category] as const,
  },

  // Bookings
  bookings: {
    all: ["bookings"] as const,
    lists: () => [...queryKeys.bookings.all, "list"] as const,
    list: (filters?: {
      status?: string;
      startDate?: string;
      endDate?: string;
    }) => [...queryKeys.bookings.lists(), filters] as const,
    details: () => [...queryKeys.bookings.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.bookings.details(), id] as const,
    todayMovements: () =>
      [...queryKeys.bookings.all, "today-movements"] as const,
    userUpcoming: (userId?: string) =>
      [...queryKeys.bookings.all, "upcoming", userId] as const,
    history: (userId?: string) =>
      [...queryKeys.bookings.all, "history", userId] as const,
  },

  // Users
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters?: { role?: string }) =>
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: (userId?: string) =>
      [...queryKeys.users.all, "profile", userId] as const,
  },

  // Packages
  packages: {
    all: ["packages"] as const,
    lists: () => [...queryKeys.packages.all, "list"] as const,
    list: (filters?: { isActive?: boolean }) =>
      [...queryKeys.packages.lists(), filters] as const,
    details: () => [...queryKeys.packages.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.packages.details(), id] as const,
  },

  // Loyalty
  loyalty: {
    all: ["loyalty"] as const,
    rewards: () => [...queryKeys.loyalty.all, "rewards"] as const,
    transactions: (userId: string) =>
      [...queryKeys.loyalty.all, "transactions", userId] as const,
    balance: (userId: string) =>
      [...queryKeys.loyalty.all, "balance", userId] as const,
    summary: (userId?: string) =>
      [...queryKeys.loyalty.all, "summary", userId] as const,
  },

  // Payments
  payments: {
    all: ["payments"] as const,
    intents: () => [...queryKeys.payments.all, "intents"] as const,
    intent: (id: string) => [...queryKeys.payments.intents(), id] as const,
    transactions: (filters?: { status?: string }) =>
      [...queryKeys.payments.all, "transactions", filters] as const,
  },

  // Webhooks
  webhooks: {
    all: ["webhooks"] as const,
    deliveries: () => [...queryKeys.webhooks.all, "deliveries"] as const,
    delivery: (id: string) => [...queryKeys.webhooks.deliveries(), id] as const,
    logs: () => [...queryKeys.webhooks.all, "logs"] as const,
  },

  // Admin dashboards / analytics
  admin: {
    all: ["admin"] as const,
    dashboard: () => [...queryKeys.admin.all, "dashboard"] as const,
    stats: (range: { from: string; to: string }) =>
      [...queryKeys.admin.all, "stats", range] as const,
  },
} as const;
