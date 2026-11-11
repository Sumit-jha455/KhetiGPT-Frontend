import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";

import Input from "../components/Input";
import Button from "../components/Button";
import {
  validateEmail,
  validatePassword,
  runValidation,
} from "../utils/validators";

import { useApp } from "../context/AppContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Login() {
  useDocumentTitle("Login");

  const navigate = useNavigate();
  const { login } = useApp();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [remember, setRemember] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
      form: "",
    }));
  };

  const validateForm = () => {
    const rules = {
      email: (value) => validateEmail(value),
      password: (value) => validatePassword(value),
    };

    const { errors: nextErrors, isValid } = runValidation(form, rules);

    setErrors(nextErrors);

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrors({});

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await login(
        {
          email: form.email.trim(),
          password: form.password,
        },
        remember
      );

      setSuccessMessage("Login successful! Opening your dashboard...");

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrors({
        form:
          error.response?.data?.message ||
          error.message ||
          "Login failed. Please check your email and password.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-brand-950">
        Welcome back
      </h1>

      <p className="mt-1.5 text-sm text-ink-muted">
        Sign in to continue to your KhetiGPT dashboard.
      </p>

      <div className="mt-5 rounded-xl border border-sky-100 bg-sky-soft px-3.5 py-2.5 text-xs leading-relaxed text-sky-deep">
        Sign in securely to access your personalized farming dashboard.
      </div>

      {/* Email */}
      <div className="mt-5">
        <Input
          label="Email"
          name="email"
          type="email"
          icon={Mail}
          value={form.email}
          onChange={handleChange}
          placeholder="farmer@example.com"
          required
          error={errors.email}
          autoFocus
        />
      </div>

      {/* Password */}
      <div className="mt-4">
        <Input
          label="Password"
          name="password"
          type="password"
          icon={Lock}
          value={form.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
          error={errors.password}
        />
      </div>

      {/* Remember me and Forgot password */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-4 w-4 rounded border-line accent-brand-600"
          />
          Remember me
        </label>

        <button
          type="button"
          onClick={() =>
            setErrors((current) => ({
              ...current,
              password: "",
              form: "Password reset is not available yet. Please contact the project administrator if you cannot access your account.",
            }))
          }
          aria-label="Forgot password"
          className="text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          Forgot password?
        </button>
      </div>

      {/* API error */}
      {errors.form ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs leading-relaxed text-red-700"
        >
          {errors.form}
        </p>
      ) : null}

      {/* Success message */}
      {successMessage ? (
        <p className="mt-4 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-xs font-medium leading-relaxed text-brand-800">
          {successMessage}
        </p>
      ) : null}

      {/* Submit */}
      <Button
        type="submit"
        fullWidth
        className="mt-6"
        title="Sign in"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
        <LogIn size={18} aria-hidden="true" />
      </Button>

      <p className="mt-5 text-center text-sm text-ink-muted">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-brand-700 hover:text-brand-800"
        >
          Create account
        </Link>
      </p>
    </form>
  );
}