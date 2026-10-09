import { renderToString } from "react-dom/server";
import App from "./App.jsx";

export function render(url) {
  return renderToString(<App initialPath={url} />);
}
