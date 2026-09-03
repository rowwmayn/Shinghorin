'use client';

interface ToastProps {
  message: string;
  show: boolean;
  isError?: boolean;
}

export default function Toast({ message, show, isError = false }: ToastProps) {
  return (
    <div
      id="toast"
      className={`toast ${show ? 'show' : ''}`}
      style={{
        borderColor: isError ? 'var(--plum)' : 'var(--marigold)',
      }}
      role="alert"
    >
      <p id="toast-msg">{message}</p>
    </div>
  );
}
