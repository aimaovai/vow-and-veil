import React, { type FormEvent, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ArrowRight, CalendarDays, CheckCircle2, Heart, Menu, Sparkles, Users, Wallet } from 'lucide-react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { api } from './lib/api';
import type { User, Wedding } from './types';

const queryClient = new QueryClient();

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      setLoading(true);
      const me = await api.me();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const login = async (email: string, password: string) => {
    const nextUser = await api.login({ email, password });
    setUser(nextUser);
  };

  const register = async (input: { firstName: string; lastName: string; email: string; password: string }) => {
    const nextUser = await api.register(input);
    setUser(nextUser);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(() => ({ user, loading, login, register, logout, refresh }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageShell><div className="mx-auto max-w-3xl py-20 text-center text-sm text-stone-500">Loading your celebration...</div></PageShell>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[var(--ivory)] text-[var(--charcoal)]">
      <header className="border-b border-[color:var(--border)] bg-[rgba(250,248,245,0.9)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--charcoal)] text-sm font-medium text-[var(--ivory)]">V</div>
            <div>
              <div className="font-display text-2xl tracking-tight">Vow &amp; Veil</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-stone-600 md:flex">
            <Link to="/features">Features</Link>
            <Link to="/venues">Venues</Link>
            <Link to="/how-it-works">How it Works</Link>
            <Link to="/about">About</Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <Link to="/dashboard" className="rounded-full border border-[var(--charcoal)] px-4 py-2 text-sm font-medium">Dashboard</Link>
                <button type="button" onClick={handleLogout} className="rounded-full bg-[var(--charcoal)] px-4 py-2 text-sm font-medium text-white">Log Out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-full border border-[var(--charcoal)] px-4 py-2 text-sm font-medium">Log In</Link>
                <Link to="/register" className="rounded-full bg-[var(--charcoal)] px-4 py-2 text-sm font-medium text-white">Start Planning</Link>
              </>
            )}
          </div>

          <button type="button" className="md:hidden" onClick={() => setMobileOpen((open) => !open)} aria-label="Toggle menu">
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-[color:var(--border)] bg-[var(--ivory)] px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-medium text-stone-700">
              <Link to="/features" onClick={() => setMobileOpen(false)}>Features</Link>
              <Link to="/venues" onClick={() => setMobileOpen(false)}>Venues</Link>
              <Link to="/how-it-works" onClick={() => setMobileOpen(false)}>How it Works</Link>
              <Link to="/about" onClick={() => setMobileOpen(false)}>About</Link>
              <Link to="/login" onClick={() => setMobileOpen(false)}>Log In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}>Start Planning</Link>
            </div>
          </div>
        )}
      </header>
      <main>{children}</main>
      <footer className="border-t border-[color:var(--border)] bg-[#f5f1ec]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="lg:col-span-2">
            <div className="font-display text-3xl tracking-tight">Vow &amp; Veil</div>
            <p className="mt-3 max-w-sm text-sm text-stone-600">Your forever, beautifully planned.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Explore</h3>
            <ul className="mt-4 space-y-2 text-sm text-stone-600">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/how-it-works">How It Works</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm text-stone-600">
              <li><span className="italic">Privacy placeholder</span></li>
              <li><span className="italic">Terms placeholder</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Portfolio</h3>
            <p className="mt-4 text-sm text-stone-600">This is a fictional portfolio-demo concept for a wedding planning product.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">{children}</div>;
}

