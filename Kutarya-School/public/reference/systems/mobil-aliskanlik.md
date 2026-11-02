---
title: "Çevrimdışı çalışan alışkanlık takip uygulaması"
type: "system-guide"
canonical: "https://kutarya.com/sistemler/mobil-aliskanlik"
publisher: "Kutarya"
language: "tr-TR"
category: "Mobil"
---

# Çevrimdışı çalışan alışkanlık takip uygulaması

Flutter ile alışkanlık ekleme, günlük tamamlama, yerel kayıt ve test içeren çalışır bir mobil uygulama.

**Kategori:** Mobil
**Teknoloji yığını:** Dart, Flutter, SharedPreferences
**Seviye:** Orta
**Okuma süresi:** 28 dk

## Sonuç

İnternet gerektirmeden alışkanlık ekleyen, tamamlanma durumunu saklayan ve yeniden açıldığında veriyi geri yükleyen uygulama.

## Ön koşullar

- Flutter SDK ve çalışan flutter doctor çıktısı
- Android emülatörü veya fiziksel cihaz
- Dart sınıfları ve async/await temeli

## Dosya ağacı

```text
habit_tracker/
  lib/
    main.dart
    habit.dart
    habit_store.dart
  test/
    habit_test.dart
  pubspec.yaml
```

## Kurulum

flutter create habit_tracker
cd habit_tracker
flutter pub add shared_preferences
flutter test
flutter run

## lib/main.dart

Uygulama açılışında kayıtları yükler; ekleme ve tamamlama işlemlerinden sonra kalıcılığı bekler. Arayüz yalnız ekrandaki kopyayı değil aynı Habit nesnelerini yönetir.


```dart
import "package:flutter/material.dart";
import "habit.dart";
import "habit_store.dart";

void main() => runApp(const HabitApp());

class HabitApp extends StatelessWidget {
  const HabitApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
    title: "Alışkanlıklar",
    theme: ThemeData(colorSchemeSeed: Colors.teal),
    home: const HabitPage(),
  );
}

class HabitPage extends StatefulWidget {
  const HabitPage({super.key});
  @override
  State<HabitPage> createState() => _HabitPageState();
}

class _HabitPageState extends State<HabitPage> {
  final store = HabitStore();
  List<Habit> habits = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    store.load().then((items) {
      if (mounted) setState(() { habits = items; loading = false; });
    });
  }

  Future<void> addHabit() async {
    final controller = TextEditingController();
    final name = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Alışkanlık ekle"),
        content: TextField(controller: controller, autofocus: true),
        actions: [TextButton(
          onPressed: () => Navigator.pop(context, controller.text.trim()),
          child: const Text("Ekle"),
        )],
      ),
    );
    if (name == null || name.isEmpty) return;
    setState(() => habits.add(Habit(
      id: DateTime.now().microsecondsSinceEpoch.toString(), name: name)));
    await store.save(habits);
  }

  Future<void> toggle(Habit habit) async {
    setState(() => habit.toggle(DateTime.now()));
    await store.save(habits);
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text("Alışkanlıklar")),
    floatingActionButton: FloatingActionButton(
      onPressed: addHabit, child: const Icon(Icons.add)),
    body: loading
      ? const Center(child: CircularProgressIndicator())
      : ListView(
          children: habits.map((habit) => CheckboxListTile(
            value: habit.isDone(DateTime.now()),
            title: Text(habit.name),
            onChanged: (_) => toggle(habit),
          )).toList(),
        ),
  );
}
```

## lib/habit.dart

Kalıcı verinin uygulama arayüzünden bağımsız modeli. Tarih anahtarı yalnız gün bilgisini saklar; saat dilimi değişikliklerinin etkisi tek yerde yönetilir.


```dart
class Habit {
  Habit({required this.id, required this.name, Set<String>? days})
      : completedDays = days ?? <String>{};

  final String id;
  final String name;
  final Set<String> completedDays;

  bool isDone(DateTime date) => completedDays.contains(dayKey(date));

  void toggle(DateTime date) {
    final key = dayKey(date);
    completedDays.contains(key)
        ? completedDays.remove(key)
        : completedDays.add(key);
  }

  Map<String, dynamic> toJson() => {
    "id": id,
    "name": name,
    "days": completedDays.toList(),
  };

  factory Habit.fromJson(Map<String, dynamic> json) => Habit(
    id: json["id"] as String,
    name: json["name"] as String,
    days: Set<String>.from(json["days"] as List? ?? const []),
  );
}

String dayKey(DateTime date) {
  final local = date.toLocal();
  return "${local.year.toString().padLeft(4, "0")}-"
      "${local.month.toString().padLeft(2, "0")}-"
      "${local.day.toString().padLeft(2, "0")}";
}
```

## lib/habit_store.dart

SharedPreferences ayrıntısını tek sınıfta tutar. Bozuk JSON uygulamayı çökertmek yerine açıkça boş listeye döner.


```dart
import "dart:convert";
import "package:shared_preferences/shared_preferences.dart";
import "habit.dart";

class HabitStore {
  static const _key = "habits.v1";

  Future<List<Habit>> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null) return [];

    try {
      final rows = jsonDecode(raw) as List<dynamic>;
      return rows
          .map((row) => Habit.fromJson(row as Map<String, dynamic>))
          .toList();
    } on FormatException {
      return [];
    }
  }

  Future<void> save(List<Habit> habits) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = jsonEncode(habits.map((h) => h.toJson()).toList());
    final saved = await prefs.setString(_key, raw);
    if (!saved) throw StateError("Alışkanlıklar kaydedilemedi");
  }
}
```

## test/habit_test.dart

Arayüzden bağımsız iş kuralını test eder. Bir günün iki kez değiştirilmesi başlangıç durumuna dönmelidir.


```dart
import "package:flutter_test/flutter_test.dart";
import "package:habit_tracker/habit.dart";

void main() {
  test("tamamlama durumu iki kez değiştirilebilir", () {
    final habit = Habit(id: "water", name: "Su iç");
    final date = DateTime(2026, 9, 19);

    habit.toggle(date);
    expect(habit.isDone(date), isTrue);

    habit.toggle(date);
    expect(habit.isDone(date), isFalse);
  });
}
```

## Çalışma kontrolleri

1. flutter analyze sonucunda hata olmamalı
2. flutter test tüm testleri geçirmeli
3. Uygulama kapatılıp açıldığında tamamlanma işareti korunmalı
4. Cihaz tarihi değiştirildiğinde farklı gün ayrı kaydedilmeli

## Hata ayıklama tablosu

| Belirti | Olası neden | Kontrol | Düzeltme |
| --- | --- | --- | --- |
| MissingPluginException | Paket eklendikten sonra yalnız hot reload yapıldı. | Uygulamayı tamamen durdurup flutter clean ardından yeniden çalıştır. | flutter clean && flutter pub get && flutter run |
| Veri yeniden açılışta yok | save çağrısı await edilmedi veya hata yutuldu. | setString dönüş değerini ve debug konsolunu kontrol et. | Kaydetmeyi await et; başarısızlıkta kullanıcıya durum göster. |
| Gün bir önceki tarih görünüyor | UTC tarih doğrudan anahtar yapıldı. | date.isUtc ve timeZoneOffset değerlerini yazdır. | Anahtar üretmeden önce toLocal kullan. |

## Genişletme noktaları

- Haftalık hedef ve seri hesabı
- Bildirim izni sonrası yerel hatırlatıcı
- JSON dışa aktarma ve içe alma
- SQLite geçişi ve şema sürümleme

---
Canonical: https://kutarya.com/sistemler/mobil-aliskanlik
