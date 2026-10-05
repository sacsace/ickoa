"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Heart, Loader2, CheckCircle2, CreditCard } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { createDonationOrder, verifyDonationPayment } from "@/actions/donate";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
    };
  }
}

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

type DonateFormProps = {
  razorpayConfigured: boolean;
};

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function DonateForm({ razorpayConfigured }: DonateFormProps) {
  const { locale } = useLocale();
  const isKo = locale === "ko";
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ amountInr: number } | null>(null);
  const [amountInr, setAmountInr] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [form, setForm] = useState({
    donorName: session?.user?.name ?? "",
    donorEmail: session?.user?.email ?? "",
    donorPhone: "",
    message: "",
  });

  const labels = {
    presets: isKo ? "후원 금액 선택" : "Choose amount",
    custom: isKo ? "직접 입력 (₹)" : "Custom amount (₹)",
    name: isKo ? "이름" : "Name",
    email: isKo ? "이메일" : "Email",
    phone: isKo ? "연락처 (선택)" : "Phone (optional)",
    message: isKo ? "응원 메시지 (선택)" : "Message (optional)",
    pay: isKo ? "Razorpay로 후원하기" : "Donate with Razorpay",
    successTitle: isKo ? "후원이 완료되었습니다!" : "Thank you for your donation!",
    successDesc: isKo
      ? "첸나이 한인회 활동에 소중한 후원을 보내주셔서 감사합니다."
      : "Your support helps ICKOA serve the Chennai Korean community.",
    notConfigured: isKo
      ? "Razorpay 결제 키가 설정되지 않았습니다. .env에 RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET을 추가해 주세요."
      : "Razorpay is not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.",
  };

  function resolveAmount() {
    if (customAmount.trim()) {
      const parsed = parseInt(customAmount, 10);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return amountInr;
  }

  function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const finalAmount = resolveAmount();

    startTransition(async () => {
      try {
        const loaded = await loadRazorpayScript();
        if (!loaded || !window.Razorpay) {
          throw new Error(isKo ? "결제 모듈을 불러오지 못했습니다." : "Failed to load payment module.");
        }

        const order = await createDonationOrder({
          amountInr: finalAmount,
          ...form,
        });

        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "ICKOA",
          description: isKo ? "첸나이 한인회 후원" : "Korean Association in Chennai",
          order_id: order.orderId,
          prefill: {
            name: order.donorName,
            email: order.donorEmail,
            contact: order.donorPhone,
          },
          theme: { color: "#2d6a4f" },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const result = await verifyDonationPayment({
                donationId: order.donationId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              setSuccess({ amountInr: result.amountInr });
            } catch (err) {
              setError(err instanceof Error ? err.message : "Verification failed");
            }
          },
          modal: {
            ondismiss: () => setError(isKo ? "결제가 취소되었습니다." : "Payment cancelled."),
          },
        });

        rzp.on("payment.failed", (response) => {
          setError(response.error?.description ?? (isKo ? "결제에 실패했습니다." : "Payment failed."));
        });

        rzp.open();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    });
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-brand/20 bg-accent/50 p-8 text-center md:p-12">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand" />
        <h2 className="font-display mt-4 text-2xl font-bold">{labels.successTitle}</h2>
        <p className="mt-2 text-muted-foreground">
          ₹{success.amountInr.toLocaleString("en-IN")} · {labels.successDesc}
        </p>
      </div>
    );
  }

  if (!razorpayConfigured) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-8 text-center">
        <CreditCard className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">{labels.notConfigured}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handlePay} className="space-y-8">
      <div>
        <p className="mb-3 text-sm font-medium">{labels.presets}</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => {
                setAmountInr(amt);
                setCustomAmount("");
              }}
              className={cn(
                "rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
                amountInr === amt && !customAmount
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-card hover:border-brand/40",
              )}
            >
              ₹{amt.toLocaleString("en-IN")}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">{labels.custom}</label>
        <input
          type="number"
          min={100}
          max={500000}
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder="1000"
          className="h-11 w-full max-w-xs rounded-xl border border-border bg-background px-4 text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">{labels.name} *</label>
          <input
            required
            value={form.donorName}
            onChange={(e) => setForm({ ...form, donorName: e.target.value })}
            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{labels.email} *</label>
          <input
            type="email"
            required
            value={form.donorEmail}
            onChange={(e) => setForm({ ...form, donorEmail: e.target.value })}
            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{labels.phone}</label>
          <input
            value={form.donorPhone}
            onChange={(e) => setForm({ ...form, donorPhone: e.target.value })}
            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{labels.message}</label>
          <input
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" size="lg" disabled={isPending} className="gap-2">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className="h-4 w-4" />
        )}
        {labels.pay}
      </Button>

      <p className="text-xs text-muted-foreground">
        {isKo
          ? "결제는 Razorpay를 통해 안전하게 처리됩니다. UPI, 카드, 넷뱅킹을 지원합니다."
          : "Payments are securely processed by Razorpay. UPI, cards, and netbanking supported."}
      </p>
    </form>
  );
}
