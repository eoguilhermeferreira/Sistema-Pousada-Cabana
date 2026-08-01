export function Field({
  label,
  required,
  error,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className ? className : "flex flex-col gap-1.5"}>
      <span className="text-xs font-medium text-gray-text">
        {label}
        {required && <span className="text-status-ocupado"> *</span>}
      </span>
      {children}
      {error && (
        <span className="text-xs font-medium text-status-ocupado">{error}</span>
      )}
    </label>
  );
}
