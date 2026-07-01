import { useState, useEffect } from "react";
import { fetchNotifications, authenticate } from "../api/notifications";
import { log } from "../../../logging-middleware/logger";

export function useNotifications(page, limit, notificationType) {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        let token = localStorage.getItem("auth_token");
        
        if (!token) {
          await log("frontend", "info", "hook", "No token found, authenticating...");
          token = await authenticate();
          localStorage.setItem("auth_token", token);
          await log("frontend", "info", "hook", "Auth token established.");
        }

        await log("frontend", "debug", "api", `Fetching page ${page} limit ${limit} type ${notificationType}`);
        const data = await fetchNotifications(token, {
          page,
          limit,
          notification_type: notificationType
        });

        if (active) {
          setNotifications(data.notifications || []);
          
          const totalCount = data.total || (data.notifications ? data.notifications.length : 0);
          setTotal(totalCount);
          
          const pages = data.totalPages || Math.ceil(totalCount / limit) || 1;
          setTotalPages(pages);
          
          await log("frontend", "info", "api", `Loaded ${data.notifications?.length || 0} items.`);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load notifications.");
          const errMsg = `API error: ${err.message}`.substring(0, 48);
          await log("frontend", "error", "api", errMsg);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [page, limit, notificationType]);

  return { notifications, total, totalPages, loading, error };
}
