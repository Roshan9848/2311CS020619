import { useState, useEffect } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { fetchNotifications, authenticate } from "../api/notifications";
import { log } from "../../../logging-middleware/logger";

const WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1
};

const WEIGHT_FACTOR = 86400;

function getPriorityScore(notification) {
  const weight = WEIGHTS[notification.Type] || 0;
  const epochSeconds = Math.floor(new Date(notification.Timestamp).getTime() / 1000);
  return (weight * WEIGHT_FACTOR) + epochSeconds;
}

export function PriorityInboxPage({ viewedIds, onView }) {
  const [filter, setFilter] = useState("All");
  const [limit, setLimit] = useState(10);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPriorityData = async () => {
      setLoading(true);
      setError(null);
      try {
        let token = localStorage.getItem("auth_token");
        if (!token) {
          token = await authenticate();
          localStorage.setItem("auth_token", token);
        }

        const pages = [1, 2, 3];
        const requests = pages.map((p) =>
          fetchNotifications(token, { page: p, limit: 10, notification_type: "All" })
        );

        const results = await Promise.all(requests);
        
        const merged = [];
        const seenIds = new Set();
        for (const res of results) {
          if (res && res.notifications) {
            for (const n of res.notifications) {
              if (!seenIds.has(n.ID)) {
                seenIds.add(n.ID);
                merged.push(n);
              }
            }
          }
        }

        setNotifications(merged);
        await log("frontend", "info", "page", `Loaded ${merged.length} items for priority.`);
      } catch (err) {
        setError(err.message || "Failed to load priority notifications.");
        const errMsg = `Priority error: ${err.message}`.substring(0, 48);
        await log("frontend", "error", "page", errMsg);
      } finally {
        setLoading(false);
      }
    };

    loadPriorityData();
  }, []);

  const handleFilterChange = async (newFilter) => {
    setFilter(newFilter);
    await log("frontend", "debug", "page", `Priority filter changed to: ${newFilter}`);
  };

  const handleLimitChange = async (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setLimit(newLimit);
    await log("frontend", "debug", "page", `Priority limit changed to: ${newLimit}`);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "All") return true;
    return n.Type === filter;
  });

  const priorityList = filteredNotifications
    .map(item => ({ ...item, score: getPriorityScore(item) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const unreadCount = priorityList.filter(n => !viewedIds.has(n.ID)).length;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3} spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <PriorityHighIcon sx={{ fontSize: 28, color: "text.primary" }} />
          </Badge>
          <Typography variant="h5" fontWeight={700} color="text.primary">
            Priority Inbox
          </Typography>
        </Stack>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel id="limit-select-label">Show Top</InputLabel>
          <Select
            labelId="limit-select-label"
            id="limit-select"
            value={limit}
            label="Show Top"
            onChange={handleLimitChange}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            <MenuItem value={10}>Top 10</MenuItem>
            <MenuItem value={15}>Top 15</MenuItem>
            <MenuItem value={20}>Top 20</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ mb: 3 }}>
        <NotificationFilter value={filter} onChange={handleFilterChange} />
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress size={40} thickness={4} />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Failed to load priority notifications: {error}
        </Alert>
      )}

      {!loading && !error && priorityList.length === 0 && (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          No priority notifications in this category.
        </Alert>
      )}

      {!loading && !error && priorityList.length > 0 && (
        <Stack spacing={2}>
          {priorityList.map((n) => (
            <NotificationCard
              key={n.ID}
              notification={n}
              isUnread={!viewedIds.has(n.ID)}
              onView={onView}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
