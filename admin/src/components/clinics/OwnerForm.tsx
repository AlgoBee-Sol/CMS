"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ownerSchema, OwnerDto } from "@/lib/schemas/owner.schema";
import { formatCnicInput } from "@/lib/utils/format";

interface OwnerFormProps {
  defaultValues?: Partial<OwnerDto>;
  onSubmit: (data: OwnerDto) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export default function OwnerForm({ defaultValues, onSubmit, isPending, submitLabel = "Save Owner" }: OwnerFormProps) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<OwnerDto>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      cnic: "",
      ...defaultValues,
    },
  });

  const inputClass = "w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white";
  const labelClass = "block text-sm font-medium mb-1.5";
  const errorClass = "mt-1 text-xs text-red-500";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>First Name *</label>
          <input {...register("firstName")} className={inputClass} style={{ borderColor: errors.firstName ? "var(--color-danger)" : "var(--color-neutral-200)" }} />
          {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Last Name *</label>
          <input {...register("lastName")} className={inputClass} style={{ borderColor: errors.lastName ? "var(--color-danger)" : "var(--color-neutral-200)" }} />
          {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Email *</label>
          <input {...register("email")} type="email" className={inputClass} style={{ borderColor: errors.email ? "var(--color-danger)" : "var(--color-neutral-200)" }} />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Phone</label>
          <input {...register("phone")} className={inputClass} style={{ borderColor: "var(--color-neutral-200)" }} />
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>CNIC</label>
          <input
            {...register("cnic")}
            placeholder="XXXXX-XXXXXXX-X"
            className={inputClass}
            style={{ borderColor: errors.cnic ? "var(--color-danger)" : "var(--color-neutral-200)" }}
            onChange={(e) => setValue("cnic", formatCnicInput(e.target.value))}
          />
          {errors.cnic && <p className={errorClass}>{errors.cnic.message}</p>}
        </div>
      </div>
      <p className="text-xs" style={{ color: "var(--color-neutral-400)" }}>
        Password is not set here — the owner will receive a welcome email with login credentials.
      </p>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "var(--color-primary-600)" }}
        >
          {isPending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
