import { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { setCurrentUser } from "../utils/storage";
import { loginApi } from "../api/auth.api";

const sanitizeEmail = (value: string) => value.trim().toLowerCase();

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.username || !form.password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const email = sanitizeEmail(form.username);
      
      const payload = {
          user: {
              username: email,
              password: form.password
          }
      };

      const response = await loginApi(payload);
      const data = response.data.user;
      
      setCurrentUser(data);
      login(data.access, data.refresh);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Sai tài khoản hoặc mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex flex-col items-center justify-center px-4 py-12 text-[#111827]">
      {/* Brand */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-11 w-11 rounded-[14px] bg-[#6366f1] text-white grid place-items-center shadow-[0_10px_24px_rgba(99,102,241,0.25)]">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="4" y="4" width="16" height="16" rx="4" />
            <path d="M8 12l2.5 2.5L16 9" />
          </svg>
        </div>
        <span className="text-[22px] font-bold text-[#0f172a]">
          TaskFlow
        </span>
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="
          w-full max-w-[440px]
          bg-white
          rounded-2xl
          border border-[#eaecf0]
          shadow-[0_16px_32px_rgba(15,23,42,0.06)]
          px-[22px] pt-6 pb-5
          flex flex-col gap-4
        "
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-[22px] font-bold text-[#0f172a]">
            Đăng nhập
          </h2>
          <p className="mt-1 text-sm text-[#6b7280]">
            Nhập thông tin đăng nhập để truy cập hệ thống
          </p>
        </div>

        {/* Email */}
        <label className="flex flex-col gap-2 text-sm font-medium text-[#111827]">
          Email
          <input
            name="username"
            type="email"
            placeholder="email@company.com"
            onChange={handleChange}
            className="
              w-full
              rounded-xl
              border border-[#d9dee7]
              bg-[#fff9c2]
              px-4 py-3
              text-sm text-[#111827]
              placeholder:text-[#9ca3af]
              transition
              focus:outline-none
              focus:border-[#6b6ffb]
              focus:ring-2 focus:ring-[#6b6ffb]/30
            "
          />
        </label>

        {/* Password */}
        <label className="flex flex-col gap-2 text-sm font-medium text-[#111827]">
          Mật khẩu
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              onChange={handleChange}
              className="
                w-full
                rounded-xl
                border border-[#d9dee7]
                bg-[#fff9c2]
                px-4 py-3 pr-12
                text-sm text-[#111827]
                placeholder:text-[#9ca3af]
                transition
                focus:outline-none
                focus:border-[#6b6ffb]
                focus:ring-2 focus:ring-[#6b6ffb]/30
              "
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#111827]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </label>

        {/* Error */}
        {error && (
          <p className="rounded-xl bg-[#fee2e2] px-4 py-2 text-center text-sm text-[#b91c1c]">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="
            mt-1
            w-full
            rounded-xl
            bg-[#6366f1]
            py-3
            text-sm font-semibold text-white
            transition
            hover:bg-[#5b5fe8]
            disabled:opacity-75 disabled:cursor-not-allowed
          "
        >
          {isLoading ? "Đang xử lý..." : "Đăng nhập"}
        </button>

        {/* Divider */}
        <div className="h-px bg-[#e5e7eb] my-2" />

        {/* Demo accounts */}
        <div className="text-center">
          <p className="text-xs text-[#6b7280] mb-2">
            Tài khoản demo:
          </p>
          <div className="grid gap-3 sm:grid-cols-2 text-left">
            <div className="rounded-xl bg-[#f3f4f6] px-3 py-2 border border-[#eceff4]">
              <p className="text-sm font-medium text-[#111827]">
                Admin
              </p>
              <p className="text-xs text-[#6b7280]">
                admin@gmail.com
              </p>
            </div>
            <div className="rounded-xl bg-[#f3f4f6] px-3 py-2 border border-[#eceff4]">
              <p className="text-sm font-medium text-[#111827]">
                User
              </p>
              <p className="text-xs text-[#6b7280]">
                john.doe
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-[#6b7280]">
            Mật khẩu: admin123 (Admin) | user123 (User)
          </p>
        </div>
      </form>
    </div>
  );
}
