import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MassEmailForm from './MassEmailForm.js';
import { sendMassEmail } from '../../services/fetch-utils.js';
import { toast } from 'react-toastify';

const mockNavigate = jest.fn();
let mockLocationState = null;

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: mockLocationState }),
}));

jest.mock('../../services/fetch-utils.js', () => ({
  sendMassEmail: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// Fills the form and clicks the form's send button, which opens the confirm dialog.
const fillAndSubmit = async (user, { subject, message, sendLabel }) => {
  await user.type(screen.getByPlaceholderText('Subject'), subject);
  await user.type(screen.getByPlaceholderText('Write your message to customers'), message);
  await user.click(screen.getByRole('button', { name: sendLabel }));
  return screen.getByRole('dialog');
};

describe('MassEmailForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocationState = null;
  });

  it('sends an announcement to every customer, shows the count, and navigates on success', async () => {
    sendMassEmail.mockResolvedValue({ total: 5, sent: 5, failed: 0 });
    const user = userEvent.setup();
    render(<MassEmailForm />);

    expect(
      screen.getByRole('heading', { name: 'Announcement to all customers' })
    ).toBeInTheDocument();

    const dialog = await fillAndSubmit(user, {
      subject: 'Sorry!',
      message: 'Please disregard the earlier email.',
      sendLabel: 'Send announcement',
    });

    expect(within(dialog).getByRole('heading', { name: 'Send announcement?' })).toBeInTheDocument();
    expect(
      within(dialog).getByText(/every customer, including those who turned notifications off/)
    ).toBeInTheDocument();
    expect(within(dialog).getByText('Subject: Sorry!')).toBeInTheDocument();
    expect(sendMassEmail).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: 'Send announcement' }));

    await waitFor(() => {
      expect(sendMassEmail).toHaveBeenCalledWith({
        subject: 'Sorry!',
        message: 'Please disregard the earlier email.',
      });
    });
    // MUI plays an exit transition before removing the dialog
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(toast.success).toHaveBeenCalledWith('Sent to 5 of 5 customers', expect.any(Object));
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });

  it('shows an error toast and does not navigate when the send fails', async () => {
    sendMassEmail.mockRejectedValue(new Error('boom'));
    const user = userEvent.setup();
    render(<MassEmailForm />);

    const dialog = await fillAndSubmit(user, {
      subject: 'Hi',
      message: 'Body',
      sendLabel: 'Send announcement',
    });
    await user.click(within(dialog).getByRole('button', { name: 'Send announcement' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('not sent'),
        expect.any(Object)
      );
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('sends a promotion only to the segment handed over from the Users page', async () => {
    mockLocationState = {
      segment: { label: 'Owes money', userIds: [4, 7] },
    };
    sendMassEmail.mockResolvedValue({ total: 2, sent: 2, failed: 0 });
    const user = userEvent.setup();
    render(<MassEmailForm />);

    expect(
      screen.getByRole('heading', { name: 'Promotion to filtered customers' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Goes to the 2 customers in "Owes money" who have email notifications on. For sales and specials.'
      )
    ).toBeInTheDocument();

    const dialog = await fillAndSubmit(user, {
      subject: 'Reminder',
      message: 'Body',
      sendLabel: 'Send promotion',
    });

    expect(within(dialog).getByRole('heading', { name: 'Send promotion?' })).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        /Goes to the 2 customers in "Owes money" who have email notifications on\./
      )
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Send promotion' }));

    await waitFor(() => {
      expect(sendMassEmail).toHaveBeenCalledWith({
        subject: 'Reminder',
        message: 'Body',
        userIds: [4, 7],
      });
    });
  });

  it('sends nothing and closes the dialog when the confirmation is cancelled', async () => {
    mockLocationState = {
      segment: { label: 'Owes money', userIds: [4, 7] },
    };
    const user = userEvent.setup();
    render(<MassEmailForm />);

    const dialog = await fillAndSubmit(user, {
      subject: 'Reminder',
      message: 'Body',
      sendLabel: 'Send promotion',
    });
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    // MUI plays an exit transition before removing the dialog
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(sendMassEmail).not.toHaveBeenCalled();
  });

  it('closes the dialog without sending when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<MassEmailForm />);

    await fillAndSubmit(user, { subject: 'Hi', message: 'Body', sendLabel: 'Send announcement' });
    await user.keyboard('{Escape}');

    // MUI plays an exit transition before removing the dialog
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(sendMassEmail).not.toHaveBeenCalled();
  });
});
