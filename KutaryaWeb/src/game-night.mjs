// Liste yalnız gerçek, yayınlı ve açılabilir katalog projelerinden oluşur.
export const nightMoods = [
  { id: '', title: 'Hepsi', note: 'Akşam sana kalsın.' },
  { id: 'arkadaslarla', title: 'Arkadaşlarla', note: 'Aynı oda, farklı ekranlar.' },
  { id: 'kisa', title: 'Kısa bir mola', note: 'Bir el, bir tur, küçük bir ara.' },
  { id: 'kesif', title: 'Biraz keşif', note: 'Kendi ritminde bir dünya.' },
];
const notes = {
  blackjack: { number: '01', line: 'Bir kart daha?', description: 'Yeşil masaya otur. Asın iki yüzü, bir kararın var.', mood: 'kisa', minutes: 'Kısa turlar' },
  'rus-ruleti': { number: '02', line: 'Son tura kadar.', description: 'Arkadaşlarını çağır. Sıranı bekle, şansını dene.', mood: 'arkadaslarla', minutes: 'Kısa maçlar' },
  pixelgun: { number: '03', line: 'Arenada buluşalım.', description: 'Üç arena, arkadaşların ve biraz rekabet.', mood: 'arkadaslarla', minutes: '3–10 dakika' },
  rulet: { number: '04', line: 'Çark bir daha dönsün.', description: 'Bir renk seç, çarkın ritmine küçük bir mola ver.', mood: 'kisa', minutes: 'Kısa turlar' },
  'blok-diyari': { number: '05', line: 'Bu dünya senin.', description: 'Bir tohumdan başla. Keşfet, üret, kendi yerini kur.', mood: 'kesif', minutes: 'Serbest keşif' },
};
export function nightEntries(projects, mood = '') {
  return projects.filter(g => g.status === 'published' && g.kind === 'game' && ['web', 'unity'].includes(g.engine) && g.runtime).map(game => {
    const online = (game.tags || []).some(tag => ['online', 'çevrimiçi', 'çevrim içi'].includes(tag.toLocaleLowerCase('tr')));
    const note = notes[game.id] || { number: '↗', line: game.title, description: game.subtitle, mood: online ? 'arkadaslarla' : 'kesif', minutes: game.duration || 'Kendi ritminde' };
    return { game, ...note, online, modes: online ? 'Arkadaşlarla · Tek başına' : 'Tek başına' };
  }).filter(entry => !mood || (mood === 'arkadaslarla' ? entry.online : entry.mood === mood)).sort((a, b) => a.number.localeCompare(b.number));
}
