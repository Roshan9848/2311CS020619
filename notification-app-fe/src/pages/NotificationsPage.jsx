import { useState, useEffect } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";
import { log } from "../../../logging-middleware/logger";

const LIMIT = 6;

export function NotificationsPage({ viewedIds, onView }) {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);

  const { notifications, totalPages, loading, error } = useNotifications(
    page,
    LIMIT,
    filter
  );

  const handleFilterChange = async (newFilter) => {
    setFilter(newFilter);
    setPage(1);
    await log("frontend", "debug", "page", `Filter changed to: ${newFilter}`);
  };

  const handlePageChange = async (_, newPage) => {
    setPage(newPage);
    await log("frontend", "debug", "page", `Page changed to: ${newPage}`);
  };

  const unreadCount = notifications.filter(n => !viewedIds.has(n.ID)).length;

  useEffect(() => {
    log("frontend", "info", "page", "Notifications page mounted");
  }, []);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <Badge badgeContent={unreadCount} color="primary" max={99}>
          <NotificationsIcon sx={{ fontSize: 28, color: "text.primary" }} />
        </Badge>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          All Notifications
        </Typography>
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
          Failed to load notifications: {error}
        </Alert>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          No notifications found in this category.
        </Alert>
      )}

      {!loading && !error && notifications.length > 0 && (
        <Stack spacing={2}>
          {notifications.map((n) => (
            <NotificationCard
              key={n.ID}
              notification={n}
              isUnread={!viewedIds.has(n.ID)}
              onView={onView}
            />
          ))}
        </Stack>
      )}

      {!loading && !error && totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
            size="medium"
            sx={{
              "& .MuiPaginationItem-root": {
                fontWeight: 600,
                borderRadius: "8px"
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
}
