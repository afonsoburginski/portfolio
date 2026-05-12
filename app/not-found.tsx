import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <p className="text-sm text-muted-foreground">
        O conteúdo que você procura não existe ou foi movido.
      </p>
      <Link href="/" className="text-sm text-primary underline">Voltar para o início</Link>
    </div>
  );
}
