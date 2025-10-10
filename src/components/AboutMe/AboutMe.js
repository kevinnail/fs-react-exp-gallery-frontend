import './AboutMe.css';
import { signOut } from '../../services/auth.js';
import { useUserStore } from '../../stores/userStore.js';
export default function AboutMe() {
  const { signout } = useUserStore();

  const handleClick = async () => {
    await signOut();
    signout();
  };
  return (
    <div className="about-me-div">
      <h1 className="about-me-h1">About Kevin</h1>
      <div className="scene3">
        <div className="cube3">
          <div className="face3 front3"></div>
          <div className="face3 back3"></div>
          <div className="face3 right3"></div>
          <div className="face3 left3"></div>
          <div className="face3 top3"></div>
          <div className="face3 bottom3"></div>
        </div>
      </div>
      <p className="about-me-p">
        Welcome! I appreciate you checking out my page. I&apos;ve been blowing glass for about 28
        years. In recent years, I&apos;ve been working on making a life pivot into web development
        to work on websites like this one!
      </p>
      <p className="about-me-p">
        I fell in love with gold and silver fuming before I even know how to do it- once I saw my
        teacher Ezra Z. do it the first time I was hooked! Watching the piece &apos;change
        color&apos; with use was one of my favorite things as a young man, it was part of the magic
        that glass promised. I&apos;ve been keeping that era alive for my entire glass career.
      </p>
      <p className="about-me-p">
        Aside from that I&apos;m all over the place with my hobbies and interests. Musician at heart
        and can&apos;t play my drums enough- I also enjoy fretless bass and a little bit of keys.
        Astromony and astrophotography are another fun hobby, as well as I went down the mushroom
        rabbit hole and enjoy foraging and cultivating. Always wishing I was backpacking in the
        Cascades, I at least get to go enjoy the Pacific Ocean on the Oregon Coast. In the mean time
        I am working hard on pursuing starting to make a living from my new found skills in web
        development.
      </p>

      <div className="about-me-p about-me-div-adjust">
        I&apos;m always looking to sell some glass and currently looking for work in tech. If
        you&apos;re interested in either, please reach out to me{' '}
        <a className="about-me-link" href="mailto:kevin@kevinnail.com">
          via email
        </a>{' '}
        or on my pages below. Thanks for stopping by!
        <br />
        <div className="about-me-link-container">
          <a
            className="about-me-link  about-icon-adapt"
            href="https://www.instagram.com/kevinnail_music/"
          >
            <img className="link-logo" src="./drumming-icon.png" />
          </a>
          <a className="about-me-link" href="https://www.instagram.com/stresslessglass/">
            <img className="link-logo" src="./logo-sq-180.png" />
          </a>
          <a className="about-me-link" href="https://www.linkedin.com/in/kevinnail">
            <img className="link-logo" src="./li.png" />
          </a>
          <a className="about-me-link about-icon-adapt" href="https://www.github.com/kevinnail">
            <img className="link-logo" src="./github.png" />
          </a>
          <div className="about-me-link-sub-container">
            <a className="about-me-link" href="https://www.instagram.com/good_morning_mushrooms">
              <img className="link-logo" src="./gmm.png" />
            </a>
            <a className="about-me-link" href="https://www.kevinnail.com">
              <img className="link-logo" src="./kcn-icon.png" />
            </a>
          </div>
        </div>
        <div className="about-me-img">
          <img className="me" src="./kevin.jpeg" />
        </div>
      </div>
    </div>
  );
}
