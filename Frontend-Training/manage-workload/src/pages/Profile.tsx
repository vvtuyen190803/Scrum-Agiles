import { useEffect, useMemo, useState } from "react";
import { User } from "../types/auth.type";
import { getCurrentUser } from "../utils/storage";
import "./Profile.css";

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase() || "U";
};

type ProfileProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export default function Profile({ theme, onToggleTheme }: ProfileProps) {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const localProfile = getCurrentUser<User>();
    if (!localProfile) {
      setError("Không tìm thấy thông tin tài khoản.");
      setLoading(false);
      return;
    }
    setProfile(localProfile);
    setLoading(false);
  }, []);

  const initials = useMemo(() => getInitials(profile?.username ?? "User"), [profile]);
  const role = Array.isArray(profile?.groups)
    ? profile?.groups?.[0] ?? "Người dùng"
    : profile?.groups ?? "Người dùng";
  const displayRole = role.toLowerCase().includes("admin") ? "Quản trị viên" : "Người dùng";
  const isActive = Boolean(profile?.is_active);

  if (loading) return <p className="profile-state">Loading profile...</p>;
  if (error) return <p className="profile-state profile-state--error">{error}</p>;

  return (
    <div className="profile-page">
      <header className="content-header">
        <div>
          <h1 className="content-title">Cài đặt</h1>
          <p className="content-subtitle">Quản lý tài khoản và tùy chọn của bạn</p>
        </div>
      </header>
      <section className="profile-card">
        <div className="profile-card__title">
          <span className="profile-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c1.8-4 14.2-4 16 0" />
            </svg>
          </span>
          <div>
            <h2>Thông tin cá nhân</h2>
            <p>Thông tin tài khoản của bạn</p>
          </div>
        </div>

        <div className="profile-summary">
          <div className="profile-avatar">{initials}</div>
          <div>
            <p className="profile-name">{profile?.username ?? "—"}</p>
            <p className="profile-email">{profile?.email ?? "—"}</p>
          </div>
        </div>

        <div className="profile-divider" />

        <div className="profile-meta">
          <div>
            <p className="profile-label">Vai trò</p>
            <p className="profile-value">{displayRole}</p>
          </div>
          <div>
            <p className="profile-label">Trạng thái</p>
            <p className="profile-value profile-value--active">
              {isActive ? "Đang hoạt động" : "Không hoạt động"}
            </p>
          </div>
        </div>
      </section>

      <section className="profile-card">
        <div className="profile-card__title">
          <span className="profile-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </span>
          <div>
            <h2>Giao diện</h2>
            <p>Tùy chỉnh giao diện ứng dụng</p>
          </div>
        </div>
        <div className="profile-toggle">
          <div>
            <p className="profile-label">Chế độ tối</p>
            <p className="profile-helper">Bật chế độ tối để giảm mỏi mắt khi làm việc ban đêm</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={theme === "dark"} onChange={onToggleTheme} />
            <span className="slider" />
          </label>
        </div>
      </section>

      <section className="profile-card">
        <div className="profile-card__title">
          <span className="profile-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M15 18H6a3 3 0 0 1-3-3v-1a7 7 0 0 1 14 0v1" />
              <path d="M18 8a6 6 0 0 0-12 0" />
              <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2z" />
            </svg>
          </span>
          <div>
            <h2>Thông báo</h2>
            <p>Quản lý cài đặt thông báo</p>
          </div>
        </div>
        <div className="profile-toggle profile-toggle--split">
          <div>
            <p className="profile-label">Thông báo email</p>
            <p className="profile-helper">Nhận email khi có công việc mới được giao</p>
          </div>
          <label className="switch">
            <input type="checkbox" defaultChecked />
            <span className="slider" />
          </label>
        </div>
        <div className="profile-divider" />
        <div className="profile-toggle profile-toggle--split">
          <div>
            <p className="profile-label">Thông báo trình duyệt</p>
            <p className="profile-helper">Hiển thị thông báo trên trình duyệt</p>
          </div>
          <label className="switch">
            <input type="checkbox" />
            <span className="slider" />
          </label>
        </div>
      </section>
    </div>
  );
}
