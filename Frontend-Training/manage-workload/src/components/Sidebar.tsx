import { NavLink } from "react-router-dom";
import "./Sidebar.css";

type SidebarUser = {
  initials: string;
  name: string;
  role: string;
};

type SidebarNavItem = {
  id: string;
  label: string;
  to: string;
  icon?: "dashboard" | "tasks" | "users" | "settings" | "english";
  onClick?: () => void;
};

type SidebarProps = {
  brand: string;
  user: SidebarUser;
  navItems: SidebarNavItem[];
  theme: "light" | "dark";
  onLogout: () => void;
  onToggleTheme: () => void;
};

export default function Sidebar({
  brand,
  user,
  navItems,
  theme,
  onLogout,
  onToggleTheme,
}: SidebarProps) {
  const renderIcon = (name?: SidebarNavItem["icon"]) => {
    switch (name) {
      case "dashboard":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="2" />
            <rect x="14" y="3" width="7" height="7" rx="2" />
            <rect x="3" y="14" width="7" height="7" rx="2" />
            <rect x="14" y="14" width="7" height="7" rx="2" />
          </svg>
        );
      case "tasks":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M8 12l2.5 2.5L16 9" />
          </svg>
        );
      case "users":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c1.6-4 14.4-4 16 0" />
          </svg>
        );
      case "settings":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6l-.09.1a2 2 0 0 1-3.82 0l-.09-.1a1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.88.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1l-.1-.09a2 2 0 0 1 0-3.82l.1-.09a1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.88l-.06-.06A2 2 0 1 1 7.04 3.3l.06.06A1.65 1.65 0 0 0 9 4.6c.38 0 .74-.13 1-.36l.09-.1a2 2 0 0 1 3.82 0l.09.1c.26.23.62.36 1 .36.38 0 .74-.13 1-.36l.09-.1a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c0 .38.13.74.36 1l.1.09a2 2 0 0 1 0 3.82l-.1.09c-.23.26-.36.62-.36 1z" />
          </svg>
        );
      case "english":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand" aria-label={brand}>
        <span className="brand-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="4" />
            <path d="M8 12l2.5 2.5L16 9" />
          </svg>
        </span>
        <span className="brand-text" style={{ fontSize: "1.23rem" }}>{brand}</span>
      </div>
      <div className="sidebar__divider" />
      <div className="sidebar__profile">
        <div className="profile-avatar">{user.initials}</div>
        <div>
          <p className="profile-name">{user.name}</p>
          <p className="profile-role">{user.role}</p>
        </div>
      </div>
      <div className="sidebar__divider" />
      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? " nav-item--active" : ""}`}
            onClick={item.onClick}
          >
            <span className="nav-icon">{renderIcon(item.icon)}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar__footer">
        <button type="button" className="ghost-button" onClick={onToggleTheme}>
          <span className="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M21 12.7A8.5 8.5 0 1 1 11.3 3a7 7 0 1 0 9.7 9.7z" />
            </svg>
          </span>
          {theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
        </button>
        <button type="button" className="danger-button" onClick={onLogout}>
          <span className="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M10 6H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4" />
              <path d="M17 16l4-4-4-4" />
              <path d="M21 12H9" />
            </svg>
          </span>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
