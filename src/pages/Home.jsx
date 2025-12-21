import { A, useNavigate } from "@solidjs/router";
import { For, createMemo } from "solid-js";
import { useAuth } from "../utils/useAuth";
import { useExpirations } from "../utils/useExpirations";
import { usePriceErrors } from "../utils/usePriceErrors";
import List from "../components/List";
import { Container } from "../components/Layout";
import {
  AddListIcon,
  BarCodeIcon,
  ChevronRight,
  DateAddIcon,
  OrderIcon,
} from "../assets/Icons";

const quickActions = [
  { label: "Créer une nouvelle liste de produits", to: "/list/new", icon: AddListIcon },
  { label: "Valider la réception de commande", to: "/lists", icon: OrderIcon },
  { label: "Signaler les erreurs d'étiquettages", to: "/erreurs-prix", icon: BarCodeIcon },
  { label: "Vérifier les dates de péremption", to: "/peremptions", icon: DateAddIcon },
];

export default function Home() {
  const { user } = useAuth();
  const { expired, upcoming } = useExpirations();
  const { pending: pendingErrors } = usePriceErrors();

  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
  }).format(today);

  const expiringToday = createMemo(() =>
    expired().concat(upcoming().filter(e => e.date === todayISO))
  );

  const reminders = createMemo(() => [
    {
      count: expiringToday().length,
      title: "Produits expirent aujourd'hui",
      description: expiringToday().slice(0, 2).map(e => e.productName).join(", ") || "Aucun produit",

      to: "/peremptions",
    },
    {
      count: pendingErrors().length,
      title: "Étiquettes à rectifier",
      description: pendingErrors().slice(0, 2).map(e => e.productName).join(", ") || "Aucune erreur",
      to: "/erreurs-prix",
    },
  ]);

  const firstName = createMemo(() => {
    const u = user();
    if (!u) return "Frédéric";
    return (
      u.displayName?.split(" ")[0] ??
      u.email?.split("@")[0] ??
      "Frédéric"
    );
  });


  return (
    <Container gap="gap-y-8">
      <header>
        <p className="text-sm font-medium  text-neutral-500 dark:text-neutral-400">
          Bonjour {firstName()}
        </p>
        <p className="mt-1 text-4xl font-bold leading-none tracking-tight">
          {dateLabel}
        </p>
      </header>
      <Container data-expanded gap="gap-y-2">
        <h4 className="text-sm pl-2">Actions</h4>
        <div className="flex gap-3 py-1 overflow-x-auto scrollbar-subtle" data-expanded>
          <For each={quickActions}>
            {(action) => <QuickActionCard {...action} />}
          </For>
        </div>
      </Container>
      <Container data-expanded gap="gap-y-2">
        <h4 className="text-sm pl-2">Suggestions</h4>
        <List items={reminders()}>
          {(item) => <ReminderItem {...item} />}
        </List>
      </Container>
    </Container>
  );
}


function QuickActionCard(props) {
  const Icon = props.icon;

  return (
    <A
      href={props.to}
      className="flex-1 first:ml-4 last:mr-4 min-w-50 rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-4 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
    >
      <div className="flex flex-col gap-3">
        <div className="*:h-10 *:w-10 *:dark:fill-white *:fill-neutral-500">
          <Icon />
        </div>
        <span className="grid grid-cols-[1fr_1rem] text-balance gap-1 items-center text-sm text-neutral-500 dark:text-neutral-400">
          {props.label}
          <ChevronRight />
        </span>
      </div>
    </A>
  );
}

function ReminderItem(props) {
  const navigate = useNavigate();

  return (
    <li>
      <button
        type="button"
        onClick={() => navigate(props.to)}
        className="flex w-full items-center gap-4 px-2 py-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
      >
        <span className="w-6 text-right text-3xl leading-6">
          {props.count}
        </span>
        <div className="flex-1">
          <p className="text-sm">{props.title}</p>
          <p className="mt-1 text-xs text-neutral-500 truncate">
            {props.description}
          </p>
        </div>
        <ChevronRight className="h-6 w-6 shrink-0 text-neutral-600" />
      </button>
    </li>
  );
}
