package com.kutarya.cep;

import android.content.Context;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.*;
import android.text.*;
import android.text.style.*;
import android.view.*;
import android.widget.*;
import java.util.regex.*;

final class Ui {
  final Context c;
  final boolean dark;
  final int bg, panel, ink, muted, accent, tint, line;

  Ui(Context c, boolean dark) {
    this.c = c;
    this.dark = dark;
    bg = Color.parseColor(dark ? "#10121C" : "#F7F7FC");
    panel = Color.parseColor(dark ? "#1B1E2D" : "#FFFFFF");
    ink = Color.parseColor(dark ? "#F2F0FF" : "#24243A");
    muted = Color.parseColor(dark ? "#A8ABC4" : "#73778F");
    accent = Color.parseColor(dark ? "#B0A4FF" : "#6958E8");
    tint = Color.parseColor(dark ? "#302C4D" : "#EEEBFF");
    line = Color.parseColor(dark ? "#303447" : "#E6E6F0");
  }

  int dp(float n) {
    return Math.round(n * c.getResources().getDisplayMetrics().density);
  }

  GradientDrawable shape(int color, int radius) {
    GradientDrawable g = new GradientDrawable();
    g.setColor(color);
    g.setCornerRadius(dp(radius));
    return g;
  }

  void background(View v, int color, int radius) {
    v.setBackground(shape(color, radius));
  }

  TextView text(String text, int size, int color) {
    TextView v = new TextView(c);
    v.setText(text);
    v.setTextSize(size);
    v.setTextColor(color);
    v.setIncludeFontPadding(false);
    v.setLineSpacing(dp(3), 1);
    return v;
  }

  TextView heading(String text, int size) {
    TextView v = text(text, size, ink);
    v.setTypeface(Typeface.create("sans-serif-medium", Typeface.NORMAL));
    return v;
  }

  LinearLayout column() {
    LinearLayout v = new LinearLayout(c);
    v.setOrientation(LinearLayout.VERTICAL);
    return v;
  }

  LinearLayout row() {
    LinearLayout v = new LinearLayout(c);
    v.setOrientation(LinearLayout.HORIZONTAL);
    v.setGravity(Gravity.CENTER_VERTICAL);
    return v;
  }

  LinearLayout card() {
    LinearLayout v = column();
    v.setPadding(dp(18), dp(18), dp(18), dp(18));
    background(v, panel, 22);
    return v;
  }

  void gap(LinearLayout v, int n) {
    View g = new View(c);
    v.addView(g, new LinearLayout.LayoutParams(1, dp(n)));
  }

  Button button(String label, boolean primary, Runnable action) {
    Button b = new Button(c);
    b.setText(label);
    b.setAllCaps(false);
    b.setTextSize(14);
    b.setTextColor(primary ? (dark ? bg : Color.WHITE) : accent);
    b.setMinHeight(dp(48));
    b.setMinimumHeight(dp(48));
    b.setPadding(dp(16), dp(8), dp(16), dp(8));
    b.setElevation(0);
    b.setStateListAnimator(null);
    b.setBackground(
        new RippleDrawable(
            android.content.res.ColorStateList.valueOf(line),
            shape(primary ? accent : tint, 16),
            null));
    b.setOnClickListener(v -> action.run());
    return b;
  }

  EditText input(String hint, int type) {
    EditText e = new EditText(c);
    e.setTextSize(15);
    e.setTextColor(ink);
    e.setHintTextColor(muted);
    e.setHint(hint);
    e.setInputType(type);
    e.setPadding(dp(14), dp(14), dp(14), dp(14));
    background(e, dark ? bg : Color.parseColor("#F4F4FA"), 14);
    return e;
  }

  void margin(View v, int top) {
    LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(-1, -2);
    p.topMargin = dp(top);
    v.setLayoutParams(p);
  }

  void animate(View v, boolean enabled) {
    if (!enabled || !android.animation.ValueAnimator.areAnimatorsEnabled()) return;
    v.setAlpha(0);
    v.setTranslationY(dp(12));
    v.animate().alpha(1).translationY(0).setDuration(240).start();
  }

  static CharSequence markdown(String text) {
    SpannableStringBuilder result = new SpannableStringBuilder();
    Matcher code = Pattern.compile("(?s)```[^\\n]*\\n(.*?)```").matcher(text);
    int end = 0;
    while (code.find()) {
      inline(result, text.substring(end, code.start()));
      int start = result.length();
      result.append(code.group(1));
      result.setSpan(
          new TypefaceSpan("monospace"), start, result.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
      result.setSpan(
          new BackgroundColorSpan(0x186958E8),
          start,
          result.length(),
          Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
      end = code.end();
    }
    inline(result, text.substring(end));
    return result;
  }

  private static void inline(SpannableStringBuilder result, String text) {
    Matcher m = Pattern.compile("\\*\\*([^*]+)\\*\\*|`([^`\\n]+)`|(?m)^#{1,3} (.+)$").matcher(text);
    int end = 0;
    while (m.find()) {
      result.append(text.substring(end, m.start()));
      int start = result.length();
      String body = m.group(1) != null ? m.group(1) : m.group(2) != null ? m.group(2) : m.group(3);
      result.append(body);
      result.setSpan(
          m.group(2) != null ? new TypefaceSpan("monospace") : new StyleSpan(Typeface.BOLD),
          start,
          result.length(),
          Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
      end = m.end();
    }
    result.append(text.substring(end));
  }
}
