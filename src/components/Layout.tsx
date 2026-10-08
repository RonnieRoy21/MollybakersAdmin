import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { PropsWithChildren } from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { signOutAdmin } from "../auth";
import { useToast } from "./ToastProvider";

const DRAWER_WIDTH = 220;

const NAV_ITEMS = [
  { label: "Users", path: "/users", icon: <GroupOutlinedIcon /> },
  { label: "Cakes", path: "/cakes", icon: <CakeOutlinedIcon /> },
  { label: "Offers", path: "/offers", icon: <LocalOfferOutlinedIcon /> },
  { label: "Orders", path: "/orders", icon: <ReceiptLongOutlinedIcon /> },
  { label: "Feedback", path: "/feedback", icon: <ForumOutlinedIcon /> },
];

export default function Layout({ children }: PropsWithChildren) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const notify = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOutAdmin();
      window.location.replace("/login");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Unable to sign out.",
        "error",
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}
        elevation={0}
      >
        <Toolbar sx={{ gap: 1, px: { xs: 2, sm: 3 } }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <MenuOutlinedIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component="div"
            sx={{ minWidth: 0, overflowWrap: "anywhere" }}
          >
            Molly Bakers — Admin
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={!isMobile || mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: isMobile ? "min(220px, 82vw)" : DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: isMobile ? "min(220px, 82vw)" : DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid #E7DFD8",
          },
        }}
      >
        <Toolbar />
        <List sx={{ px: 1, py: 2 }}>
          {NAV_ITEMS.map((item) => {
            const selected = location.pathname.startsWith(item.path);
            return (
              <ListItemButton
                key={item.path}
                component={Link}
                to={item.path}
                onClick={() => setMobileNavOpen(false)}
                selected={selected}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "rgba(74,44,42,0.08)",
                    color: "primary.main",
                    "& .MuiListItemIcon-root": { color: "primary.main" },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
          <ListItemButton
            onClick={() => void handleSignOut()}
            disabled={isSigningOut}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <LogoutOutlinedIcon />
            </ListItemIcon>
            <ListItemText
              primary={isSigningOut ? "Signing out..." : "Sign out"}
            />
          </ListItemButton>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: 1100,
            width: "100%",
            boxSizing: "border-box",
            mx: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
