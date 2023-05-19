const BASE_URL = 'https://glass-art-gallery.herokuapp.com';
// const BASE_URL = 'http://localhost:7890';
// const BASE_URL = ''; // for netlify

/* Auth related functions */
export async function getUser() {
  const resp = await fetch(`${BASE_URL}/api/v1/users/me`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (resp.ok) {
    const user = await resp.json();
    return user;
  } else if (resp.status === 401 || resp.status === 403) {
    return null;
  } else {
    throw new Error('An error occurred while fetching user');
  }
}

export async function signUpUser(email, password) {
  const resp = await fetch(`${BASE_URL}/api/v1/users`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  const data = await resp.json();

  if (resp.ok) {
    await signInUser(email, password);
    return resp;
  } else {
    // eslint-disable-next-line no-console
    console.error(data.message);
  }
}

export async function signInUser(email, password) {
  const resp = await fetch(`${BASE_URL}/api/v1/users/sessions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  const data = await resp.json();

  if (resp.ok) {
    location.replace('/admin ');

    return resp;
  } else {
    // eslint-disable-next-line no-console
    console.error(data.message);
  }
}

export async function signOutUser() {
  const resp = await fetch(`${BASE_URL}/api/v1/users/sessions`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (resp.ok) {
    location.replace('/auth');
  }
}

/* Data functions */

// get all posts from database and display on admin page
export async function fetchPosts() {
  const resp = await fetch(`${BASE_URL}/api/v1/admin`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  const data = await resp.json();

  if (resp.ok) {
    return data;
  } else {
    // eslint-disable-next-line no-console
    // console.error(data.message);
    throw new Error(data.message);
  }
}

// create new post in database
export async function postPost(
  title,
  description,
  image_url,
  category,
  price,
  author_id,
  public_id,
  num_imgs
) {
  const resp = await fetch(`${BASE_URL}/api/v1/admin`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      description,
      image_url,
      category,
      price,
      author_id,
      public_id,
      num_imgs,
    }),
    credentials: 'include',
  });

  const msg = await resp.json();
  if (resp.ok) {
    return msg;
  } else {
    // eslint-disable-next-line no-console
    console.error(msg.message);
    throw new Error(msg.message);
  }
}

// upload images to cloudinary and send urls and public ids to db
export async function postAddImages(imageFiles, id) {
  const formData = new FormData();
  formData.append('image_urls', JSON.stringify(imageFiles.map((image) => image.secure_url)));
  formData.append('image_public_ids', JSON.stringify(imageFiles.map((image) => image.public_id)));
  formData.append('resource_types', JSON.stringify(imageFiles.map((image) => image.resource_type)));
  // Append the id to the formData
  formData.append('id', id);
  const resp = await fetch(`${BASE_URL}/api/v1/admin/images`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const msg = await resp.json();
  return msg;
}

// delete single post from database
export async function deleteById(post_id) {
  const resp = await fetch(`${BASE_URL}/api/v1/admin/${post_id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  const msg = await resp.json();

  return msg;
}

// edit post called from EditPost
export async function updatePost(id, post) {
  const resp = await fetch(`${BASE_URL}/api/v1/admin/${id}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, post }),
    credentials: 'include',
  });
  const msg = await resp.json();

  return msg;
}

// return post detail (no image urls aside from the first one)
export async function getPostDetail(id) {
  const resp = await fetch(`${BASE_URL}/api/v1/admin/${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const msg = await resp.json();
  return msg;
}

// image file upload functions
export const uploadImagesAndCreatePost = async (imageFiles, formFunctionMode) => {
  const formData = new FormData();
  imageFiles.forEach((file) => formData.append('imageFiles', file));
  try {
    const response = await fetch(`${BASE_URL}/api/v1/admin/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    const result = await response.json();

    const image_urls = result.map((image) => image.secure_url);
    const public_ids = result.map((image) => image.public_id);

    let additionalImages = [];
    let newPost;
    let newImages = [];
    let editedPost;

    // create additionalImages WITH the default image
    if (formFunctionMode === 'new') {
      additionalImages = result.map((image) => ({
        public_id: image.public_id,
        secure_url: image.secure_url,
        resource_type: image.resource_type,
      }));

      // create new post object with default image url and public id,
      //  and any additional images
      newPost = {
        image_url: image_urls[0],
        public_id: public_ids[0],
        additionalImages,
      };
      return newPost;
    } else {
      newImages = result.map((image) => ({
        secure_url: image.secure_url,
        public_id: image.public_id,
        resource_type: image.resource_type,
      }));
      // create edited post object with new images
      editedPost = {
        newImages,
        additionalImages,
      };
      return editedPost;
    }

    // return newPost;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// export const uploadRemainingImages = async (imageFiles, postDetails) => {
export const uploadRemainingImages = async (imageFiles) => {
  const formData = new FormData();
  imageFiles.forEach((file) => formData.append('imageFiles', file));
  try {
    const response = await fetch(`${BASE_URL}/api/v1/admin/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// delete image from cloudinary
export const deleteImage = async (public_id, resource_type) => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/admin/delete`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_id: public_id, resource_type: resource_type }),
    });
    const result = await response.json();

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// delete single image data from db
export const deleteImageData = async (id, public_id) => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/admin/image/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_id: public_id }),
    });
    const result = await response.json();

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// get additional image urls from in db
export const getAdditionalImageUrlsPublicIds = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/admin/urls/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
    const result = await response.json();

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

//  public routes for gallery
// fetch all posts
export const fetchGalleryPosts = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/main-gallery`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// public route for post detail
export async function getGalleryPostDetail(id) {
  const resp = await fetch(`${BASE_URL}/api/v1/main-gallery/${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  const msg = await resp.json();
  return msg;
}
export const getAdditionalImageUrlsPublicIdsGallery = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/main-gallery/urls/${id}`, {
      method: 'GET',
    });
    const result = await response.json();

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export async function searchGalleryPosts(searchTerm) {
  const resp = await fetch(`${BASE_URL}/api/v1/main-gallery/search/${searchTerm}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  const msg = await resp.json();
  return msg;
}
