import { Box, Card, Chip, Stack, Typography } from "@mui/material";
import PlacementIcon from "@mui/icons-material/Work";
import ResultIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import { log } from "../../../logging-middleware/logger";

const TYPE_CONFIGS = {
  Placement: {
    bg: "#e0e7ff",
    text: "#4338ca",
    label: "Placement",
    icon: <PlacementIcon sx={{ fontSize: 14, color: "#4338ca" }} />
  },
  Result: {
    bg: "#ffedd5",
    text: "#c2410c",
    label: "Result",
    icon: <ResultIcon sx={{ fontSize: 14, color: "#c2410c" }} />
  },
  Event: {
    bg: "#dcfce7",
    text: "#15803d",
    label: "Event",
    icon: <EventIcon sx={{ fontSize: 14, color: "#15803d" }} />
  }
};

export function NotificationCard({ notification, isUnread, onView }) {
  const { ID, Type, Message, Timestamp } = notification;
  const config = TYPE_CONFIGS[Type] || {
    bg: "#f1f5f9",
    text: "#475569",
    label: Type,
    icon: null
  };

  const formattedDate = new Date(Timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const handleClick = async () => {
    if (isUnread && onView) {
      onView(ID);
      await log("frontend", "debug", "component", `Notification read: ${ID.substring(0, 8)}`);
    }
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        position: "relative",
        borderRadius: 2,
        border: "1px solid",
        borderColor: isUnread ? "primary.light" : "divider",
        backgroundColor: isUnread ? "rgba(79, 70, 229, 0.02)" : "background.paper",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.01)",
          borderColor: "primary.main"
        }
      }}
    >
      {isUnread && (
        <Box
          sx={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "primary.main"
          }}
        />
      )}

      <Box p={2.5}>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between">
            <Chip
              icon={config.icon}
              label={config.label}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                backgroundColor: config.bg,
                color: config.text,
                border: "none",
                borderRadius: "8px",
                padding: "2px 4px",
                "& .MuiChip-label": {
                  color: config.text,
                  paddingLeft: "6px",
                  paddingRight: "6px"
                }
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {formattedDate}
            </Typography>
          </Stack>

          <Typography variant="body1" color="text.primary" fontWeight={500}>
            {Message}
          </Typography>
        </Stack>
      </Box>
    </Card>
  );
}
