import { createContext, useContext, createSignal } from "solid-js";

const HeaderContext = createContext();

export function HeaderProvider(props) {
  const [header, setHeader] = createSignal("Home");
  const store = { header, setHeader };
  return (
    <HeaderContext.Provider value={store}>
      {props.children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const ctx = useContext(HeaderContext);
  if (!ctx) throw new Error("useHeader must be used inside <HeaderProvider>");
  return ctx;
}
