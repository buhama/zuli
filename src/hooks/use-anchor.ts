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
 * @param deps - Additional dependencies that should trigger position recalculation
 * @returns An object mapping comment IDs to their vertical positions
 */
export function useAnchors(
  editor: Editor | null,
  deps: unknown[] = [],
): AnchorPositions {
  // Store positions of all comment anchors
  const [positions, setPositions] = useState<AnchorPositions>({})

  useEffect(() => {
    // Don't do anything if editor isn't initialized
    if (!editor) return
  
    // Get the root DOM element of the editor
    const root = editor.view.dom as HTMLElement
  
    /**
     * Updates the positions of all comment anchors
     * This needs to run whenever the document layout changes
     */
    const update = () => {
      console.log('Updating comment anchor positions...')
      const map: Record<string, number> = {}
      // Find all elements with data-comment-id attribute
      const elements = root.querySelectorAll<HTMLElement>("[data-comment-id]")
      console.log(`Found ${elements.length} comment anchors`)
      
      elements.forEach((el) => {
        const id = el.dataset.commentId
        if (id) {
          // Calculate absolute position by adding scroll offset to element's top position
          const position = el.getBoundingClientRect().top + window.scrollY
          map[id] = position
          console.log(`Anchor ${id} position: ${position}px`)
        }
      })
      
      console.log('New positions:', map)
      setPositions(map)
    }
  
    // Initial position calculation
    update()
  
    // Watch for size changes in the editor
    const ro = new ResizeObserver(update)
    ro.observe(root)
  
    // Update positions when editor content changes
    editor.on("transaction", update)     // 🔗 add listener
  
    // Update positions when page is scrolled
    window.addEventListener("scroll", update, { passive: true })
  
    // Cleanup function to remove all listeners
    return () => {
      ro.disconnect()
      editor.off("transaction", update)  // 🔗 remove listener
      window.removeEventListener("scroll", update)
    }
  }, [editor, ...deps])

  return positions
}


export default useAnchors