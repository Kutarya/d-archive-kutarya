// İlk kurulum gerçek proje uydurmaz. İçerikler yönetici tarafından eklenir.
export const games = [];
export const categories = [
  { id: "oyun", name: "Oyun geliştirme", order: 0 },
  { id: "uygulama", name: "Uygulamalar", order: 1 },
  { id: "web", name: "Web geliştirme", order: 2 },
  { id: "acik-kaynak", name: "Açık kaynak", order: 3 },
  { id: "arac", name: "Yardımcı araçlar", order: 4 },
];
export const settings = {
  title: "Kutarya",
  tagline: "Fikirden projeye. Projeden sana.",
  notice: "",
  maintenance: false,
  contact: "kutaryaai@gmail.com",
};
export const announcements = [
  {
    id: "merhaba",
    title: "Kutarya’da yeni bir paylaşım alanı.",
    body: "Oyunlar, masaüstü ve mobil uygulamalar, web projeleri ve kaynak kod için ortak bir kütüphane hazırlıyoruz. Yeni projeler paylaşıldıkça koleksiyonlar burada dolacak.",
    status: "published",
    createdAt: Date.now(),
  },
];
