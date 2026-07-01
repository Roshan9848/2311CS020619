const CONFIG = {
  email: "2311cs020619@mallareddyuniversity.ac.in",
  name: "madani roshan",
  rollNo: "2311cs020619",
  accessCode: "xpQddd",
  clientID: "26f7933a-bfbf-4c8b-8331-b9dbc4d3f37a",
  clientSecret: "JYVWCZwBKsjPQSKC"
};

const BASE_URL = import.meta.env.DEV 
  ? "/api/evaluation-service" 
  : "http://4.224.186.213/evaluation-service";

export async function authenticate() {
  const url = `${BASE_URL}/auth`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: CONFIG.email,
      name: CONFIG.name,
      rollNo: CONFIG.rollNo,
      accessCode: CONFIG.accessCode,
      clientID: CONFIG.clientID,
      clientSecret: CONFIG.clientSecret
    })
  });

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function fetchNotifications(token, params = {}) {
  const base = import.meta.env.DEV
    ? `${window.location.origin}/api/evaluation-service/notifications`
    : "http://4.224.186.213/evaluation-service/notifications";
    
  const url = new URL(base);
  
  if (params.limit) url.searchParams.append("limit", params.limit);
  if (params.page) url.searchParams.append("page", params.page);
  if (params.notification_type && params.notification_type !== "All") {
    url.searchParams.append("notification_type", params.notification_type);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return await response.json();
}
