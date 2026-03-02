import { useEffect, useMemo, useState } from "react";
import FilterSelect from "../components/FilterSelect";
import IconButton from "../components/IconButton";
import ModalShell from "../components/ModalShell";
import PageHeader from "../components/PageHeader";
import PaginationFooter from "../components/PaginationFooter";
import SearchField from "../components/SearchField";
import TableCard from "../components/TableCard";
import { registerApi, getAllUsers, updateUser } from "../api/auth.api";
import { ListUsers, User } from "../types/auth.type";
import { getCurrentUser } from "../utils/storage";

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase() || "U";
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
};

export default function Users() {
  const [users, setUsers] = useState<ListUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [searchRole, setSearchRole] = useState("all");
  const [searchStatus, setSearchStatus] = useState<"all" | "active" | "inactive">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [openFilter, setOpenFilter] = useState<"role" | "status" | null>(null);
  const [formValue, setFormValue] = useState({
    username: "",
    email: "",
    password: "",
    role: "staff",
  });
  const [disableModalUser, setDisableModalUser] = useState<User | null>(null);
  const currentUser = getCurrentUser<User>();
  const isAdmin = (currentUser?.groups?.[0] || "").toLowerCase() === "admin";
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      setUsers(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Lỗi tải dữ liệu người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenFilter(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  const resetCreateForm = () => {
    setFormValue({
      username: "",
      email: "",
      password: "",
      role: "staff",
    });
  }
  const closeCreateModal = () => {
    setShowCreateModal(false);
    resetCreateForm();
    setErrorMessage(null);
    setEdittingUserId(null);
  }
  const rows = useMemo(() => users?.results ?? [], [users]);
  const getStatusKey = (user: User): "active" | "inactive" => {
    const isActive = user.is_active;
    // Kiểm tra inactive trước
    if (isActive === false) {
      return "inactive";
    }
    // Mọi trường hợp khác (true, undefined) -> active
    return "active";
  };

  const renderStatus = (user: User) => {
    const statusKey = getStatusKey(user);
    const statusText = statusKey === "active" ? "Hoạt động" : "Không hoạt động";
    const statusClass =
      statusKey === "active"
        ? "bg-[#e9f9ee] text-[#16a34a]"
        : "bg-[#fef3c7] text-[#d97706]";
    return (
      <span
        className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[14px] font-medium ${statusClass} [[data-theme=dark]_&]:bg-[var(--ring-track)]`}
      >
        <span className="h-2 w-2 rounded-full bg-current" />
        {statusText}
      </span>
    );
  };

  const renderRole = (user: User) => {
    const roleText = Array.isArray(user.groups)
      ? user.groups[0] ?? "Người dùng"
      : user.groups ?? "Người dùng";
    const normalizedRole = roleText.toLowerCase();
    const displayRole =
      normalizedRole.includes("admin") ? "Quản trị viên" : "Người dùng";
    const roleClassName = normalizedRole.includes("admin")
      ? "text-[#4f46e5]"
      : "text-[var(--muted)]";
    return (
      <span
        className={`inline-flex w-fit rounded-full bg-[#eef2ff] px-3 py-1 text-[14px] font-medium ${roleClassName} [[data-theme=dark]_&]:bg-[var(--ring-track)]`}
      >
        {displayRole}
      </span>
    );
  };
  const filteredUsers = useMemo(() => {
    return rows.filter((t) => {
      const text = searchText.trim().toLowerCase();
      const matchesText =
        !text ||
        (t.username ?? "").toLowerCase().includes(text) ||
        (t.email ?? "").toLowerCase().includes(text);

      // Get user's role (first group)
      const userRole = (t.groups?.[0] ?? "").toLowerCase();
      
      let matchesRole = false;
      if (searchRole === "all") {
        matchesRole = true;
      } else if (searchRole === "admin") {
        // Only match admin
        matchesRole = userRole.includes("admin");
      } else if (searchRole === "staff") {
        // Match all non-admin users (staff, manager, etc.)
        matchesRole = !userRole.includes("admin");
      }

      const statusKey = getStatusKey(t);
      const matchesStatus = searchStatus === "all" || statusKey === searchStatus;

      return matchesText && matchesRole && matchesStatus;
    });
  }, [rows, searchRole, searchStatus, searchText]);
  const roleOptions = [
    { value: "all", label: "Tất cả vai trò" },
    { value: "admin", label: "Quản trị viên" },
    { value: "staff", label: "Người dùng" },
  ];
  const statusOptions: { value: "all" | "active" | "inactive"; label: string }[] = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Không hoạt động" },
  ];
  const currentRoleLabel =
    roleOptions.find((option) => option.value === searchRole)?.label ??
    "Tất cả vai trò";
  const currentStatusLabel =
    statusOptions.find((option) => option.value === searchStatus)?.label ??
    "Tất cả trạng thái";
  const totalResults = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, searchRole, searchStatus, pageSize]);
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  const pagedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);
  if (loading) return <p className="m-0 text-[var(--muted)]">Loading users...</p>;
  if (error) return <p className="m-0 text-[#b91c1c]">{error}</p>;
  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    if (!formValue.username || !formValue.email) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (!isEditMode && !formValue.password) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (isEditMode && edittingUserId) {
      try {
        await updateUser({
          id: edittingUserId,
          username: formValue.username,
          email: formValue.email,
          groups: [formValue.role],
        });
        setSuccessMessage("Cập nhật người dùng thành công.");
        await fetchUsers();
        closeCreateModal();
      } catch (err: any) {
        setErrorMessage(err.response?.data?.error || "Lỗi cập nhật người dùng");
      }
      return;
    }
    
    try {
      await registerApi({
        user: {
          username: formValue.username,
          email: formValue.email,
          password: formValue.password,
        }
      });
      setSuccessMessage("Tạo người dùng thành công.");
      await fetchUsers();
      closeCreateModal();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || "Lỗi tạo người dùng");
    }
  }
  const openEditModal = (user: User) => {
    setFormValue({
      username: user.username,
      email: user.email ?? "",
      password: "",
      role: (user.groups?.[0] ?? "staff").toLowerCase(),
    });
    setEdittingUserId(user.id);
    setShowCreateModal(true);
  };

  const openDisableModal = (user: User) => {
    setDisableModalUser(user);
  };

  const closeDisableModal = () => {
    setDisableModalUser(null);
  };

  const handleToggleUserStatus = async () => {
    if (!disableModalUser) return;
    
    const currentStatus = getStatusKey(disableModalUser);
    const newStatus = currentStatus === "inactive";
    
    try {
      await updateUser({
        id: disableModalUser.id,
        is_active: newStatus,
      });
      
      const message = newStatus 
        ? `Đã kích hoạt tài khoản "${disableModalUser.username}" thành công.`
        : `Đã vô hiệu hóa tài khoản "${disableModalUser.username}" thành công.`;
      setSuccessMessage(message);
      await fetchUsers();
      closeDisableModal();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || "Lỗi cập nhật trạng thái người dùng");
    }
  };
  return (
    <>
    <div className="users-page">
    <PageHeader
        title="Quản lý người dùng"
        subtitle="Quản lý tài khoản và phân quyền người dùng"
        actionLabel={isAdmin ? "Thêm người dùng" : undefined}
        onAction={isAdmin ? () => {
          setEdittingUserId(null);
          resetCreateForm();
          setShowCreateModal(true);
        } : undefined}
    />
    <div className="my-5 grid gap-3 rounded-[12px] border border-[var(--border)] bg-white p-3.5 [[data-theme=dark]_&]:bg-[var(--card)]">
        <SearchField
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Tìm kiếm theo tên hoặc email..."
        />
        <div className="flex flex-wrap gap-3">
          <FilterSelect
            id="user-role-filter"
            label={currentRoleLabel}
            isOpen={openFilter === "role"}
            onOpenChange={(open) => setOpenFilter(open ? "role" : null)}
            options={roleOptions}
            selectedValue={searchRole}
            onSelect={(value) => {
              setSearchRole(value);
              setOpenFilter(null);
            }}
          />
          <FilterSelect
            id="user-status-filter"
            label={currentStatusLabel}
            isOpen={openFilter === "status"}
            onOpenChange={(open) => setOpenFilter(open ? "status" : null)}
            options={statusOptions}
            selectedValue={searchStatus}
            onSelect={(value) => {
              setSearchStatus(value as "all" | "active" | "inactive");
              setOpenFilter(null);
            }}
          />
        </div>
    </div>
    {successMessage && (
      <div className="fixed right-6 top-6 z-[60] flex items-center gap-3 rounded-full border border-[#bbf7d0] bg-[#ecfdf3] px-3.5 py-2.5 text-[0.9rem] font-medium text-[#166534] shadow-[0_10px_30px_rgba(15,23,42,0.12)]" role="status">
        <span>{successMessage}</span>
        <button
          className="bg-transparent px-1 text-[1.2rem]"
          type="button"
          aria-label="Dong thong bao"
          onClick={() => setSuccessMessage(null)}
        >
          ×
        </button>
      </div>
    )}
    {errorMessage && (
      <div className="fixed right-6 top-6 z-[60] flex items-center gap-3 rounded-full border border-[#fecaca] bg-[#fef2f2] px-3.5 py-2.5 text-[0.9rem] font-medium text-[#b91c1c] shadow-[0_10px_30px_rgba(15,23,42,0.12)]" role="alert">
        <span>{errorMessage}</span>
        <button
          className="bg-transparent px-1 text-[1.2rem]"
          type="button"
          aria-label="Dong thong bao"
          onClick={() => setErrorMessage(null)}
        >
          ×
        </button>
      </div>
    )}
    <TableCard>
      <div className="grid gap-0">
        <div className={`grid ${isAdmin ? 'grid-cols-[2fr_2fr_1.2fr_1.2fr_1fr_120px]' : 'grid-cols-[2fr_2fr_1.2fr_1.2fr_1fr]'} items-center gap-4 border-b border-[var(--border)] bg-[#f8fafc] px-4 py-3 font-semibold text-[var(--text)] max-[900px]:hidden [[data-theme=dark]_&]:bg-[var(--surface)]`}>
          <span>Người dùng</span>
          <span>Email</span>
          <span>Vai trò</span>
          <span>Trạng thái</span>
          <span>Ngày tạo</span>
          {isAdmin && <span className="text-right">Thao tác</span>}
        </div>
        {pagedUsers.map((user, index) => (
          <div
            className={`grid ${isAdmin ? 'grid-cols-[2fr_2fr_1.2fr_1.2fr_1fr_120px]' : 'grid-cols-[2fr_2fr_1.2fr_1.2fr_1fr]'} items-center gap-4 border-b border-[var(--border)] px-4 py-3 text-[14px] last:border-b-0 max-[900px]:grid-cols-1 max-[900px]:gap-2`}
            key={`${user.id}-${index}`}
          >
            <div className="flex items-center gap-3.5">
              <div className="grid h-[42px] w-[42px] place-items-center rounded-full bg-[#eef2ff] font-semibold text-[#4f46e5] [[data-theme=dark]_&]:bg-[var(--ring-track)] [[data-theme=dark]_&]:text-[var(--nav-active-text)]">
                {getInitials(user.username)}
              </div>
              <div>
                <p className="m-0 font-semibold">{user.username}</p>
              </div>
            </div>
            <span className="text-[var(--muted)]">{user.email ?? "—"}</span>
            {renderRole(user)}
            {renderStatus(user)}
            <span className="text-[var(--muted)]">{formatDate(user.date_joined)}</span>
            {isAdmin && (
              <div className="flex justify-end gap-2.5 max-[900px]:justify-start">
                <IconButton
                  ariaLabel="Edit user"
                  onClick={() => openEditModal(user)}
                  className="h-8 w-8"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 20h4l10-10-4-4L4 16v4z" />
                    <path d="M14 6l4 4" />
                  </svg>
                </IconButton>
                <IconButton
                  ariaLabel={getStatusKey(user) === "active" ? "Vô hiệu hóa" : "Kích hoạt"}
                  onClick={() => openDisableModal(user)}
                  variant={getStatusKey(user) === "active" ? "danger" : "success"}
                  className="h-8 w-8"
                >
                  {getStatusKey(user) === "active" ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="7" r="4" />
                      <path d="M4 21c1.8-4 14.2-4 16 0" />
                      <path d="M18 6l4 4m0-4l-4 4" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="7" r="4" />
                      <path d="M4 21c1.8-4 14.2-4 16 0" />
                      <path d="M17 8l2 2 4-4" />
                    </svg>
                  )}
                </IconButton>
              </div>
            )}
          </div>
        ))}
      </div>
      <PaginationFooter
        totalResults={totalResults}
        pageSize={pageSize}
        pageSizeOptions={[5, 10, 20, 50]}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageSizeChange={setPageSize}
        onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        onNext={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
      />
    </TableCard>
    {showCreateModal && (
      <ModalShell
        onClose={() => setShowCreateModal(false)}
        contentClassName="w-[min(460px,100%)] rounded-[12px] border border-[#e5e7eb] bg-white px-[18px] pb-[18px] pt-4 shadow-[0_24px_70px_rgba(15,23,42,0.2)] [[data-theme=dark]_&]:border-[var(--border)] [[data-theme=dark]_&]:bg-[#0b1220] [[data-theme=dark]_&]:text-[var(--text)]"
        contentProps={{ role: "dialog", "aria-modal": true }}
      >
          <header className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="mb-1 text-[1.15rem] font-semibold">
                {isEditMode ? "Chỉnh sửa người dùng" : "Tạo người dùng mới"}
              </h2>
              <p className="m-0 text-[0.9rem] text-[#64748b] [[data-theme=dark]_&]:text-[var(--muted)]">
                {isEditMode ? "Cập nhật thông tin người dùng" : "Điền thông tin để tạo người dùng mới"}
              </p>
            </div>
            <button
              className="bg-transparent px-1 text-[1.4rem] text-[var(--muted)]"
              type="button"
              aria-label="Dong"
              onClick={() => setShowCreateModal(false)}
            >
              ×
            </button>
          </header>
          <form className="grid gap-3.5" onSubmit={handleCreateUser}>
            <label className="grid gap-2 text-[0.9rem] text-[var(--text)]"> 
              <span>Họ và tên *</span>
              <input 
                type="text"
                placeholder="Nhập họ và tên"
                value={formValue.username}
                onChange={(e) => setFormValue({ ...formValue, username: e.target.value })}
                className="w-full rounded-[10px] border border-[#e2e8f0] bg-white px-3 py-2.5 text-[var(--text)] outline-none focus:border-[#6366f1] focus:outline-2 focus:outline-[rgba(79,70,229,0.2)] [[data-theme=dark]_&]:border-[var(--border)] [[data-theme=dark]_&]:bg-[var(--surface)]"
              />
            </label>
            <label className="grid gap-2 text-[0.9rem] text-[var(--text)]">
              <span>Email *</span>
              <input 
                type="email"
                placeholder="Nhập email"
                value={formValue.email}
                onChange={(e) => setFormValue({ ...formValue, email: e.target.value })}
                readOnly={isEditMode}
                className="w-full rounded-[10px] border border-[#e2e8f0] bg-white px-3 py-2.5 text-[var(--text)] outline-none focus:border-[#6366f1] focus:outline-2 focus:outline-[rgba(79,70,229,0.2)] read-only:bg-[#f8fafc] [[data-theme=dark]_&]:border-[var(--border)] [[data-theme=dark]_&]:bg-[var(--surface)]"
              />
            </label>
            {isEditMode && (
              <label className="grid gap-2 text-[0.9rem] text-[var(--text)]">
                <span>Vai trò</span>
                <select
                  value={formValue.role}
                  onChange={(e) => setFormValue({ ...formValue, role: e.target.value })}
                  className="w-full rounded-[10px] border border-[#e2e8f0] bg-white px-3 py-2.5 text-[var(--text)] outline-none focus:border-[#6366f1] focus:outline-2 focus:outline-[rgba(79,70,229,0.2)] [[data-theme=dark]_&]:border-[var(--border)] [[data-theme=dark]_&]:bg-[var(--surface)]"
                >
                  <option value="admin">Quản trị viên</option>
                  <option value="staff">Người dùng</option>
                </select>
              </label>
            )}
            {!isEditMode && (
              <label className="grid gap-2 text-[0.9rem] text-[var(--text)]">
                <span>Mật khẩu *</span>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={formValue.password}
                  onChange={(e) => setFormValue({ ...formValue, password: e.target.value })}
                  className="w-full rounded-[10px] border border-[#e2e8f0] bg-white px-3 py-2.5 text-[var(--text)] outline-none focus:border-[#6366f1] focus:outline-2 focus:outline-[rgba(79,70,229,0.2)] [[data-theme=dark]_&]:border-[var(--border)] [[data-theme=dark]_&]:bg-[var(--surface)]"
                />
              </label>
            )}
             <div className="mt-2 flex justify-end gap-3">
              <button
                  className="rounded-[10px] border border-[#e2e8f0] bg-transparent px-4 py-2 text-[var(--text)] [[data-theme=dark]_&]:border-[var(--border)] [[data-theme=dark]_&]:bg-[var(--surface)]"
                  type="button"
                  onClick={closeCreateModal}
              >
                  Hủy
              </button>
              <button className="rounded-[10px] bg-[#6366f1] px-[18px] py-2 text-white font-medium" type="submit" >
                { isEditMode ? "Cập nhật" : "Tạo người dùng"}
              </button>
          </div>
          </form>
      </ModalShell>
    )}
    {disableModalUser && (
      <ModalShell
        onClose={closeDisableModal}
        wrapperClassName="z-[1001]"
        contentClassName="w-[min(480px,92vw)] rounded-[12px] border border-[#e5e7eb] bg-white px-5 pb-5 pt-[18px] shadow-[0_24px_70px_rgba(15,23,42,0.25)] [[data-theme=dark]_&]:border-[var(--border)] [[data-theme=dark]_&]:bg-[#0b1220] [[data-theme=dark]_&]:text-[var(--text)]"
        contentProps={{ role: "dialog", "aria-modal": true }}
      >
          <header>
            <h3 className="mb-2 text-[1.05rem] font-semibold">
              {getStatusKey(disableModalUser) === "active" 
                ? "Vô hiệu hóa tài khoản" 
                : "Kích hoạt tài khoản"}
            </h3>
          </header>
          <div className="grid gap-1.5 text-[0.9rem] text-[var(--muted)]">
            {getStatusKey(disableModalUser) === "active" ? (
              <>
                <p className="m-0">
                  Bạn có chắc chắn muốn vô hiệu hóa tài khoản "{disableModalUser.username}"?
                </p>
                <p className="m-0">Người dùng sẽ không thể đăng nhập.</p>
              </>
            ) : (
              <>
                <p className="m-0">
                  Bạn có chắc chắn muốn kích hoạt lại tài khoản "{disableModalUser.username}"?
                </p>
                <p className="m-0">Người dùng sẽ có thể đăng nhập trở lại.</p>
              </>
            )}
          </div>
          <div className="mt-4 flex justify-end gap-2.5">
            <button
              className="rounded-[8px] border border-[#e2e8f0] bg-white px-3.5 py-2 text-[var(--text)] hover:bg-[#f8fafc] [[data-theme=dark]_&]:border-[var(--border)] [[data-theme=dark]_&]:bg-[var(--surface)]"
              type="button"
              onClick={closeDisableModal}
            >
              Hủy
            </button>
            <button 
              className={getStatusKey(disableModalUser) === "active" 
                ? "rounded-[8px] bg-[#ef4444] px-3.5 py-2 text-white hover:bg-[#dc2626]" 
                : "rounded-[8px] bg-[#6366f1] px-3.5 py-2 text-white hover:bg-[#4f46e5]"}
              type="button"
              onClick={handleToggleUserStatus}
            >
              {getStatusKey(disableModalUser) === "active" ? "Vô hiệu hóa" : "Kích hoạt"}
            </button>
          </div>
      </ModalShell>
    )}
    </div>
    </>
  );
}
