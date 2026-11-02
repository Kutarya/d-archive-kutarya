import { useRef, useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  Maximize,
  Minimize,
  ArrowLeft,
  HelpCircle,
  ArrowUpRight,
} from "lucide-react";
import { useApp } from "../state";
import { api } from "../services/firebase";
import { Empty } from "../components/UI";

export default function Player() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const { catalog, toast } = useApp();
  const game = catalog.games.find((g) => g.slug === slug);
  const code = params.get("masa") || "";
  const playRuntime = game?.slug === "blackjack" && /^[A-HJ-NP-Z2-9]{6}$/.test(code)
    ? `${game.runtime}${game.runtime.includes("?") ? "&" : "?"}masa=${code}`
    : game?.runtime || "";
  const isGame = game?.kind === "game";
  const frame = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState(false),
    [help, setHelp] = useState(false),
    [started, setStarted] = useState(false),
    [packageState, setPackageState] = useState("idle"),
    [packageError, setPackageError] = useState("");
  const lastReport = useRef(0);
  const loadRequest = useRef<AbortController | null>(null);
  useEffect(() => {
    setStarted(false);
    setPackageState("idle");
    setPackageError("");
    lastReport.current = 0;
    return () => {
      loadRequest.current?.abort();
      loadRequest.current = null;
    };
  }, [slug]);
  useEffect(() => {
    if (packageState !== "loading") return;
    const timer = setTimeout(() => {
      setPackageState("error");
      setPackageError(
        "Proje paketine zamanında ulaşılamadı. Bağlantını kontrol edip tekrar dene.",
      );
      setStarted(false);
    }, 45000);
    return () => clearTimeout(timer);
  }, [packageState]);
  useEffect(() => {
    const handler = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);
  if (!game || !["unity", "web"].includes(game.engine))
    return (
      <Empty title="Tarayıcı deneyimi bulunamadı.">
        <Link to="/projeler">Projelere dön.</Link>
      </Empty>
    );
  async function start() {
    if (Date.now() - lastReport.current < 60000) return;
    lastReport.current = Date.now();
    const session =
      sessionStorage.getItem("kutarya-play-session") || crypto.randomUUID();
    sessionStorage.setItem("kutarya-play-session", session);
    try {
      await api("play", { gameId: game!.id, session });
    } catch (e: any) {
      toast(e.message);
    }
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await frame.current?.requestFullscreen();
    } catch {
      toast("Bu tarayıcı tam ekranı desteklemiyor. Burada devam edebilirsin.");
    }
  }
  async function loadPackage() {
    loadRequest.current?.abort();
    const request = new AbortController();
    loadRequest.current = request;
    const timeout = setTimeout(() => request.abort(), 10000);
    setPackageError("");
    setPackageState("loading");
    try {
      const response = await fetch(playRuntime, {
        method: "HEAD",
        signal: request.signal,
      });
      if (
        !response.ok ||
        !response.headers.get("content-type")?.includes("text/html")
      )
        throw new Error(
          "Proje paketi şu anda açılamıyor. Tekrar deneyebilir veya sorun bildirebilirsin.",
        );
      if (request.signal.aborted) return;
      setStarted(true);
    } catch (error: any) {
      if (loadRequest.current !== request) return;
      setPackageError(
        error.name === "AbortError"
          ? "Bağlantı zaman aşımına uğradı. Tekrar dene."
          : error.message,
      );
      setPackageState("error");
      setStarted(false);
    } finally {
      clearTimeout(timeout);
    }
  }
  return (
    <>
      <div className="player-top">
        <Link to={`/proje/${game.slug}`} className="back-link">
          <ArrowLeft size={17} /> Proje sayfası
        </Link>
        <span className="status-tag">
          {game.engine === "unity" ? "Unity Web" : "Web deneyimi"}
        </span>
      </div>
      <div className="player-heading">
        <div>
          <span className="eyebrow">KUTARYA / TARAYICI DENEYİMİ</span>
          <h1>{game.title}</h1>
        </div>
      </div>
      <div className="player-frame" ref={frame}>
        {started ? (
          <iframe
            src={playRuntime}
            title={game.title}
            sandbox={
              isGame
                ? "allow-scripts allow-pointer-lock"
                : "allow-scripts allow-downloads"
            }
            allow="fullscreen; autoplay"
            onLoad={() => {
              setPackageState("loaded");
              void start();
            }}
            onError={() => {
              setPackageError("Proje paketi yüklenemedi. Tekrar dene.");
              setPackageState("error");
              setStarted(false);
            }}
          />
        ) : (
          <div className="puzzle-start">
            <h2>{game.title}</h2>
            <p role={packageError ? "alert" : undefined}>
              {packageError ||
                `${isGame ? "Oyun" : "Uygulama"} paketi bu adımda yüklenir.`}
            </p>
            <button
              className="button"
              disabled={packageState === "loading"}
              onClick={() => void loadPackage()}
            >
              {packageState === "loading"
                ? "Pakete bağlanılıyor…"
                : packageState === "error"
                  ? "Tekrar dene"
                  : isGame
                    ? "Oyunu yükle"
                    : "Uygulamayı yükle"}{" "}
              <ArrowUpRight size={18} />
            </button>
          </div>
        )}
        <div className="player-toolbar">
          <span>
            {game.title}
            <small>v{game.version}</small>
          </span>
          <div>
            <a
              className="text-button"
              href={playRuntime}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ArrowUpRight size={17} /> Ayrı sekmede aç
            </a>
            <button className="text-button" onClick={() => setHelp(!help)}>
              <HelpCircle size={17} /> Kontroller
            </button>
            <button className="text-button" onClick={() => void fullscreen()}>
              {full ? <Minimize size={17} /> : <Maximize size={17} />}{" "}
              {full ? "Küçült" : "Tam ekran"}
            </button>
          </div>
        </div>
      </div>
      {help && (
        <div className="panel controls-panel">
          <h3>Kontroller</h3>
          <p>{game.controls}</p>
        </div>
      )}
      <div className="player-bottom">
        <span>
          <b>{game.title}</b> · v{game.version}
        </span>
        <Link to={`/destek?proje=${game.id}`}>
          Sorun bildir <ArrowUpRight size={14} />
        </Link>
      </div>
    </>
  );
}
