import { useEffect, useMemo, useState } from "react";
import { User } from "../types/auth.type";
import { getCurrentUser, setCurrentUser } from "../utils/storage";
import { updateUser } from "../api/auth.api";
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
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", password: "", is_active: true });
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  useEffect(() => {
    const localProfile = getCurrentUser<User>();
    if (!localProfile) {
      setError("Không tìm thấy thông tin tài khoản.");
      setLoading(false);
      return;
    }
    setProfile(localProfile);
    setEditForm({ username: localProfile.username, password: "", is_active: Boolean(localProfile.is_active) });
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setUpdateError(null);
    setUpdateSuccess(null);
    
    try {
        const payload: any = {
            id: profile.id,
            username: editForm.username.trim(),
            is_active: editForm.is_active
        };
        if (editForm.password.trim().length > 0) {
            payload.password = editForm.password;
        }

        const res = await updateUser(payload);
        
        // Update local state
        const updatedUser = { 
            ...profile, 
            username: res.data.user.username,
            is_active: res.data.user.is_active
        };
        setProfile(updatedUser);
        setCurrentUser(updatedUser); // Update localStorage
        setEditForm({ username: updatedUser.username, password: "", is_active: Boolean(updatedUser.is_active) });
        setIsEditing(false);
        setUpdateSuccess("Cập nhật thông tin thành công!");
    } catch (err: any) {
        setUpdateError(err.response?.data?.error || "Lỗi cập nhật thông tin.");
    }
  };

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

        <div className="profile-summary" style={{ alignItems: "flex-start", position: "relative" }}>
          <div className="profile-avatar mt-1">{initials}</div>
          <div className="w-full" style={{ flex: 1 }}>
            {!isEditing ? (
              <div className="flex justify-between items-start w-full gap-4">
                <div>
                  <p className="profile-name">{profile?.username ?? "—"}</p>
                  <p className="profile-email">{profile?.email ?? "—"}</p>
                </div>
                <button 
                  className="rounded-[6px] border border-[#e2e8f0] bg-white px-3 py-1.5 text-[0.85rem] text-[var(--text)] hover:bg-[#f8fafc] [[data-theme=dark]_&]:border-[var(--border)] [[data-theme=dark]_&]:bg-[var(--surface)] transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  Chỉnh sửa
                </button>
              </div>
            ) : (
                <form onSubmit={handleUpdateProfile} className="grid w-full gap-3">
                  <label className="grid gap-1.5 text-[0.85rem] text-[var(--text)]">
                    <span className="font-medium text-[#64748b]">Tên hiển thị</span>
                    <input 
                      type="text" 
                      value={editForm.username}
                      onChange={e => setEditForm({...editForm, username: e.target.value})}
                      className="w-full rounded-[8px] border border-[#e2e8f0] bg-white px-3 py-2 text-[0.95rem] text-[var(--text)] outline-none focus:border-[#6366f1] focus:outline-2 focus:outline-[rgba(79,70,229,0.2)] [[data-theme=dark]_&]:border-[var(--border)] [[data-theme=dark]_&]:bg-[var(--surface)]"
                      required
                    />
                  </label>
                  
                  <label className="grid gap-1.5 text-[0.85rem] text-[var(--text)]">
                    <span className="font-medium text-[#64748b]">Email (Không thể đổi)</span>
                    <input 
                      type="email" 
                      value={profile?.email ?? ""}
                      readOnly
                      className="w-full rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-[0.95rem] text-[var(--muted)] cursor-not-allowed outline-none [[data-theme=dark]_&]:border-[var(--border)] [[data-theme=dark]_&]:bg-[#0b1220]"
                    />
                  </label>

                  <label className="grid gap-1.5 text-[0.85rem] text-[var(--text)]">
                    <span className="font-medium text-[#64748b]">Mật khẩu mới (Tùy chọn)</span>
                    <input 
                      type="password" 
                      placeholder="Để trống nếu không đổi mật khẩu"
                      value={editForm.password}
                      onChange={e => setEditForm({...editForm, password: e.target.value})}
                      className="w-full rounded-[8px] border border-[#e2e8f0] bg-white px-3 py-2 text-[0.95rem] text-[var(--text)] outline-none focus:border-[#6366f1] focus:outline-2 focus:outline-[rgba(79,70,229,0.2)] [[data-theme=dark]_&]:border-[var(--border)] [[data-theme=dark]_&]:bg-[var(--surface)]"
                    />
                  </label>

                  <div className="flex items-center justify-between mt-1 mb-2">
                    <div className="grid gap-0.5">
                      <span className="text-[0.85rem] font-medium text-[var(--text)]">Trạng thái hoạt động</span>
                      <span className="text-[0.75rem] text-[var(--muted)]">Cho phép tài khoản đăng nhập vào hệ thống</span>
                    </div>
                    <label className="switch" style={{ transform: "scale(0.85)", transformOrigin: "right center" }}>
                      <input 
                        type="checkbox" 
                        checked={editForm.is_active} 
                        onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})} 
                      />
                      <span className="slider" />
                    </label>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-end gap-2.5">
                    <button 
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({ username: profile?.username || "", password: "", is_active: Boolean(profile?.is_active) });
                      }}
                      className="rounded-[6px] px-3 py-1.5 text-[0.85rem] font-medium text-[var(--muted)] hover:bg-[#f1f5f9] [[data-theme=dark]_&]:hover:bg-[var(--border)] transition-colors"
                    >
                      Hủy
                    </button>
                    <button 
                      type="submit"
                      className="rounded-[6px] bg-[#6366f1] px-4 py-1.5 text-[0.85rem] font-medium text-white shadow-sm hover:bg-[#4f46e5] transition-colors"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
            )}
          </div>
        </div>

        {updateSuccess && (
          <div className="mt-3 mx-5 mb-2 rounded-[8px] bg-[#ecfdf3] px-3 py-2 text-[0.85rem] font-medium text-[#166534] border border-[#bbf7d0]">
            {updateSuccess}
          </div>
        )}
        {updateError && (
          <div className="mt-3 mx-5 mb-2 rounded-[8px] border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[0.85rem] font-medium text-[#b91c1c]">
            {updateError}
          </div>
        )}

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
