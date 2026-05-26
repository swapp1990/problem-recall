import { createContext, useContext } from "react";
import { defaultTheme } from "./theme.js";

export const VizContext = createContext(defaultTheme);
export const useVizTheme = () => useContext(VizContext);
