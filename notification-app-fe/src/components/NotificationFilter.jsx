import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const filters = ["All", "Placement", "Result", "Event"];

/**
 * Filter component for selecting the notification category.
 * @param {object} props
 * @param {string} props.value - Selected filter
 * @param {function} props.onChange - Selection handler
 */
export function NotificationFilter({ value, onChange }) {
  const handleChange = (event, newFilter) => {
    // Prevent deselecting (MUI exclusive group returns null if clicking active item)
    if (newFilter !== null && onChange) {
      onChange(newFilter);
    }
  };

  return (
    <ToggleButtonGroup
      value={value || "All"}
      exclusive
      onChange={handleChange}
      size="small"
      sx={{
        flexWrap: "wrap",
        gap: 1,
        border: "none",
        "& .MuiToggleButtonGroup-grouped": {
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "8px !important",
          textTransform: "none",
          fontWeight: 600,
          color: "text.secondary",
          px: 2.5,
          py: 0.8,
          transition: "all 0.2s ease",
          "&.Mui-selected": {
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            borderColor: "primary.main",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
            "&:hover": {
              backgroundColor: "primary.dark"
            }
          },
          "&:hover": {
            backgroundColor: "rgba(59, 130, 246, 0.04)",
            color: "primary.main",
            borderColor: "primary.light"
          }
        }
      }}
    >
      {filters.map((type) => (
        <ToggleButton key={type} value={type}>
          {type}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}