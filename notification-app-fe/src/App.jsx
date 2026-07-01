import { useState, useEffect } from "react";
import { 
  Box, 
  CssBaseline, 
  ThemeProvider, 
  createTheme, 
  AppBar, 
  Toolbar, 
  Typography, 
  Tabs, 
  Tab, 
  Container 
} from "@mui/material";
import InboxIcon from "@mui/icons-material/Notifications";
import PriorityInboxIcon from "@mui/icons-material/PriorityHigh";
import { NotificationsPage } from "./pages/NotificationsPage";
import { PriorityInboxPage } from "./pages/PriorityInboxPage";
import { authenticate } from "./api/notifications";
import { log, setAuthToken } from "../../logging-middleware/logger";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4f46e5",
      dark: "#3730a3",
      light: "#818cf8"
    },
    secondary: {
      main: "#10b981",
      dark: "#047857",
      light: "#34d399"
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff"
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569"
    },
    divider: "#cbd5e1"
  },
  typography: {
    fontFamily: "'Outfit', sans-serif",
    button: {
      textTransform: "none",
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 16
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)"
        }
      }
    }
  }
});

export default function App() {
  const [currentTab, setCurrentTab] = useState("all");
  const [viewedIds, setViewedIds] = useState(() => {
    const saved = localStorage.getItem("viewed_notifications");
    if (saved) {
      try {
        const list = JSON.parse(saved);
        return new Set(list);
      } catch (e) {
        console.error("Failed to parse viewed notifications", e);
      }
    }
    return new Set();
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await authenticate();
        localStorage.setItem("auth_token", token);
        setAuthToken(token);
        await log("frontend", "info", "auth", "App initialized and authenticated.");
      } catch (err) {
        console.error("Background auth failed:", err);
        await log("frontend", "fatal", "auth", `Initial auth failed: ${err.message}`.substring(0, 48));
      }
    };

    initAuth();
  }, []);

  const handleNotificationView = (id) => {
    setViewedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem("viewed_notifications", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: "100vh", backgroundColor: "background.default" }}>
        <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider", backgroundColor: "background.paper" }}>
          <Container maxWidth="md">
            <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
              <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: "-0.5px", color: "text.primary" }}>
                Notify<span style={{ color: "#4f46e5" }}>MRU</span>
              </Typography>
              
              <Tabs 
                value={currentTab} 
                onChange={async (e, val) => {
                  setCurrentTab(val);
                  await log("frontend", "info", "page", `Tab switched to: ${val}`);
                }}
                textColor="primary"
                indicatorColor="primary"
                aria-label="navigation tabs"
              >
                <Tab 
                  label="Inbox" 
                  value="all" 
                  icon={<InboxIcon sx={{ fontSize: 20 }} />} 
                  iconPosition="start"
                  sx={{ minHeight: 64, fontWeight: 600 }}
                />
                <Tab 
                  label="Priority Inbox" 
                  value="priority" 
                  icon={<PriorityInboxIcon sx={{ fontSize: 20 }} />} 
                  iconPosition="start"
                  sx={{ minHeight: 64, fontWeight: 600 }}
                />
              </Tabs>
            </Toolbar>
          </Container>
        </AppBar>

        <Container maxWidth="sm" sx={{ py: 4 }}>
          {currentTab === "all" ? (
            <NotificationsPage viewedIds={viewedIds} onView={handleNotificationView} />
          ) : (
            <PriorityInboxPage viewedIds={viewedIds} onView={handleNotificationView} />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}