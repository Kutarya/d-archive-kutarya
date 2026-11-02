package com.kutarya.cep;

import static com.kutarya.cep.Models.*;

import android.app.*;
import android.content.*;
import android.content.res.Configuration;
import android.os.Bundle;
import android.speech.RecognizerIntent;
import android.speech.tts.TextToSpeech;
import android.text.*;
import android.text.util.Linkify;
import android.view.*;
import android.view.inputmethod.InputMethodManager;
import android.widget.*;
import java.text.SimpleDateFormat;
import java.util.*;

public class MainActivity extends Activity {
  private ChatSession session;
  private Ui ui;
  private LinearLayout root, body, messages;
  private ScrollView chatScroll;
  private EditText composer;
  private TextView state, chatTitle, error;
  private Button send, retry;
  private long chatId;
  private String page = "Sohbet", draft = "";
  private boolean bottom = true;
  private int visibleMessages = 150;
  private final Set<Long> animated = new HashSet<>();
  private TextToSpeech tts;
  private boolean ttsReady;
  private final Runnable observer =
      () -> {
        if (page.equals("Sohbet")) renderMessages();
      };

  @Override
  public void onCreate(Bundle saved) {
    super.onCreate(saved);
    session = ((CepApplication) getApplication()).session();
    chatId = saved == null ? session.prefs.getLong("lastChat", 0) : saved.getLong("chat");
    if (saved != null) {
      page = saved.getString("page", "Sohbet");
      draft = saved.getString("draft", "");
    }
    session.listen(observer);
    render();
  }

  @Override
  protected void onSaveInstanceState(Bundle b) {
    super.onSaveInstanceState(b);
    b.putLong("chat", chatId);
    b.putString("page", page);
    b.putString("draft", composer == null ? draft : composer.getText().toString());
  }

  @Override
  protected void onDestroy() {
    session.unlisten(observer);
    if (tts != null) {
      tts.stop();
      tts.shutdown();
    }
    super.onDestroy();
  }

  private boolean motion() {
    return session.prefs.getBoolean("motion", true);
  }

  private void toast(String s) {
    Toast.makeText(this, s, Toast.LENGTH_SHORT).show();
  }

  private void go(String target) {
    if (composer != null) draft = composer.getText().toString();
    page = target;
    ((InputMethodManager) getSystemService(INPUT_METHOD_SERVICE))
        .hideSoftInputFromWindow(root.getWindowToken(), 0);
    render();
  }

