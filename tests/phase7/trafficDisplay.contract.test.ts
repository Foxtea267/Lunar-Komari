import { readFileSync } from 'node:fs'

const nodeCardSource = readFileSync(new URL('../../src/components/NodeCard.vue', import.meta.url), 'utf8')
const nodeListSource = readFileSync(new URL('../../src/components/NodeList.vue', import.meta.url), 'utf8')
const instanceDetailSource = readFileSync(new URL('../../src/views/InstanceDetail.vue', import.meta.url), 'utf8')

describe('traffic usage display contract', () => {
  it('shows used traffic only when a node has unlimited traffic', () => {
    expect(nodeCardSource).toContain('{{ formatBytes(trafficUsed) }}')
    expect(nodeCardSource).not.toContain('<template v-else>\n                  ∞')
    expect(nodeListSource).toContain('{{ formatBytes(getTrafficUsed(node)) }}')
    expect(nodeListSource).not.toContain('<template v-else>∞</template>')
    expect(instanceDetailSource).toMatch(/if \(!hasTrafficLimit\.value\)\s+return formatBytes\(trafficUsed\.value\)/)
  })

  it('shows used and total traffic when a node has a traffic limit', () => {
    expect(nodeCardSource).toContain('/ {{ formatBytes(props.node.traffic_limit) }}')
    expect(nodeListSource).toContain('/ {{ formatBytes(node.traffic_limit) }}')
    expect(instanceDetailSource).toContain('formatBytes(data.value?.traffic_limit ?? 0)')
  })
})
