import { A, useLocation } from "@solidjs/router";
import { Show, Switch, Match, createSignal, createEffect, For } from "solid-js";
import { useAuth } from "../utils/useAuth";
import {
  CloseIcon,
  MenuIcon,
  SearchIcon,
  ChevronRight,
  LogoutIcon,
  SpinnerIcon,
} from "../assets/Icons";
import Search from "../pages/Search";

export default function Layout(props) {
  const location = useLocation()
  const [mode, setMode] = createSignal(null);
  const toggle = (next) => setMode((prev) => (prev === next ? null : next));
  const close = () => setMode(null);

  createEffect(() => {
    location?.pathname;
    location?.search;
    setMode(null);
  });

  const animateEntryClass = "origin-top duration-250 transition-[scale,opacity,filter] ease-out  starting:scale-[0.98] starting:translate-y-2 starting:blur-[2px]"


  return (
    <>
      <header className="sticky top-0 mb-6 bg-white dark:bg-neutral-900 py-4 border-b border-neutral-200 dark:border-neutral-800 z-10">
        <Container>

          <nav className="flex text-neutral-900 dark:text-white text-lg justify-between">
            <A href="/home" class="tracking-tighter font-bold" onClick={close}>
              Emplettes
            </A>

            <div className="flex gap-3">
              <button
                aria-pressed={mode() === "search"}
                onClick={() => toggle("search")}>
                <Show when={mode() === "search"} fallback={<SearchIcon />}>
                  <CloseIcon />
                </Show>
              </button>

              <button
                aria-pressed={mode() === "menu"}
                onClick={() => toggle("menu")}
              >
                <Show when={mode() === "menu"} fallback={<MenuIcon />}>
                  <CloseIcon />
                </Show>
              </button>
            </div>
          </nav>
        </Container>

      </header>


      <Switch>
        <Match when={mode() === "search"}>
          <main class={animateEntryClass}>
            <Search onClose={close} />
          </main>
        </Match>

        <Match when={mode() === "menu"}>
          <main class={animateEntryClass}>
            <Menu onClose={close} />
          </main>
        </Match>

        <Match when={!mode()}>
          <main class={animateEntryClass}>
            {props.children}
          </main>
        </Match>
      </Switch>
    </>
  );
}



export function EmptyState(props) {
  return (
    <section className="*:mx-auto flex flex-col gap-1 items-center justify-center py-12">
      <h3 className="text-lg font-semibold">{props.title}</h3>
      {props.children}
    </section>
  );
}

export function LoadingState(props) {
  return (
    <section className="*:mx-auto flex flex-col gap-1 items-center justify-center py-12">
      <SpinnerIcon className="h-12 aspect-square stroke-neutral-500" />
      <h3 className="text-lg font-semibold">{props.title}</h3>
      {props.children}
    </section>
  );
}

function Menu(props) {
  const { user, logout } = useAuth();

  const links = [
    { label: "Ajouter des articles", to: "/import" },
    { label: "Créer une nouvelle liste", to: "/list/new" },
    { label: "Voir les listes", to: "/lists" },
    { label: "Dates de péremption", to: "/peremptions" },
    { label: "Erreurs de prix", to: "/erreurs-prix" },
  ];

  const handleLogout = () => {
    logout?.();
    props.onClose();
  };

return (
    <Container>
      <h4 className="text-sm text-neutral-400">Menu</h4>
      <ul>
        <For each={links}>
          {(item) => (
            <li>
              <A
                href={item.to}
                class="flex py-1"
                onClick={props.onClose}
              >
                <h3>{item.label}</h3>
                <ChevronRight />
              </A>
            </li>
          )}
        </For>
      </ul>

      <Show
        when={user()}
        fallback={
          <A class="btn subtle full" href="/login" onClick={props.onClose}>
            Connexion
          </A>
        }
      >
        <footer>
          <button class="flex p-2 mt-6 dark:bg-neutral-800 rounded-lg" onClick={handleLogout}>
            <LogoutIcon />
            Déconnexion
          </button>
        </footer>
      </Show>
    </Container>
  );
}
export function Container(props) {
  const gap = props.gap || "gap-y-4";
  return (
    <section
      className={`
        ${gap}
        grid
        grid-cols-[minmax(0,1fr)_1rem_minmax(0,56rem)_1rem_minmax(0,1fr)]
        *:col-start-3
        [&>*[data-expanded]]:col-start-2 [&>*[data-expanded]]:col-span-3
        [&>*[data-full]]:col-span-full
      `}
      {...props}
    >
      {props.children}
    </section>
  )
}


export function ContainerHeading(props) {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold tracking-tight">
        {props.title}
      </h1>
      {props.children}
    </header>
  )
}

export function ContainerFooter(props) {
  return <footer className="mb-4">{props.children}</footer>
}
