import { useCallback } from 'react'

interface UseArrowNavigationOptions {
  rowCount: number
  columnCount: number
  getCellId: (row: number, col: number) => string
}

export function useArrowNavigation({ rowCount, columnCount, getCellId }: UseArrowNavigationOptions) {
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>, currentRow: number, currentCol: number) => {
    let nextRow = currentRow
    let nextCol = currentCol

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        nextRow = Math.min(currentRow + 1, rowCount - 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        nextRow = Math.max(currentRow - 1, 0)
        break
      case 'ArrowRight':
        event.preventDefault()
        nextCol = Math.min(currentCol + 1, columnCount - 1)
        break
      case 'ArrowLeft':
        event.preventDefault()
        nextCol = Math.max(currentCol - 1, 0)
        break
      default:
        return
    }

    const nextCellId = getCellId(nextRow, nextCol)
    const nextCell = document.getElementById(nextCellId) as HTMLInputElement | null
    if (nextCell) {
      nextCell.focus()
      nextCell.select()
    }
  }, [rowCount, columnCount, getCellId])

  return { handleKeyDown }
}
