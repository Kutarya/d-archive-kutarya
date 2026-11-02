import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Clock, ArrowUpRight, ShieldCheck, LogOut } from "lucide-react";
import { useApp } from "../state";
import { api } from "../services/firebase";
import { PageHead, GameCard, Empty, Field } from "../components/UI";
export default function Account({ library = false }: { library?: boolean }) {
  const { user, profile, catalog, authLoading, refreshProfile, toast, logout } =
    useApp();
  const [tab, setTab] = useState("favorites"),
    [name, setName] = useState(""),
    [bio, setBio] = useState(""),
    [avatar, setAvatar] = useState("spark"),
    [busy, setBusy] = useState(false),
    [clear, setClear] = useState(false);
  useEffect(() => {
    setName(profile?.displayName || user?.displayName || "");
    setBio(profile?.bio || "");
    setAvatar(profile?.avatar || "spark");
  }, [profile]);
  if (authLoading) return <div className="loading">Hesabın hazırlanıyor…</div>;
  if (!user)
    return (
      <>
        <PageHead
          label="SANA AİT BİR YER"
          title={library ? "Koleksiyonun hep yanında." : "Kutarya hesabın."}
          description="Favorilerin, son incelenen projeler ve profilin tek bir hesapta."
        />
        <Empty title="Kütüphaneni oluşturalım">
          <Link
            className="button"
            to={`/auth/login?next=${library ? "/kutuphanem" : "/hesabim"}`}
          >
            Giriş yap <ArrowUpRight size={17} />
          </Link>
        </Empty>
      </>
    );
  const verifyBanner = !user.emailVerified ? (
    <div className="notice">
      Üye işlemlerini kullanmak için e-postanı doğrula.{" "}
      <Link to="/auth/verify-email">Doğrulamayı tamamla →</Link>
    </div>
  ) : null;
  if (library) {
    const gameIds =
      tab === "favorites"
        ? profile?.favorites
        : profile?.recent.map((x) => x.id);
    const list =
      gameIds
        ?.map((id) => catalog.games.find((g) => g.id === id))
        .filter(Boolean) || [];
    return (
      <>
        <PageHead
          label="KENDİ KOLEKSİYONUN"
          title={`${profile?.displayName || "Üye"}, koleksiyonun.`}
          description="Oyunlarını, uygulamalarını ve kaynaklarını tek bir yerde sakla."
        />
        {verifyBanner}
        <div className="catalog-chips">
          <button
            className={`chip ${tab === "favorites" ? "active" : ""}`}
            onClick={() => setTab("favorites")}
          >
            <Heart size={15} /> Favoriler
          </button>
          <button
            className={`chip ${tab === "recent" ? "active" : ""}`}
            onClick={() => setTab("recent")}
          >
            <Clock size={15} /> Son incelenen
          </button>
          <span>{list.length} proje</span>
        </div>
        <div className="game-grid">
          {list.map((g) => (
            <GameCard game={g!} key={g!.id} />
          ))}
        </div>
        {!list.length && (
          <Empty
            title={
              tab === "favorites"
                ? "Henüz bir favorin yok."
                : "Henüz incelenen proje yok."
            }
          >
            <Link to="/projeler">Koleksiyonu keşfet →</Link>
          </Empty>
        )}
      </>
    );
  }
  return (
    <>
      <PageHead
        label="KUTARYA HESABI"
        title="Kutarya profilin."
        description="Küçük dokunuşlarla burayı kendine ait kıl."
      />
      {verifyBanner}
      <div className="account-layout">
        <aside className="panel account-summary">
          <div className="avatar-large">
            {avatar === "spark"
              ? "✦"
              : avatar === "moon"
                ? "☾"
                : avatar === "orbit"
                  ? "◎"
                  : "❋"}
          </div>
          <h2>{profile?.displayName || "Üye"}</h2>
          <p>{user.email}</p>
          <span className="status-tag">
            <ShieldCheck size={14} />
            {user.emailVerified ? "Doğrulanmış hesap" : "Doğrulama bekliyor"}
          </span>
          <div className="account-stats">
            <span>
              <b>{profile?.favorites.length || 0}</b>Favori
            </span>
            <span>
              <b>{profile?.recent.length || 0}</b>İncelenen proje
            </span>
          </div>
          <button className="button outline full" onClick={() => void logout()}>
            <LogOut size={17} /> Çıkış yap
          </button>
        </aside>
        <form
          className="panel form-panel"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await api("profile", { displayName: name, bio, avatar });
              await refreshProfile();
              toast("Profilin güncellendi.");
            } catch (e: any) {
              toast(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2>Profilini düzenle</h2>
          <Field label="Görünen ad">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              required
            />
          </Field>
          <Field label="Kısa bir not">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={3}
            />
          </Field>
          <Field label="Avatar">
            <div className="avatar-options">
              {[
                ["spark", "✦"],
                ["moon", "☾"],
                ["orbit", "◎"],
                ["leaf", "❋"],
              ].map(([id, symbol]) => (
                <button
                  type="button"
                  aria-label={id}
                  className={avatar === id ? "selected" : ""}
                  key={id}
                  onClick={() => setAvatar(id)}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </Field>
          <button className="button" disabled={busy || !user.emailVerified}>
            {busy ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
          </button>
          <div className="account-danger">
            <h3>Site profilini temizle</h3>
            <p>
              Favorilerin, yakın geçmişin ve site profilin silinir. Ortak
              Kutarya hesabın korunur.
            </p>
            {clear ? (
              <div className="inline-actions">
                <button
                  type="button"
                  className="button danger"
                  onClick={async () => {
                    try {
                      await api("clearProfile");
                      await refreshProfile();
                      setClear(false);
                      toast("Site profilin temizlendi.");
                    } catch (e: any) {
                      toast(e.message);
                    }
                  }}
                >
                  Evet, proje profilimi temizle
                </button>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setClear(false)}
                >
                  Vazgeç
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="text-button danger-text"
                onClick={() => setClear(true)}
              >
                Verilerimi temizle
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
