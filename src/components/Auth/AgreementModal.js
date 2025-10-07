import React, { useState, useRef, useEffect } from 'react';
import './AgreementModal.css';

export default function AgreementModal({ isOpen, onAgree, onDecline }) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!isOpen) setHasScrolled(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScroll = () => {
    const el = scrollRef.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      setHasScrolled(true);
    }
  };

  return (
    <div className="agreement-overlay">
      <div className="agreement-modal">
        <h2 className="agreement-title">User Agreement & Terms of Use</h2>
        <div className="agreement-content" ref={scrollRef} onScroll={handleScroll}>
          <p>
            <strong>Last Updated:</strong> October 2025
          </p>

          <p>
            By clicking <strong>“Agree & Continue”</strong>, you confirm that you have read,
            understood, and accepted these Terms & Conditions. If you do not agree, you may not
            create an account or use this website.
          </p>

          <h3>1. Age Requirement</h3>
          <p>
            You must be at least <strong>21 years old</strong> to access or use this site. By
            proceeding, you affirm that you meet this requirement. If I have reason to believe you
            are under 21, I may suspend or delete your account without notice.
          </p>

          <h3>2. Lawful Use</h3>
          <p>
            You agree to use this site, its services, and messaging features for lawful purposes
            only. You may not use this site to promote, discuss, or conduct any illegal activity,
            including but not limited to the distribution or sale of controlled substances or any
            other unlawful conduct under state or federal law.
          </p>

          <h3>3. Content & Conduct</h3>
          <p>
            You agree not to post, transmit, or share any material that is harassing, defamatory,
            obscene, threatening, or otherwise unlawful. You are solely responsible for your
            content, messages, and activity on the site.
          </p>
          <p>
            This platform has a zero-tolerance policy for hate speech, discrimination, or harassment
            of any kind. This includes, but is not limited to, content or behavior that targets
            individuals or groups based on race, ethnicity, religion, gender, sexual orientation,
            gender identity, or disability. Any such actions will result in immediate suspension or
            termination of your account.
          </p>

          <h3>4. Limitation of Liability</h3>
          <p>
            This website and all services are provided <em>“as is”</em> without warranty of any
            kind. Stress Less Glass is not liable for any damages arising from use or misuse of the
            site, including indirect or consequential losses.
          </p>

          <h3>5. Indemnification</h3>
          <p>
            You agree to indemnify and hold harmless Stress Less Glass and its owner, Kevin Nail,
            from any claims, damages, or losses arising from your violation of these Terms or any
            applicable law.
          </p>

          <h3>6. Termination</h3>
          <p>
            I reserve the right to suspend or terminate your account at any time if you violate
            these Terms or engage in unlawful or abusive behavior on the platform.
          </p>

          <h3>7. Changes to Terms</h3>
          <p>
            I may modify these Terms at any time by posting an updated version on this site.
            Continued use constitutes acceptance of the modified Terms.
          </p>

          <h3>8. Governing Law</h3>
          <p>
            These Terms are governed by the laws of the State of Oregon, without regard to its
            conflict of law provisions. You agree to submit to the exclusive jurisdiction of the
            courts located in Oregon for resolution of any disputes.
          </p>
          <p>
            And while these rules are important, let&apos;s not forget the wisdom of The Dude: “This
            aggression will not stand, man.” So, let&apos;s keep things chill, abide by the rules,
            and enjoy the ride. After all, life&apos;s more enjoyable when we all just take it easy.
          </p>

          <h3>9. Contact</h3>
          <p>
            For questions or concerns regarding these Terms, contact me at{' '}
            <a href="mailto:kevin@kevinnail.com">kevin@kevinnail.com</a>.
          </p>
        </div>

        <div className="agreement-actions">
          <button className="decline-btn" onClick={onDecline}>
            Decline
          </button>
          <button
            className="agree-btn"
            onClick={onAgree}
            disabled={!hasScrolled}
            title={!hasScrolled ? 'Scroll to the bottom to enable' : ''}
          >
            Agree & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
