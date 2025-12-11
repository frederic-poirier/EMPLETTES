import { createSignal, For } from "solid-js";

function inferTypeForKey(list, key) {
  for (let item of list) {
    if (item[key] != null) return getType(item[key]);
  }
  return "unknown";
}

function getType(value) {
  if (value == null) return "null";
  if (typeof value === "string") return !isNaN(new Date(value)) ? "date" : "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (value instanceof Date) return "date";
  return "unknown";
}

function sortByType(a, b, type, ascending = true) {
  const f = ascending ? 1 : -1;

  if (type === "string") return a.localeCompare(b) * f;
  if (type === "number") return (a - b) * f;
  if (type === "boolean") return ((a ? 1 : 0) - (b ? 1 : 0)) * f;
  if (type === "date") return (new Date(a) - new Date(b)) * f;

  return 0;
}

export function applySort(list = [], key, dir) {
  const type = inferTypeForKey(list, key);
  const ascending = dir === "asc";
  return [...list].sort((a, b) => sortByType(a[key], b[key], type, ascending));
}

function directionLabel(type, dir) {
  const dict = {
    string: {
      asc: "en ordre alphabétique",
      desc: "en ordre alphabétique inverse",
    },
    number: {
      asc: "en ordre croissant",
      desc: "en ordre décroissant",
    },
    date: {
      asc: "par ancienneté",
      desc: "par nouveauté",
    },
    boolean: {
      asc: "d'abord",
      desc: "après",
    },
    unknown: {
      asc: "en ordre croissant",
      desc: "en ordre décroissant",
    }
  };

  return dict[type]?.[dir] ?? dict.unknown[dir];
}

function sortLabel(option, dir, type) {
  return `${option.label} ${directionLabel(type, dir)}`;
}

export function Sorter(props) {
  const [active, setActive] = createSignal(null);

  const onSelect = (option, direction) => {
    const selection = { key: option.key, dir: direction.dir };

    setActive(selection);
    props.onSort?.(option, direction.dir);

    const source = props.list || [];
    const sorted = applySort(source, selection.key, selection.dir);
    props.setList?.(sorted);
  };

  return (
    <section>
      <h3>Tri</h3>
      <ul>
        <For each={props.options}>
          {(option) => {
            const type = inferTypeForKey(props.list || [], option.key);

            return (
              <For each={option.directions}>
                {(direction) => {
                  const label = sortLabel(option, direction.dir, type);
                  const isChecked =
                    active()?.key === option.key &&
                    active()?.dir === direction.dir;

                  return (
                    <InputItem
                      label={label}
                      name={option.key}
                      isChecked={isChecked}
                      type="radio"
                      onSelect={() => onSelect(option, direction)}
                    />
                  );
                }}
              </For>
            );
          }}
        </For>
      </ul>
    </section>
  );
}

function InputItem(props) {
  return (
    <li>
      <label>
        {props.label}
        <input
          type={props.type}
          name={props.name}
          checked={props.isChecked}
          onChange={props.onSelect}
        />
      </label>
    </li>
  );
}

function applyFilters(list, activeFilters) {
  return list.filter(item =>
    activeFilters.every(f => f.fn(item[f.key]))
  );
}

export function Filter(props) {
  const { filters, list, setList } = props;

  const [activeFilters, setActiveFilters] = createSignal(
    filters.filter(f => f.default)
  );

  const toggle = (filter) => {
    const current = activeFilters();
    const exists = current.includes(filter);

    const updated = exists
      ? current.filter(f => f !== filter)
      : [...current, filter];

    setActiveFilters(updated);

    const filtered = applyFilters(list, updated);
    setList(filtered);
  };

  return (
    <section>
      <h3>Filtres</h3>
      <ul>
        <For each={filters}>
          {(filter) => {
            const checked = activeFilters().includes(filter);
            return (
              <InputItem
                label={filter.label}
                type="checkbox"
                isChecked={checked}
                onSelect={() => toggle(filter)}
              />
            );
          }}
        </For>
      </ul>
    </section>
  );
}
