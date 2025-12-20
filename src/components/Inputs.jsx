export function Select(props) {
    return (
        <>
            <label for={normalize(props.label)}>
                {props.label}
            </label>

            <select
                id={normalize(props.label)}
                value={props.value}
                onChange={(e) => props.onChange?.(e.currentTarget.value)}
            >
                <For each={props.options}>
                    {(option) => (
                        <option value={option}>
                            {option}
                        </option>
                    )}
                </For>
            </select>
        </>
    );
}


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