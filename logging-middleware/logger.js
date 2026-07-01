let authToken = "";

export function setAuthToken(token) {
  authToken = token;
}

export async function log(stack, level, pkg, message) {
  let token = authToken;
  
  if (!token && typeof window !== "undefined" && window.localStorage) {
    token = window.localStorage.getItem("auth_token") || "";
  }

  if (!token && typeof process !== "undefined" && process.env) {
    token = process.env.AUTH_TOKEN || "";
  }

  const payload = {
    stack,
    level,
    package: pkg,
    message
  };

  try {
    const response = await fetch("http://4.224.186.213/evaluation-service/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[Log Server Error] Status ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error("[Log Server Network Error]", error);
  }
}
