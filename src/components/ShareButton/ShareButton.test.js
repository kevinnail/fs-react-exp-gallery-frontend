import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ShareButton from './ShareButton.js';

const imageUrl = 'https://example.cloudfront.net/stress-less-glass/piece.jpeg';

// The share sheet, clipboard and network are browser APIs jsdom does not provide.
const stubNavigator = (name, value) => {
  Object.defineProperty(window.navigator, name, { value, configurable: true });
};

const namedError = (name) => {
  const error = new Error(`${name} from the test`);
  error.name = name;
  return error;
};

// Lets every pending promise in the click handler settle before asserting.
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const renderButton = () =>
  render(<ShareButton imageUrl={imageUrl} title="Blue bowl" text="Blue bowl" />);

describe('ShareButton', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['image bytes'], { type: 'image/jpeg' }),
    });
    stubNavigator('share', jest.fn().mockResolvedValue(undefined));
    stubNavigator('canShare', jest.fn().mockReturnValue(true));
    stubNavigator('clipboard', { writeText: jest.fn().mockResolvedValue(undefined) });
  });

  afterEach(() => {
    delete global.fetch;
    delete window.navigator.share;
    delete window.navigator.canShare;
    delete window.navigator.clipboard;
  });

  it('fetches the image under its own cache entry and shares it as a file', async () => {
    renderButton();
    fireEvent.click(screen.getByRole('button', { name: 'Share Blue bowl' }));

    await waitFor(() => expect(window.navigator.share).toHaveBeenCalled());
    await flushPromises();

    expect(global.fetch).toHaveBeenCalledWith(`${imageUrl}?share`);
    const [shareData] = window.navigator.share.mock.calls[0];
    expect(shareData.files).toHaveLength(1);
    expect(shareData.files[0].name).toBe('piece.jpeg');
    expect(shareData.files[0].type).toBe('image/jpeg');
    expect(window.navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it('names the share error on the label after copying the link', async () => {
    window.navigator.share.mockRejectedValue(namedError('NotAllowedError'));

    renderButton();
    fireEvent.click(screen.getByRole('button', { name: 'Share Blue bowl' }));

    expect(await screen.findByText('Link copied: NotAllowedError')).toBeInTheDocument();
    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
  });

  it('still names the share error when the clipboard is refused too', async () => {
    window.navigator.share.mockRejectedValue(namedError('NotAllowedError'));
    window.navigator.clipboard.writeText.mockRejectedValue(namedError('NotAllowedError'));

    renderButton();
    fireEvent.click(screen.getByRole('button', { name: 'Share Blue bowl' }));

    expect(await screen.findByText('Share failed: NotAllowedError')).toBeInTheDocument();
  });

  it('treats a dismissed share sheet as no error', async () => {
    window.navigator.share.mockRejectedValue(namedError('AbortError'));

    renderButton();
    fireEvent.click(screen.getByRole('button', { name: 'Share Blue bowl' }));
    await waitFor(() => expect(window.navigator.share).toHaveBeenCalled());
    await flushPromises();

    expect(window.navigator.clipboard.writeText).not.toHaveBeenCalled();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });
});
