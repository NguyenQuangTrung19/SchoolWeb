export const API_URL = "http://localhost:3000"; // Backend NestJS

async function request(method, url, body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) options.body = JSON.stringify(body);

  const res = await fetch(API_URL + url, options);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return res.json();
}

export const apiGet = (url) => request("GET", url);
export const apiPost = (url, body) => request("POST", url, body);
export const apiPut = (url, body) => request("PUT", url, body);
export const apiDelete = (url) => request("DELETE", url);
