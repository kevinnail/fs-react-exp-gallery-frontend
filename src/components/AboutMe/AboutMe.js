import React from 'react';
import './AboutMe.css';
export default function AboutMe() {
  return (
    <div className="about-me-div">
      <h1 className="about-me-h1">About Kevin</h1>
      <div className="scene3">
        <div className="cube3">
          <div className="face3 front3">
            {' '}
            <video className="bgVideo" autoPlay muted loop>
              <source src="./drumming.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="face3 back3">
            {' '}
            <video className="bgVideo" autoPlay muted loop>
              <source src="./blowing-glass.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="face3 right3"></div>
          <div className="face3 left3"></div>
          <div className="face3 top3"></div>
          <div className="face3 bottom3"></div>
        </div>
      </div>
      <p className="about-me-p">
        Welcome! I appreciate you checking my page out- I&apos;ve been blowing glass for about 25
        years, and now I&apos;ve made a life pivot into web development making websites like this
        one!
      </p>
      <p className="about-me-p">
        I&apos;m a full stack developer currently using React, Node, and Express. Hope you enjoyed
        the animations- I&apos;m a big fan of CSS I&apos;ve been trying to incorporate them into my
        projects as much as possible. This project with the cubes is definitely my coolest yet!
        That&apos;s just pure CSS by the way, no libraries or frameworks. I can&apos;t wait to get
        into some libraries like Three.js and GSAP.
      </p>
      <p className="about-me-p">
        I&apos;m always looking to sell some glass and currently offering freelance work for fellow
        artists who need a website. If you&apos;re interested in either, please reach out to me
        <a className="about-me-link" href="mailto:kevin@kevinnail.com">
          via email{' '}
        </a>{' '}
        or on my pages below. Thanks for stopping by!
        <br />
        <div className="about-me-link-container">
          <a className="about-me-link" href="https://www.instagram.com/stresslessglass/">
            <img className="ig-logo" src="./IG.png" />
          </a>
          <a className="about-me-link" href="https://www.linkedin.com/kevinnail">
            <img className="ig-logo" src="./li.png" />
          </a>
        </div>
      </p>
    </div>
  );
}
