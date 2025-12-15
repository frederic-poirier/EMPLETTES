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

function normalize(input) {
    return input
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
