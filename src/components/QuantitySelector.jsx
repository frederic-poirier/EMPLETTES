/**
 * Quantity selector component with - and + buttons
 * @param {Object} props
 * @param {number} props.value - Current quantity value
 * @param {(value: number) => void} props.onChange - Callback when value changes
 * @param {number} [props.min=0] - Minimum allowed value
 * @param {number} [props.max] - Maximum allowed value (optional)
 * @param {string} [props.size="md"] - Size variant: "sm" | "md"
 * @param {boolean} [props.showBackground=false] - Whether to show background on buttons
 */
export default function QuantitySelector(props) {
    const min = () => props.min ?? 0;
    const max = () => props.max;
    const value = () => props.value ?? 0;
    const size = () => props.size ?? "md";
    const showBg = () => props.showBackground ?? false;

    const canDecrement = () => value() > min();
    const canIncrement = () => max() === undefined || value() < max();

    const decrement = () => {
        if (canDecrement()) {
            props.onChange?.(value() - 1);
        }
    };

    const increment = () => {
        if (canIncrement()) {
            props.onChange?.(value() + 1);
        }
    };

    const buttonClass = () => {
        const base = "flex items-center justify-center text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors";
        const sizeClass = size() === "sm" ? "w-6 h-6 text-sm" : "w-8 h-8 text-lg";
        const bgClass = showBg() ? "bg-neutral-800 rounded-lg" : "";
        return `${base} ${sizeClass} ${bgClass}`;
    };

    const valueClass = () => {
        const base = "text-center font-medium text-white";
        const sizeClass = size() === "sm" ? "w-6 text-sm" : "w-8 text-sm";
        return `${base} ${sizeClass}`;
    };

    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                className={buttonClass()}
                disabled={!canDecrement()}
                onClick={decrement}
                aria-label="Diminuer la quantité"
            >
                −
            </button>
            <span className={valueClass()}>{value()}</span>
            <button
                type="button"
                className={buttonClass()}
                disabled={!canIncrement()}
                onClick={increment}
                aria-label="Augmenter la quantité"
            >
                +
            </button>
        </div>
    );
}
