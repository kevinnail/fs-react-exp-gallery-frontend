// const BASE_URL = 'https://react-fs-ex-to-do-list.herokuapp.com';
const BASE_URL = 'http://localhost:7890';

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
    // location.replace('/auth');
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
    console.error(data.message);
  }
}

export async function postPost(title, description, image_url, category, price, author_id) {
  const resp = await fetch(`${BASE_URL}/api/v1/admin`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description, image_url, category, price, author_id }),
    credentials: 'include',
  });
  const msg = await resp.json();
  return msg;
}

export async function postAddImages(imageFiles, id) {
  // console.log('imageFiles', imageFiles);
  // console.log('id', id);

  const formData = new FormData();
  // imageFiles.forEach((image) => {
  //   formData.append('image', image);
  // });
  formData.append('image_urls', JSON.stringify(imageFiles.map((image) => image.secure_url)));
  formData.append('image_public_ids', JSON.stringify(imageFiles.map((image) => image.public_id)));

  // Append the id to the formData
  formData.append('id', id);
  // for (const [key, value] of formData.entries()) {
  //   console.log(key, value);
  // }

  const resp = await fetch(`${BASE_URL}/api/v1/admin/images`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const msg = await resp.json();
  return msg;
}

export async function deleteById(todo_id) {
  const resp = await fetch(`${BASE_URL}/api/v1/admin/${todo_id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    // body: JSON.stringify({ todo_id }),
    credentials: 'include',
  });
  const msg = await resp.json();

  return msg;
}

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
export const uploadImagesAndCreatePost = async (imageFiles, postDetails) => {
  const formData = new FormData();
  imageFiles.forEach((file) => formData.append('imageFiles', file));
  try {
    const response = await fetch('http://localhost:7890/api/v1/admin/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    const result = await response.json();
    const image_urls = result.map((image) => image.secure_url);
    const additionalImages = result.slice(1).map((image) => ({
      public_id: image.public_id,
      secure_url: image.secure_url,
    }));

    const newPost = {
      ...postDetails,
      image_url: image_urls[0],
      additionalImages,
    };

    return newPost;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const uploadRemainingImages = async (imageFiles, postDetails) => {
  const formData = new FormData();
  imageFiles.forEach((file) => formData.append('imageFiles', file));
  try {
    const response = await fetch('http://localhost:7890/api/v1/admin/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    const result = await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
