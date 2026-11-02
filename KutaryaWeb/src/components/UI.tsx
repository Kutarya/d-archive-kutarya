import { Link } from "react-router-dom";
import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  ArrowUpRight,
  Sparkles,
  ArrowRight,
  Download,
  Code2,
  Play,
} from "lucide-react";
import type { Game } from "../types";
import { Art } from "./Art";
import { kindOf, platforms } from "../content";
import { capabilities } from "../discovery.mjs";
export function Logo() {
  return (
    <Link to="/" className="logo">
      <svg viewBox="-3.48 0 24 32" aria-hidden="true">
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M8.52 5.96L17.04 13.75L13.38 13.77L9.71 10.46L9.71 18.14L16.02 24.54L8.52 32L1.02 24.54L7.33 18.14L7.33 10.46L3.66 13.77L0 13.75ZM8.52 20.44L4.46 24.48L8.52 28.56L12.58 24.48Z"
        />
        <path
          fill="#35c08a"
          d="M8.52 0.79L10.38 3.09L8.52 5.34L6.66 3.09ZM1.85 0L5.47 3.62L4.63 3.71L3.84 3.66L1.02 0.93ZM15.19 0L11.57 3.62L12.41 3.71L13.2 3.66L16.02 0.93Z"
        />
      </svg>
      <span>
        Kutarya<span className="logo-sub">PROJELER & DENEYİMLER</span>
      </span>
    </Link>
  );
}
export function GameCard({ game, index = 0 }: { game: Game; index?: number }) {
  const access = capabilities(game);
  return (
    <article
      className="game-card"
      style={
        {
          "--game-color": game.color,
          animationDelay: `${index * 50}ms`,
        } as React.CSSProperties
      }
    >
      <div className="card-art">
        <Link to={`/proje/${game.slug}`} tabIndex={-1} aria-hidden="true">
          <Art
            kind={game.cover}
            className={game.kind === "mobile" ? "mobile-cover" : ""}
          />
        </Link>
        <span className="card-badge">{kindOf(game).singular}</span>
      </div>
      <div className="card-content">
        <Link to={`/proje/${game.slug}`} className="card-title">
          {game.title}
          <ArrowUpRight size={17} />
        </Link>
        {game.subtitle && <p className="card-description">{game.subtitle}</p>}
        <div className="card-meta">
          <span>
            {game.platforms
              .map((platform) => platforms[platform] || platform)
              .join(" · ")}
          </span>
          <span className="card-version">v{game.version}</span>
        </div>
        <div className="card-capabilities" aria-label="Projenin sundukları">
          {access.browser && (
            <span>
              <Play size={12} />
              Tarayıcıda
            </span>
          )}
          {access.download && (
            <span>
              <Download size={12} />
              İndirilebilir
            </span>
          )}
          {access.source && (
            <span>
              <Code2 size={12} />
              Kaynak kod
            </span>
          )}
        </div>
        <div className="card-actions">
          <Link
            to={`/proje/${game.slug}`}
            aria-label={`${game.title} ayrıntıları`}
          >
            İncele <ArrowRight size={15} />
          </Link>
          {access.browser ? (
            <LaunchLink game={game} className="card-launch">
              {game.kind === "game" ? "Oyunu aç" : "Uygulamayı aç"}
              <ArrowUpRight size={15} />
            </LaunchLink>
          ) : (
            (access.download || access.source) && (
              <Link
                to={`/proje/${game.slug}?sekme=dosyalar`}
                className="card-launch"
                aria-label={`${game.title} dosyalarını gör`}
              >
                Dosyaları gör <Download size={14} />
              </Link>
            )
          )}
        </div>
      </div>
    </article>
  );
}
export function LaunchLink({
  game,
  className,
  children,
}: {
  game: Game;
  className?: string;
  children: ReactNode;
}) {
  return game.kind === "tool" ? (
    <a
      href={game.runtime}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  ) : (
    <Link to={`/oyna/${game.slug}`} className={className}>
      {children}
    </Link>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <Sparkles size={32} />
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
export function PageHead({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-head">
      <span className="eyebrow">{label}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const labelId = useId();
  function connect(nodes: ReactNode): ReactNode {
    return Children.map(nodes, (child) => {
      if (!isValidElement(child)) return child;
      const element = child as ReactElement<any>;
      if (["input", "select", "textarea"].includes(String(element.type)))
        return cloneElement(
          element,
          element.props["aria-label"] ? {} : { "aria-labelledby": labelId },
        );
      return element.props.children
        ? cloneElement(element, {}, connect(element.props.children))
        : element;
    });
  }
  return (
    <div className="field">
      <span id={labelId}>{label}</span>
      {connect(children)}
    </div>
  );
}
