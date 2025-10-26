import './AgreementModal.css';

export default function AgreementModal({ isOpen, onAgree, onDecline }) {
  if (!isOpen) return null;

  return (
    <div className="agreement-overlay">
      <div className="agreement-modal">
        <h2 className="agreement-title">User Agreement & Age Confirmation</h2>
        <div className="agreement-content">
          <p>
            <strong>Last Updated:</strong> October 2025
          </p>
          <p>
            By clicking <strong>“Agree & Continue”</strong>, you confirm that you are at least{' '}
            <strong>21 years old</strong> and that you agree to the following terms:
          </p>
          <ul>
            <li>You are 21 or older.</li>
            <li>You are legally allowed to view and purchase glass art.</li>
            <li>
              <strong>
                You agree to pay for any purchases/ auction wins within 24hrs/ ASAP{' '}
                <span style={{ textDecoration: 'underline' }}>with communication</span> if more time
                is needed.{' '}
              </strong>
            </li>
          </ul>
          <p>
            By clicking “Agree & Continue,” you acknowledge that you understand and accept these
            terms.
          </p>
        </div>

        <div className="agreement-actions">
          <button className="decline-btn" onClick={onDecline}>
            Decline
          </button>
          <button className="agree-btn" onClick={onAgree}>
            Agree & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
