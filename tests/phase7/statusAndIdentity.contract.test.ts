import { readFileSync } from 'node:fs'

const nodeCardSource = readFileSync(new URL('../../src/components/NodeCard.vue', import.meta.url), 'utf8')
const nodeListSource = readFileSync(new URL('../../src/components/NodeList.vue', import.meta.url), 'utf8')
const headerSource = readFileSync(new URL('../../src/components/Header.vue', import.meta.url), 'utf8')

describe('status and loading identity contract', () => {
  it('keeps status dots static while preserving semantic colors', () => {
    expect(nodeCardSource).not.toContain('animate-ping')
    expect(nodeListSource).not.toContain('animate-ping')
    expect(nodeCardSource).toContain('props.node.online ? \'bg-green-600\' : \'bg-red-600\'')
    expect(nodeListSource).toContain('node.online ? \'bg-green-600\' : \'bg-red-600\'')
  })

  it('uses Lunar Komari before public settings provide a site name', () => {
    expect(headerSource).toContain('appStore.publicSettings?.sitename || \'Lunar Komari\'')
  })
})
