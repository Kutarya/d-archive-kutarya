// Kullanıcının açık talimatı: PC'de hiçbir sunucu/debug portu açma.
require("node:net").Server.prototype.listen = function () {
  throw new Error(
    "KUTARYA_NO_LOCAL_PORTS: Bu görevde yerel sunucu başlatılamaz.",
  );
};
