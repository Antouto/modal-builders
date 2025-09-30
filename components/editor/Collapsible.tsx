'use client'

import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { MdOutlineDragIndicator } from "react-icons/md";

export default function Collapsible({
  title,
  level,
  children,
  hasError,
  onRemove,
  dragId
}: {
  title: string,
  level: 1 | 2,
  children: React.ReactNode,
  hasError?: boolean,
  onRemove?: () => void,
  dragId?: string
}) {
  const styles = {
    1: {
      details: 'group/1 bg-surface-high',
      summary: 'group-open/1:mb-[.5rem]',
      chevron: 'group-open/1:rotate-90'
    },
    2: {
      details: 'group/2 bg-surface-higher',
      summary: 'group-open/2:mb-[.5rem]',
      chevron: 'group-open/2:rotate-90'
    }
  }

  const sortable = dragId ? useSortable({ id: dragId }) : null
  const dragStyle = sortable ? {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.5 : 1
  } : undefined

  return (
    <div ref={sortable?.setNodeRef} style={dragStyle} className="relative w-0 min-w-full">
      <details
        className={`p-2 pr-4 border border-border-subtle shadow rounded-[8px] ${styles[level].details}`}
      >
        <summary className={`flex transition-[margin] select-none justify-between appearance-none cursor-pointer ${styles[level].summary}`}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {dragId && (
              <button
                type="button"
                className="cursor-grab active:cursor-grabbing touch-none select-none flex-shrink-0"
                style={{ touchAction: 'none' }}
                {...(sortable?.attributes ?? {})}
                {...(sortable?.listeners ?? {})}
                onClick={(e) => e.stopPropagation()}
              >
                <MdOutlineDragIndicator className="opacity-75" />
              </button>
            )}
            <svg className={`transition-transform duration-200 ${styles[level].chevron}`} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-semibold truncate">{title}</span>
            <div className="transition-opacity duration-100" style={{ opacity: hasError ? 1 : 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="transparent"></circle>
                <path fill="rgb(218,62,68)" fillRule="evenodd" d="M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22Zm1.44-15.94L13.06 14a1.06 1.06 0 0 1-2.12 0l-.38-6.94a1 1 0 0 1 1-1.06h.88a1 1 0 0 1 1 1.06Zm-.19 10.69a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div className="flex-1" />
          </div>
          {onRemove && <button
            type="button"
            className="h-[24px] flex justify-center items-center cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 10V17M10 10V17M6 6V17.8C6 18.9201 6 19.4798 6.21799 19.9076C6.40973 20.2839 6.71547 20.5905 7.0918 20.7822C7.5192 21 8.07899 21 9.19691 21H14.8031C15.921 21 16.48 21 16.9074 20.7822C17.2837 20.5905 17.5905 20.2839 17.7822 19.9076C18 19.4802 18 18.921 18 17.8031V6M6 6H8M6 6H4M8 6H16M8 6C8 5.06812 8 4.60241 8.15224 4.23486C8.35523 3.74481 8.74432 3.35523 9.23438 3.15224C9.60192 3 10.0681 3 11 3H13C13.9319 3 14.3978 3 14.7654 3.15224C15.2554 3.35523 15.6447 3.74481 15.8477 4.23486C15.9999 4.6024 16 5.06812 16 6M16 6H18M18 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>}
        </summary>
        <div className="mt-4 space-y-2">
          {children}
        </div>
      </details>
    </div>
  )
}
