import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import TimetableEmptyState from '~/components/timetable/TimetableEmptyState.vue'

describe('TimetableEmptyState', () => {
  it('tells the user there is nothing to show yet', async () => {
    const wrapper = await mountSuspended(TimetableEmptyState)

    expect(wrapper.text()).toBe('Nothing to show here yet')
  })

  it('has no detectable accessibility violations', async () => {
    const wrapper = await mountSuspended(TimetableEmptyState)

    expect(await axe(wrapper.html())).toHaveNoViolations()
  })
})
