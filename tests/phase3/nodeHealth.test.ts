import type { NodeData } from '../../src/stores/nodes'
import { describe, expect, test } from 'bun:test'
import { buildNodeAvailabilityRows, buildNodeVolatilityRows } from '../../src/features/resource-overview/nodeHealth'

function node(overrides: Partial<NodeData> = {}): NodeData {
  return {
    uuid: 'node',
    name: 'Node',
    cpu_cores: 4,
    statusObserved: true,
    online: true,
    load: 0.4,
    load5: 0.4,
    load15: 0.4,
    uptime: 3600,
    time: '2026-09-26T01:00:00Z',
    ...overrides,
  } as NodeData
}

describe('node health view models', () => {
  test('ranks online nodes by normalized 1/5/15 minute load span', () => {
    const rows = buildNodeVolatilityRows([
      node({ uuid: 'stable', name: 'Stable', load: 1, load5: 1.1, load15: 1.2 }),
      node({ uuid: 'high', name: 'High', load: 4, load5: 2, load15: 0 }),
      node({ uuid: 'elevated', name: 'Elevated', load: 1.2, load5: 0.8, load15: 0.4 }),
      node({ uuid: 'offline', name: 'Offline', online: false, load: 10 }),
      node({ uuid: 'invalid', name: 'Invalid', load: Number.NaN }),
    ])

    expect(rows.map(row => row.uuid)).toEqual(['high', 'elevated', 'stable'])
    expect(rows[0]).toMatchObject({ score: 100, formattedScore: '100.0%', status: 'high' })
    expect(rows[1]).toMatchObject({ score: 20, status: 'elevated' })
    expect(rows[2]).toMatchObject({ score: 5, status: 'stable' })
  })

  test('lists availability problems first without inventing a historical percentage', () => {
    const rows = buildNodeAvailabilityRows([
      node({ uuid: 'online', name: 'Online', uptime: 7200 }),
      node({ uuid: 'unobserved', name: 'Unobserved', statusObserved: false }),
      node({ uuid: 'offline', name: 'Offline', online: false }),
    ])

    expect(rows.map(row => row.uuid)).toEqual(['offline', 'unobserved', 'online'])
    expect(rows[0]).toMatchObject({ status: 'offline', statusLabel: '离线' })
    expect(rows[0]?.detail).toContain('最后上报')
    expect(rows[1]).toMatchObject({ status: 'unobserved', detail: '等待首次状态上报' })
    expect(rows[2]).toMatchObject({ status: 'online', detail: '连续运行 2 小时' })
  })
})
