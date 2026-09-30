import { readFileSync } from 'node:fs'

const homeViewSource = readFileSync(new URL('../../src/views/HomeView.vue', import.meta.url), 'utf8')
const generalCardsSource = readFileSync(new URL('../../src/components/NodeGeneralCards.vue', import.meta.url), 'utf8')
const globeSource = readFileSync(new URL('../../src/components/NodeEarthGlobe.vue', import.meta.url), 'utf8')

describe('mobile toolbar and globe contract', () => {
  it('separates the scrollable group tabs from mobile controls and preserves desktop layout', () => {
    expect(homeViewSource).toContain('class="flex flex-col gap-2 md:flex-row md:items-start md:flex-nowrap"')
    expect(homeViewSource).toContain('class="w-full overflow-x-auto rounded-sm md:w-auto md:pointer-events-auto"')
    expect(homeViewSource).toContain('class="search flex w-full flex-wrap items-center gap-2 pointer-events-auto md:ml-auto md:w-auto md:flex-nowrap"')
    expect(homeViewSource).toContain('class="h-11 w-11 border-none shadow-none rounded-md md:h-8 md:w-8"')
  })

  it('keeps focused search expansion within the viewport', () => {
    expect(homeViewSource).toContain('focus-within:basis-full')
    expect(homeViewSource).toContain('max-w-[min(15rem,calc(100vw-2rem))]')
    expect(homeViewSource).toContain('md:focus-within:w-60')
  })

  it('passes a narrow-screen compact flag to the Earth globe only', () => {
    expect(generalCardsSource).toContain('useMediaQuery(\'(max-width: 767px)\')')
    expect(generalCardsSource).toContain(':compact="compactGlobe"')
    expect(generalCardsSource).toContain('<NodeEarthMaps v-else-if="showMaps"')
  })

  it('retains globe data layers and readable node details in compact mode', () => {
    expect(globeSource).toContain('compact?: boolean')
    expect(globeSource).toContain('\'earth-globe-host-compact\': props.compact')
    expect(globeSource).toContain('.globeImageUrl(EARTH_DAY_TEXTURE)')
    expect(globeSource).toContain('.arcsData(arcsData.value)')
    expect(globeSource).toContain('.htmlElementsData(labelsData.value)')
    expect(globeSource).toContain('.earth-globe-host-compact :deep(.earth-rate-panel)')
    expect(globeSource).not.toContain('.earth-globe-host-compact :deep(.earth-rate-panel) {\n  display: none;')
    expect(globeSource).toContain('altitude: props.compact ? 2.25 : 1.95')
  })
})
