const API_URL =
  import.meta.env.VITE_API_URL || "/api";

async function request(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type");

  let data;

  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.blob();
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data?.detail
        ? data.detail
        : "Something went wrong";

    throw new Error(
      typeof message === "string"
        ? message
        : JSON.stringify(message)
    );
  }

  return data;
}

export const api = {
  get: (endpoint) =>
    request(endpoint, {
      method: "GET",
    }),

  post: (endpoint, body) =>
    request(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: (endpoint, body) =>
    request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (endpoint) =>
    request(endpoint, {
      method: "DELETE",
    }),
};

export { API_URL };