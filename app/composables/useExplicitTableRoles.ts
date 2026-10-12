import type { Ref } from 'vue'

// Each part of a table, with the ARIA role it already has natively
const TABLE_ROLES_BY_SELECTOR: [selector: string, role: string][] = [
  ['table', 'table'],
  ['thead, tbody, tfoot', 'rowgroup'],
  ['tr', 'row'],
  ['th[scope="col"]', 'columnheader'],
  ['th[scope="row"]', 'rowheader'],
  ['td', 'cell'],
]

/**
 * Writes each table part's role on it explicitly, for the tables inside the given element. On mobile the
 * results' rows turn into cards (`display: block` / `grid`, timetable-table.css), and Safari drops the table
 * semantics of elements whose display changes, so VoiceOver would read a flat list. Explicit roles keep
 * them. In script, because UTable takes no attributes for its parts. Its rows don't change after mount
 * (a new search remounts the results), so once is enough.
 */
export const useExplicitTableRoles = (tableContainerRef: Readonly<Ref<HTMLElement | null>>) => {
  onMounted(() => {
    const tableContainer = tableContainerRef.value
    if (!tableContainer) return

    for (const [selector, role] of TABLE_ROLES_BY_SELECTOR) {
      for (const tablePart of tableContainer.querySelectorAll(selector)) tablePart.setAttribute('role', role)
    }
  })
}
