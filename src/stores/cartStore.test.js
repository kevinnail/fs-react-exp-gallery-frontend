import { useCartStore, REQUEST_CART_STORAGE_KEY, selectIsInCart } from './cartStore.js';

const blueRig = {
  postId: 42,
  title: 'Blue Wrap Rig',
  category: 'rigs',
  price: '250',
  discountedPrice: '200',
  imageUrl: 'https://cdn.example.com/a.jpg',
  url: 'https://stresslessglass.example.com/42',
};

const slymeSpoon = {
  postId: 17,
  title: 'Slyme Spoon',
  category: 'spoons',
  price: '90',
  discountedPrice: null,
  imageUrl: 'https://cdn.example.com/b.jpg',
  url: 'https://stresslessglass.example.com/17',
};

describe('cartStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({ items: [] });
  });

  it('adds a piece with the fields the request message needs', () => {
    useCartStore.getState().addItem(blueRig);

    expect(useCartStore.getState().items).toEqual([
      {
        postId: 42,
        title: 'Blue Wrap Rig',
        category: 'rigs',
        price: '250',
        discountedPrice: '200',
        imageUrl: 'https://cdn.example.com/a.jpg',
        url: 'https://stresslessglass.example.com/42',
      },
    ]);
  });

  it('ignores a second add of the same piece, because each piece is one of a kind', () => {
    const { addItem } = useCartStore.getState();
    addItem(blueRig);
    addItem({ ...blueRig, title: 'Blue Wrap Rig (edited title)' });

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Blue Wrap Rig');
  });

  it('treats a string post id as the same piece as its numeric id', () => {
    const { addItem } = useCartStore.getState();
    addItem(blueRig);
    addItem({ ...blueRig, postId: '42' });

    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it('ignores a piece with no post id rather than storing an unusable row', () => {
    useCartStore.getState().addItem({ title: 'Mystery piece' });

    expect(useCartStore.getState().items).toEqual([]);
  });

  it('removes only the named piece', () => {
    const { addItem, removeItem } = useCartStore.getState();
    addItem(blueRig);
    addItem(slymeSpoon);

    removeItem(42);

    expect(useCartStore.getState().items.map((item) => item.postId)).toEqual([17]);
  });

  it('removes a piece when given its id as a string', () => {
    const { addItem, removeItem } = useCartStore.getState();
    addItem(blueRig);

    removeItem('42');

    expect(useCartStore.getState().items).toEqual([]);
  });

  it('empties the basket on clearCart', () => {
    const { addItem, clearCart } = useCartStore.getState();
    addItem(blueRig);
    addItem(slymeSpoon);

    clearCart();

    expect(useCartStore.getState().items).toEqual([]);
  });

  it('reports whether a piece is already in the basket', () => {
    useCartStore.getState().addItem(blueRig);

    expect(selectIsInCart(42)(useCartStore.getState())).toBe(true);
    expect(selectIsInCart('42')(useCartStore.getState())).toBe(true);
    expect(selectIsInCart(17)(useCartStore.getState())).toBe(false);
  });

  it('writes the basket to localStorage so it survives a reload', () => {
    useCartStore.getState().addItem(blueRig);

    const persisted = JSON.parse(localStorage.getItem(REQUEST_CART_STORAGE_KEY));
    expect(persisted.state.items).toHaveLength(1);
    expect(persisted.state.items[0].postId).toBe(42);
  });

  it('rehydrates a basket that was already in localStorage', async () => {
    localStorage.setItem(
      REQUEST_CART_STORAGE_KEY,
      JSON.stringify({ state: { items: [slymeSpoon] }, version: 0 })
    );

    await useCartStore.persist.rehydrate();

    expect(useCartStore.getState().items).toEqual([slymeSpoon]);
  });
});
