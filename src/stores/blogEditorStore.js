import { create } from 'zustand';

const emptyPost = { title: '', category: '', blocks: [] };

export const useBlogEditorStore = create((set) => ({
  ...emptyPost,

  loadPost: (post) => set({ title: post.title, category: post.category, blocks: post.blocks }),

  // Called when the editor unmounts so one post's blocks never leak into the next.
  reset: () => set(emptyPost),

  setTitle: (title) => set({ title }),

  setCategory: (category) => set({ category }),

  addTextBlock: () =>
    set((state) => ({
      blocks: [...state.blocks, { id: crypto.randomUUID(), type: 'text', body: '' }],
    })),

  removeBlock: (blockId) =>
    set((state) => ({ blocks: state.blocks.filter((block) => block.id !== blockId) })),

  moveBlock: (blockId, direction) =>
    set((state) => {
      const fromIndex = state.blocks.findIndex((block) => block.id === blockId);
      const toIndex = fromIndex + direction;
      if (fromIndex === -1 || toIndex < 0 || toIndex >= state.blocks.length) return state;

      const blocks = [...state.blocks];
      [blocks[fromIndex], blocks[toIndex]] = [blocks[toIndex], blocks[fromIndex]];
      return { blocks };
    }),

  updateText: (blockId, body) =>
    set((state) => ({
      blocks: state.blocks.map((block) => (block.id === blockId ? { ...block, body } : block)),
    })),
}));
