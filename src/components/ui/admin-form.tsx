import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  badge?: string;
}

export function FormSection({ title, description, badge, children, className, ...props }: FormSectionProps) {
  return (
    <div className={cn("space-y-3 pt-2 first:pt-0", className)} {...props}>
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            {title}
          </h4>
          {description && (
            <p className="text-[11px] text-muted-foreground font-normal mt-0.5">{description}</p>
          )}
        </div>
        {badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-3.5 pt-1">{children}</div>
    </div>
  );
}

export interface FormGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4;
}

export function FormGrid({ cols = 2, children, className, ...props }: FormGridProps) {
  const colClass =
    cols === 1
      ? "grid-cols-1"
      : cols === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : cols === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2";

  return (
    <div className={cn("grid gap-4", colClass, className)} {...props}>
      {children}
    </div>
  );
}

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  required?: boolean;
  error?: string | null;
  helperText?: string;
}

export function FormField({ label, required, error, helperText, children, className, ...props }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {label} {required && <span className="text-destructive font-bold ml-0.5">*</span>}
        </Label>
      </div>
      {children}
      {error ? (
        <p className="text-[11px] font-medium text-destructive mt-1 flex items-center gap-1">
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-muted-foreground mt-1 leading-normal">{helperText}</p>
      ) : null}
    </div>
  );
}
