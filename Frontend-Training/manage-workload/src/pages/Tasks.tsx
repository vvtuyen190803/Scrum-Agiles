import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Button, DatePicker, Input, Modal, Select } from "antd";
import dayjs from "dayjs";
import FilterSelect from "../components/FilterSelect";
import IconButton from "../components/IconButton";
import PageHeader from "../components/PageHeader";
import TableCard from "../components/TableCard";
import PaginationFooter from "../components/PaginationFooter";
import SearchField from "../components/SearchField";
import { getTasks, createTask, updateTask, deleteTask, getAllUsers } from "../api/auth.api";
import { Task, User } from "../types/auth.type";
import { getCurrentUser } from "../utils/storage";

type CreateTaskPayload = {
    title: string;
    description: string;
    status: string;
    priority: string;
    assignee?: number;
    due_date?: string;
};

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [formValues, setFormValues] = useState<{
        title: string;
        description: string;
        status: string;
        priority: string;
        assignee: string;
        dueDate: string;
    }>({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        assignee: "",
        dueDate: "",
    });
    const [ viewTaskId, setViewTaskId ] = useState<number | null>(null);
    const [viewTask, setViewTask] = useState<Task | null>(null);
    const isviewMode = Boolean(viewTaskId);
    const isEditMode = Boolean(editingTaskId);
    const [users, setUsers] = useState<User[]>([]);
    
    const currentUser = getCurrentUser<User>();
    const isAdmin = (currentUser?.groups?.[0] || "").toLowerCase() === "admin";

    const statusOptions = [
        { value: "pending", label: "Chờ xử lý" },
        { value: "in_progress", label: "Đang thực hiện" },
        { value: "completed", label: "Hoàn thành" },
        { value: "cancelled", label: "Đã hủy" },
    ];

    const priorityOptions = [
        { value: "high", label: "Cao" },
        { value: "medium", label: "Trung bình" },
        { value: "low", label: "Thấp" },
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return (
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="7" />
                        <path d="M9 12l2 2 4-4" />
                    </svg>
                );
            case "in_progress":
                return (
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 3v3" />
                        <path d="M12 18v3" />
                        <path d="M4.6 4.6l2.1 2.1" />
                        <path d="M17.3 17.3l2.1 2.1" />
                        <path d="M3 12h3" />
                        <path d="M18 12h3" />
                        <path d="M4.6 19.4l2.1-2.1" />
                        <path d="M17.3 6.7l2.1-2.1" />
                    </svg>
                );
            case "cancelled":
                return (
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="7" />
                        <path d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                );
            default:
                return (
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="7" />
                        <path d="M12 8v4l2 2" />
                    </svg>
                );
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case "high":
                return (
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 5v14" />
                        <path d="M5 12l7-7 7 7" />
                    </svg>
                );
            case "low":
                return (
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 5v14" />
                        <path d="M5 12l7 7 7-7" />
                    </svg>
                );
            default:
                return (
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M5 12h14" />
                    </svg>
                );
        }
    };

    const normalizeDateValue = (value?: string) => {
        if (!value) return "";
        return value.slice(0, 10);
    };
    const formatDisplayDate = (value?: string) => {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString("vi-VN");
    };
    const getAssigneeName = (assigneeId?: number) => {
        if (!assigneeId) return "-";
        const user = users.find(u => u.id === assigneeId);
        return user?.username ?? `User #${assigneeId}`;
    };
    const handleViewTask = (task: Task) => {
        setViewTaskId(task.id);
        setViewTask(task);
        setEditingTaskId(null);
        setCreateError(null);
        setShowCreateModal(true);
    }
    useEffect(() => {
        const loadUsers = async () => {
             const res = await getAllUsers();
             setUsers(res.data.results);
        };
        loadUsers();
    }, []);
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsStatusFilterOpen(false);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);


    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await getTasks();
            setTasks(res.data);
        } catch (err: any) {
             setError(err.response?.data?.error || "Lỗi tải dữ liệu công việc");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const resetCreateForm = () => {
        setFormValues({
            title: "",
            description: "",
            status: "pending",
            priority: "medium",
            assignee: "",
            dueDate: "",
        });
        setEditingTaskId(null);
        setCreateError(null);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        setViewTaskId(null);
        setViewTask(null);
        resetCreateForm();
    };

    const statusLabel = (value?: string) => {
        const statusValue = String(value ?? "").toLowerCase();
        if (statusValue.includes("complete")) return "Hoàn thành";
        if (statusValue.includes("progress")) return "Đang thực hiện";
        if (statusValue.includes("pending") || statusValue.includes("wait")) return "Chờ xử lý";
        if (statusValue.includes("cancel")) return "Đã hủy";
        return value ?? "-";
    };
    const priorityLabel = (value?: string) => {
        const priorityValue = String(value ?? "").toLowerCase();
        if (priorityValue.includes("high")) return "Cao";
        if (priorityValue.includes("medium")) return "Trung bình";
        if (priorityValue.includes("low")) return "Thấp";
        return value ?? "-";
    };
    const badgeBase =
        "inline-flex w-fit items-center justify-center gap-1.5 rounded-full px-3 py-1 text-[14px] font-semibold whitespace-nowrap";
    const badgeDark = "[[data-theme=dark]_&]:bg-[var(--ring-track)]";
    const statusClassName = (value?: string) => {
        const statusValue = String(value ?? "").toLowerCase();
        if (statusValue.includes("complete")) {
            return `${badgeBase} bg-[#dcfce7] text-[#16a34a] ${badgeDark}`;
        }
        if (statusValue.includes("progress")) {
            return `${badgeBase} bg-[#e0f2fe] text-[#0284c7] ${badgeDark}`;
        }
        if (statusValue.includes("pending") || statusValue.includes("wait")) {
            return `${badgeBase} bg-[#fef3c7] text-[#d97706] ${badgeDark}`;
        }
        if (statusValue.includes("cancel")) {
            return `${badgeBase} bg-[#f3f4f6] text-[#6b7280] ${badgeDark}`;
        }
        return `${badgeBase} bg-[#e0f2fe] text-[#0369a1] ${badgeDark}`;
    };
    const priorityClassName = (value?: string) => {
        const priorityValue = String(value ?? "").toLowerCase();
        if (priorityValue.includes("high")) {
            return `${badgeBase} bg-[#fee2e2] text-[#dc2626] ${badgeDark}`;
        }
        if (priorityValue.includes("medium")) {
            return `${badgeBase} bg-[#e0f2fe] text-[#0284c7] ${badgeDark}`;
        }
        if (priorityValue.includes("low")) {
            return `${badgeBase} bg-[#f3f4f6] text-[#6b7280] ${badgeDark}`;
        }
        return `${badgeBase} bg-[#e0f2fe] text-[#0369a1] ${badgeDark}`;
    };
    const formatStatusWithIcon = (value?: string) => {
        const statusValue = String(value ?? "").toLowerCase();
        let icon = (
            <>
                <circle cx="12" cy="12" r="7" />
                <path d="M12 8v4l2 2" />
            </>
        );
        if (statusValue.includes("complete")) {
            icon = (
                <>
                    <circle cx="12" cy="12" r="7" />
                    <path d="M9 12l2 2 4-4" />
                </>
            );
        } else if (statusValue.includes("progress")) {
            icon = (
                <>
                    <path d="M12 3v3" />
                    <path d="M12 18v3" />
                    <path d="M4.6 4.6l2.1 2.1" />
                    <path d="M17.3 17.3l2.1 2.1" />
                    <path d="M3 12h3" />
                    <path d="M18 12h3" />
                    <path d="M4.6 19.4l2.1-2.1" />
                    <path d="M17.3 6.7l2.1-2.1" />
                </>
            );
        } else if (statusValue.includes("cancel")) {
            icon = (
                <>
                    <circle cx="12" cy="12" r="7" />
                    <path d="M9 9l6 6M15 9l-6 6" />
                </>
            );
        }
        return (
            <>
                <span className="inline-flex h-4 w-4" aria-hidden="true">
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        {icon}
                    </svg>
                </span>
                {statusLabel(value)}
            </>
        );
    };
    const formatPriorityWithIcon = (value?: string) => {
        const priorityValue = String(value ?? "").toLowerCase();
        return (
            <>
                <span className="inline-flex h-4 w-4" aria-hidden="true">
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        {priorityValue.includes("high") ? (
                            <path d="M12 5v14M7 10l5-5 5 5" />
                        ) : priorityValue.includes("low") ? (
                            <path d="M12 5v14M7 14l5 5 5-5" />
                        ) : (
                            <path d="M7 12h10" />
                        )}
                    </svg>
                </span>
                {priorityLabel(value)}
            </>
        );
    };

    const openEditModal = (task: Task) => {
        setFormValues({
            title: task.title ?? "",
            description: task.description ?? "",
            status: String(task.status ?? "pending").toLowerCase(),
            priority: String(task.priority ?? "medium").toLowerCase(),
            assignee: task.assignee ? String(task.assignee) : "",
            dueDate: normalizeDateValue(task.due_date),
        });
        setEditingTaskId(task.id ?? null);
        setCreateError(null);
        setShowCreateModal(true);
    };

    const renderContent = (filteredTasks?: any[]) => {
        if (loading) return <p className="m-0 text-[var(--muted)]">Loading tasks...</p>;
        if (error) return <p className="m-0 text-[#b91c1c]">{error}</p>;
        if (!tasks.length) return <p className="m-0 text-[var(--muted)]">No tasks available yet.</p>;

        const safeTasks = filteredTasks ?? [];

        return (
            <div className="grid gap-0">
                <div className="grid grid-cols-[2.4fr_1.4fr_1.1fr_1.1fr_1fr_0.8fr] items-center gap-4 border-b border-[var(--border)] bg-[#f8fafc] px-4 py-3 font-semibold text-[var(--text)] max-[640px]:hidden [[data-theme=dark]_&]:bg-[var(--surface)]">
                    <span>Tiêu đề</span>
                    <span>Người thực hiện</span>
                    <span>Trạng thái</span>
                    <span>Độ ưu tiên</span>
                    <span>Hạn hoàn thành</span>
                    <span className="text-right">Thao tác</span>
                </div>
                {safeTasks.map((task, index) => {
                    const statusValue = String(task.status ?? "");
                    const priorityValue = String(task.priority ?? "");
                    const statusClass = statusClassName(statusValue);
                    const priorityClass = priorityClassName(priorityValue);
                    return (
                        <div
                            key={String(task.id ?? task.title ?? index)}
                            className="grid grid-cols-[2.4fr_1.4fr_1.1fr_1.1fr_1fr_0.8fr] items-center gap-4 border-b border-[var(--border)] px-4 py-3 text-[14px] last:border-b-0 max-[640px]:grid-cols-1 max-[640px]:gap-2.5"
                        >
                            <div className="grid gap-1.5 text-[var(--text)]">
                                <p className="m-0 truncate font-semibold">
                                    {task.title ?? `Task ${index + 1}`}
                                </p>
                                {task.description && (
                                    <p className="m-0 max-w-[260px] truncate text-[14px] text-[var(--muted)]">
                                        {task.description}
                                    </p>
                                )}
                            </div>
                            <span className="text-[var(--text)]">{getAssigneeName(task.assignee)}</span>
                            <span className={statusClass}>
                                {formatStatusWithIcon(statusValue)}
                            </span>
                            <span className={priorityClass}>
                                {formatPriorityWithIcon(priorityValue)}
                            </span>
                            <span className="text-[var(--text)]">{formatDisplayDate(task.due_date)}</span>
                            <div className="flex justify-end gap-2">
                                <IconButton
                                    ariaLabel="Xem công việc"
                                    onClick={() => handleViewTask(task)}
                                    className="h-8 w-8 text-[#667085]"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-[18px] w-[18px]"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={1.8}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                </IconButton>
                                {isAdmin && (
                                    <>
                                        <IconButton
                                            ariaLabel="Chỉnh sửa công việc"
                                            onClick={() => openEditModal(task)}
                                            className="h-8 w-8 text-[#667085]"
                                        >
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="h-[18px] w-[18px]"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={1.8}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                aria-hidden="true"
                                            >
                                                <path d="M4 20h4l10-10-4-4L4 16v4z" />
                                                <path d="M14 6l4 4" />
                                            </svg>
                                        </IconButton>
                                        <IconButton
                                            ariaLabel="Xóa công việc"
                                            onClick={() => handleDeleteTask(task)}
                                            variant="danger"
                                            className="h-8 w-8 text-[#667085]"
                                        >
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="h-[18px] w-[18px]"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={1.8}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                aria-hidden="true"
                                            >
                                                <path d="M3 6h18" />
                                                <path d="M8 6V4h8v2" />
                                                <path d="M9 10v6M15 10v6" />
                                                <path d="M5 6l1 14h12l1-14" />
                                            </svg>
                                        </IconButton>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };
    const activeUsers = useMemo(() => users.filter(u => u.is_active !== false), [users]);
    const filteredTasks = useMemo(() => tasks.filter((t) => {
        const text = searchText.trim().toLowerCase();
        const matchesText =
            !text ||
            (t.title && t.title.toLowerCase().includes(text)) ||
            (t.description && t.description.toLowerCase().includes(text));
        const matchesStatus = statusFilter === "all" || t.status === statusFilter;
        return (
            matchesText &&
            matchesStatus
        )
    }), [tasks, searchText, statusFilter]);
    const filterStatusOptions = [
        { value: "all", label: "Tất cả trạng thái" },
        { value: "pending", label: "Chờ xử lý" },
        { value: "in_progress", label: "Đang thực hiện" },
        { value: "completed", label: "Hoàn thành" },
        { value: "cancelled", label: "Đã hủy" },
    ];
    const currentStatusLabel =
        filterStatusOptions.find((option) => option.value === statusFilter)?.label ??
        "Tất cả trạng thái";
    const totalResults = filteredTasks.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
    useEffect(() => {
        setCurrentPage(1);
    }, [searchText, statusFilter, pageSize]);
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);
    const pagedTasks = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredTasks.slice(start, start + pageSize);
    }, [filteredTasks, currentPage, pageSize]);
    const handleCreateTask = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!formValues.title.trim()) {
            setCreateError("Vui lòng nhập tiêu đề công việc.");
            return;
        }
        setIsCreating(true);
        setCreateError(null);
        
        const payload: CreateTaskPayload = {
            title: formValues.title.trim(),
            description: formValues.description.trim(),
            status: formValues.status,
            priority: formValues.priority,
            due_date: formValues.dueDate || undefined,
            assignee: formValues.assignee ? Number(formValues.assignee) : undefined,
        };

        try {
            if (editingTaskId) {
                await updateTask(editingTaskId.toString(), payload);
            } else {
                await createTask(payload as Task);
            }
            await fetchTasks(); // Refresh list after create/update
            closeCreateModal();
        } catch (err: any) {
             setCreateError(err.response?.data?.error || "Đã xảy ra lỗi khi lưu công việc");
        } finally {
             setIsCreating(false);
        }
    };
    const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const handleDeleteTask = (task: Task) => {
        setDeleteTarget(task);
    };
    const confirmDeleteTask = async () => {
        if (!deleteTarget?.id) return;
        setIsDeleting(true);
        try {
            await deleteTask(deleteTarget.id.toString());
            await fetchTasks();
            setDeleteTarget(null);
        } catch (err: any) {
             setError(err.response?.data?.error || "Đã xảy ra lỗi khi xoá công việc");
        } finally {
            setIsDeleting(false);
        }
    };
    return (
        <div className="tasks-page">
            <PageHeader
                title="Quản lý công việc"
                subtitle="Theo dõi và quản lý các công việc trong dự án."
                actionLabel={isAdmin ? "Tạo mới" : undefined}
                onAction={isAdmin ? () => {
                    resetCreateForm();
                    setShowCreateModal(true);
                } : undefined}
            />
            <div className="my-5 grid gap-3 rounded-[12px] border border-[var(--border)] bg-white p-3.5 [[data-theme=dark]_&]:bg-[var(--card)]">
                <SearchField
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Tìm kiếm công việc..."
                />
                <div className="flex gap-3">
                    <FilterSelect
                        id="task-status-filter"
                        label={currentStatusLabel}
                        isOpen={isStatusFilterOpen}
                        onOpenChange={setIsStatusFilterOpen}
                        options={filterStatusOptions}
                        selectedValue={statusFilter}
                        onSelect={(value: string) => {
                            setStatusFilter(value);
                            setIsStatusFilterOpen(false);
                        }}
                    />
                </div>
            </div>
            <TableCard>
                {renderContent(pagedTasks)}
            </TableCard>
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
            {showCreateModal && !isviewMode && (
                <Modal
                    open
                    centered
                    footer={null}
                    width={520}
                    closable={false}
                    onCancel={closeCreateModal}
                    className="[[data-theme=dark]_&]:text-[var(--text)]"
                    classNames={{
                        wrapper: "rounded-[12px] border border-[#e5e7eb] bg-white [[data-theme=dark]_&]:border-[var(--border)] [[data-theme=dark]_&]:bg-[#0b1220]",
                        body: "p-0",
                    }}
                >
                    <div className="px-4 pb-5 pt-[18px]">
                        <header className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h2 className="mb-1 text-[1.15rem] font-semibold">
                                    {isEditMode ? "Chỉnh sửa công việc" : "Tạo công việc mới"}
                                </h2>
                                <p className="m-0 text-[0.9rem] text-[#64748b] [[data-theme=dark]_&]:text-[var(--muted)]">
                                    {isEditMode ? "Cập nhật thông tin công việc" : "Điền thông tin để tạo công việc mới"}
                                </p>
                            </div>
                            <Button
                                type="text"
                                aria-label="Dong"
                                onClick={closeCreateModal}
                                className="px-1 text-[1.4rem] text-[var(--muted)]"
                            >
                                ×
                            </Button>
                        </header>
                        <form className="grid gap-3.5" onSubmit={handleCreateTask}>
                            <label className="grid gap-2 text-[0.9rem] text-[var(--text)]">
                                <span>Tiêu đề *</span>
                                <Input
                                    placeholder="Nhập tiêu đề công việc"
                                    value={formValues.title}
                                    onChange={(e) =>
                                        setFormValues((prev) => ({ ...prev, title: e.target.value }))
                                    }
                                    disabled={isviewMode}
                                    className="rounded-[10px]"
                                />
                            </label>
                            <label className="grid gap-2 text-[0.9rem] text-[var(--text)]">
                                <span>Mô tả</span>
                                <Input.TextArea
                                    placeholder="Nhập mô tả chi tiết"
                                    rows={3}
                                    value={formValues.description}
                                    onChange={(e) =>
                                        setFormValues((prev) => ({ ...prev, description: e.target.value }))
                                    }
                                    disabled={isviewMode}
                                    className="rounded-[10px]"
                                />
                            </label>
                            <div className="grid grid-cols-2 gap-x-[18px] gap-y-3.5 max-[640px]:grid-cols-1">
                                <div className="grid gap-2 text-[0.9rem] text-[var(--text)]">
                                    <span>Trạng thái</span>
                                    <Select
                                        value={formValues.status}
                                        onChange={(value) =>
                                            setFormValues((prev) => ({ ...prev, status: value }))
                                        }
                                        options={statusOptions}
                                        disabled={isviewMode}
                                    />
                                </div>
                                <div className="grid gap-2 text-[0.9rem] text-[var(--text)]">
                                    <span>Độ ưu tiên</span>
                                    <Select
                                        value={formValues.priority}
                                        onChange={(value) =>
                                            setFormValues((prev) => ({ ...prev, priority: value }))
                                        }
                                        options={priorityOptions}
                                        disabled={isviewMode}
                                    />
                                </div>
                                <div className="grid gap-2 text-[0.9rem] text-[var(--text)]">
                                    <span>Người thực hiện</span>
                                    <Select
                                        value={formValues.assignee || undefined}
                                        onChange={(value) =>
                                            setFormValues((prev) => ({
                                                ...prev,
                                                assignee: value ? String(value) : "",
                                            }))
                                        }
                                        allowClear
                                        placeholder="Chọn người thực hiện"
                                        options={activeUsers.map((user) => ({
                                            value: String(user.id),
                                            label: user.username,
                                        }))}
                                        disabled={isviewMode}
                                    />
                                </div>
                                <label className="grid gap-2 text-[0.9rem] text-[var(--text)]">
                                    <span>Hạn hoàn thành</span>
                                    <DatePicker
                                        value={formValues.dueDate ? dayjs(formValues.dueDate) : null}
                                        onChange={(date) =>
                                            setFormValues((prev) => ({
                                                ...prev,
                                                dueDate: date ? date.format("YYYY-MM-DD") : "",
                                            }))
                                        }
                                        format="YYYY-MM-DD"
                                        disabled={isviewMode}
                                        className="w-full"
                                    />
                                </label>
                            </div>
                            {createError && <p className="m-0 text-[0.9rem] text-[#b91c1c]">{createError}</p>}
                            <div className="mt-1 flex justify-end gap-2.5">
                                <Button
                                    onClick={closeCreateModal}
                                    className="rounded-[10px]"
                                >
                                    Hủy
                                </Button>
                                <Button type="primary" htmlType="submit" disabled={isCreating} className="rounded-[10px]">
                                    {isCreating
                                                ? "Đang lưu..."
                                        : editingTaskId
                                                    ? "Cập nhật"
                                                    : "Tạo mới"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}
            {showCreateModal && isviewMode && viewTask && (
                <Modal
                    open
                    centered
                    footer={null}
                    width={480}
                    closable={false}
                    onCancel={closeCreateModal}
                    className="[[data-theme=dark]_&]:text-[var(--text)]"
                    classNames={{
                        wrapper: "rounded-[14px] border border-[#e5e7eb] bg-white [[data-theme=dark]_&]:border-[var(--border)] [[data-theme=dark]_&]:bg-[#0b1220]",
                        body: "p-0",
                    }}
                >
                    <div className="px-[22px] pb-5 pt-[18px]">
                        <header className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h2 className="m-0 text-[1.15rem] font-semibold">Chi tiết công việc</h2>
                            </div>
                            <Button
                                type="text"
                                aria-label="Dong"
                                onClick={closeCreateModal}
                                className="px-1 text-[1.4rem] text-[var(--muted)]"
                            >
                                ×
                            </Button>
                        </header>
                        <div className="grid gap-[18px]">
                            <div className="grid gap-1.5">
                                <p className="m-0 text-[0.9rem] text-[#667085] [[data-theme=dark]_&]:text-[var(--muted)]">Tiêu đề</p>
                                <p className="m-0 truncate text-[14px] font-medium text-[#0f1729] [[data-theme=dark]_&]:text-[var(--text)]">
                                    {viewTask.title ?? "-"}
                                </p>
                            </div>
                            <div className="grid gap-1.5">
                                <p className="m-0 text-[0.9rem] text-[#667085] [[data-theme=dark]_&]:text-[var(--muted)]">Mô tả</p>
                                <p className="m-0 truncate text-[14px] font-medium text-[#0f1729] [[data-theme=dark]_&]:text-[var(--text)]">
                                    {viewTask.description ?? "-"}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-[18px] max-[640px]:grid-cols-1">
                                <div className="grid gap-1.5">
                                    <p className="m-0 text-[0.9rem] text-[#667085] [[data-theme=dark]_&]:text-[var(--muted)]">Trạng thái</p>
                                    <span className={statusClassName(viewTask.status)}>
                                        {formatStatusWithIcon(viewTask.status)}
                                    </span>
                                </div>
                                <div className="grid gap-1.5">
                                    <p className="m-0 text-[0.9rem] text-[#667085] [[data-theme=dark]_&]:text-[var(--muted)]">Độ ưu tiên</p>
                                    <span className={priorityClassName(viewTask.priority)}>
                                        {formatPriorityWithIcon(viewTask.priority)}
                                    </span>
                                </div>
                                <div className="grid gap-1.5">
                                    <p className="m-0 text-[0.9rem] text-[#667085] [[data-theme=dark]_&]:text-[var(--muted)]">Người thực hiện</p>
                                    <p className="m-0 text-[14px] font-medium text-[#0f1729] [[data-theme=dark]_&]:text-[var(--text)]">
                                        {getAssigneeName(viewTask.assignee)}
                                    </p>
                                </div>
                                <div className="grid gap-1.5">
                                    <p className="m-0 text-[0.9rem] text-[#667085] [[data-theme=dark]_&]:text-[var(--muted)]">Hạn hoàn thành</p>
                                    <p className="m-0 text-[14px] font-medium text-[#0f1729] [[data-theme=dark]_&]:text-[var(--text)]">
                                        {formatDisplayDate(viewTask.due_date)}
                                    </p>
                                </div>
                                <div className="grid gap-1.5">
                                    <p className="m-0 text-[0.9rem] text-[#667085] [[data-theme=dark]_&]:text-[var(--muted)]">Ngày tạo</p>
                                    <p className="m-0 text-[14px] font-medium text-[#0f1729] [[data-theme=dark]_&]:text-[var(--text)]">
                                        {formatDisplayDate(viewTask.created_at)}
                                    </p>
                                </div>
                                <div className="grid gap-1.5">
                                    <p className="m-0 text-[0.9rem] text-[#667085] [[data-theme=dark]_&]:text-[var(--muted)]">Cập nhật lần cuối</p>
                                    <p className="m-0 text-[14px] font-medium text-[#0f1729] [[data-theme=dark]_&]:text-[var(--text)]">
                                        {formatDisplayDate((viewTask as any).updated_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2.5">
                            <Button onClick={closeCreateModal} className="rounded-[10px]">
                                Đóng
                            </Button>
                            {isAdmin && (
                                <Button
                                    type="primary"
                                    className="rounded-[10px]"
                                    onClick={() => {
                                        setViewTaskId(null);
                                        setViewTask(null);
                                        openEditModal(viewTask);
                                    }}
                                >
                                    Chỉnh sửa
                                </Button>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
            {deleteTarget && (
                <Modal
                    open
                    centered
                    footer={null}
                    width={480}
                    closable={false}
                    onCancel={() => setDeleteTarget(null)}
                    className="[[data-theme=dark]_&]:text-[var(--text)]"
                    classNames={{
                        wrapper: "rounded-[12px] border border-[#e5e7eb] bg-white [[data-theme=dark]_&]:border-[var(--border)] [[data-theme=dark]_&]:bg-[#0b1220]",
                        body: "p-0",
                    }}
                >
                    <div className="px-5 pb-5 pt-[18px]">
                        <header>
                            <h3 className="mb-2 text-[1.05rem] font-semibold">Xác nhận xóa</h3>
                        </header>
                        <div className="grid gap-1.5 text-[0.9rem] text-[var(--muted)]">
                            <p className="m-0">
                                Bạn có chắc chắn muốn xóa công việc "{deleteTarget.title ?? "Không có tiêu đề"}"?
                            </p>
                            <p className="m-0">Hành động này không thể hoàn tác.</p>
                        </div>
                        <div className="mt-4 flex justify-end gap-2.5">
                            <Button onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="rounded-[8px]">
                                Hủy
                            </Button>
                            <Button
                                danger
                                type="primary"
                                onClick={confirmDeleteTask}
                                disabled={isDeleting}
                                className="rounded-[8px]"
                            >
                                {isDeleting ? "Đang xóa..." : "Xóa"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
