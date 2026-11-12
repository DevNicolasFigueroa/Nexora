export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-wide text-3xl font-extrabold tracking-tight">
        Esta página no existe
      </h1>
      <p className="max-w-[46ch] text-mist">
        La dirección que buscaste no corresponde a ninguna página de Nexora.
      </p>
      <a
        href="/"
        className="rounded-md bg-faro px-5 py-3 text-sm font-semibold text-on-amber transition-colors hover:bg-faro-deep"
      >
        Volver al inicio
      </a>
    </main>
  );
}
