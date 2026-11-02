package com.kutarya.cep;

import android.content.Context;
import android.graphics.*;
import android.view.View;

/** Hafif, çizim tabanlı karşılama animasyonu; bitmap/video indirmez. */
final class OrbitView extends View {
  private final Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
  private final Ui ui;
  private final boolean motion;

  OrbitView(Context c, Ui ui, boolean motion) {
    super(c);
    this.ui = ui;
    this.motion = motion;
    setContentDescription("Kutarya sembolü ve yörüngeler");
  }

  @Override
  protected void onDraw(Canvas canvas) {
    super.onDraw(canvas);
    float x = getWidth() / 2f, y = getHeight() / 2f, r = Math.min(x, y) * .72f;
    float phase =
        motion && android.animation.ValueAnimator.areAnimatorsEnabled()
            ? android.os.SystemClock.uptimeMillis() / 1800f
            : 0;
    p.setStyle(Paint.Style.FILL);
    p.setShader(
        new RadialGradient(x, y, r, new int[] {ui.tint, ui.bg}, null, Shader.TileMode.CLAMP));
    canvas.drawCircle(x, y, r, p);
    p.setShader(null);
    p.setStyle(Paint.Style.STROKE);
    p.setStrokeWidth(ui.dp(1));
    p.setColor(ui.line);
    canvas.drawOval(x - r * .86f, y - r * .52f, x + r * .86f, y + r * .52f, p);
    canvas.save();
    canvas.rotate(-38, x, y);
    canvas.drawOval(x - r * .86f, y - r * .52f, x + r * .86f, y + r * .52f, p);
    canvas.restore();
    p.setStyle(Paint.Style.FILL);
    for (int i = 0; i < 3; i++) {
      float a = phase + i * 2.094f;
      p.setColor(i == 0 ? ui.accent : Color.parseColor(i == 1 ? "#F3AF80" : "#3BB18B"));
      canvas.drawCircle(
          x + (float) Math.cos(a) * r * .86f,
          y + (float) Math.sin(a) * r * .52f,
          ui.dp(i == 0 ? 5 : 3),
          p);
    }
    android.graphics.drawable.Drawable logo =
        getResources().getDrawable(R.drawable.ic_kutarya, null);
    int size = ui.dp(55);
    logo.setBounds((int) x - size / 2, (int) y - size / 2, (int) x + size / 2, (int) y + size / 2);
    logo.draw(canvas);
    if (motion && isAttachedToWindow() && android.animation.ValueAnimator.areAnimatorsEnabled())
      postInvalidateDelayed(33);
  }
}
