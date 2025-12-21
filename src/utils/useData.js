import { createSignal, createMemo } from "solid-js";

export function useData(list) {
  const [operations, setOperations] = createSignal([]);

  const result = createMemo(() => {
    const data = typeof list === "function" ? list() : list;
    const ops = operations();

    if (!data) return data;

    const sortedOps = [...ops].sort((a, b) => (a.type === "filter" ? -1 : 1));
    return sortedOps.reduce((acc, op) => op.apply(acc), data);
  });

  return { result, operations, setOperations };
}
