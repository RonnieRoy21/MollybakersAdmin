import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { PropsWithChildren } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { signOutAdmin } from "../auth";

const DRAWER_WIDTH = 220;

const NAV_ITEMS = [
  { label: "Users", path: "/users", icon: <GroupOutlinedIcon /> },
  { label: "Cakes", path: "/cakes", icon: <CakeOutlinedIcon /> },
  { label: "Offers", path: "/offers", icon: <LocalOfferOutlinedIcon /> },
  { label: "Orders", path: "/orders", icon: <ReceiptLongOutlinedIcon /> },
  { label: "Feedback", path: "/feedback", icon: <ForumOutlinedIcon /> },
];

export default function Layout({ children }: PropsWithChildren) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}
        elevation={0}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ letterSpacing: 0.2 }}>
            Molly Bakers — Admin
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
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
            onClick={() => {
              void signOutAdmin().then(() =>
                navigate("/login", { replace: true }),
              );
            }}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <LogoutOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Sign out" />
          </ListItemButton>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: "background.default", minHeight: "100vh" }}
      >
        <Toolbar />
        <Box sx={{ p: 4, maxWidth: 1100, mx: "auto" }}>{children}</Box>
      </Box>
    </Box>
  );
}
