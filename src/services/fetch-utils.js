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
  // console.log('data', data);

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
    location.replace('/todos ');

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

export async function fetchTodos() {
  const resp = await fetch(`${BASE_URL}/api/v1/todos`, {
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

export async function postToDo(task, user_Id) {
  const resp = await fetch(`${BASE_URL}/api/v1/todos`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ task, user_Id }),
    credentials: 'include',
  });
  const msg = await resp.json();
  return msg;
}

export async function toggleComplete(mark, todo_id) {
  const resp = await fetch(`${BASE_URL}/api/v1/todos/${todo_id}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mark, todo_id }),
    credentials: 'include',
  });

  const msg = await resp.json();
  return msg;
}
export async function deleteById(todo_id) {
  const resp = await fetch(`${BASE_URL}/api/v1/todos/${todo_id}`, {
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

export async function updatePost(id, task) {
  const resp = await fetch(`${BASE_URL}/api/v1/todos/edit/${id}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, task }),
    credentials: 'include',
  });
  const msg = await resp.json();

  return msg;
}

export async function getPostDetail(id) {
  const resp = await fetch(`${BASE_URL}/api/v1/todos/${id}`, {
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
