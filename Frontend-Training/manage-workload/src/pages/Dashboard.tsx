import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTasks, getAllUsers } from "../api/auth.api";
import type { Task, User } from "../types/auth.type";
export default function Dashboard() {
    const navigate = useNavigate();
    const [taskStats, setTaskStats] = useState({
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
    });
    const [recentTasks, setRecentTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [tasksRes, usersRes] = await Promise.all([
                    getTasks(),
                    getAllUsers()
                ]);
                const tasks: Task[] = tasksRes.data || [];
                // getAllUsers usually returns { data: { results: User[] } } based on Tasks.tsx
                setUsers(usersRes.data.results || []);

                const nextStats = {
                  total: 0,
                  pending: 0,
                  inProgress: 0,
                  completed: 0,
                };

                tasks.forEach((task) => {
                  const status = (task.status ?? "").toLowerCase().replace(/\s|-/g, "_");
                  if (status === "completed" || status === "done") {
                    nextStats.completed += 1;
                  } else if (status === "pending" || status === "todo") {
                    nextStats.pending += 1;
                  } else if (status === "in_progress" || status === "doing") {
                    nextStats.inProgress += 1;
                  } else {
                    nextStats.total += 1;
                  }
                });

                nextStats.total =
                  nextStats.total +
                  nextStats.pending +
                  nextStats.inProgress +
                  nextStats.completed;

                setTaskStats(nextStats);

                const sorted = [...tasks].sort((a, b) => {
                  const aTime = new Date(a.created_at ?? 0).getTime();
                  const bTime = new Date(b.created_at ?? 0).getTime();
                  return bTime - aTime;
                });
                setRecentTasks(sorted.slice(0, 5));
            } catch (err) {
                console.error("Failed to load dashboard data:", err);
            }
        };
        loadData();
    }, []);
    const formatStatus = (status?: string) => {
      const normalized = (status ?? "").toLowerCase();
      if (normalized === "completed" || normalized === "done") return "Hoàn thành";
      if (normalized === "pending" || normalized === "todo") return "Chờ xử lý";
      if (normalized === "in_progress" || normalized === "doing") return "Đang thực hiện";
      return status ?? "Không rõ";
    };
    const statusClass = (status?: string) => {
      const normalized = (status ?? "").toLowerCase();
      if (normalized === "completed" || normalized === "done") {
        return "bg-[#e9f9ee] text-[#16a34a] [[data-theme=dark]_&]:bg-[var(--ring-track)]";
      }
      if (normalized === "pending" || normalized === "todo") {
        return "bg-[#fff7ed] text-[#f97316] [[data-theme=dark]_&]:bg-[var(--ring-track)]";
      }
      if (normalized === "in_progress" || normalized === "doing") {
        return "bg-[#e0f2fe] text-[#2563eb] [[data-theme=dark]_&]:bg-[var(--ring-track)]";
      }
      return "bg-[#fff7ed] text-[#f97316] [[data-theme=dark]_&]:bg-[var(--ring-track)]";
    };
    const renderStatusIcon = (status?: string) => {
      const normalized = (status ?? "").toLowerCase();
      if (normalized === "completed" || normalized === "done") {
        return (
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
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
      }
      if (normalized === "in_progress" || normalized === "doing") {
        return (
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
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
      }
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
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
    };
    const getInitials = (name?: string) => {
      const text = (name ?? "").trim();
      if (!text) return "??";
      const parts = text.split(/\s+/);
      const first = parts[0]?.[0] ?? "";
      const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
      return `${first}${last}`.toUpperCase();
    };
    const getAssigneeName = (task: Task) => {
      const assigneeId = task.assignee || task.owner;
      if (typeof assigneeId === "number") {
          const user = users.find(u => u.id === assigneeId);
          if (user) return user.username;
          return `User #${assigneeId}`;
      }
      return "Không rõ";
    };
    const completionRate = taskStats.total
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;
    const ringRadius = 48;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringOffset = ringCircumference * (1 - completionRate / 100);
  return (
    <div className="mt-[-8px] flex flex-col gap-6">
      <header>
        <div>
          <h2 className="mb-1 text-[1.9rem] font-semibold text-[var(--text)]">
            Xin chào, Admin!
          </h2>
          <p className="m-0 text-[16px] text-[#6b7280]">
            Tổng quan hệ thống quản lý công việc
          </p>
        </div>
      </header>

      <section className="grid grid-cols-4 gap-[18px] max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
        <div className="flex items-center justify-between rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-[18px] py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
          <div>
            <p className="mb-[6px] text-[0.85rem] text-[var(--muted)]">
              Tổng công việc
            </p>
            <h2 className="m-0 text-[1.5rem] font-semibold">{taskStats.total}</h2>
          </div>
          <span
            className="grid h-12 w-12 place-items-center rounded-[10px] bg-[#eef2ff] text-[#4f46e5] [[data-theme=dark]_&]:bg-[var(--ring-track)] [[data-theme=dark]_&]:text-[var(--nav-active-text)]"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="4" width="16" height="16" rx="4" />
              <path d="M8 12l2.5 2.5L16 9" />
            </svg>
          </span>
        </div>
        <div className="flex items-center justify-between rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-[18px] py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
          <div>
            <p className="mb-[6px] text-[0.85rem] text-[var(--muted)]">
              Chờ xử lý
            </p>
            <h2 className="m-0 text-[1.5rem] font-semibold">{taskStats.pending}</h2>
          </div>
          <span
            className="grid h-12 w-12 place-items-center rounded-[10px] bg-[#fff7ed] text-[#f97316] [[data-theme=dark]_&]:bg-[var(--ring-track)]"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="7" />
              <path d="M12 8v4l2 2" />
            </svg>
          </span>
        </div>
        <div className="flex items-center justify-between rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-[18px] py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
          <div>
            <p className="mb-[6px] text-[0.85rem] text-[var(--muted)]">
              Đang thực hiện
            </p>
            <h2 className="m-0 text-[1.5rem] font-semibold">{taskStats.inProgress}</h2>
          </div>
          <span
            className="grid h-12 w-12 place-items-center rounded-[10px] bg-[#e0f2fe] text-[#2563eb] [[data-theme=dark]_&]:bg-[var(--ring-track)]"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
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
          </span>
        </div>
        <div className="flex items-center justify-between rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-[18px] py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
          <div>
            <p className="mb-[6px] text-[0.85rem] text-[var(--muted)]">
              Hoàn thành
            </p>
            <h2 className="m-0 text-[1.5rem] font-semibold">{taskStats.completed}</h2>
          </div>
          <span
            className="grid h-12 w-12 place-items-center rounded-[10px] bg-[#ecfdf3] text-[#16a34a] [[data-theme=dark]_&]:bg-[var(--ring-track)]"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="7" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </span>
        </div>
      </section>

      <section className="grid grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)] gap-[22px] max-[1100px]:grid-cols-1">
        <div className="flex min-h-[380px] flex-col gap-4 rounded-[12px] border border-[var(--border)] bg-[var(--card)] px-5 py-[18px] shadow-[0_12px_26px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-[30px] w-[30px] place-items-center rounded-[8px] bg-[#eef2ff] text-[#4f46e5] [[data-theme=dark]_&]:bg-[var(--ring-track)] [[data-theme=dark]_&]:text-[var(--nav-active-text)]"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 14l5-5 4 4 5-5" />
                <path d="M14 8h6v6" />
              </svg>
            </span>
            <h2 className="m-0 text-[1.05rem] font-semibold">Tỷ lệ hoàn thành</h2>
          </div>
          <div className="relative mx-auto mt-3 grid h-[120px] w-[120px] place-items-center">
            <svg
              className="h-[120px] w-[120px] -rotate-90"
              viewBox="0 0 120 120"
              aria-hidden="true"
            >
              <circle
                className="fill-none stroke-[10px] stroke-[var(--ring-track)]"
                cx="60"
                cy="60"
                r={ringRadius}
              />
              <circle
                className="fill-none stroke-[10px] stroke-[#6366f1] transition-[stroke-dashoffset] duration-300 [stroke-linecap:round]"
                cx="60"
                cy="60"
                r={ringRadius}
                style={{
                  strokeDasharray: ringCircumference,
                  strokeDashoffset: ringOffset,
                }}
              />
            </svg>
            <div className="absolute inset-0 m-auto grid h-[86px] w-[86px] place-items-center rounded-full bg-[var(--card)] text-[1.8rem] font-bold">
              <span>{completionRate}%</span>
            </div>
          </div>
          <p className="m-0 text-center text-[0.9rem] text-[var(--muted)]">
            {taskStats.completed} / {taskStats.total} công việc đã hoàn thành
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-[12px] border border-[var(--border)] bg-[var(--card)] px-5 py-[18px] shadow-[0_12px_26px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between">
            <h2 className="m-0 text-[1.05rem] font-semibold">Công việc gần đây</h2>
            <button
              className="bg-transparent text-[0.95rem] font-medium text-[#4f46e5]"
              type="button"
              onClick={() => navigate("/api/task")}
            >
              Xem tất cả →
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {recentTasks.map((task) => (
              <div
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[10px] px-1.5 py-2"
                key={task.id}
              >
                <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--ring-track)] text-[0.8rem] font-semibold text-[var(--nav-active-text)]">
                  {getInitials(getAssigneeName(task))}
                </div>
                <div>
                  <p className="mb-1 font-semibold">{task.title ?? "Khong co tieu de"}</p>
                  <p className="m-0 text-[0.85rem] text-[var(--muted)]">
                    {getAssigneeName(task)}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[0.8rem] font-semibold ${statusClass(
                    task.status
                  )}`}
                >
                  <span className="inline-flex h-3.5 w-3.5" aria-hidden="true">
                    {renderStatusIcon(task.status)}
                  </span>
                  {formatStatus(task.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
