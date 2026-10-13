import { useBlogEditorStore } from './blogEditorStore.js';

const savedPost = {
  id: '7',
  slug: 'ridge-hike',
  title: 'Ridge Hike',
  category: 'Hiking',
  blocks: [
    { id: 'block-a', type: 'text', body: 'Trailhead at dawn.' },
    { id: 'block-b', type: 'text', body: 'The ridge above camp.' },
    { id: 'block-c', type: 'text', body: 'Back at the car.' },
  ],
};

const blockIds = () => useBlogEditorStore.getState().blocks.map((block) => block.id);

describe('blogEditorStore', () => {
  beforeEach(() => {
    useBlogEditorStore.getState().reset();
  });

  it('loads a saved post title, category and blocks', () => {
    useBlogEditorStore.getState().loadPost(savedPost);

    const { title, category, blocks } = useBlogEditorStore.getState();
    expect(title).toBe('Ridge Hike');
    expect(category).toBe('Hiking');
    expect(blocks).toEqual(savedPost.blocks);
  });

  it('reset clears everything a loaded post put in the store', () => {
    useBlogEditorStore.getState().loadPost(savedPost);
    useBlogEditorStore.getState().reset();

    const { title, category, blocks } = useBlogEditorStore.getState();
    expect({ title, category, blocks }).toEqual({ title: '', category: '', blocks: [] });
  });

  it('adds an empty text block at the end with a fresh unique id', () => {
    useBlogEditorStore.getState().loadPost(savedPost);
    useBlogEditorStore.getState().addTextBlock();
    useBlogEditorStore.getState().addTextBlock();

    const { blocks } = useBlogEditorStore.getState();
    expect(blocks).toHaveLength(5);
    expect(blocks[3]).toEqual({ id: expect.any(String), type: 'text', body: '' });
    expect(new Set(blockIds()).size).toBe(5);
  });

  it('removes only the named block', () => {
    useBlogEditorStore.getState().loadPost(savedPost);
    useBlogEditorStore.getState().removeBlock('block-b');

    expect(blockIds()).toEqual(['block-a', 'block-c']);
  });

  it('moves a block up and down', () => {
    useBlogEditorStore.getState().loadPost(savedPost);
    useBlogEditorStore.getState().moveBlock('block-c', -1);
    expect(blockIds()).toEqual(['block-a', 'block-c', 'block-b']);

    useBlogEditorStore.getState().moveBlock('block-a', 1);
    expect(blockIds()).toEqual(['block-c', 'block-a', 'block-b']);
  });

  it('does nothing when moving the first block up or the last block down', () => {
    useBlogEditorStore.getState().loadPost(savedPost);
    useBlogEditorStore.getState().moveBlock('block-a', -1);
    useBlogEditorStore.getState().moveBlock('block-c', 1);

    expect(blockIds()).toEqual(['block-a', 'block-b', 'block-c']);
  });

  it('updates the text of only the named block', () => {
    useBlogEditorStore.getState().loadPost(savedPost);
    useBlogEditorStore.getState().updateText('block-b', 'The **ridge** in fog.');

    const { blocks } = useBlogEditorStore.getState();
    expect(blocks[1]).toEqual({ id: 'block-b', type: 'text', body: 'The **ridge** in fog.' });
    expect(blocks[0].body).toBe('Trailhead at dawn.');
    expect(blocks[2].body).toBe('Back at the car.');
  });

  it('updates title and category', () => {
    useBlogEditorStore.getState().setTitle('Ridge Hike, Day Two');
    useBlogEditorStore.getState().setCategory('Backpacking');

    const { title, category } = useBlogEditorStore.getState();
    expect({ title, category }).toEqual({ title: 'Ridge Hike, Day Two', category: 'Backpacking' });
  });
});
