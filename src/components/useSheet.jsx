import { doc } from "firebase/firestore";
import { createSignal } from "solid-js";

export function useSheet(openState, maxHeightVH) {
    let sheetREF, contentREF, backdropREF;

    const VELOCITY_THRESHOLD = 1;
    const DISTANCE_THRESHOLD = 200;

    let dragging = false;
    let startY = 0;
    let lastY = 0;
    let lastT = 0;
    let velocity = 0;

    let touchStartY = 0;
    let isTouchDragging = false;

    const [viewportHeight, setViewportHeight] = createSignal(window.innerHeight)
    const [isOpen, setIsOpen] = createSignal(openState);
    const height = () => viewportHeight() * (maxHeightVH / 100);

    const root = document.getElementById("root");
    const body = document.body
    const

}