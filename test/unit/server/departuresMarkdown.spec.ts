import { describe, expect, it } from 'vitest'
import { buildDeparturesErrorMarkdown, buildDeparturesMarkdown } from '../../../server/utils/departuresMarkdown'
import { searchCriteriaFixture, servicesFixture } from '../../fixtures/timetableFixtures'

const siteUrl = 'https://timetable.example'

describe('buildDeparturesMarkdown', () => {
  const departuresMarkdown = buildDeparturesMarkdown(siteUrl, searchCriteriaFixture, servicesFixture)

  it('names the search and links to the same search on the web', () => {
    expect(departuresMarkdown).toContain('# Trains from Haworth after 12:00 on 24 April 2026')
    expect(departuresMarkdown).toContain(`${siteUrl}/?from=haworth&date=2026-04-24&time=12:00`)
  })

  it('lists the trains in a table, with their stop count and notes', () => {
    expect(departuresMarkdown).toContain('4 trains, both ways along the line, earliest first.')
    expect(departuresMarkdown).toContain('| 12:20 | Haworth | Keighley | 13:00 | 3 stops | Diesel train, Rail Story museums at Ingrow, National Rail connections |')
    expect(departuresMarkdown).toContain('| 13:20 | Haworth | Oxenhope | 14:00 | Direct | – |')
  })

  it('says a service alert in text, and marks the last train', () => {
    expect(departuresMarkdown).toContain('| 16:20 | Haworth | Keighley | 17:00 | 1 stop | Service alert, Steam train, Real Ale Bar Car, Diesel train |')
    expect(departuresMarkdown).toContain('### Haworth 16:20 to Keighley 17:00 (service alert)')
    expect(departuresMarkdown).toContain('### Haworth 17:20 to Oxenhope 17:30 (last train)')
  })

  it('lists each train\'s stops, with its request stops', () => {
    expect(departuresMarkdown).toContain([
      '### Haworth 12:20 to Keighley 13:00',
      '',
      '- 12:20 Haworth (departs)',
      '- 12:27 Oakworth (departs)',
      '- 12:35 Damems (departs, request stop)',
      '- 12:42 Ingrow West (departs)',
      '- 13:00 Keighley (arrives)',
    ].join('\n'))
  })

  it('explains each symbol once, and the request stop', () => {
    expect(departuresMarkdown.match(/\*\*Diesel train\*\*/g)).toHaveLength(1)
    expect(departuresMarkdown).toContain('- **Last train**: Last train of the day from this station')
    expect(departuresMarkdown).toContain('- **Request stop**: Request Stop')
  })

  it('says when no trains leave then, like the page', () => {
    const noTrainsMarkdown = buildDeparturesMarkdown(siteUrl, searchCriteriaFixture, [])

    expect(noTrainsMarkdown).toContain('No trains leave Haworth at or after 12:00 on 24 April 2026.')
    expect(noTrainsMarkdown).not.toContain('## Departures')
  })
})

describe('buildDeparturesErrorMarkdown', () => {
  it('says the timetable couldn\'t be loaded, like the page\'s error state', () => {
    const errorMarkdown = buildDeparturesErrorMarkdown(siteUrl, searchCriteriaFixture)

    expect(errorMarkdown).toContain('# Trains from Haworth after 12:00 on 24 April 2026')
    expect(errorMarkdown).toContain('Sorry, we couldn’t load the timetable.')
  })
})
