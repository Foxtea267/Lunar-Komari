import type { NodeData } from '../../src/stores/nodes'
import type { PublicSettings } from '../../src/utils/api'
import { describe, expect, test } from 'bun:test'
import { createPinia, setActivePinia } from 'pinia'
import { useAppStore } from '../../src/stores/app'
import { getStoredFinanceCurrency, setStoredFinanceCurrency } from '../../src/utils/financeHelper'
import { getPriceTags } from '../../src/utils/nodeHelpers'

const storage = new Map<string, string>()

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  writable: true,
  value: {
    get length() {
      return storage.size
    },
    clear: () => storage.clear(),
    getItem: (key: string) => storage.get(key) ?? null,
    key: (index: number) => [...storage.keys()][index] ?? null,
    removeItem: (key: string) => storage.delete(key),
    setItem: (key: string, value: string) => storage.set(key, value),
  },
})

function withThemeSettings(themeSettings: Record<string, unknown>): PublicSettings {
  return { theme_settings: themeSettings } as PublicSettings
}

function createStore(themeSettings: Record<string, unknown> = {}) {
  setActivePinia(createPinia())
  const store = useAppStore()
  store.publicSettings = withThemeSettings(themeSettings)
  return store
}

describe('public finance settings', () => {
  test('hides node price tags while preserving expiry information', () => {
    const node = { price: 12345, billing_cycle: 30, currency: 'CNY', expired_at: '2099-01-01T00:00:00Z' } as NodeData
    const publicTags = getPriceTags(node, 'zh-CN', true)
    const privateTags = getPriceTags(node, 'zh-CN', false)
    expect(publicTags).toHaveLength(2)
    expect(privateTags).toHaveLength(1)
    expect(privateTags[0]?.text).toMatch(/^\+\d+天$/)
    expect(privateTags).toEqual(publicTags.slice(1))
  })

  test('hides expiry information when remaining value display is disabled', () => {
    const node = { price: 12345, billing_cycle: 30, currency: 'CNY', expired_at: '2099-01-01T00:00:00Z' } as NodeData
    const priceOnlyTags = getPriceTags(node, 'zh-CN', true, false)
    const hiddenTags = getPriceTags(node, 'zh-CN', false, false)

    expect(priceOnlyTags).toHaveLength(1)
    expect(priceOnlyTags[0]?.text).not.toMatch(/天$/)
    expect(hiddenTags).toEqual([])
  })
  test('remaining value follows public finance permissions and an explicit disable wins for administrators', () => {
    const store = createStore({ showRemainingValue: true, showPublicFinance: false })
    expect(store.canViewRemainingValue).toBe(false)
    expect(store.canViewRemainingTime).toBe(true)
    store.updateLoginState(true)
    expect(store.canViewRemainingValue).toBe(true)
    store.publicSettings = withThemeSettings({ showRemainingValue: false, showPublicFinance: true })
    expect(store.canViewRemainingValue).toBe(false)
    expect(store.canViewRemainingTime).toBe(true)
    store.updateLoginState(false)
    expect(store.canViewRemainingValue).toBe(false)
    expect(store.canViewRemainingTime).toBe(false)
    store.publicSettings = withThemeSettings({ showRemainingValue: true, showPublicFinance: true })
    expect(store.canViewRemainingValue).toBe(true)
  })

  test('does not expose remaining value before settings load', () => {
    const store = createStore()
    store.publicSettings = undefined
    store.updateLoginState(true)
    expect(store.canViewRemainingValue).toBe(false)
    expect(store.canViewRemainingTime).toBe(false)
  })
  test('defaults the browser display currency to CNY and preserves a user selection', () => {
    storage.clear()

    expect(getStoredFinanceCurrency()).toBe('CNY')
    expect(getStoredFinanceCurrency('USD')).toBe('USD')

    setStoredFinanceCurrency('EUR')

    expect(getStoredFinanceCurrency('USD')).toBe('EUR')
    storage.clear()
  })

  test('keeps finance private by default and lets administrators view it', () => {
    const store = createStore()

    expect(store.showPublicFinance).toBe(false)
    expect(store.publicFinanceCurrency).toBe('CNY')
    expect(store.renewalWarningDays).toBe(30)
    expect(store.canViewPublicFinance).toBe(false)

    store.updateLoginState(true)

    expect(store.canViewPublicFinance).toBe(true)
  })

  test('uses only display currencies and clamps renewal warning days', () => {
    expect(createStore({ publicFinanceCurrency: 'INVALID', renewalWarningDays: 0 }))
      .toMatchObject({ publicFinanceCurrency: 'CNY', renewalWarningDays: 1 })
    expect(createStore({ publicFinanceCurrency: 'USD', renewalWarningDays: 999 }))
      .toMatchObject({ publicFinanceCurrency: 'USD', renewalWarningDays: 365 })
  })

  test('allows guests to view finance only when the theme explicitly makes it public', () => {
    const store = createStore({ showPublicFinance: true })

    expect(store.canViewPublicFinance).toBe(true)
  })
})
