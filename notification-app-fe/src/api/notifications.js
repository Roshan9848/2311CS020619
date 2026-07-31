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

const MOCK_NOTIFICATIONS = [
  { ID: "n1", Type: "Placement", Message: "Tesla Inc. hiring drive started", Timestamp: new Date(Date.now() - 3600000).toISOString() },
  { ID: "n2", Type: "Result", Message: "Semester 5 exam results published", Timestamp: new Date(Date.now() - 7200000).toISOString() },
  { ID: "n3", Type: "Event", Message: "Annual Ugadi celebrations on campus", Timestamp: new Date(Date.now() - 14400000).toISOString() },
  { ID: "n4", Type: "Placement", Message: "Google India summer internship opening", Timestamp: new Date(Date.now() - 86400000).toISOString() },
  { ID: "n5", Type: "Result", Message: "Revaluation marks updated in portal", Timestamp: new Date(Date.now() - 100000000).toISOString() },
  { ID: "n6", Type: "Event", Message: "Guest lecture on cloud computing in Seminar Hall", Timestamp: new Date(Date.now() - 120000000).toISOString() },
  { ID: "n7", Type: "Placement", Message: "Microsoft recruitment session registration open", Timestamp: new Date(Date.now() - 172800000).toISOString() },
  { ID: "n8", Type: "Event", Message: "Hacks MRU 2026 registration deadline tomorrow", Timestamp: new Date(Date.now() - 200000000).toISOString() },
  { ID: "n9", Type: "Placement", Message: "Cognizant virtual onboarding details released", Timestamp: new Date(Date.now() - 259200000).toISOString() },
  { ID: "n10", Type: "Result", Message: "Practical lab exam schedule released", Timestamp: new Date(Date.now() - 300000000).toISOString() }
];

export async function authenticate() {
  const url = `${BASE_URL}/auth`;
  try {
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
  } catch (err) {
    if (import.meta.env.DEV) {
      return "mock-development-token";
    }
    throw err;
  }
}

export async function fetchNotifications(token, params = {}) {
  const base = import.meta.env.DEV
    ? `${window.location.origin}/api/evaluation-service/notifications`
    : "http://4.224.186.213/evaluation-service/notifications";
    
  try {
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
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn("Dev mode server connection failed, loading mock data fallback.");
      const type = params.notification_type || "All";
      const limit = params.limit || 10;
      
      let filtered = MOCK_NOTIFICATIONS;
      if (type !== "All") {
        filtered = MOCK_NOTIFICATIONS.filter(n => n.Type === type);
      }
      
      const sliceStart = ((params.page || 1) - 1) * limit;
      const sliced = filtered.slice(sliceStart, sliceStart + limit);
      
      return {
        notifications: sliced,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit) || 1
      };
    }
    throw err;
  }
}
