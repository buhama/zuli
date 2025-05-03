import { useEffect, useState } from "react"
import { Editor } from "@tiptap/core"

/**
 * Type representing a mapping of comment IDs to their vertical positions on the page
 */
type AnchorPositions = Record<string, number>

/**
 * Hook that tracks the vertical positions of comment anchors in a Tiptap editor
 * 
 * @param editor - The Tiptap editor instance
 * @param scrollRef - Reference to the scrollable container element
 * @returns An object mapping comment IDs to their vertical positions
 */
export function useAnchors(
  editor: Editor | null,
  scrollRef: React.RefObject<HTMLDivElement>,
): AnchorPositions {
  // Store positions of all comment anchors
  const [positions, setPositions] = useState<AnchorPositions>({})

  useEffect(() => {
    // Don't do anything if editor or scroll container isn't initialized
    if (!editor || !scrollRef.current) return
  
    // Get the root DOM element of the editor and scroll container
    const root = editor.view.dom as HTMLElement
    const scroll = scrollRef.current
  
    /**
     * Updates the positions of all comment anchors
     * This needs to run whenever the document layout changes
     */
    const update = () => {
      const map: Record<string, number> = {}
      // Find all elements with data-comment-id attribute
      const elements = root.querySelectorAll<HTMLElement>("[data-comment-id]")
      
      // Get the container's position relative to viewport
      const contRect = scroll.getBoundingClientRect()
      
      elements.forEach((el) => {
        const id = el.dataset.commentId
        if (id) {
          // Calculate position relative to the scroll container
          const elRect = el.getBoundingClientRect()
          map[id] = elRect.top - contRect.top + scroll.scrollTop
        }
      })
      
      setPositions(map)
    }
  
    // Initial position calculation
    update()
  
    // Watch for size changes in the editor
    const ro = new ResizeObserver(update)
    ro.observe(root)
  
    // Update positions when editor content changes
    editor.on("transaction", update)
  
    // Update positions when container is scrolled
    scroll.addEventListener("scroll", update, { passive: true })
  
    // Cleanup function to remove all listeners
    return () => {
      ro.disconnect()
      editor.off("transaction", update)
      scroll.removeEventListener("scroll", update)
    }
  }, [editor, scrollRef])

  return positions
}

export default useAnchors