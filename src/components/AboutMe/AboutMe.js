import { useNavigate } from 'react-router-dom';
import './AboutMe.css';

const ELSEWHERE_LINKS = [
  { href: 'https://www.kevinnail.com', logo: '/kcn-icon.png', label: 'Main Site' },
  { href: 'https://www.instagram.com/stresslessglass/', logo: '/logo-sq-180.png', label: 'Glass' },
  { href: 'https://www.github.com/kevinnail', logo: '/github.jpg', label: 'Code' },
  {
    href: 'https://www.instagram.com/kevinnail_music/',
    logo: '/drumming-icon.png',
    label: 'Music',
  },
  {
    href: 'https://www.instagram.com/good_morning_mushrooms',
    logo: '/gmm.png',
    label: 'Mushrooms',
  },
  { href: 'https://www.linkedin.com/in/kevinnail', logo: '/li.png', label: 'LinkedIn' },
];

const STACK = [
  'React',
  'React Native',
  'Node.js',
  'Express',
  'PostgreSQL',
  'TypeScript',
  'WebSockets',
  'AWS S3',
];

const PURSUITS = [
  { image: '/drumset.jpeg', caption: 'Drums, fretless bass, a little bit of keys' },
  { image: '/saturn.JPEG', caption: 'Astronomy and astrophotography' },
  { image: '/mushrooms.JPG', caption: 'Foraging and cultivating' },
  { image: '/mt.jpeg', caption: 'The Cascades, whenever I can get there' },
];

export default function AboutMe() {
  const navigate = useNavigate();

  return (
    <main className="about-page">
      <section className="about-intro" aria-labelledby="about-page-heading">
        <div className="about-intro-details">
          <p className="about-heading-label">About</p>
          <h1 className="about-page-title" id="about-page-heading">
            Kevin Nail
          </h1>
          <p className="about-intro-summary">
            Welcome- I appreciate you checking out my page. I&apos;ve been blowing glass for about
            29 years, and in recent years I&apos;ve been working on a life pivot into web
            development, building sites like this one.
          </p>
          <div className="about-actions">
            <button className="about-button" onClick={() => navigate('/messages')}>
              Message me
            </button>
            <a
              className="about-button about-button--secondary"
              href="https://www.instagram.com/stresslessglass"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          </div>
        </div>

        <figure className="about-intro-image">
          <img src="/action-2.jpg" alt="Kevin at the torch" />
        </figure>
      </section>

      <section className="about-section" aria-labelledby="about-software-heading">
        <figure className="about-section-media about-section-media--code-screenshot">
          <img src="/code.png" alt="Source code from one of my projects" />
        </figure>
        <div className="about-section-details">
          <p className="about-heading-label">Software</p>
          <h2 className="about-section-title" id="about-software-heading">
            I build the software, too
          </h2>
          <p className="about-paragraph">
            Everything you are looking at right now is mine. The React front end, the Node and
            Express API, the PostgreSQL database behind it, the live auction timers running over
            WebSockets, the image pipeline into S3, the encrypted messaging. I built it, I host it,
            and I maintain it.
          </p>
          <p className="about-paragraph">
            I went back to school for web development in 2022 and have not stopped building since:
            this site, my developer portfolio, a full-stack platform project, and an iOS app that is
            approved and live on the App Store with in-app purchases. Twenty-nine years at the torch
            taught me to work precisely and to finish what I start- that is exactly what I bring to
            code.
          </p>
          <ul className="about-tech-stack">
            {STACK.map((technology) => (
              <li key={technology}>{technology}</li>
            ))}
          </ul>
          <p className="about-paragraph">
            I am actively looking for full-stack work. If you are hiring, or you know someone who
            is, I would genuinely like to hear from you.
          </p>
          <div className="about-actions">
            <a
              className="about-button"
              href="https://www.kevinnail.com"
              target="_blank"
              rel="noreferrer"
            >
              See my dev portfolio
            </a>
            <a
              className="about-button about-button--secondary"
              href="https://www.github.com/kevinnail"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              className="about-button about-button--secondary"
              href="https://www.linkedin.com/in/kevinnail"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      <section
        className="about-section about-section--image-right"
        aria-labelledby="about-fuming-heading"
      >
        <figure className="about-section-media">
          <img src="/knaildriver4.jpg" alt="A fumed recycler and matching accessories" />
        </figure>
        <div className="about-section-details">
          <p className="about-heading-label">At the torch</p>
          <h2 className="about-section-title" id="about-fuming-heading">
            Gold and silver fuming
          </h2>
          <p className="about-paragraph">
            I fell in love with fuming before I even knew how to do it. The first time I watched my
            teacher Ezra Z. do it, I was hooked. Watching a piece change color with use was one of
            my favorite things as a young man- it was part of the magic that glass promised.
            I&apos;ve been keeping that era alive for my entire glass career.
          </p>
        </div>
      </section>

      <section className="about-section" aria-labelledby="about-pursuits-heading">
        <figure className="about-section-media about-section-media--tile-grid">
          {PURSUITS.map((pursuit) => (
            <span className="about-pursuit-tile" key={pursuit.image}>
              <img src={pursuit.image} alt={pursuit.caption} />
              <span className="about-pursuit-caption">{pursuit.caption}</span>
            </span>
          ))}
        </figure>
        <div className="about-section-details">
          <p className="about-heading-label">Away from the bench</p>
          <h2 className="about-section-title" id="about-pursuits-heading">
            All over the place, on purpose
          </h2>
          <p className="about-paragraph">
            Musician at heart- I can&apos;t play my drums enough, and I enjoy fretless bass and a
            little bit of keys. Astronomy and astrophotography are another favorite, and I went down
            the mushroom rabbit hole a while back and haven&apos;t come out: foraging and
            cultivating both. I&apos;m always wishing I were backpacking in the Cascades- be sure to
            check out my backpacking page with all my hikes/ photos.
          </p>
        </div>
      </section>

      <section
        className="about-section about-section--image-right"
        aria-labelledby="about-contact-heading"
      >
        <figure className="about-section-media about-section-media--portrait">
          <img src="/action-1.jpg" className="portrait" alt="Kevin Nail" />
        </figure>
        <div className="about-section-details">
          <p className="about-heading-label">Get in touch</p>
          <h2 className="about-section-title" id="about-contact-heading">
            Say hello
          </h2>
          <p className="about-paragraph">
            I&apos;m always looking to sell some glass, and I&apos;m currently looking for work in
            tech. If you&apos;re interested in either, please reach out. Thanks for stopping by.
          </p>
          <div className="about-actions">
            <button className="about-button" onClick={() => navigate('/messages')}>
              Send me a private message
            </button>
            <a className="about-button about-button--secondary" href="mailto:kevin@kevinnail.com">
              Email
            </a>
          </div>
        </div>
      </section>

      <section className="about-elsewhere" aria-labelledby="about-elsewhere-heading">
        <h2 className="about-elsewhere-title" id="about-elsewhere-heading">
          Elsewhere
        </h2>
        <ul className="about-elsewhere-links">
          {ELSEWHERE_LINKS.map((link) => (
            <li key={link.href}>
              <a className="about-elsewhere-link" href={link.href} target="_blank" rel="noreferrer">
                <img src={link.logo} alt="" />
                <span>{link.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
