"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClinicSchema, updateClinicSchema, CreateClinicDto, UpdateClinicDto } from "@/lib/schemas/clinic.schema";
import { generateClinicCode, generateSubdomain } from "@/lib/utils/format";

type ClinicFormProps =
  | {
      mode: "create";
      defaultValues?: Partial<CreateClinicDto>;
      onSubmit: (data: CreateClinicDto) => void;
      isPending?: boolean;
    }
  | {
      mode: "edit";
      defaultValues?: Partial<UpdateClinicDto>;
      onSubmit: (data: UpdateClinicDto) => void;
      isPending?: boolean;
    };

const inputClass = "w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white";
const labelClass = "block text-sm font-medium mb-1.5";
const errorClass = "mt-1 text-xs text-red-500";

function CreateClinicFormInner({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues?: Partial<CreateClinicDto>;
  onSubmit: (data: CreateClinicDto) => void;
  isPending?: boolean;
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateClinicDto>({
    resolver: zodResolver(createClinicSchema),
    defaultValues: {
      code: "",
      name: "",
      subdomain: "",
      email: "",
      phone: "",
      address: "",
      logoUrl: "",
      termsAndConditions: "",
      ...defaultValues,
    },
  });

  const name = watch("name");

  useEffect(() => {
    if (name) {
      setValue("code", generateClinicCode(name));
      setValue("subdomain", generateSubdomain(name));
    }
  }, [name, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Clinic Name *</label>
          <input {...register("name")} className={inputClass} style={{ borderColor: errors.name ? "var(--color-danger)" : "var(--color-neutral-200)" }} />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Clinic Code *</label>
          <input {...register("code")} className={inputClass} style={{ borderColor: errors.code ? "var(--color-danger)" : "var(--color-neutral-200)" }} />
          {errors.code && <p className={errorClass}>{errors.code.message}</p>}
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Subdomain *</label>
          <input {...register("subdomain")} className={inputClass} style={{ borderColor: errors.subdomain ? "var(--color-danger)" : "var(--color-neutral-200)" }} />
          {errors.subdomain && <p className={errorClass}>{errors.subdomain.message}</p>}
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Email *</label>
          <input {...register("email")} type="email" className={inputClass} style={{ borderColor: errors.email ? "var(--color-danger)" : "var(--color-neutral-200)" }} />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Phone *</label>
          <input {...register("phone")} className={inputClass} style={{ borderColor: errors.phone ? "var(--color-danger)" : "var(--color-neutral-200)" }} />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>
        <div className="md:col-span-2">
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Address</label>
          <input {...register("address")} className={inputClass} style={{ borderColor: "var(--color-neutral-200)" }} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Logo URL</label>
          <input {...register("logoUrl")} placeholder="https://…" className={inputClass} style={{ borderColor: errors.logoUrl ? "var(--color-danger)" : "var(--color-neutral-200)" }} />
          {errors.logoUrl && <p className={errorClass}>{errors.logoUrl.message}</p>}
        </div>
        <div className="md:col-span-2">
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Terms & Conditions</label>
          <textarea {...register("termsAndConditions")} rows={3} className={inputClass} style={{ borderColor: "var(--color-neutral-200)" }} />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={isPending} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--color-primary-600)" }}>
          {isPending ? "Saving…" : "Continue"}
        </button>
      </div>
    </form>
  );
}

function EditClinicFormInner({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues?: Partial<UpdateClinicDto>;
  onSubmit: (data: UpdateClinicDto) => void;
  isPending?: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateClinicDto>({
    resolver: zodResolver(updateClinicSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      logoUrl: "",
      termsAndConditions: "",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Clinic Name *</label>
          <input {...register("name")} className={inputClass} style={{ borderColor: errors.name ? "var(--color-danger)" : "var(--color-neutral-200)" }} />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Email *</label>
          <input {...register("email")} type="email" className={inputClass} style={{ borderColor: errors.email ? "var(--color-danger)" : "var(--color-neutral-200)" }} />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Phone *</label>
          <input {...register("phone")} className={inputClass} style={{ borderColor: errors.phone ? "var(--color-danger)" : "var(--color-neutral-200)" }} />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>
        <div className="md:col-span-2">
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Address</label>
          <input {...register("address")} className={inputClass} style={{ borderColor: "var(--color-neutral-200)" }} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Logo URL</label>
          <input {...register("logoUrl")} placeholder="https://…" className={inputClass} style={{ borderColor: errors.logoUrl ? "var(--color-danger)" : "var(--color-neutral-200)" }} />
          {errors.logoUrl && <p className={errorClass}>{errors.logoUrl.message}</p>}
        </div>
        <div className="md:col-span-2">
          <label className={labelClass} style={{ color: "var(--color-neutral-600)" }}>Terms & Conditions</label>
          <textarea {...register("termsAndConditions")} rows={3} className={inputClass} style={{ borderColor: "var(--color-neutral-200)" }} />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={isPending} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--color-primary-600)" }}>
          {isPending ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

export default function ClinicForm(props: ClinicFormProps) {
  if (props.mode === "create") {
    return (
      <CreateClinicFormInner
        defaultValues={props.defaultValues}
        onSubmit={props.onSubmit}
        isPending={props.isPending}
      />
    );
  }
  return (
    <EditClinicFormInner
      defaultValues={props.defaultValues}
      onSubmit={props.onSubmit}
      isPending={props.isPending}
    />
  );
}
