declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MercadoPago: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paymentBrickController: any;
  }
}

export function loadMpScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.MercadoPago) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

type PayMethod = "pix" | "card";

// O SDK do MercadoPago só aceita os valores documentados por campo.
// Campos não informados são tratados como desativados — nunca usar "none" para desativar.
// bank_transfer aceita: "pix" | omitido
// creditCard / debitCard aceitam: "all" | omitido
// ticket aceita: "all" | omitido
// mercadoPago aceita: "all" | "mercado_pago" | "onboarding_credits" | omitido
function paymentMethodsFor(method: PayMethod) {
  if (method === "pix") {
    return { bankTransfer: "pix" as const };
  }
  return {
    creditCard: "all" as const,
  };
}

interface InitBrickOptions {
  preferenceId: string;
  amount: number;
  method: PayMethod;
  payerEmail?: string;
  onReady: () => void;
  onError: (err: unknown) => void;
  onSubmit: (data: { formData: unknown }) => Promise<void>;
}

export async function initPaymentBrick({
  preferenceId,
  amount,
  method,
  payerEmail,
  onReady,
  onError,
  onSubmit,
}: InitBrickOptions): Promise<void> {
  await loadMpScript();

  // Garante que o container já foi montado no DOM pelo React
  const container = document.getElementById("mp-payment-brick");
  if (!container) {
    throw new Error("Container #mp-payment-brick não encontrado no DOM.");
  }

  const mp = new window.MercadoPago(
    process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
    { locale: "pt-BR" }
  );

  await mp.bricks().create("payment", "mp-payment-brick", {
    initialization: {
      amount,
      preferenceId,
      // Pré-preenche e-mail do usuário logado → PIX vai direto ao QR code
      ...(payerEmail && { payer: { email: payerEmail } }),
    },
    customization: {
      paymentMethods: paymentMethodsFor(method),
      // Abre direto no formulário do método selecionado sem tela de seleção
      defaultPaymentOption: method === "card"
        ? { creditCardForm: true }
        : { pixTransferForm: true },
      // Parcelamento: até 6x no cartão de crédito
      ...(method === "card" && {
        installments: { minInstallments: 1, maxInstallments: 6 },
      }),
      visual: {
        style: { theme: "dark", customVariables: { baseColor: "#a855f7" } },
        hideFormTitle: true,
      },
    },
    callbacks: { onReady, onError, onSubmit },
  });
}

export async function unmountPaymentBrick(mounted: { current: boolean }): Promise<void> {
  if (mounted.current && window.paymentBrickController) {
    await window.paymentBrickController.unmount().catch(() => {});
    mounted.current = false;
  }
}
