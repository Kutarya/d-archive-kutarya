// Aynı gerçek React arayüzünün yayın sırasında üretilen genel sayfa HTML'i.
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { Provider } from "./state";
import type { Catalog } from "./types";
export function render(path:string, catalog:Catalog) {
  return renderToString(<MemoryRouter initialEntries={[path]}><Provider initialCatalog={catalog}><App /></Provider></MemoryRouter>);
}
