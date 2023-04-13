# Stress Less Glass

An image gallery website for an artist- in this case me- to display work that collectors can browse/ contact me if interested.

![Logo](https://fs-react-exp-gallery-kn.netlify.app/logo-sq-180.png)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Lessons Learned](#lessons-learned)
- [Preview](#preview)

## Tech Stack

[![React](https://img.shields.io/badge/-React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![CSS3](https://img.shields.io/badge/-CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![React Router](https://img.shields.io/badge/-React%20Router-CA4245?style=flat&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/-Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)

## Lessons Learned

### _What did I learn while building this project?_

- Excellent plans miss a huge amount of challenges
- The complexity/ organization of an edit form with image upload
- Auto deletion of foreign key relationships with "ON DELETE CASCADE" saving a fetch call
- Cloudinary SDK and uploading images through my Node/ Express server
- Using local vs remote storage with Cloudinary uploads
- Limitations of Heroku
- Much about the FormData object, using it to send files in requests
- The multer npm package and how it works/ parses FormData objects
- Responsive web design with @media(min-width:...) rules
- Significantly complex 3D animation through CSS- NO LIBRARIES, only @keyframes, etc.

### _What challenges did I face and how did I overcome them?_

For starters- I began this project just after my boot camp closed without warning just shy of 3/4 of the way through the program, so this entire project was me working on finishing my own training. My main challenge of this project was the edit form- it sounds so simple. But needing to first learn how to even use Cloudinary's SDK in conjuction with my Express server all through React to begin with was very challenging, and then what? The form needs to allow for a user to choose images for initial upload, which need to be displayed in the form with the ability to delete them if the user changes their mind. That list also needs to be displayed in the edit form allowing for additional images to be added to the list- again allowing for deletion.

The initial list is data urls- when editing the post, the display list is urls to the Cloudinary server. Adding to that list is adding more data urls to the http urls. Allowing for deletion means keeping track of all this so that once submit is pressed, the remaining images are parsed such that:

- Any initial images (remaining after any deletions on the form) are uploaded to Cloudinary and the return data (public_id and secure_url) are stored on my Express server
- Any existing images on Cloudinary selected for deletion have their public_id sent in a request to Cloudinary for removal
- All remaining images upon submit of the form have their collective urls inputted/ updated into the Express server for display in the gallery

It's a mix of state; current images, new images, and deleted images- and mixing up data urls/ http urls in an array that needs to be parsed. It was the most challenging thing I've had to figure out logic-wise in my development journey but and thrilled with how it came out.

# Preview

![Preview](./public/preview.gif)
