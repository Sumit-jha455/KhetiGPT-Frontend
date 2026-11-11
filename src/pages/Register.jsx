import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  UserRound,
  MapPin,
  Languages,
  UserPlus,
} from "lucide-react";

import Input from "../components/Input";
import LocationSelector from "../components/LocationSelector";
import Button from "../components/Button";

import {
  validateEmail,
  validateConfirmPassword,
  validateRequired,
  runValidation,
} from "../utils/validators";

import { useApp } from "../context/AppContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const LANGUAGES = ["English", "Hindi"];

export default function Register() {
  useDocumentTitle("Create Account");

  const navigate = useNavigate();
  const { register } = useApp();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    language: "English",
  });

  const [errors, setErrors] = useState({});
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
      name: (value) => {
        const requiredError = validateRequired(value, "Name");
        if (requiredError) return requiredError;
        if (String(value).trim().length < 2)
          return "Name must be at least 2 characters";
        return "";
      },

      email: (value) => validateEmail(value),

      password: (value) => {
        if (value.length < 8) {
          return "Password must contain at least 8 characters.";
        }

        if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
          return "Password must contain at least one letter and one number.";
        }

        return "";
      },

      confirmPassword: (value) =>
        validateConfirmPassword(form.password, value),

      location: (value) => validateRequired(value, "Location"),

      language: (value) =>
        validateRequired(value, "Preferred language"),
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
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        location: form.location,
        language: form.language,
      });

      setSuccessMessage(
        "Account created successfully! Opening your dashboard..."
      );

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrors({
        form:
          error.response?.data?.message ||
          error.message ||
          "Registration failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-brand-950">
        Create your account
      </h1>

      <p className="mt-1.5 text-sm text-ink-muted">
        Create your KhetiGPT account to access personalized farming assistance.
      </p>

      <div className="mt-5 rounded-xl border border-sky-100 bg-sky-soft px-3.5 py-2.5 text-xs leading-relaxed text-sky-deep">
        Create your secure account to access personalized farming assistance.
      </div>

      {/* Name */}
      <div className="mt-5">
        <Input
          label="Name"
          name="name"
          type="text"
          icon={UserRound}
          value={form.name}
          onChange={handleChange}
          placeholder="Your full name"
          required
          error={errors.name}
        />
      </div>

      {/* Email */}
      <div className="mt-4">
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
          hint="Your email will be used to sign in to your account."
        />
      </div>

      {/* Password fields */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input
          label="Password"
          name="password"
          type="password"
          icon={Lock}
          value={form.password}
          onChange={handleChange}
          placeholder="Minimum 8 characters"
          required
          error={errors.password}
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          icon={Lock}
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter password"
          required
          error={errors.confirmPassword}
        />
      </div>

      {/* Location */}
      <div className="mt-4">
        <LocationSelector
          name="location"
          value={form.location}
          onChange={handleChange}
          required
          error={errors.location}
        />
      </div>

      {/* Preferred language */}
      <div className="mt-4">
        <div className="relative">
          <span className="mb-1.5 block text-sm font-semibold text-ink">
            Preferred Language
            <span className="ml-0.5 text-red-600">*</span>
          </span>

          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map((language) => (
              <label
                key={language}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-semibold transition-colors"
                style={
                  form.language === language
                    ? {
                        borderColor: "#57bd78",
                        backgroundColor: "#f1fbf3",
                        color: "#196a3a",
                      }
                    : {
                        borderColor: "#e2e9e0",
                        backgroundColor: "#ffffff",
                        color: "#45594f",
                      }
                }
              >
                <input
                  type="radio"
                  name="language"
                  value={language}
                  checked={form.language === language}
                  onChange={handleChange}
                  className="h-4 w-4 accent-brand-600"
                />

                <Languages
                  size={16}
                  aria-hidden="true"
                  className="shrink-0"
                />

                {language}
              </label>
            ))}
          </div>

          {errors.language ? (
            <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
              {errors.language}
            </p>
          ) : null}
        </div>
      </div>

      {/* Location information */}
      <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-muted">
        <MapPin size={13} aria-hidden="true" />
        Your location helps provide relevant farming and weather information.
      </p>

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
        title="Create account"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating account..." : "Create Account"}
        <UserPlus size={18} aria-hidden="true" />
      </Button>

      <p className="mt-5 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-brand-700 hover:text-brand-800"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}