import { useBlogEditorStore } from './blogEditorStore.js';

const savedPost = {
  id: '7',
  slug: 'ridge-hike',
  title: 'Ridge Hike',
  category: 'Hiking',
  summary: 'Two days up the ridge.',
  coverImageUrl: 'https://cdn.example.com/cover.jpg',
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

  it('loads a saved post title, category, summary, cover and blocks', () => {
    useBlogEditorStore.getState().loadPost(savedPost);

    const { title, category, summary, coverImageUrl, blocks } = useBlogEditorStore.getState();
    expect(title).toBe('Ridge Hike');
    expect(category).toBe('Hiking');
    expect(summary).toBe('Two days up the ridge.');
    expect(coverImageUrl).toBe('https://cdn.example.com/cover.jpg');
    expect(blocks).toEqual(savedPost.blocks);
  });

  it('sets the summary and the cover URL, and clears the cover with null', () => {
    useBlogEditorStore.getState().loadPost(savedPost);
    useBlogEditorStore.getState().setSummary('Three days to Table Lake.');
    useBlogEditorStore.getState().setCoverImageUrl('https://cdn.example.com/summit.jpg');

    expect(useBlogEditorStore.getState().summary).toBe('Three days to Table Lake.');
    expect(useBlogEditorStore.getState().coverImageUrl).toBe('https://cdn.example.com/summit.jpg');

    useBlogEditorStore.getState().setCoverImageUrl(null);

    expect(useBlogEditorStore.getState().coverImageUrl).toBeNull();
    expect(useBlogEditorStore.getState().blocks).toEqual(savedPost.blocks);
  });

  it('reset clears everything a loaded post put in the store', () => {
    useBlogEditorStore.getState().loadPost(savedPost);
    useBlogEditorStore.getState().reset();

    const { title, category, summary, coverImageUrl, blocks } = useBlogEditorStore.getState();
    expect({ title, category, summary, coverImageUrl, blocks }).toEqual({
      title: '',
      category: '',
      summary: '',
      coverImageUrl: null,
      blocks: [],
    });
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

  describe('image blocks', () => {
    const uploadedImages = [
      { id: '11', imageUrl: 'https://cdn.example.com/ridge.jpg' },
      { id: '12', imageUrl: 'https://cdn.example.com/camp.jpg' },
      { id: '13', imageUrl: 'https://cdn.example.com/summit.jpg' },
    ];

    const addImagesBlockWithUploads = () => {
      useBlogEditorStore.getState().loadPost(savedPost);
      useBlogEditorStore.getState().addImagesBlock();
      const imagesBlock = useBlogEditorStore.getState().blocks[3];
      useBlogEditorStore.getState().addImages(imagesBlock.id, uploadedImages);
      return imagesBlock.id;
    };

    const imagesOf = (blockId) =>
      useBlogEditorStore.getState().blocks.find((block) => block.id === blockId).images;

    it('adds an empty images block at the end', () => {
      useBlogEditorStore.getState().loadPost(savedPost);
      useBlogEditorStore.getState().addImagesBlock();

      const { blocks } = useBlogEditorStore.getState();
      expect(blocks).toHaveLength(4);
      expect(blocks[3]).toEqual({ id: expect.any(String), type: 'images', images: [] });
    });

    it('appends uploaded images with an empty caption, and later uploads after them', () => {
      const blockId = addImagesBlockWithUploads();
      useBlogEditorStore
        .getState()
        .addImages(blockId, [{ id: '14', imageUrl: 'https://cdn.example.com/lake.jpg' }]);

      expect(imagesOf(blockId)).toEqual([
        { imageId: '11', imageUrl: 'https://cdn.example.com/ridge.jpg', caption: '' },
        { imageId: '12', imageUrl: 'https://cdn.example.com/camp.jpg', caption: '' },
        { imageId: '13', imageUrl: 'https://cdn.example.com/summit.jpg', caption: '' },
        { imageId: '14', imageUrl: 'https://cdn.example.com/lake.jpg', caption: '' },
      ]);
    });

    it('removes only the named image', () => {
      const blockId = addImagesBlockWithUploads();
      useBlogEditorStore.getState().removeImage(blockId, '12');

      expect(imagesOf(blockId).map((image) => image.imageId)).toEqual(['11', '13']);
    });

    it('moves an image left and right, and does nothing past either end', () => {
      const blockId = addImagesBlockWithUploads();
      useBlogEditorStore.getState().moveImage(blockId, '13', -1);
      expect(imagesOf(blockId).map((image) => image.imageId)).toEqual(['11', '13', '12']);

      useBlogEditorStore.getState().moveImage(blockId, '11', -1);
      useBlogEditorStore.getState().moveImage(blockId, '12', 1);
      expect(imagesOf(blockId).map((image) => image.imageId)).toEqual(['11', '13', '12']);
    });

    it('updates the caption of only the named image', () => {
      const blockId = addImagesBlockWithUploads();
      useBlogEditorStore.getState().updateCaption(blockId, '12', 'Camp at dusk');

      expect(imagesOf(blockId).map((image) => image.caption)).toEqual(['', 'Camp at dusk', '']);
    });

    it('leaves text blocks untouched while editing images', () => {
      const blockId = addImagesBlockWithUploads();
      useBlogEditorStore.getState().removeImage(blockId, '11');

      expect(useBlogEditorStore.getState().blocks.slice(0, 3)).toEqual(savedPost.blocks);
    });
  });
});
