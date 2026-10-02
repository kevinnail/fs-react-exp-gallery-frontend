import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Unsubscribe from './Unsubscribe.js';
import { unsubscribeFromEmails } from '../../services/fetch-unsubscribe.js';

jest.mock('../../services/fetch-unsubscribe.js', () => ({
  unsubscribeFromEmails: jest.fn(),
}));

const renderAt = (url) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Unsubscribe />
    </MemoryRouter>
  );

describe('Unsubscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('unsubscribes from the emailed category and names it in the confirmation', async () => {
    unsubscribeFromEmails.mockResolvedValue({ unsubscribedFrom: ['auctions'] });
    renderAt('/unsubscribe?token=signed-token');

    await userEvent.click(screen.getByRole('button', { name: 'Unsubscribe from these emails' }));

    expect(unsubscribeFromEmails).toHaveBeenCalledWith({ token: 'signed-token', all: false });
    expect(
      await screen.findByText("You won't get new auction emails anymore.")
    ).toBeInTheDocument();
  });

  it('unsubscribes from every marketing category', async () => {
    unsubscribeFromEmails.mockResolvedValue({
      unsubscribedFrom: ['auctions', 'galleryPosts', 'promotions'],
    });
    renderAt('/unsubscribe?token=signed-token');

    await userEvent.click(
      screen.getByRole('button', { name: 'Unsubscribe from all marketing emails' })
    );

    expect(unsubscribeFromEmails).toHaveBeenCalledWith({ token: 'signed-token', all: true });
    expect(
      await screen.findByText(
        "You won't get new auction, new gallery post, sales and promotions emails anymore."
      )
    ).toBeInTheDocument();
  });

  it('shows the server error and keeps the buttons when the link is rejected', async () => {
    unsubscribeFromEmails.mockRejectedValue(new Error('This unsubscribe link is not valid'));
    renderAt('/unsubscribe?token=forged');

    await userEvent.click(screen.getByRole('button', { name: 'Unsubscribe from these emails' }));

    expect(await screen.findByText('This unsubscribe link is not valid')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Unsubscribe from these emails' })
    ).toBeInTheDocument();
  });

  it('does not offer to unsubscribe when the link has no token', () => {
    renderAt('/unsubscribe');

    expect(screen.getByText('This unsubscribe link is not complete')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(unsubscribeFromEmails).not.toHaveBeenCalled();
  });
});