function HomePage() {
  return (
    <PublicLayout>
      <section className="bg-[var(--ivory)]">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-24">
          <div className="flex flex-col items-start justify-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--sage)]/50 bg-[var(--champagne)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-700">
              <Heart className="h-3.5 w-3.5" /> Wedding planning, beautifully organized
            </div>
            <h1 className="max-w-xl font-display text-5xl leading-none text-[var(--charcoal)] sm:text-6xl">A beautiful beginning deserves a beautifully planned celebration.</h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-stone-600">From the first idea to the final unforgettable moment, Vow &amp; Veil brings your wedding plans, budget, guests, and milestones together in one thoughtfully designed space.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-[var(--charcoal)] px-6 py-3 font-medium text-white">Start Planning for Free <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/features" className="inline-flex items-center gap-2 rounded-full border border-[var(--charcoal)] px-6 py-3 font-medium text-[var(--charcoal)]">Explore Features</Link>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-[#f7f3ee] p-4 shadow-[0_30px_80px_rgba(48,46,44,0.08)]">
              <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,#f5efe9,#f0e3d7)] p-6">
                <div className="flex items-center justify-between text-sm text-stone-600">
                  <span>Spring 2027</span>
                  <span className="rounded-full bg-white px-2 py-1">Planning in progress</span>
                </div>
                <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--champagne)] font-semibold text-[var(--charcoal)]">AS</div>
                    <div>
                      <div className="text-lg font-semibold text-[var(--charcoal)]">Ava &amp; Sean</div>
                      <div className="text-sm text-stone-500">Chicago, Illinois</div>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-[#f5f1ec] p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Budget</div>
                      <div className="mt-2 text-2xl font-semibold text-[var(--charcoal)]">$24.8k</div>
                    </div>
                    <div className="rounded-xl bg-[#f5f1ec] p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Guests</div>
                      <div className="mt-2 text-2xl font-semibold text-[var(--charcoal)]">148</div>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3 text-sm text-stone-600">
                    <div className="flex items-center justify-between rounded-xl bg-[#f5f1ec] px-3 py-2"><span>Venue shortlist</span><span className="font-medium text-[var(--charcoal)]">3 options</span></div>
                    <div className="flex items-center justify-between rounded-xl bg-[#f5f1ec] px-3 py-2"><span>Checklist</span><span className="font-medium text-[var(--charcoal)]">72% complete</span></div>
                    <div className="flex items-center justify-between rounded-xl bg-[#f5f1ec] px-3 py-2"><span>Timeline</span><span className="font-medium text-[var(--charcoal)]">On track</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[color:var(--border)] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Everything in one place</p>
            <h2 className="mt-3 font-display text-4xl text-[var(--charcoal)]">From vision to vows.</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[
              { icon: Wallet, title: 'Wedding budgeting', text: 'Track spending, priorities, and payment milestones with a clear overview.' },
              { icon: Users, title: 'Guest management', text: 'Keep RSVPs, guest counts, and family notes organized and accessible.' },
              { icon: CalendarDays, title: 'Venue discovery', text: 'Shortlist venues and compare key details without losing the bigger picture.' },
              { icon: CheckCircle2, title: 'Wedding checklists', text: 'Manage to-dos for each stage of planning with a calm, actionable flow.' },
              { icon: Sparkles, title: 'Planning timelines', text: 'See the milestones that matter most as your celebration approaches.' },
              { icon: Heart, title: 'Shared planning workspace', text: 'Keep your wedding details in a single workspace built for collaboration.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-3xl border border-[color:var(--border)] bg-[#faf8f5] p-6">
                <div className="mb-4 inline-flex rounded-2xl bg-[var(--champagne)] p-3 text-[var(--charcoal)]"><Icon className="h-5 w-5" /></div>
                <h3 className="text-xl font-semibold text-[var(--charcoal)]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">How it works</p>
            <h2 className="mt-3 font-display text-4xl text-[var(--charcoal)]">Planning that feels effortless.</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3 lg:col-span-3">
            {[
              ['01', 'Tell us about your celebration', 'Share your wedding style, date, budget, and the details that matter most.'],
              ['02', 'Organize everything in one place', 'Keep your budget, guests, tasks, and milestones aligned in a single workspace.'],
              ['03', 'Plan confidently, together', 'Stay on top of progress and make decisions with clarity from the very beginning.'],
            ].map(([step, title, text]) => (
              <div key={step} className="rounded-3xl border border-[color:var(--border)] bg-[#f7f3ee] p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">{step}</div>
                <h3 className="mt-4 text-xl font-semibold text-[var(--charcoal)]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--charcoal)] py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl text-white sm:text-5xl">Your celebration starts here.</h2>
          <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[var(--charcoal)]">Create Your Wedding Workspace <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </PublicLayout>
  );
}

function FeaturesPage() {
  return (
    <PublicLayout>
      <PageShell>
        <h1 className="font-display text-5xl text-[var(--charcoal)]">Features</h1>
        <p className="mt-4 max-w-2xl text-lg text-stone-600">Built to make the planning process feel thoughtful, organized, and beautifully manageable.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {['Wedding budgeting', 'Guest management', 'Venue discovery', 'Planning timelines', 'Checklists', 'Shared planning workspace'].map((feature) => (
            <div key={feature} className="rounded-3xl border border-[color:var(--border)] bg-[#faf8f5] p-6">
              <h2 className="text-2xl font-semibold text-[var(--charcoal)]">{feature}</h2>
              <p className="mt-3 text-stone-600">Early-phase planning tools designed to help couples organize the most important decision points and milestones.</p>
            </div>
          ))}
        </div>
      </PageShell>
    </PublicLayout>
  );
}

function VenuesPage() {
  return (
    <PublicLayout>
      <PageShell>
        <h1 className="font-display text-5xl text-[var(--charcoal)]">Venues</h1>
        <div className="mt-6 rounded-3xl border border-[color:var(--border)] bg-[#faf8f5] p-10 text-center">
          <p className="text-xl text-stone-700">Venue discovery is a planned Phase 3 feature.</p>
          <p className="mt-3 text-stone-600">This page highlights the direction of the experience without presenting a live marketplace or fake booking data.</p>
        </div>
      </PageShell>
    </PublicLayout>
  );
}

function HowItWorksPage() {
  return (
    <PublicLayout>
      <PageShell>
        <h1 className="font-display text-5xl text-[var(--charcoal)]">How it works</h1>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ['1. Tell us about your celebration', 'Start with the essentials: your date, style, venue goals, and budget.'],
            ['2. Organize everything in one place', 'Track budgets, checklists, guests, and major milestones without juggling scattered notes.'],
            ['3. Plan confidently, together', 'Keep your partner and your planning team aligned with a calm, readable workflow.'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-3xl border border-[color:var(--border)] bg-[#faf8f5] p-6">
              <h2 className="text-xl font-semibold text-[var(--charcoal)]">{title}</h2>
              <p className="mt-3 text-stone-600">{text}</p>
            </div>
          ))}
        </div>
      </PageShell>
    </PublicLayout>
  );
}

function AboutPage() {
  return (
    <PublicLayout>
      <PageShell>
        <h1 className="font-display text-5xl text-[var(--charcoal)]">About Vow &amp; Veil</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-600">Vow &amp; Veil is a premium wedding planning product concept designed to bring clarity, calm, and confidence to the planning process.</p>
      </PageShell>
    </PublicLayout>
  );
}

function AuthCard({ title, subtitle, onSubmit, children }: { title: string; subtitle: string; onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> | void; children: React.ReactNode }) {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-[2rem] border border-[color:var(--border)] bg-white p-8 shadow-[0_30px_80px_rgba(48,46,44,0.08)]">
      <h1 className="font-display text-4xl text-[var(--charcoal)]">{title}</h1>
      <p className="mt-2 text-sm text-stone-600">{subtitle}</p>
      <form className="mt-8 space-y-5" onSubmit={onSubmit}>{children}</form>
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setError('');
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log in.');
    }
  };

  return (
    <PublicLayout>
      <AuthCard title="Welcome back" subtitle="Access your wedding workspace." onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-stone-700">
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[#faf8f5] px-4 py-3 outline-none ring-0 focus:border-[var(--sage)]" />
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className="mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[#faf8f5] px-4 py-3 outline-none ring-0 focus:border-[var(--sage)]" />
        </label>
        {error && <div className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <button type="submit" className="w-full rounded-full bg-[var(--charcoal)] px-4 py-3 font-medium text-white">Log In</button>
        <p className="text-center text-sm text-stone-600">Need an account? <Link to="/register" className="font-medium text-[var(--charcoal)]">Create one</Link></p>
      </AuthCard>
    </PublicLayout>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setError('');
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
    }
  };

  return (
    <PublicLayout>
      <AuthCard title="Create your account" subtitle="Start planning your celebration." onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-stone-700">
            First name
            <input value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} required className="mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[#faf8f5] px-4 py-3" />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Last name
            <input value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} required className="mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[#faf8f5] px-4 py-3" />
          </label>
        </div>
        <label className="block text-sm font-medium text-stone-700">
          Email
          <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required className="mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[#faf8f5] px-4 py-3" />
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Password
          <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required minLength={8} className="mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[#faf8f5] px-4 py-3" />
        </label>
        {error && <div className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <button type="submit" className="w-full rounded-full bg-[var(--charcoal)] px-4 py-3 font-medium text-white">Create Account</button>
        <p className="text-center text-sm text-stone-600">Already have an account? <Link to="/login" className="font-medium text-[var(--charcoal)]">Log in</Link></p>
      </AuthCard>
    </PublicLayout>
  );
}

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['current-wedding'],
    queryFn: async () => api.getCurrentWedding(),
    retry: false,
  });

  const wedding = data && !(data as { exists?: boolean }).exists ? (data as Wedding) : null;

  const [form, setForm] = useState<Wedding>({
    weddingName: wedding?.weddingName ?? '',
    partnerOneName: wedding?.partnerOneName ?? '',
    partnerTwoName: wedding?.partnerTwoName ?? '',
    city: wedding?.city ?? '',
    venueName: wedding?.venueName ?? '',
    planningStage: wedding?.planningStage ?? 'DISCOVERY',
    notes: wedding?.notes ?? '',
  });

  useEffect(() => {
    if (wedding) {
      setForm({
        weddingName: wedding.weddingName ?? '',
        partnerOneName: wedding.partnerOneName ?? '',
        partnerTwoName: wedding.partnerTwoName ?? '',
        city: wedding.city ?? '',
        venueName: wedding.venueName ?? '',
        planningStage: wedding.planningStage ?? 'DISCOVERY',
        notes: wedding.notes ?? '',
      });
    }
  }, [wedding]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await api.updateCurrentWedding(form);
    await refetch();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--ivory)] text-[var(--charcoal)]">
      <header className="border-b border-[color:var(--border)] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="font-display text-2xl">Vow &amp; Veil</Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-600">{user?.firstName ?? 'Planner'}</span>
            <button type="button" onClick={handleLogout} className="rounded-full border border-[var(--charcoal)] px-4 py-2 text-sm font-medium">Log out</button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-[color:var(--border)] bg-white p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Wedding overview</p>
            <h1 className="mt-3 font-display text-4xl text-[var(--charcoal)]">{wedding?.weddingName ?? 'Your wedding journey begins here'}</h1>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#f5f1ec] p-4"><div className="text-xs uppercase tracking-[0.2em] text-stone-500">Planning stage</div><div className="mt-2 text-lg font-semibold">{wedding?.planningStage ?? 'DISCOVERY'}</div></div>
              <div className="rounded-2xl bg-[#f5f1ec] p-4"><div className="text-xs uppercase tracking-[0.2em] text-stone-500">Venue</div><div className="mt-2 text-lg font-semibold">{wedding?.venueName ?? 'Not set yet'}</div></div>
              <div className="rounded-2xl bg-[#f5f1ec] p-4"><div className="text-xs uppercase tracking-[0.2em] text-stone-500">City</div><div className="mt-2 text-lg font-semibold">{wedding?.city ?? 'Add your city'}</div></div>
            </div>
          </div>

          <form onSubmit={handleSave} className="rounded-[2rem] border border-[color:var(--border)] bg-white p-8">
            <h2 className="font-display text-3xl text-[var(--charcoal)]">Wedding details</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-medium text-stone-700 md:col-span-2">
                Wedding name
                <input value={form.weddingName ?? ''} onChange={(event) => setForm((value) => ({ ...value, weddingName: event.target.value }))} required className="mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[#faf8f5] px-4 py-3" />
              </label>
              <label className="block text-sm font-medium text-stone-700">
                Partner one
                <input value={form.partnerOneName ?? ''} onChange={(event) => setForm((value) => ({ ...value, partnerOneName: event.target.value }))} className="mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[#faf8f5] px-4 py-3" />
              </label>
              <label className="block text-sm font-medium text-stone-700">
                Partner two
                <input value={form.partnerTwoName ?? ''} onChange={(event) => setForm((value) => ({ ...value, partnerTwoName: event.target.value }))} className="mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[#faf8f5] px-4 py-3" />
              </label>
              <label className="block text-sm font-medium text-stone-700">
                City
                <input value={form.city ?? ''} onChange={(event) => setForm((value) => ({ ...value, city: event.target.value }))} className="mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[#faf8f5] px-4 py-3" />
              </label>
              <label className="block text-sm font-medium text-stone-700">
                Venue name
                <input value={form.venueName ?? ''} onChange={(event) => setForm((value) => ({ ...value, venueName: event.target.value }))} className="mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[#faf8f5] px-4 py-3" />
              </label>
              <label className="block text-sm font-medium text-stone-700">
                Planning stage
                <select value={form.planningStage ?? 'DISCOVERY'} onChange={(event) => setForm((value) => ({ ...value, planningStage: event.target.value }))} className="mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[#faf8f5] px-4 py-3">
                  <option value="DISCOVERY">Discovery</option>
                  <option value="BOOKED">Booked</option>
                  <option value="PLANNING">Planning</option>
                  <option value="FINAL_PREPARATIONS">Final preparations</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-stone-700 md:col-span-2">
                Notes
                <textarea value={form.notes ?? ''} onChange={(event) => setForm((value) => ({ ...value, notes: event.target.value }))} rows={5} className="mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[#faf8f5] px-4 py-3" />
              </label>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="submit" className="rounded-full bg-[var(--charcoal)] px-5 py-3 font-medium text-white" disabled={isLoading}>Save details</button>
            </div>
          </form>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-[color:var(--border)] bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Today</p>
            <ul className="mt-5 space-y-4 text-sm text-stone-700">
              <li className="flex items-center justify-between rounded-2xl bg-[#f5f1ec] p-3"><span>Guest list</span><span>148 invited</span></li>
              <li className="flex items-center justify-between rounded-2xl bg-[#f5f1ec] p-3"><span>Budget</span><span>$24,800</span></li>
              <li className="flex items-center justify-between rounded-2xl bg-[#f5f1ec] p-3"><span>Checklist</span><span>72% complete</span></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/venues" element={<VenuesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
