import type { ReactNode } from "react";
interface AppShellProps {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  variant?: "admin" | "fryer" | "home";
}

export function AppShell({ children, eyebrow, title, subtitle, actions, variant = "admin" }: AppShellProps) {
  return (
    <div className={`app-shell ${variant}-shell`}>
      <header className={variant === "fryer" ? "topbar" : "header"}>
        <div className={variant === "fryer" ? "topbar-left" : "header-left"}>
          {eyebrow && <div className="header-kicker">{eyebrow}</div>}
          <h1 className="headline header-title">{title}</h1>
          {subtitle && <div className="header-sub">{subtitle}</div>}
        </div>
        <nav className="header-actions" aria-label="Page actions">{actions}</nav>
      </header>
      <main className={variant === "fryer" ? "wrap fryer-wrap" : "wrap"}>{children}</main>
    </div>
  );
}
