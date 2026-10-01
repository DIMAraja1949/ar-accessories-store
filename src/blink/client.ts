import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'ar-accessorie-shop-0ex1513j',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_ZVofXxFEayvbLrTCfWLWenmTGtyhBvuO',
  authRequired: false,
  auth: { mode: 'managed' },
})
