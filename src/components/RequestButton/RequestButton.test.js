import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import RequestButton from './RequestButton.js';
import { useCartStore } from '../../stores/cartStore.js';

const blueRig = {
  postId: 42,
  title: 'Blue Wrap Rig',
  category: 'rigs',
  price: '250',
  discountedPrice: '200',
  imageUrl: 'https://cdn.example.com/a.jpg',
  url: 'https://stresslessglass.example.com/42',
};

describe('RequestButton', () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({ items: [] });
  });

  it('adds the piece to the basket and flips its label', async () => {
    const user = userEvent.setup();
    render(<RequestButton piece={blueRig} />);

    await user.click(screen.getByRole('button', { name: /add to request/i }));

    expect(useCartStore.getState().items.map((item) => item.postId)).toEqual([42]);
    expect(screen.getByRole('button', { name: /in request/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('takes the piece back out when clicked again', async () => {
    const user = userEvent.setup();
    render(<RequestButton piece={blueRig} />);

    await user.click(screen.getByRole('button', { name: /add to request/i }));
    await user.click(screen.getByRole('button', { name: /in request/i }));

    expect(useCartStore.getState().items).toEqual([]);
    expect(screen.getByRole('button', { name: /add to request/i })).toBeInTheDocument();
  });

  it('renders nothing for a sold piece, which cannot be requested', () => {
    render(<RequestButton piece={{ ...blueRig, sold: true }} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not navigate when it sits inside a gallery card link', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <Link to="/42">
                <span>Blue Wrap Rig</span>
                <RequestButton piece={blueRig} variant="card" />
              </Link>
            }
          />
          <Route path="/42" element={<p>Piece detail page</p>} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /add to request/i }));

    expect(screen.queryByText('Piece detail page')).not.toBeInTheDocument();
    expect(useCartStore.getState().items).toHaveLength(1);
  });
});
