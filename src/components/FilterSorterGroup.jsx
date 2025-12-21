import { For, onMount, Show } from "solid-js";

const getType = (val) => {
  if (val == null) return "null";
  if (typeof val === "number") return "number";
  if (typeof val === "boolean") return "boolean";
  if (typeof val === "string" && !Number.isNaN(Date.parse(val)) && val.length > 5) return "date";
  return "string";
};

const smartCompare = (a, b, dir) => {
  const type = getType(a ?? b);
  const coef = dir === "desc" ? -1 : 1;

  if (a == null) return 1;
  if (b == null) return -1;

  if (type === "string") return a.localeCompare(b) * coef;
  if (type === "number") return (a - b) * coef;
  if (type === "date") return (new Date(a) - new Date(b)) * coef;
  return (a > b ? 1 : -1) * coef;
};

export function FilterSorterGroup(props) {
  const { config, operations, setOperations } = props;

  const createFilterOp = (fConfig) => ({
    id: `filter:${fConfig.key}:${fConfig.label}`,
    type: "filter",
    apply: (data) => data.filter(item => fConfig.filter(item[fConfig.key]))
  });

  const createSortOp = (sConfig) => {
    const dir = sConfig.dir || "asc";
    return {
      id: `sort:${sConfig.key}-${dir}`,
      type: "sort",
      apply: (data) => [...data].sort((a, b) =>
        smartCompare(a[sConfig.key], b[sConfig.key], dir)
      )
    };
  };


  onMount(() => {
    setOperations(currentOps => {
      let nextOps = [...currentOps];

      const hasActiveFilter = nextOps.some(o => o.type === 'filter');
      if (!hasActiveFilter && config.filter) {
        const defaultFilters = config.filter.filter(f => f.default);
        defaultFilters.forEach(f => nextOps.push(createFilterOp(f)));
      }

      const hasActiveSort = nextOps.some(o => o.type === 'sort');
      if (!hasActiveSort && config.sort) {
        const defaultSort = config.sort.find(s => s.default);
        if (defaultSort) nextOps.push(createSortOp(defaultSort));
      }

      return nextOps;
    });
  });

  const toggleFilter = (fConfig) => {
    const newOp = createFilterOp(fConfig);
    setOperations(ops => {
      const exists = ops.find(o => o.id === newOp.id);
      return exists
        ? ops.filter(o => o.id !== newOp.id)
        : [...ops, newOp];
    });
  };

  const activateSort = (sConfig) => {
    const newOp = createSortOp(sConfig);
    setOperations(ops => [
      ...ops.filter(o => o.type !== "sort"),
      newOp
    ]);
  };

  const isActive = (id) => operations().some(o => o.id === id);

  return (
    <>
      <Show when={config.filter?.length}>
        <div>
          <h4 class="text-sm font-semibold text-neutral-400 dark:text-neutral-500 mb-2">Filtres</h4>
          <ul class="space-y-2">
            <For each={config.filter}>
              {(f) => {
                const id = `filter:${f.key}:${f.label}`;
                return (
                  <li class="flex items-center">
                    <input
                      type="checkbox"
                      id={id}
                      checked={isActive(id)}
                      onChange={() => toggleFilter(f)}
                      class="w-4 h-4 rounded border-gray-300"
                    />
                    <label for={id} class="ml-2 text-sm  cursor-pointer">
                      {f.label}
                    </label>
                  </li>
                );
              }}
            </For>
          </ul>
        </div>
      </Show>

      <Show when={config.sort?.length}>
        <div >
          <h4 class="text-sm font-semibold text-neutral-400 dark:text-neutral-500 mb-2">Trier par</h4>
          <ul class="space-y-2">
            <For each={config.sort}>
              {(s) => {
                const id = `sort:${s.key}-${s.dir || "asc"}`;
                return (
                  <li class="flex items-center">
                    <input
                      type="radio"
                      id={id}
                      name="sort"
                      checked={isActive(id)}
                      onChange={() => activateSort(s)}
                      class="w-4 h-4 border-gray-300"
                    />
                    <label for={id} class="ml-2 text-sm cursor-pointer">
                      {s.label}
                    </label>
                  </li>
                );
              }}
            </For>
          </ul>
        </div>
      </Show>
    </>
  );
}
