import React from 'react';
import './AboutMe.css';
import Menu from '../Menu/Menu.js';
import { signOut } from '../../services/auth.js';
import { useUser } from '../../hooks/useUser.js';
export default function AboutMe() {
  const { setUser } = useUser();

  const handleClick = async () => {
    await signOut();
    setUser(null);
  };
  return (
    <div className="about-me-div">
      <div className="menu-search-container">
        <Menu handleClick={handleClick} />
      </div>
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
        Welcome! I appreciate you checking out my page. I&apos;ve been blowing glass for about 27
        years, and now I&apos;ve made a life pivot into web development making websites like this
        one!
      </p>
      <p className="about-me-p">
        I fell in love with gold and silver fuming before I even know how to do it- once I saw my
        teacher Ezra Z. do it the first time I was hooked! My other work is I&apos;m a full stack
        developer currently using React, Node, and Express for web- hope you enjoyed the animations!
        I&apos;m a big fan of CSS I&apos;ve been trying to incorporate them into my projects as much
        as possible. This project with the cubes is definitely my coolest yet! That&apos;s just pure
        CSS by the way, no libraries or frameworks! Recently I started working with C++ and Arduino/
        Clearcore + 4D Systems HMI for automating a glass saw- another fun arena of solving puzzles.
      </p>
      <div className="about-me-p about-me-div-adjust">
        Aside from that I&apos;m all over the place with my hobbies and interests. Musician at heart
        and can&apos;t play my drums enough- I also enjoy fretless bass and a little bit of keys.
        Astromony and astrophotography are another fun hobby, as well as I went down the mushroom
        rabbithole and enjoy foraging and cultivating.I&apos;m always looking to sell some glass and
        currently offering freelance work for fellow artists who need a website. If you&apos;re
        interested in either, please reach out to me{' '}
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
