/// urls for both local and deployed
const BASE_URL = process.env.REACT_APP_HOME_URL;

/* Auth related functions */
export async function getUser() {
  try {
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
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/users`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (resp.ok) {
      const users = await resp.json();

      return users;
    } else if (resp.status === 401 || resp.status === 403) {
      return null;
    } else {
      throw new Error('An error occurred while fetching user');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

//TODO is this worth having/ using?

export async function getAdminProfile() {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/profile/admin-profile`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (resp.ok) {
      const adminProfile = await resp.json();
      return adminProfile;
    } else if (resp.status === 401 || resp.status === 403) {
      return null;
    } else {
      throw new Error('An error occurred while fetching admin profile');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function signUpUser(email, password) {
  try {
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
      return resp;
    } else {
      console.error(data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function signInUser(email, password) {
  try {
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

    if (!resp.ok) {
      const err = new Error(data.message || 'Failed to sign in');
      if (data && data.code) err.code = data.code;
      err.status = resp.status;
      throw err;
    }
    return data;
  } catch (error) {
    console.error('Problem signing in: ', error.message);
    throw error;
  }
}

// Resend email verification
export async function resendVerification(email) {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/users/resend-verification`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      // No credentials required, but safe to include
      credentials: 'include',
      body: JSON.stringify({ email }),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      const err = new Error(data.message || 'Failed to resend verification');
      err.status = resp.status;
      if (data && data.code) err.code = data.code;
      throw err;
    }

    return data; // { message }
  } catch (error) {
    console.error('Problem resending verification: ', error.message);
    throw error;
  }
}

export async function signOutUser() {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/users/sessions`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (resp.ok) {
      return { success: true };
    } else {
      throw new Error('Failed to sign out');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Deprecated: profile updates are handled by updateProfileWithImage

export async function fetchUserProfile() {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/profile`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (resp.ok) {
      const result = await resp.json();
      return result;
    } else if (resp.status === 401 || resp.status === 403) {
      return null;
    } else {
      throw new Error('An error occurred while fetching user profile');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/* Data functions */

// get all posts from database and display on admin page
export async function fetchPosts() {
  try {
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
      throw new Error(data.message);
    }
  } catch (error) {
    console.error(error);
    throw error;
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
  num_imgs,
  link,
  hide,
  sold
) {
  try {
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
        link,
        hide,
        sold,
      }),
      credentials: 'include',
    });

    const msg = await resp.json();
    if (resp.ok) {
      return msg;
    } else {
      console.error(msg.message);
      throw new Error(msg.message);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// upload images to S3 and send urls and public ids to db
export async function postAddImages(imageFiles, id) {
  try {
    const formData = new FormData();
    formData.append('image_urls', JSON.stringify(imageFiles.map((image) => image.secure_url)));
    formData.append('image_public_ids', JSON.stringify(imageFiles.map((image) => image.public_id)));
    formData.append(
      'resource_types',
      JSON.stringify(imageFiles.map((image) => image.resource_type))
    );
    // Append the id to the formData
    formData.append('id', id);
    const resp = await fetch(`${BASE_URL}/api/v1/admin/images`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const msg = await resp.json();
    return msg;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// delete single post from database
export async function deleteById(post_id) {
  try {
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
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// soft delete gallery post (PATCH)
export async function softDeleteGalleryPost(post_id) {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/admin/delete/${post_id}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    const msg = await resp.json();
    return msg;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// edit post called from EditPost
export async function updatePost(id, post) {
  try {
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
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// return post detail (no image urls aside from the first one)
export async function getPostDetail(id) {
  try {
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
  } catch (error) {
    console.error(error);
    throw error;
  }
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

// delete image from S3
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
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/main-gallery/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const msg = await resp.json();
    return msg;
  } catch (error) {
    console.error(error);
    throw error;
  }
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

export async function downloadInventoryCSV() {
  // console.log('hi');
  const data = await fetch(`${BASE_URL}/api/v1/admin/download-inventory-csv`, {
    credentials: 'include',
  })
    .then((response) => {
      return response.blob();
    })
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'inventory.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error('Error during fetch or download:', error);
    });

  return data;
}

export async function bulkPostEdit(action, percentage = 0) {
  // Prepare the data to send to the backend
  const data = {
    action,
    percentage: action === 'apply' ? percentage : 0,
  };

  try {
    // Make the fetch call to your backend
    const response = await fetch(`${BASE_URL}/api/v1/admin/discounts`, {
      method: 'POST',
      credentials: 'include',

      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // Check if the response is ok
    if (response.ok) {
      const result = await response.json();

      return result.message; // Return the message for further handling in your component
    } else {
      console.error('Failed to apply/undo discount');
      throw new Error('Failed to apply/undo discount');
    }
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

export async function getSiteMessage() {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/main-gallery/home-message`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const msg = await response.json();
    return msg;
  } catch (error) {
    console.error('An error occurred', error);
    throw error;
  }
}

export async function postAdminMessage(message) {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/admin/home-message`, {
      method: 'PUT', // or PATCH, depending on whether you're doing a full or partial update
      credentials: 'include',

      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Failed to post the message');
    }

    return await response.json();
  } catch (e) {
    console.error('An error occurred:', e);
    throw e;
  }
}

/* Image API functions */

// Upload single image to S3 and return URL
export async function uploadImageToS3(imageFile) {
  try {
    const formData = new FormData();
    formData.append('imageFiles', imageFile);

    const response = await fetch(`${BASE_URL}/api/v1/profile/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const result = await response.json();
    // Return the first (and only) uploaded image result
    return result[0];
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Update profile with image URL
export async function updateProfileWithImage(
  imageUrl,
  firstName = null,
  lastName = null,
  sendEmailNotifications
) {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/profile/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        firstName: firstName,
        lastName: lastName,
        sendEmailNotifications,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to update profile with image');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating profile with image:', error);
    throw error;
  }
}

export async function markWelcomeMessageFalse(userId) {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/profile/welcome-message/${userId}`, {
      method: 'PUT',
      credentials: 'include',

      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ showWelcome: false }),
    });

    if (!response.ok) {
      throw new Error('Failed to post the message');
    }

    return response;
  } catch (e) {
    console.error('An error occurred:', e);
    throw e;
  }
}

// New: PUT profile (profile + optional address), returns { profile, address }
export async function putProfile({
  firstName,
  lastName,
  imageUrl,
  sendEmailNotifications,
  addressLine1,
  addressLine2,
  city,
  state,
  postalCode,
  countryCode,
}) {
  try {
    const body = {
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      imageUrl: imageUrl ?? null,
      sendEmailNotifications,
    };

    // Only attach address fields if caller provided them (all-or-nothing handled upstream)
    if (
      addressLine1 !== undefined ||
      addressLine2 !== undefined ||
      city !== undefined ||
      state !== undefined ||
      postalCode !== undefined ||
      countryCode !== undefined
    ) {
      Object.assign(body, {
        addressLine1,
        addressLine2: addressLine2 ?? '',
        city,
        state,
        postalCode,
        countryCode: countryCode || 'US',
      });
    }

    const response = await fetch(`${BASE_URL}/api/v1/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    return data; // { profile, address }
  } catch (error) {
    console.error('Error putting profile:', error);
    throw error;
  }
}