  private void render() {
    String theme = session.prefs.getString("theme", "Sistem");
    boolean dark =
        theme.equals("Koyu")
            || theme.equals("Sistem")
                && (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK)
                    == Configuration.UI_MODE_NIGHT_YES;
    ui = new Ui(this, dark);
    setContentView(R.layout.activity_main);
    root = findViewById(R.id.root);
    root.setBackgroundColor(ui.bg);
    root.setOnApplyWindowInsetsListener(
        (v, insets) -> {
          if (android.os.Build.VERSION.SDK_INT >= 30) {
            android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars()),
                ime = insets.getInsets(WindowInsets.Type.ime());
            v.setPadding(bars.left, bars.top, bars.right, Math.max(bars.bottom, ime.bottom));
          } else {
            v.setPadding(
                insets.getSystemWindowInsetLeft(),
                insets.getSystemWindowInsetTop(),
                insets.getSystemWindowInsetRight(),
                insets.getSystemWindowInsetBottom());
          }
          return insets;
        });
    getWindow()
        .getDecorView()
        .setSystemUiVisibility(
            dark
                ? 0
                : View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
    root.requestApplyInsets();
    LinearLayout header = ui.row();
    header.setPadding(ui.dp(20), ui.dp(12), ui.dp(16), ui.dp(12));
    ImageView logo = new ImageView(this);
    logo.setImageResource(R.drawable.ic_kutarya);
    header.addView(logo, new LinearLayout.LayoutParams(ui.dp(29), ui.dp(39)));
    LinearLayout names = ui.column();
    names.setPadding(ui.dp(12), 0, 0, 0);
    names.addView(ui.heading("Kutarya Cep", 19));
    names.addView(ui.text("Senin alanın. Senin sohbetin.", 11, ui.muted));
    header.addView(names, new LinearLayout.LayoutParams(0, -2, 1));
    header.addView(
        ui.button(
            "＋",
            false,
            () -> {
              chatId = 0;
              draft = "";
              visibleMessages = 150;
              go("Sohbet");
            }),
        new LinearLayout.LayoutParams(ui.dp(48), ui.dp(48)));
    root.addView(header);
    body = ui.column();
    root.addView(body, new LinearLayout.LayoutParams(-1, 0, 1));
    composer = null;
    if (page.equals("Sohbet")) chat();
    else if (page.equals("Geçmiş")) history();
    else if (page.equals("Hafıza")) memory();
    else settings();
    LinearLayout nav = ui.row();
    nav.setPadding(ui.dp(10), ui.dp(8), ui.dp(10), ui.dp(8));
    nav.setBackgroundColor(ui.panel);
    for (String label : new String[] {"Sohbet", "Geçmiş", "Hafıza", "Ayarlar"}) {
      Button b = ui.button(label, page.equals(label), () -> go(label));
      b.setTextSize(12);
      LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, ui.dp(46), 1);
      lp.setMargins(ui.dp(2), 0, ui.dp(2), 0);
      nav.addView(b, lp);
    }
    root.addView(nav);
  }

  private LinearLayout scrollPage(String title, String subtitle) {
    ScrollView s = new ScrollView(this);
    s.setFillViewport(true);
    body.addView(s, new LinearLayout.LayoutParams(-1, -1));
    LinearLayout c = ui.column();
    c.setPadding(ui.dp(20), ui.dp(12), ui.dp(20), ui.dp(24));
    s.addView(c);
    c.addView(ui.heading(title, 28));
    ui.gap(c, 8);
    c.addView(ui.text(subtitle, 14, ui.muted));
    ui.gap(c, 22);
    return c;
  }

  private void chat() {
    LinearLayout top = ui.row();
    top.setPadding(ui.dp(20), 0, ui.dp(20), ui.dp(10));
    chatTitle = ui.heading("Kutarya Us", 15);
    chatTitle.setMaxLines(1);
    chatTitle.setEllipsize(TextUtils.TruncateAt.END);
    top.addView(chatTitle, new LinearLayout.LayoutParams(0, -2, 1));
    TextView provider = ui.text(session.provider().label + "  ›", 12, ui.accent);
    provider.setPadding(8, 12, 8, 12);
    provider.setOnClickListener(v -> go("Ayarlar"));
    top.addView(provider);
    body.addView(top);
    chatScroll = new ScrollView(this);
    chatScroll.setFillViewport(true);
    chatScroll.setClipToPadding(false);
    chatScroll.setPadding(ui.dp(20), 0, ui.dp(20), ui.dp(12));
    body.addView(chatScroll, new LinearLayout.LayoutParams(-1, 0, 1));
    messages = ui.column();
    chatScroll.addView(messages);
    chatScroll.setOnScrollChangeListener(
        (v, x, y, ox, oy) ->
            bottom = messages.getHeight() - y - chatScroll.getHeight() < ui.dp(100));
    error = ui.text("", 12, ui.accent);
    error.setPadding(ui.dp(20), ui.dp(4), ui.dp(20), ui.dp(6));
    body.addView(error);
    LinearLayout compose = ui.row();
    compose.setPadding(ui.dp(16), ui.dp(4), ui.dp(16), ui.dp(4));
    composer =
        ui.input(
            "Kutarya Us'a bir şey sor…",
            android.text.InputType.TYPE_CLASS_TEXT
                | android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE
                | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);
    composer.setMaxLines(5);
    composer.setMinLines(1);
    composer.setText(draft);
    composer.setFilters(new InputFilter[] {new InputFilter.LengthFilter(12000)});
    compose.addView(composer, new LinearLayout.LayoutParams(0, -2, 1));
    send =
        ui.button(
            "↑",
            true,
            () -> {
              if (session.busy) {
                session.stop();
                return;
              }
              String text = composer.getText().toString().trim();
              if (text.isEmpty()) return;
              if (!session.vault.has(session.provider()) || session.model().isEmpty()) {
                go("Ayarlar");
                toast("API anahtarını ve modelini ekle.");
                return;
              }
              if (chatId == 0) chatId = session.db.createChat();
              session.prefs.edit().putLong("lastChat", chatId).apply();
              composer.setText("");
              draft = "";
              bottom = true;
              session.send(chatId, text, false);
            });
    send.setTextSize(22);
    LinearLayout.LayoutParams sendLp = new LinearLayout.LayoutParams(ui.dp(50), ui.dp(50));
    sendLp.leftMargin = ui.dp(8);
    compose.addView(send, sendLp);
    body.addView(compose);
    LinearLayout meta = ui.row();
    meta.setPadding(ui.dp(20), 0, ui.dp(20), ui.dp(8));
    state = ui.text("", 10, ui.muted);
    meta.addView(state, new LinearLayout.LayoutParams(0, -2, 1));
    TextView voice = ui.text("Sesle yaz", 11, ui.accent);
    voice.setPadding(ui.dp(10), ui.dp(10), 0, ui.dp(10));
    voice.setOnClickListener(v -> voice());
    meta.addView(voice);
    body.addView(meta);
    renderMessages();
  }

  private void renderMessages() {
    if (messages == null || !page.equals("Sohbet")) return;
    boolean follow = bottom;
    int oldScroll = chatScroll.getScrollY();
    messages.removeAllViews();
    List<Message> list = chatId == 0 ? new ArrayList<>() : session.db.messages(chatId);
    List<Chat> chats = session.db.chats("");
    for (Chat c : chats)
      if (c.id == chatId) chatTitle.setText(c.title.equals("Yeni sohbet") ? "Kutarya Us" : c.title);
    if (list.isEmpty()) {
      LinearLayout welcome = ui.column();
      welcome.setGravity(Gravity.CENTER_HORIZONTAL);
      ui.gap(welcome, 16);
      welcome.addView(
          new OrbitView(this, ui, motion()), new LinearLayout.LayoutParams(-1, ui.dp(155)));
      TextView h = ui.heading("Bir fikirle başlayalım.", 27);
      h.setGravity(Gravity.CENTER);
      welcome.addView(h);
      ui.gap(welcome, 12);
      TextView p =
          ui.text("Sor, öğren, birlikte geliştir.\nGeçmişin ve hafızan bu cihazda.", 14, ui.muted);
      p.setGravity(Gravity.CENTER);
      welcome.addView(p);
      ui.gap(welcome, 24);
      for (String prompt :
          new String[] {
            "Java'da OOP'yi örnekle anlat.",
            "Bugünkü derslerim için bir plan çıkar.",
            "Hatırla: Yanıtlarını Türkçe ve anlaşılır yaz."
          }) {
        Button b =
            ui.button(
                prompt,
                false,
                () -> {
                  composer.setText(prompt);
                  composer.requestFocus();
                });
        ui.margin(b, 8);
        welcome.addView(b);
      }
      messages.addView(welcome);
    } else {
      if (list.size() > visibleMessages) {
        Button b =
            ui.button(
                "Daha eski mesajları göster",
                false,
                () -> {
                  visibleMessages += 150;
                  renderMessages();
                });
        messages.addView(b);
      }
      for (int i = Math.max(0, list.size() - visibleMessages); i < list.size(); i++) {
        Message m = list.get(i);
        boolean user = m.role.equals("user");
        LinearLayout wrapper = ui.column();
        wrapper.setPadding(user ? ui.dp(26) : 0, ui.dp(8), user ? 0 : ui.dp(12), ui.dp(8));
        LinearLayout bubble = ui.card();
        ui.background(bubble, user ? ui.tint : ui.panel, 22);
        bubble.setPadding(ui.dp(16), ui.dp(14), ui.dp(16), ui.dp(14));
        TextView label = ui.text(user ? "SEN" : "KUTARYA US", 10, user ? ui.accent : ui.muted);
        bubble.addView(label);
        ui.gap(bubble, 8);
        String text =
            m.text.isEmpty()
                ? m.status.equals("streaming") ? "Düşünüyor…" : "Yanıt tamamlanmadı."
                : m.text;
        TextView content = ui.text(text, 15, ui.ink);
        content.setText(Ui.markdown(text));
        content.setTextIsSelectable(true);
        Linkify.addLinks(content, Linkify.WEB_URLS);
        content.setLinkTextColor(ui.accent);
        bubble.addView(content);
        ui.gap(bubble, 10);
        TextView foot =
            ui.text(
                new SimpleDateFormat("HH:mm", Locale.forLanguageTag("tr")).format(new Date(m.at))
                    + (user ? "" : " · " + m.provider + " · " + m.model)
                    + (m.status.equals("complete") ? "" : " · " + statusName(m.status)),
                9,
                ui.muted);
        bubble.addView(foot);
        foot.setOnClickListener(v -> messageActions(m));
        bubble.setOnLongClickListener(
            v -> {
              messageActions(m);
              return true;
            });
        label.setOnClickListener(v -> messageActions(m));
        wrapper.addView(bubble);
        messages.addView(wrapper);
        if (animated.add(m.id)) ui.animate(wrapper, motion());
      }
    }
    boolean same = session.busy && session.activeChat == chatId;
    send.setText(session.busy ? "■" : "↑");
    send.setContentDescription(session.busy ? "Yanıtı durdur" : "Mesajı gönder");
    composer.setEnabled(true);
    error.setText(session.error);
    error.setVisibility(session.error.isEmpty() ? View.GONE : View.VISIBLE);
    if (!session.busy && !list.isEmpty() && session.retryable(chatId)) {
      retry =
          ui.button(
              "Yanıtı yeniden dene",
              false,
              () -> {
                bottom = true;
                session.send(chatId, "", true);
              });
      messages.addView(retry);
    }
    state.setText(
        same
            ? "Kutarya Us yazıyor…"
            : session.busy
                ? "Diğer sohbetin yanıtı sürüyor"
                : session.contextInfo.isEmpty() || session.activeChat != chatId
                    ? "Hafıza "
                        + (session.memoryEnabled() ? "açık" : "kapalı")
                        + " · API bağlantısı gerekir"
                    : session.contextInfo);
    chatScroll.post(
        () -> {
          if (follow) chatScroll.fullScroll(View.FOCUS_DOWN);
          else chatScroll.scrollTo(0, oldScroll);
        });
  }

  private String statusName(String status) {
    switch (status) {
      case "streaming":
        return "yazıyor";
      case "stopped":
        return "durduruldu";
      case "interrupted":
        return "kesildi";
      default:
        return "hata";
    }
  }

  private void messageActions(Message m) {
    List<String> options =
        new ArrayList<>(
            Arrays.asList(
                "Kopyala", "Paylaş", m.role.equals("user") ? "Hafızaya kaydet" : "Sesli oku"));
    new AlertDialog.Builder(this)
        .setTitle(m.role.equals("user") ? "Mesajın" : "Kutarya Us yanıtı")
        .setItems(
            options.toArray(new String[0]),
            (d, n) -> {
              if (n == 0) {
                ((android.content.ClipboardManager) getSystemService(CLIPBOARD_SERVICE))
                    .setPrimaryClip(ClipData.newPlainText("Sohbet", m.text));
                toast("Kopyalandı.");
              } else if (n == 1) {
                Intent share =
                    new Intent(Intent.ACTION_SEND)
                        .setType("text/plain")
                        .putExtra(Intent.EXTRA_TEXT, m.text);
                startActivity(Intent.createChooser(share, "Mesajı paylaş"));
              } else if (m.role.equals("user")) editMemory(null, m.text, m.id);
              else speak(m.text);
            })
        .show();
  }

  private void history() {
    LinearLayout c = scrollPage("Sohbetlerin", "Kaldığın yerden devam et. Tüm kayıtlar cihazında.");
    EditText search =
        ui.input("Başlık veya mesajlarda ara", android.text.InputType.TYPE_CLASS_TEXT);
    c.addView(search);
    LinearLayout rows = ui.column();
    ui.margin(rows, 16);
    c.addView(rows);
    Runnable refresh =
        () -> {
          rows.removeAllViews();
          List<Chat> list = session.db.chats(search.getText().toString());
          if (list.isEmpty())
            rows.addView(ui.text("Henüz sohbet yok veya arama sonucu bulunamadı.", 14, ui.muted));
          for (Chat chat : list) {
            LinearLayout card = ui.card();
            ui.margin(card, 10);
            card.addView(ui.heading((chat.pinned ? "★ " : "") + chat.title, 16));
            ui.gap(card, 8);
            TextView preview = ui.text(chat.preview, 13, ui.muted);
            preview.setMaxLines(2);
            preview.setEllipsize(TextUtils.TruncateAt.END);
            card.addView(preview);
            ui.gap(card, 12);
            LinearLayout actions = ui.row();
            actions.addView(
                ui.text(
                    new SimpleDateFormat("d MMM · HH:mm", Locale.forLanguageTag("tr"))
                        .format(new Date(chat.at)),
                    11,
                    ui.muted),
                new LinearLayout.LayoutParams(0, -2, 1));
            actions.addView(ui.button("⋯", false, () -> chatActions(chat)));
            card.addView(actions);
            card.setOnClickListener(
                v -> {
                  chatId = chat.id;
                  visibleMessages = 150;
                  draft = "";
                  session.prefs.edit().putLong("lastChat", chatId).apply();
                  go("Sohbet");
                });
            rows.addView(card);
          }
        };
    search.addTextChangedListener(watcher(refresh));
    refresh.run();
  }

  private TextWatcher watcher(Runnable r) {
    return new TextWatcher() {
      public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

      public void onTextChanged(CharSequence s, int start, int before, int count) {
        r.run();
      }

      public void afterTextChanged(Editable e) {}
    };
  }

  private void chatActions(Chat chat) {
    new AlertDialog.Builder(this)
        .setTitle(chat.title)
        .setItems(
            new String[] {
              "Adını değiştir",
              chat.pinned ? "Sabitlemeyi kaldır" : "Sabitle",
              "Metin olarak dışa aktar",
              "Sohbeti sil"
            },
            (d, i) -> {
              if (i == 0) {
                EditText e = ui.input("Sohbet başlığı", 1);
                e.setText(chat.title);
                new AlertDialog.Builder(this)
                    .setTitle("Başlığı düzenle")
                    .setView(e)
                    .setPositiveButton(
                        "Kaydet",
                        (x, y) -> {
                          session.db.rename(chat.id, e.getText().toString());
                          go("Geçmiş");
                        })
                    .setNegativeButton("Vazgeç", null)
                    .show();
              } else if (i == 1) {
                session.db.pin(chat.id, !chat.pinned);
                go("Geçmiş");
              } else if (i == 2) {
                StringBuilder text = new StringBuilder("# " + chat.title + "\n\n");
                for (Message m : session.db.messages(chat.id))
                  text.append("## ")
                      .append(m.role.equals("user") ? "Sen" : "Kutarya Us")
                      .append("\n")
                      .append(m.text)
                      .append("\n\n");
                export(text.toString(), "text/markdown", "Kutarya-Sohbet.md");
              } else {
                if (session.busy && session.activeChat == chat.id) {
                  toast("Önce yanıtı durdur.");
                  return;
                }
                new AlertDialog.Builder(this)
                    .setTitle("Sohbet silinsin mi?")
                    .setMessage("Mesajlar ve bu sohbetten kaydedilen hafıza silinir.")
                    .setPositiveButton(
                        "Sil",
                        (x, y) -> {
                          session.db.deleteChat(chat.id);
                          if (chatId == chat.id) {
                            chatId = 0;
                            session.prefs.edit().remove("lastChat").apply();
                          }
                          go("Geçmiş");
                        })
                    .setNegativeButton("Vazgeç", null)
                    .show();
              }
            })
        .show();
  }

  private void memory() {
    LinearLayout c =
        scrollPage(
            "Hatırladıklarım", "Açık tercihlerini sakla. Bir kaydı düzenle, kapat veya sil.");
    Switch enabled = new Switch(this);
    enabled.setText("Hafızayı kullan ve açık istekleri kaydet");
    enabled.setTextColor(ui.ink);
    enabled.setChecked(session.memoryEnabled());
    enabled.setOnCheckedChangeListener(
        (b, v) -> session.prefs.edit().putBoolean("memory", v).apply());
    c.addView(enabled);
    ui.gap(c, 16);
    c.addView(ui.button("＋  Yeni hafıza notu", true, () -> editMemory(null, "", 0)));
    ui.gap(c, 14);
    c.addView(
        ui.text(
            "“Hatırla: …”, “Bundan sonra …” veya “Adım …” ifadeleri otomatik kaydolur. Diğer"
                + " mesajları mesaj menüsünden seçebilirsin. AI yanıtları hafızaya alınmaz. Aktif"
                + " notlar seçilen sağlayıcıya gönderilir.",
            12,
            ui.muted));
    List<Memory> notes = session.db.memories();
    if (notes.isEmpty()) {
      ui.gap(c, 24);
      c.addView(ui.heading("Burada henüz bir not yok.", 18));
    }
    for (Memory m : notes) {
      LinearLayout card = ui.card();
      ui.margin(card, 12);
      card.addView(ui.text(m.text, 15, ui.ink));
      ui.gap(card, 12);
      LinearLayout row = ui.row();
      Switch sw = new Switch(this);
      sw.setText(m.enabled ? "Aktif" : "Kapalı");
      sw.setTextColor(ui.muted);
      sw.setChecked(m.enabled);
      sw.setOnCheckedChangeListener(
          (b, v) -> {
            session.db.editMemory(m.id, m.text, v);
            sw.setText(v ? "Aktif" : "Kapalı");
          });
      row.addView(sw, new LinearLayout.LayoutParams(0, -2, 1));
      row.addView(ui.button("Düzenle", false, () -> editMemory(m, m.text, m.sourceId)));
      card.addView(row);
      c.addView(card);
    }
  }

  private void editMemory(Memory m, String text, long source) {
    LinearLayout c = ui.column();
    c.setPadding(ui.dp(20), ui.dp(10), ui.dp(20), 0);
    EditText e =
        ui.input(
            "Hatırlanacak bilgi veya tercih",
            android.text.InputType.TYPE_CLASS_TEXT
                | android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE);
    e.setText(text);
    e.setFilters(new InputFilter[] {new InputFilter.LengthFilter(1000)});
    c.addView(e);
    Switch scope = new Switch(this);
    scope.setText("Yalnız bu sohbet");
    scope.setTextColor(ui.ink);
    scope.setChecked(m != null && m.chatId != 0);
    scope.setEnabled(m == null && chatId != 0);
    if (m == null) c.addView(scope);
    AlertDialog.Builder builder =
        new AlertDialog.Builder(this)
            .setTitle(m == null ? "Hafızaya ekle" : "Hafıza notu")
            .setView(c)
            .setPositiveButton("Kaydet", null)
            .setNegativeButton("Vazgeç", null);
    if (m != null)
      builder.setNeutralButton(
          "Sil",
          (d, n) -> {
            session.db.deleteMemory(m.id);
            go("Hafıza");
          });
    AlertDialog dialog = builder.create();
    dialog.setOnShowListener(
        x ->
            dialog
                .getButton(-1)
                .setOnClickListener(
                    v -> {
                      try {
                        if (m == null)
                          session.db.saveMemory(
                              scope.isChecked() ? chatId : 0, source, e.getText().toString());
                        else session.db.editMemory(m.id, e.getText().toString(), m.enabled);
                        dialog.dismiss();
                        go("Hafıza");
                      } catch (Exception ex) {
                        e.setError("Not boş veya aynı kapsamda zaten var.");
                      }
                    }));
    dialog.show();
  }

  private void settings() {
    LinearLayout c = scrollPage("Sana göre", "Sağlayıcını bağla, görünümünü seç, verini yönet.");
    LinearLayout apiCard = ui.card();
    apiCard.addView(ui.heading("AI bağlantısı", 19));
    ui.gap(apiCard, 12);
    Spinner provider = new Spinner(this);
    provider.setAdapter(
        new ArrayAdapter<Provider>(
            this, android.R.layout.simple_spinner_dropdown_item, Provider.values()) {
          @Override
          public View getView(int position, View convert, ViewGroup parent) {
            TextView v = (TextView) super.getView(position, convert, parent);
            v.setTextColor(ui.ink);
            return v;
          }

          @Override
          public View getDropDownView(int position, View convert, ViewGroup parent) {
            TextView v = (TextView) super.getDropDownView(position, convert, parent);
            v.setTextColor(ui.ink);
            v.setBackgroundColor(ui.panel);
            return v;
          }
        });
    provider.setSelection(session.provider().ordinal());
    apiCard.addView(provider);
    ui.gap(apiCard, 12);
    EditText key =
        ui.input(
            "API anahtarı",
            android.text.InputType.TYPE_CLASS_TEXT
                | android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD);
    key.setSingleLine(true);
    key.setImportantForAutofill(View.IMPORTANT_FOR_AUTOFILL_NO);
    apiCard.addView(key);
    ui.gap(apiCard, 10);
    EditText model =
        ui.input("Model kimliği (sağlayıcı panelinden)", android.text.InputType.TYPE_CLASS_TEXT);
    model.setSingleLine(true);
    apiCard.addView(model);
    ui.gap(apiCard, 12);
    TextView status = ui.text("", 12, ui.muted);
    apiCard.addView(status);
    ui.gap(apiCard, 12);
    Runnable load =
        () -> {
          Provider p = (Provider) provider.getSelectedItem();
          key.setText("");
          key.setHint(
              session.vault.has(p) ? "Anahtar kayıtlı · değiştirmek için yaz" : "API anahtarı");
          model.setText(session.prefs.getString("model-" + p.name(), ""));
          status.setText("Anahtar yalnız bu cihazda şifreli tutulur.");
        };
    provider.setOnItemSelectedListener(
        new android.widget.AdapterView.OnItemSelectedListener() {
          public void onItemSelected(AdapterView<?> a, View v, int pos, long id) {
            load.run();
          }

          public void onNothingSelected(AdapterView<?> a) {}
        });
    LinearLayout buttons = ui.row();
    Button save =
        ui.button(
            "Bağlantıyı kaydet",
            true,
            () -> {
              try {
                if (session.busy) {
                  toast("Önce yanıtı durdur.");
                  return;
                }
                Provider p = (Provider) provider.getSelectedItem();
                String secret = key.getText().toString().trim(),
                    name = model.getText().toString().trim();
                if (!name.matches("[A-Za-z0-9_./:@~-]{1,180}")) {
                  model.setError("Geçerli model kimliğini yaz.");
                  return;
                }
                if (!secret.isEmpty()) session.vault.set(p, secret);
                if (!session.vault.has(p)) {
                  key.setError("API anahtarını yaz.");
                  return;
                }
                session
                    .prefs
                    .edit()
                    .putString("provider", p.name())
                    .putString("model-" + p.name(), name)
                    .apply();
                key.setText("");
                key.setHint("Anahtar kayıtlı · değiştirmek için yaz");
                status.setText(
                    "Bağlantı ayarları kaydedildi. Erişimi model listesi veya sohbetle kontrol"
                        + " et.");
              } catch (Exception ex) {
                status.setText("Anahtar güvenli biçimde kaydedilemedi. Yeniden dene.");
              }
            });
    buttons.addView(save, new LinearLayout.LayoutParams(-1, -2));
    apiCard.addView(buttons);
    ui.gap(apiCard, 8);
    Button models =
        ui.button(
            "Sağlayıcıdan modelleri getir",
            false,
            () -> {
              Provider p = (Provider) provider.getSelectedItem();
              String typed = key.getText().toString().trim();
              status.setText("Modeller yükleniyor…");
              session.worker.execute(
                  () -> {
                    try {
                      String secret = typed.isEmpty() ? session.vault.get(p) : typed;
                      if (secret.isEmpty())
                        throw new IllegalArgumentException("Önce API anahtarını yaz.");
                      List<String> list = new ProviderApi().models(p, secret);
                      runOnUiThread(
                          () -> {
                            if (isFinishing() || isDestroyed()) return;
                            status.setText(
                                list.size() + " model bulundu. Seçtikten sonra bağlantıyı kaydet.");
                            new AlertDialog.Builder(this)
                                .setTitle(p.label + " modelleri")
                                .setItems(
                                    list.toArray(new String[0]),
                                    (d, n) -> model.setText(list.get(n)))
                                .setNegativeButton("Kapat", null)
                                .show();
                          });
                    } catch (Exception ex) {
                      runOnUiThread(
                          () ->
                              status.setText(
                                  "Model listesi alınamadı. Anahtar/erişimi kontrol et; model"
                                      + " kimliğini elle de yazabilirsin."));
                    }
                  });
            });
    apiCard.addView(models);
    ui.gap(apiCard, 8);
    apiCard.addView(
        ui.button(
            "Bu sağlayıcının anahtarını sil",
            false,
            () -> {
              try {
                session.vault.set((Provider) provider.getSelectedItem(), "");
                load.run();
              } catch (Exception ex) {
                toast("Anahtar silinemedi.");
              }
            }));
    c.addView(apiCard);
    LinearLayout appearance = ui.card();
    ui.margin(appearance, 16);
    appearance.addView(ui.heading("Görünüm ve yanıt", 19));
    ui.gap(appearance, 14);
    option(
        appearance,
        "Tema",
        new String[] {"Sistem", "Açık", "Koyu"},
        session.prefs.getString("theme", "Sistem"),
        value -> {
          session.prefs.edit().putString("theme", value).apply();
          go("Ayarlar");
        });
    option(
        appearance,
        "Yanıt tarzı",
        new String[] {"Dengeli", "Kısa", "Öğretici"},
        session.prefs.getString("style", "Dengeli"),
        value -> session.prefs.edit().putString("style", value).apply());
    option(
        appearance,
        "Yanıt token sınırı",
        new String[] {"1024", "2048", "4096", "8192"},
        "" + session.prefs.getInt("maxTokens", 2048),
        value -> session.prefs.edit().putInt("maxTokens", Integer.parseInt(value)).apply());
    Switch motion = new Switch(this);
    motion.setText("Animasyonlar");
    motion.setTextColor(ui.ink);
    motion.setChecked(motion());
    motion.setOnCheckedChangeListener(
        (b, v) -> session.prefs.edit().putBoolean("motion", v).apply());
    appearance.addView(motion);
    c.addView(appearance);
    LinearLayout data = ui.card();
    ui.margin(data, 16);
    data.addView(ui.heading("Verilerin seninle", 19));
    ui.gap(data, 12);
    data.addView(
        ui.text(
            "Sohbetler ve hafıza, uygulamanın özel SQLite alanında. AI'ya gönderirken seçilen"
                + " geçmiş ve aktif notlar sağlayıcıya iletilir. APK içinde ortak anahtar yok; API"
                + " kullanımı hesabına göre ücretli olabilir. Bu uygulama cihazda model"
                + " çalıştırmaz.",
            13,
            ui.muted));
    ui.gap(data, 14);
    data.addView(
        ui.button(
            "Sohbet ve hafıza yedeği al",
            false,
            () -> {
              try {
                export(Backup.exportAll(session.db), "application/json", "Kutarya-Cep-Yedek.json");
              } catch (Exception ex) {
                toast("Yedek hazırlanamadı.");
              }
            }));
    ui.gap(data, 8);
    data.addView(
        ui.button(
            "Yedeği içe aktar",
            false,
            () -> {
              if (session.busy) {
                toast("Önce yanıtı durdur.");
                return;
              }
              Intent i =
                  new Intent(Intent.ACTION_OPEN_DOCUMENT)
                      .setType("application/json")
                      .addCategory(Intent.CATEGORY_OPENABLE);
              startActivityForResult(i, 43);
            }));
    ui.gap(data, 8);
    data.addView(
        ui.button(
            "Tüm yerel verileri sil",
            false,
            () -> {
              if (session.busy) {
                toast("Önce yanıtı durdur.");
                return;
              }
              new AlertDialog.Builder(this)
                  .setTitle("Tüm veriler silinsin mi?")
                  .setMessage(
                      "Sohbetler, hafıza ve API anahtarları silinir. Dışa aktardığın dosyalar"
                          + " korunur.")
                  .setPositiveButton(
                      "Tümünü sil",
                      (d, n) -> {
                        session.db.clear();
                        session.vault.clear();
                        session.prefs.edit().remove("lastChat").apply();
                        chatId = 0;
                        draft = "";
                        session.error = "";
                        session.contextInfo = "";
                        go("Sohbet");
                      })
                  .setNegativeButton("Vazgeç", null)
                  .show();
            }));
    c.addView(data);
    ui.gap(c, 20);
    c.addView(
        ui.text("Kutarya Cep 1.0.0 · Java / SQLite\nOkul projesi · kutarya.com", 12, ui.muted));
  }

  interface Choice {
    void accept(String value);
  }

  private void option(
      LinearLayout parent, String title, String[] options, String selected, Choice onSelect) {
    LinearLayout row = ui.row();
    TextView label = ui.text(title, 14, ui.ink);
    row.addView(label, new LinearLayout.LayoutParams(0, -2, 1));
    Button b =
        ui.button(
            selected + " ›",
            false,
            () ->
                new AlertDialog.Builder(this)
                    .setTitle(title)
                    .setItems(
                        options,
                        (d, n) -> {
                          onSelect.accept(options[n]);
                          if (!title.equals("Tema")) go("Ayarlar");
                        })
                    .show());
    row.addView(b);
    parent.addView(row);
    ui.gap(parent, 8);
  }

  private void voice() {
    try {
      Intent i =
          new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
              .putExtra(
                  RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
              .putExtra(RecognizerIntent.EXTRA_LANGUAGE, "tr-TR")
              .putExtra(RecognizerIntent.EXTRA_PROMPT, "Kutarya Us'a söyle");
      startActivityForResult(i, 41);
    } catch (ActivityNotFoundException e) {
      toast("Bu cihazda sesle yazma hizmeti yok.");
    }
  }

  private void speak(String text) {
    if (tts == null) {
      tts =
          new TextToSpeech(
              this,
              status -> {
                ttsReady = status == TextToSpeech.SUCCESS;
                if (ttsReady) {
                  tts.setLanguage(Locale.forLanguageTag("tr-TR"));
                  tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "kutarya");
                } else toast("Sesli okuma hizmeti bulunamadı.");
              });
    } else if (ttsReady) {
      tts.setLanguage(Locale.forLanguageTag("tr-TR"));
      tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "kutarya");
    }
  }

  private void export(String text, String mime, String name) {
    try {
      java.nio.file.Files.write(
          new java.io.File(getCacheDir(), "pending-export.txt").toPath(),
          text.getBytes(java.nio.charset.StandardCharsets.UTF_8));
      Intent intent =
          new Intent(Intent.ACTION_CREATE_DOCUMENT)
              .setType(mime)
              .addCategory(Intent.CATEGORY_OPENABLE)
              .putExtra(Intent.EXTRA_TITLE, name);
      startActivityForResult(intent, 42);
    } catch (Exception e) {
      toast("Dosya hazırlanamadı.");
    }
  }

  @Override
  protected void onActivityResult(int request, int result, Intent data) {
    super.onActivityResult(request, result, data);
    if (result != RESULT_OK || data == null) return;
    if (request == 41) {
      ArrayList<String> words = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
      if (words != null && !words.isEmpty()) {
        draft = words.get(0);
        go("Sohbet");
        if (composer != null) composer.setText(words.get(0));
      }
    } else if (request == 42) {
      java.io.File pending = new java.io.File(getCacheDir(), "pending-export.txt");
      try (java.io.OutputStream out = getContentResolver().openOutputStream(data.getData());
          java.io.InputStream in = new java.io.FileInputStream(pending)) {
        if (out == null) throw new java.io.IOException();
        byte[] buffer = new byte[8192];
        int n;
        while ((n = in.read(buffer)) >= 0) out.write(buffer, 0, n);
        toast("Dosya kaydedildi.");
      } catch (Exception e) {
        toast("Dosya kaydedilemedi.");
      }
      pending.delete();
    } else if (request == 43) {
      try (java.io.InputStream input = getContentResolver().openInputStream(data.getData())) {
        if (input == null) throw new java.io.IOException();
        java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int n;
        while ((n = input.read(buffer)) >= 0) {
          out.write(buffer, 0, n);
          if (out.size() > 5_000_000) throw new IllegalArgumentException();
        }
        String json = out.toString("UTF-8");
        Backup.validate(json);
        new AlertDialog.Builder(this)
            .setTitle("Yedek eklensin mi?")
            .setMessage(
                "Mevcut sohbetler korunur. Yedekteki kayıtlar yeni sohbet olarak eklenir; aktif"
                    + " hafıza sağlayıcıya gönderilebilir.")
            .setPositiveButton(
                "Ekle",
                (d, j) -> {
                  try {
                    Backup.importAll(session.db, json);
                    go("Geçmiş");
                    toast("Yedek eklendi.");
                  } catch (Exception e) {
                    toast("Yedek eklenemedi; mevcut kayıtlar korundu.");
                  }
                })
            .setNegativeButton("Vazgeç", null)
            .show();
      } catch (Exception e) {
        toast("Geçersiz yedek veya 5 MB sınırı aşıldı.");
      }
    }
  }
}
