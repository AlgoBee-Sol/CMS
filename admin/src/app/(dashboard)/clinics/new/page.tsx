"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import ClinicForm from "@/components/clinics/ClinicForm";
import OwnerForm from "@/components/clinics/OwnerForm";
import SubscriptionForm from "@/components/clinics/SubscriptionForm";
import { CreateClinicDto } from "@/lib/schemas/clinic.schema";
import { OwnerDto } from "@/lib/schemas/owner.schema";
import { SubscriptionDto } from "@/lib/schemas/subscription.schema";
import { useCreateClinic, useRegisterOwner, useUpdateSubscription } from "@/lib/hooks/useClinics";
import { generateTempPassword } from "@/lib/utils/format";
import { toast } from "sonner";

const STEPS = [
  { id: 1, label: "Clinic Profile" },
  { id: 2, label: "Clinic Owner" },
  { id: 3, label: "Subscription" },
];

export default function NewClinicPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [clinicId, setClinicId] = useState<string | null>(null);

  const createClinic = useCreateClinic();
  const registerOwner = useRegisterOwner();
  const updateSubscription = useUpdateSubscription();

  const handleProfileSubmit = async (data: CreateClinicDto) => {
    const payload = { ...data, logoUrl: data.logoUrl || undefined };
    const result = await createClinic.mutateAsync(payload);
    const id = result.data?.clinic?.id;
    if (id) {
      setClinicId(id);
      setStep(2);
    }
  };

  const handleOwnerSubmit = async (data: OwnerDto) => {
    if (!clinicId) return;
    const tempPassword = generateTempPassword();
    await registerOwner.mutateAsync({
      ...data,
      clinicId,
      password: tempPassword,
      cnic: data.cnic || undefined,
      phone: data.phone || undefined,
    });
    setStep(3);
  };

  const handleSubscriptionSubmit = async (data: SubscriptionDto) => {
    if (!clinicId) return;
    await updateSubscription.mutateAsync({ id: clinicId, data });
    toast.success("Clinic registered successfully!");
    router.push(`/clinics/${clinicId}`);
  };

  const isPending = createClinic.isPending || registerOwner.isPending || updateSubscription.isPending;

  return (
    <>
      <PageHeader
        title="Register New Clinic"
        subtitle="Complete all three steps to onboard a new clinic"
      />

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: step >= s.id ? "var(--color-primary-600)" : "var(--color-neutral-100)",
                color: step >= s.id ? "white" : "var(--color-neutral-400)",
              }}
            >
              {step > s.id ? <Check className="w-3.5 h-3.5" /> : s.id}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {idx < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300" />}
          </div>
        ))}
        {isPending && <Loader2 className="w-4 h-4 animate-spin text-blue-600 ml-2" />}
      </div>

      <div className="card-base p-6 max-w-3xl">
        {step === 1 && (
          <ClinicForm mode="create" onSubmit={handleProfileSubmit} isPending={createClinic.isPending} />
        )}
        {step === 2 && (
          <OwnerForm onSubmit={handleOwnerSubmit} isPending={registerOwner.isPending} submitLabel="Continue" />
        )}
        {step === 3 && (
          <SubscriptionForm onSubmit={handleSubscriptionSubmit} isPending={updateSubscription.isPending} submitLabel="Complete Registration" />
        )}
      </div>
    </>
  );
}
