import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MassEmailForm from './MassEmailForm.js';
import { sendMassEmail } from '../../services/fetch-utils.js';
import { toast } from 'react-toastify';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('../../services/fetch-utils.js', () => ({
  sendMassEmail: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

describe('MassEmailForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends the typed subject and message, shows the count, and navigates on success', async () => {
    sendMassEmail.mockResolvedValue({ total: 5, sent: 5, failed: 0 });
    const user = userEvent.setup();
    render(<MassEmailForm />);

    await user.type(screen.getByPlaceholderText('Subject'), 'Sorry!');
    await user.type(
      screen.getByPlaceholderText('Write your message to customers'),
      'Please disregard the earlier email.'
    );
    await user.click(screen.getByRole('button', { name: /send email/i }));

    await waitFor(() => {
      expect(sendMassEmail).toHaveBeenCalledWith({
        subject: 'Sorry!',
        message: 'Please disregard the earlier email.',
      });
    });
    expect(toast.success).toHaveBeenCalledWith('Sent to 5 of 5 customers', expect.any(Object));
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });

  it('shows an error toast and does not navigate when the send fails', async () => {
    sendMassEmail.mockRejectedValue(new Error('boom'));
    const user = userEvent.setup();
    render(<MassEmailForm />);

    await user.type(screen.getByPlaceholderText('Subject'), 'Hi');
    await user.type(screen.getByPlaceholderText('Write your message to customers'), 'Body');
    await user.click(screen.getByRole('button', { name: /send email/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('not sent'),
        expect.any(Object)
      );
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
