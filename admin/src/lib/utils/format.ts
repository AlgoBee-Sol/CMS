import { format, formatDistanceToNow, parseISO } from "date-fns";

/** Format a number as Pakistani Rupees */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format ISO date string as readable date */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    return format(parseISO(dateString), "dd MMM yyyy");
  } catch {
    return "—";
  }
}

/** Format ISO date string as date + time */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    return format(parseISO(dateString), "dd MMM yyyy, HH:mm");
  } catch {
    return "—";
  }
}

/** Relative time label like "2 days ago" */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return "—";
  }
}

/** Mask a CNIC to show only the last digit: XXXXX-XXXXXXX-X */
export function maskCnic(cnic: string | null | undefined): string {
  if (!cnic) return "—";
  // Normalise any format to XXXXX-XXXXXXX-X
  const digits = cnic.replace(/\D/g, "");
  if (digits.length !== 13) return cnic; // Return as-is if unexpected format
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

/** Get days until a date expires (negative = already expired) */
export function daysUntilExpiry(dateString: string | null | undefined): number {
  if (!dateString) return -Infinity;
  try {
    const endDate = parseISO(dateString);
    const now = new Date();
    const diffMs = endDate.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return -Infinity;
  }
}

/** Generate a random secure password of 12 chars */
export function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/** Auto-generate a clinic code from its name (3-5 uppercase chars) */
export function generateClinicCode(name: string): string {
  const words = name.trim().toUpperCase().replace(/[^A-Z0-9\s]/g, "").split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 4);
  return words.map((w) => w[0]).join("").slice(0, 5);
}

/** Format CNIC as user types: XXXXX-XXXXXXX-X */
export function formatCnicInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

/** Auto-generate a subdomain from a clinic name */
export function generateSubdomain(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30);
}
