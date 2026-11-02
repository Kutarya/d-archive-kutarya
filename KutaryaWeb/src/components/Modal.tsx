import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type KeyboardEventHandler,
} from "react";
import { X } from "lucide-react";

export function Modal({
  title,
  children,
  onClose,
  className = "",
  closeLabel = "Pencereyi kapat",
  onKeyDown,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
  closeLabel?: string;
  onKeyDown?: KeyboardEventHandler<HTMLDialogElement>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current!;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className={`modal-window ${className}`}
      aria-labelledby={titleId}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.key !== "Tab" || event.defaultPrevented) return;
        const focusable = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ].filter((element) => element.getClientRects().length > 0);
        const first = focusable[0],
          last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onClose();
      }}
    >
      <header className="modal-heading">
        <h2 id={titleId}>{title}</h2>
        <button
          type="button"
          className="icon-button"
          aria-label={closeLabel}
          onClick={onClose}
          autoFocus
        >
          <X size={21} />
        </button>
      </header>
      <div className="modal-scroll">{children}</div>
    </dialog>
  );
}
