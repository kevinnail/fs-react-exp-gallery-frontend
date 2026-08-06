import { useNavigate } from 'react-router-dom';
import './AboutMe.css';

const ELSEWHERE_LINKS = [
  { href: 'https://www.instagram.com/stresslessglass/', logo: '/logo-sq-180.png', label: 'Glass' },
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
  { href: 'https://www.github.com/kevinnail', logo: '/github.jpg', label: 'Code' },
  { href: 'https://www.kevinnail.com', logo: '/kcn-icon.png', label: 'Dev portfolio' },
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
    <main className="slg-about">
      <section className="slg-about-hero" aria-labelledby="slg-about-heading">
        <div className="slg-about-hero-copy">
          <p className="slg-about-eyebrow">About</p>
          <h1 className="slg-about-title" id="slg-about-heading">
            Kevin Nail
          </h1>
          <p className="slg-about-lead">
            Welcome- I appreciate you checking out my page. I&apos;ve been blowing glass for about
            29 years, and in recent years I&apos;ve been working on a life pivot into web
            development, building sites like this one.
          </p>
          <div className="slg-about-actions">
            <button className="slg-about-button" onClick={() => navigate('/messages')}>
              Message me
            </button>
            <a
              className="slg-about-button slg-about-button--quiet"
              href="https://www.instagram.com/stresslessglass"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          </div>
        </div>

        <figure className="slg-about-hero-figure">
          <img src="/action-2.jpg" alt="Kevin at the torch" />
        </figure>
      </section>

      <section className="slg-about-band" aria-labelledby="slg-about-code">
        <figure className="slg-about-band-figure slg-about-band-figure--code">
          <img src="/code.png" alt="Source code from one of my projects" />
        </figure>
        <div className="slg-about-band-copy">
          <p className="slg-about-eyebrow">Software</p>
          <h2 className="slg-about-band-title" id="slg-about-code">
            I build the software, too
          </h2>
          <p className="slg-about-text">
            Everything you are looking at right now is mine. The React front end, the Node and
            Express API, the PostgreSQL database behind it, the live auction timers running over
            WebSockets, the image pipeline into S3, the encrypted messaging. I built it, I host it,
            and I maintain it.
          </p>
          <p className="slg-about-text">
            I went back to school for web development in 2022 and have not stopped building since:
            this site, my developer portfolio, a full-stack platform project, and an iOS app that is
            approved and live on the App Store with in-app purchases. Twenty-nine years at the torch
            taught me to work precisely and to finish what I start- that is exactly what I bring to
            code.
          </p>
          <ul className="slg-about-stack">
            {STACK.map((technology) => (
              <li key={technology}>{technology}</li>
            ))}
          </ul>
          <p className="slg-about-text">
            I am actively looking for full-stack work. If you are hiring, or you know someone who
            is, I would genuinely like to hear from you.
          </p>
          <div className="slg-about-actions">
            <a
              className="slg-about-button"
              href="https://www.kevinnail.com"
              target="_blank"
              rel="noreferrer"
            >
              See my dev portfolio
            </a>
            <a
              className="slg-about-button slg-about-button--quiet"
              href="https://www.github.com/kevinnail"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              className="slg-about-button slg-about-button--quiet"
              href="https://www.linkedin.com/in/kevinnail"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      <section className="slg-about-band slg-about-band--reverse" aria-labelledby="slg-about-torch">
        <figure className="slg-about-band-figure">
          <img src="/knaildriver4.jpg" alt="A fumed recycler and matching accessories" />
        </figure>
        <div className="slg-about-band-copy">
          <p className="slg-about-eyebrow">At the torch</p>
          <h2 className="slg-about-band-title" id="slg-about-torch">
            Gold and silver fuming
          </h2>
          <p className="slg-about-text">
            I fell in love with fuming before I even knew how to do it. The first time I watched my
            teacher Ezra Z. do it, I was hooked. Watching a piece change color with use was one of
            my favorite things as a young man- it was part of the magic that glass promised.
            I&apos;ve been keeping that era alive for my entire glass career.
          </p>
        </div>
      </section>

      <section className="slg-about-band" aria-labelledby="slg-about-off">
        <figure className="slg-about-band-figure slg-about-band-figure--grid">
          {PURSUITS.map((pursuit) => (
            <span className="slg-about-tile" key={pursuit.image}>
              <img src={pursuit.image} alt={pursuit.caption} />
              <span className="slg-about-tile-caption">{pursuit.caption}</span>
            </span>
          ))}
        </figure>
        <div className="slg-about-band-copy">
          <p className="slg-about-eyebrow">Away from the bench</p>
          <h2 className="slg-about-band-title" id="slg-about-off">
            All over the place, on purpose
          </h2>
          <p className="slg-about-text">
            Musician at heart- I can&apos;t play my drums enough, and I enjoy fretless bass and a
            little bit of keys. Astronomy and astrophotography are another favorite, and I went down
            the mushroom rabbit hole a while back and haven&apos;t come out: foraging and
            cultivating both. I&apos;m always wishing I were backpacking in the Cascades- be sure to
            check out my backpacking page with all my hikes/ photos.
          </p>
        </div>
      </section>

      <section className="slg-about-band slg-about-band--reverse" aria-labelledby="slg-about-hello">
        <figure className="slg-about-band-figure slg-about-band-figure--portrait">
          <img src="/action-1.jpg" className='portrait' alt="Kevin Nail" />
        </figure>
        <div className="slg-about-band-copy">
          <p className="slg-about-eyebrow">Get in touch</p>
          <h2 className="slg-about-band-title" id="slg-about-hello">
            Say hello
          </h2>
          <p className="slg-about-text">
            I&apos;m always looking to sell some glass, and I&apos;m currently looking for work in
            tech. If you&apos;re interested in either, please reach out. Thanks for stopping by.
          </p>
          <div className="slg-about-actions">
            <button className="slg-about-button" onClick={() => navigate('/messages')}>
              Send me a private message
            </button>
            <a
              className="slg-about-button slg-about-button--quiet"
              href="mailto:kevin@kevinnail.com"
            >
              Email
            </a>
          </div>
        </div>
      </section>

      <section className="slg-about-elsewhere" aria-labelledby="slg-about-elsewhere-heading">
        <h2 className="slg-about-elsewhere-title" id="slg-about-elsewhere-heading">
          Elsewhere
        </h2>
        <ul className="slg-about-links">
          {ELSEWHERE_LINKS.map((link) => (
            <li key={link.href}>
              <a className="slg-about-link" href={link.href} target="_blank" rel="noreferrer">
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
