import { Mark, mergeAttributes } from "@tiptap/core"

export const CommentMark = Mark.create({
  name: "comment",

  addAttributes() {
    return { id: { default: null } }
  },

  parseHTML() {
    return [{ tag: 'span[data-comment-id]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-comment-id": HTMLAttributes.id,
        // class: "inline bg-yellow-100 dark:bg-yellow-900",
      }),
      0,
    ]
  },
})
