import { SearchIcon } from "../assets/Icons";

export function Date() {
    return (
        <label className="aspect-square relative cursor-pointer flex items-center justify-center w-14 h-14 rounded-xl dark:bg-neutral-700">
            <div className="flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-white leading-none">
                    {new Date(form().date).getDate()}
                </span>
                <span className="text-[10px] text-neutral-400 uppercase">
                    {new Date(form().date).toLocaleDateString("fr-FR", { month: "short" })}
                </span>
            </div>
            <input
                type="date"
                value={form().date}
                onInput={(e) => setForm((prev) => ({ ...prev, date: e.currentTarget.value }))}
                className="inset-0 absolute opacity-0 cursor-pointer"
                onClick={(e) => e.currentTarget.showPicker?.()}
            />
        </label>
    )
}


export function SearchInput(props) {
    const { setOperations, key, debounceTime } = props;
    let debounceTimeout;

    const handleInput = (e) => {
        const value = e.target.value.toLowerCase().trim();
        const searchId = `search:${key}`;

        if (debounceTimeout) clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            setOperations((currentOps) => {
                const opsWithoutSearch = currentOps.filter((op) => op.id !== searchId);

                if (!value) return opsWithoutSearch;
                console.log(key);
                const searchOp = {
                    id: searchId,
                    type: "filter",
                    apply: (data) =>
                        data.filter((item) => key.some((k) =>
                            String(item[k] ?? "").toLowerCase().includes(value)
                        )),
                };
                return [...opsWithoutSearch, searchOp];
            });
        }, debounceTime);
    };

    return (
        <label className="flex items-center has-focus-within:*:outline-0 has-focus-within:outline-2 w-full placeholder-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 rounded-xl">
            <SearchIcon />
            <input
                type="text"
                class="search-input"
                placeholder="Rechercher..."
                onInput={handleInput}
                className="p-2"
            />
        </label>
    );
}