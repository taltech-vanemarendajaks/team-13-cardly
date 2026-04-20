export const PLAN_LIMITS = {
  free: {
    maxCards: 3,
    maxMediaPerCard: 2,
    passwordProtection: false,
    scheduling: false,
    customTemplates: false,
    removeBranding: false
  },
  pro: {
    maxCards: 25,
    maxMediaPerCard: 10,
    passwordProtection: true,
    scheduling: true,
    customTemplates: false,
    removeBranding: false
  },
  business: {
    maxCards: Infinity,
    maxMediaPerCard: 50,
    passwordProtection: true,
    scheduling: true,
    customTemplates: true,
    removeBranding: true
  }
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;
