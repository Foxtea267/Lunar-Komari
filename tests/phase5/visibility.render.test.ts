import type { ViteDevServer } from 'vite'
import type { Component } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { createPinia } from 'pinia'
import { createServer } from 'vite'
import { createSSRApp } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

let vite: ViteDevServer
let Footer: Component
let Summary: Component
let Header: Component
let Detail: Component

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
})

beforeAll(async () => {
  vite = await createServer({ appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true }, server: { middlewareMode: true } })
  Footer = (await vite.ssrLoadModule('/src/components/Footer.vue')).default
  Summary = (await vite.ssrLoadModule('/src/components/NodeGeneralCards.vue')).default
  Header = (await vite.ssrLoadModule('/src/components/Header.vue')).default
  Detail = (await vite.ssrLoadModule('/src/views/InstanceDetail.vue')).default
})

afterAll(async () => vite.close())

async function render(component: Component, settings: Record<string, unknown>, loggedIn = false) {
  const pinia = createPinia()
  pinia.state.value.app = {
    publicSettings: { theme_settings: { earthViewMode: 'cards', visitorInfoCardEnabled: false, ...settings } },
    isLoggedIn: loggedIn,
  }
  pinia.state.value.nodes = {
    nodes: [{ uuid: 'test-node', name: 'Demo', online: true, price: 12345, currency: 'CNY', billing_cycle: 30, expired_at: '2099-01-01T00:00:00Z' }],
  }
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/instance/:id', component: { template: '<div />' } }] })
  await router.push('/instance/test-node')
  await router.isReady()
  const app = createSSRApp(component)
  app.use(pinia)
  app.use(router)
  return renderToString(app)
}

describe('finance and footer visibility', () => {
  test('guests cannot see remaining value or open its calculator when public finance is off', async () => {
    const settings = { showPublicFinance: false, showRemainingValue: true }
    const summary = await render(Summary, settings)
    expect(summary).toContain('在线节点')
    expect(summary).not.toContain('剩余价值')
    expect(summary).not.toContain('月均支出')
    expect(await render(Header, settings)).not.toContain('个人价值计算')
    const detail = await render(Detail, settings)
    expect(detail).not.toContain('剩余价值')
    expect(detail).not.toContain('节点价格')
    expect(detail).toContain('剩余时间')
  })

  test('turning off remaining value keeps remaining time available to administrators only', async () => {
    const settings = { showPublicFinance: true, showRemainingValue: false }
    for (const component of [Summary, Header, Detail]) {
      const html = await render(component, settings, true)
      expect(html).not.toContain('剩余价值')
      expect(html).not.toContain('个人价值计算')
    }
    expect(await render(Detail, settings, true)).toContain('剩余时间')
    expect(await render(Detail, settings, false)).not.toContain('剩余时间')
  })

  test('remaining value is available when explicitly public and enabled', async () => {
    const settings = { showPublicFinance: true, showRemainingValue: true }
    expect(await render(Summary, settings)).toContain('剩余价值')
    expect(await render(Header, settings)).toContain('个人价值计算')
    expect(await render(Detail, settings)).toContain('剩余价值')
  })

  test('footer credits can be hidden independently without hiding filings', async () => {
    const poweredHidden = await render(Footer, { hidePoweredBy: true })
    expect(poweredHidden).not.toContain('Powered by')
    expect(poweredHidden).toContain('Theme by')
    const themeHidden = await render(Footer, { hideThemeBy: true })
    expect(themeHidden).toContain('Powered by')
    expect(themeHidden).not.toContain('Theme by')
    const bothHidden = await render(Footer, { hidePoweredBy: true, hideThemeBy: true, icpEnabled: true, icpNumber: '测试备案号' })
    expect(bothHidden).not.toContain('Powered by')
    expect(bothHidden).not.toContain('Theme by')
    expect(bothHidden).toContain('测试备案号')
    expect(await render(Footer, { hidePoweredBy: true, hideThemeBy: true })).not.toContain('<footer')
  })
})
