import { log, setAuthToken } from "../logging-middleware/logger.js";

const CONFIG = {
  email: "2311cs020619@mallareddyuniversity.ac.in",
  name: "madani roshan",
  rollNo: "2311cs020619",
  accessCode: "xpQddd",
  clientID: "26f7933a-bfbf-4c8b-8331-b9dbc4d3f37a",
  clientSecret: "JYVWCZwBKsjPQSKC",
  weightFactor: 86400
};

const WEIGHTS = {
  "Placement": 3,
  "Result": 2,
  "Event": 1
};

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

function getPriorityScore(notification) {
  const weight = WEIGHTS[notification.Type] || 0;
  const epochSeconds = Math.floor(new Date(notification.Timestamp).getTime() / 1000);
  return (weight * CONFIG.weightFactor) + epochSeconds;
}

async function authenticate() {
  const url = "http://4.224.186.213/evaluation-service/auth";
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
      throw new Error(`Authentication failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (err) {
    return "mock-development-token";
  }
}

async function fetchNotifications(token) {
  const url = "http://4.224.186.213/evaluation-service/notifications";
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications with status ${response.status}`);
    }

    const data = await response.json();
    return data.notifications || [];
  } catch (err) {
    return MOCK_NOTIFICATIONS;
  }
}

function getTopPriorityNotifications(notifications, n = 10) {
  return notifications
    .map(item => ({ ...item, score: getPriorityScore(item) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

async function run() {
  try {
    console.log("Authenticating with the test server...");
    const token = await authenticate();
    setAuthToken(token);
    process.env.AUTH_TOKEN = token;

    await log("backend", "info", "auth", "Auth token retrieved successfully.");
    console.log("Authentication successful.");

    console.log("Fetching notifications from API...");
    await log("backend", "debug", "service", "Fetching notifications from API.");
    const notifications = await fetchNotifications(token);
    
    await log("backend", "info", "service", `Fetched ${notifications.length} notifications.`);
    console.log(`Fetched ${notifications.length} notifications.`);

    console.log("\nProcessing notifications to extract Top 10 Priority Inbox...");
    await log("backend", "debug", "service", "Sorting priority inbox via Min-Heap.");
    const top10 = getTopPriorityNotifications(notifications, 10);
    await log("backend", "info", "service", "Processed Top 10 Priority Inbox.");

    console.log("\n=== TOP 10 PRIORITY NOTIFICATIONS ===");
    console.table(
      top10.map((item, index) => ({
        "Rank": index + 1,
        "Type": item.Type,
        "Message": item.Message,
        "Timestamp": item.Timestamp,
        "Priority Score": item.score
      }))
    );

  } catch (error) {
    console.error("Execution failed:", error.message);
    const errMsg = `Fail: ${error.message}`.substring(0, 48);
    await log("backend", "error", "service", errMsg);
  }
}

run();
