"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type St = { t: "ok" | "err"; m: string } | null;
const INTERESTS = ["history", "food", "markets", "architecture", "photography", "family", "culture", "nature"];

function Password({ id, name, label, autoComplete }: { id: string; name: string; label: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          required
          autoComplete={autoComplete}
          className="input pr-16 transition-all duration-300 focus:ring-2 focus:ring-gold/30 focus:border-gold"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-pressed={show}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-3 text-xs text-gold transition-colors duration-200 hover:text-sand cursor-pointer"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

const Msg = ({ s }: { s: St }) =>
  s ? (
    <div
      role={s.t === "err" ? "alert" : "status"}
      className={`rounded-xl p-3.5 text-sm transition-all duration-500 animate-[fadein_.3s_ease] ${
        s.t === "err"
          ? "bg-maroon/60 text-red-100 border border-maroon"
          : "bg-emerald/30 text-emerald-100 border border-emerald/50"
      }`}
    >
      <div className="flex items-center gap-2">
        {s.t === "ok" && (
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        )}
        <span>{s.m}</span>
      </div>
    </div>
  ) : null;

async function post(url: string, body: unknown, method = "POST") {
  try {
    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await r.text();
    try {
      const data = JSON.parse(text);
      if (!r.ok && !data.error) {
        data.error = `Server error (${r.status})`;
      }
      return data;
    } catch {
      return { ok: false, error: text || `Server error (${r.status})` };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Connection failed";
    return { ok: false, error: msg };
  }
}

const DEMOS: [string, string][] = [
  ["demo@delhikikhoj.test", "Demo@1234"],
  ["admin@delhikikhoj.test", "Admin@1234"],
  ["guide@delhikikhoj.test", "Guide@1234"],
  ["seller@delhikikhoj.test", "Seller@1234"],
];

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [s, setS] = useState<St>(notice ? { t: "ok", m: notice } : null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function doLogin(email: string, password: string) {
    setBusy(true);
    setS(null);
    try {
      const j = await post("/api/auth/login", { email, password, next });
      if (j.ok) {
        setS({ t: "ok", m: "Welcome back — redirecting…" });
        const target = j.redirect || "/dashboard";
        setTimeout(() => {
          window.location.href = target;
        }, 150);
      } else {
        setS({ t: "err", m: j.error || "Login failed. Please check credentials." });
        setBusy(false);
      }
    } catch (err: unknown) {
      setS({ t: "err", m: "Unable to log in. Please check connection and try again." });
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await doLogin(String(f.get("email")), String(f.get("password")));
  }

  return (
    <form onSubmit={submit} className="card space-y-4 shadow-xl shadow-black/20" noValidate={false}>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input transition-all duration-300 focus:ring-2 focus:ring-gold/30 focus:border-gold"
          placeholder="name@example.com"
        />
      </div>
      <Password id="password" name="password" label="Password" autoComplete="current-password" />
      <button
        type="submit"
        className="btn btn-gold w-full transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 active:scale-[0.98] cursor-pointer"
        disabled={busy}
      >
        {busy ? (
          <span className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 rounded-full border-2 border-ink border-t-transparent animate-spin" />
            Logging in…
          </span>
        ) : (
          "Log in"
        )}
      </button>
      <Msg s={s} />
      <div className="border-t border-ivory/10 pt-4">
        <p className="mb-2 text-xs uppercase tracking-widest text-ivory/50">One-click demo login</p>
        <div className="flex flex-wrap gap-2">
          {DEMOS.map(([email, pw]) => (
            <button
              key={email}
              type="button"
              disabled={busy}
              onClick={() => doLogin(email, pw)}
              className="chip min-h-9 px-3 hover:border-gold hover:text-gold active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {email.split("@")[0]}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-ivory/70">
        <Link href="/forgot-password" className="text-gold underline hover:text-sand transition-colors">
          Forgot password?
        </Link>{" "}
        · New here?{" "}
        <Link href="/signup" className="text-gold underline hover:text-sand transition-colors">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const [s, setS] = useState<St>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setS(null);
    const f = new FormData(e.currentTarget);
    if (f.get("password") !== f.get("confirmPassword")) {
      return setS({ t: "err", m: "Passwords do not match" });
    }
    setBusy(true);
    try {
      const j = await post("/api/auth/signup", {
        fullName: f.get("fullName"),
        email: f.get("email"),
        password: f.get("password"),
        confirmPassword: f.get("confirmPassword"),
        phone: f.get("phone") ?? "",
        language: f.get("language"),
        consent: f.get("consent") === "on",
      });
      if (j.ok) {
        setS({ t: "ok", m: "Account created — setting up your profile…" });
        const target = j.redirect || "/onboarding";
        setTimeout(() => {
          window.location.href = target;
        }, 150);
      } else {
        setS({ t: "err", m: j.error || "Failed to create account" });
        setBusy(false);
      }
    } catch {
      setS({ t: "err", m: "Network error during sign-up. Please try again." });
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-4 shadow-xl shadow-black/20">
      <div>
        <label className="label" htmlFor="fullName">Full name</label>
        <input
          id="fullName"
          name="fullName"
          required
          minLength={2}
          autoComplete="name"
          className="input transition-all duration-300 focus:ring-2 focus:ring-gold/30 focus:border-gold"
          placeholder="e.g. Aarav Sharma"
        />
      </div>
      <div>
        <label className="label" htmlFor="s-email">Email</label>
        <input
          id="s-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input transition-all duration-300 focus:ring-2 focus:ring-gold/30 focus:border-gold"
          placeholder="aarav@example.com"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Password id="s-pw" name="password" label="Password" autoComplete="new-password" />
        <Password id="s-pw2" name="confirmPassword" label="Confirm password" autoComplete="new-password" />
      </div>
      <p className="-mt-2 text-xs text-ivory/50">At least 8 characters with a letter and a number.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="phone">Phone (optional)</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="input transition-all duration-300 focus:ring-2 focus:ring-gold/30 focus:border-gold"
            placeholder="+91 9876543210"
          />
        </div>
        <div>
          <label className="label" htmlFor="language">Preferred language</label>
          <select id="language" name="language" className="input transition-all duration-300 focus:border-gold">
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>
        </div>
      </div>
      <label className="flex items-start gap-3 text-sm cursor-pointer">
        <input type="checkbox" name="consent" required className="mt-1 accent-gold" />
        <span>
          I agree to the <Link href="/terms" className="text-gold underline hover:text-sand">Terms</Link> and{" "}
          <Link href="/privacy" className="text-gold underline hover:text-sand">Privacy Policy</Link>.
        </span>
      </label>
      <button
        type="submit"
        className="btn btn-gold w-full transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 active:scale-[0.98] cursor-pointer"
        disabled={busy}
      >
        {busy ? (
          <span className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 rounded-full border-2 border-ink border-t-transparent animate-spin" />
            Creating account…
          </span>
        ) : (
          "Create account"
        )}
      </button>
      <Msg s={s} />
      <p className="text-sm text-ivory/70">
        Already have an account?{" "}
        <Link href="/login" className="text-gold underline hover:text-sand transition-colors">
          Log in
        </Link>
      </p>
    </form>
  );
}

export function ForgotForm() {
  const [s, setS] = useState<St>(null);
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setS(null);
    setLink(null);
    const j = await post("/api/auth/forgot", { email: new FormData(e.currentTarget).get("email") });
    setBusy(false);
    if (j.ok) {
      setS({ t: "ok", m: j.message });
      setLink(j.resetLink);
    } else {
      setS({ t: "err", m: j.error });
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-4 shadow-xl shadow-black/20">
      <div>
        <label className="label" htmlFor="f-email">Email</label>
        <input
          id="f-email"
          name="email"
          type="email"
          required
          className="input transition-all duration-300 focus:ring-2 focus:ring-gold/30 focus:border-gold"
          placeholder="your@email.com"
        />
      </div>
      <button
        type="submit"
        className="btn btn-gold w-full transition-all duration-300 active:scale-[0.98] cursor-pointer"
        disabled={busy}
      >
        {busy ? "Working…" : "Create reset link"}
      </button>
      <Msg s={s} />
      {s?.t === "ok" && (
        <div className="rounded-xl border border-gold/40 bg-gold/10 p-3 text-sm animate-[fadein_.3s_ease]">
          <span className="tag-demo">Demo mode</span>
          <p className="mt-2">
            No email service is configured, so no email was sent.{" "}
            {link ? (
              <>
                Use this one-time link (valid 1 hour):{" "}
                <Link className="break-all text-gold underline hover:text-sand" href={link}>
                  open reset page
                </Link>
              </>
            ) : (
              "No account exists for that email."
            )}
          </p>
        </div>
      )}
      <p className="text-sm">
        <Link href="/login" className="text-gold underline hover:text-sand transition-colors">
          Back to login
        </Link>
      </p>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [s, setS] = useState<St>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setS(null);
    const f = new FormData(e.currentTarget);
    if (f.get("password") !== f.get("confirm")) {
      return setS({ t: "err", m: "Passwords do not match" });
    }
    setBusy(true);
    const j = await post("/api/auth/reset", { token, password: f.get("password") });
    if (j.ok) {
      window.location.href = j.redirect || "/login?reset=1";
    } else {
      setS({ t: "err", m: j.error });
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-4 shadow-xl shadow-black/20">
      <Password id="r-pw" name="password" label="New password" autoComplete="new-password" />
      <Password id="r-pw2" name="confirm" label="Confirm new password" autoComplete="new-password" />
      <button
        type="submit"
        className="btn btn-gold w-full transition-all duration-300 active:scale-[0.98] cursor-pointer"
        disabled={busy}
      >
        {busy ? "Saving…" : "Set new password"}
      </button>
      <Msg s={s} />
    </form>
  );
}

export function OnboardingForm({ initialLang, initialInterests }: { initialLang: string; initialInterests: string[] }) {
  const [sel, setSel] = useState<string[]>(initialInterests);
  const [lang, setLang] = useState(initialLang);
  const [s, setS] = useState<St>(null);
  const [busy, setBusy] = useState(false);

  async function save(skip: boolean) {
    setBusy(true);
    setS(null);
    const j = await post("/api/profile", { language: lang, interests: skip ? [] : sel, onboarded: true }, "PUT");
    if (j.ok) {
      window.location.href = "/dashboard";
    } else {
      setS({ t: "err", m: j.error });
      setBusy(false);
    }
  }

  return (
    <div className="card space-y-6 shadow-xl shadow-black/20">
      <fieldset>
        <legend className="label font-serif text-lg">What are you into?</legend>
        <div className="flex flex-wrap gap-2 mt-2">
          {INTERESTS.map((i) => (
            <button
              type="button"
              key={i}
              aria-pressed={sel.includes(i)}
              onClick={() => setSel(sel.includes(i) ? sel.filter((x) => x !== i) : [...sel, i])}
              className={`chip min-h-10 px-4 capitalize transition-all duration-200 cursor-pointer active:scale-95 ${
                sel.includes(i) ? "chip-on ring-1 ring-gold/40" : "hover:border-gold/50"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor="o-lang">Preferred language</label>
        <select
          id="o-lang"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="input transition-all duration-300 focus:border-gold"
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी (Hindi)</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => save(false)}
          disabled={busy}
          className="btn btn-gold transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 active:scale-[0.98] cursor-pointer"
        >
          {busy ? "Saving…" : "Save & continue"}
        </button>
        <button
          onClick={() => save(true)}
          disabled={busy}
          className="btn btn-ghost transition-all duration-300 active:scale-[0.98] cursor-pointer"
        >
          Skip for now
        </button>
      </div>
      <Msg s={s} />
    </div>
  );
}
