import type { ReactNode } from 'react';
import Link from 'next/link';

/* ── Datos del mock ────────────────────────────────────────────── */

type DealCard = {
  name: string;
  note: string;
  tone: 'neutral' | 'active' | 'won';
};

type Stage = {
  title: string;
  count: number;
  featured: DealCard;
  cards: DealCard[];
};

const STAGES: Stage[] = [
  {
    title: 'Contacto',
    count: 3,
    featured: { name: 'Sudamérica Freight', note: 'Cliente nuevo', tone: 'neutral' },
    cards: [
      { name: 'Grupo Ícaro', note: 'Cliente nuevo', tone: 'neutral' },
      { name: 'Velcor S.A.', note: 'Reunión agendada', tone: 'active' },
    ],
  },
  {
    title: 'Propuesta',
    count: 2,
    featured: { name: 'Sudamérica Freight', note: 'Propuesta enviada', tone: 'active' },
    cards: [
      { name: 'Helm Textil', note: 'Propuesta enviada', tone: 'active' },
      { name: 'Andes Retail', note: 'En negociación', tone: 'active' },
    ],
  },
  {
    title: 'Cierre',
    count: 1,
    featured: { name: 'Sudamérica Freight', note: 'Ganada', tone: 'won' },
    cards: [{ name: 'Bahía Mar', note: 'Contrato firmado', tone: 'won' }],
  },
];

const SIDEBAR_ITEMS = [
  { label: 'Clientes', count: 24 },
  { label: 'Oportunidades', count: 7 },
  { label: 'Tareas', count: 12 },
  { label: 'Ajustes', count: null },
] as const;

const CAPABILITIES: Array<{ title: string; body: string }> = [
  {
    title: 'Clientes',
    body: 'Un directorio vivo por organización: cada cuenta con su historial, sus contactos y quién la lleva. Alta y edición al instante, sin hojas de cálculo paralelas.',
  },
  {
    title: 'Oportunidades',
    body: 'Un pipeline que se ve: cada negocio avanza por etapas visibles, con su valor y su responsable. Se sabe qué está por cerrar y qué está detenido.',
  },
  {
    title: 'Tareas',
    body: 'Quién hace qué y para cuándo. Cada tarea vive junto a su cliente o su oportunidad, con un responsable claro y fecha de entrega.',
  },
  {
    title: 'Equipo',
    body: 'Invitaciones y roles en manos del administrador: cada persona entra a la organización y elige con qué autonomía trabaja.',
  },
];

const ROLES: Array<{ title: string; intro: string; points: string[] }> = [
  {
    title: 'Administrador',
    intro: 'Gobierna la organización.',
    points: [
      'Invita y retira miembros del equipo.',
      'Administra el espacio y su configuración.',
      'Puede trabajar en lo comercial cuando quiera.',
    ],
  },
  {
    title: 'Colaborador',
    intro: 'Autonomía completa en lo comercial.',
    points: [
      'Crea, consulta, modifica y archiva clientes.',
      'Mueve oportunidades por el pipeline.',
      'Gestiona sus tareas y las que le asignan.',
    ],
  },
];

/* ── Piezas del mock ───────────────────────────────────────────── */

function LogoMark() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden="true"
      className="text-faro"
    >
      <rect x="1.5" y="4.5" width="9" height="17" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="15.5" y="4.5" width="9" height="17" rx="2" stroke="currentColor" strokeWidth="2" opacity="0.45" />
    </svg>
  );
}

function dealToneClass(tone: DealCard['tone']): string {
  if (tone === 'active') return 'text-flujo';
  if (tone === 'won') return 'text-ok';
  return 'text-mist';
}

function DealCardView({ deal, featured = false }: { deal: DealCard; featured?: boolean }) {
  return (
    <div
      className={`rounded-md border border-edge bg-panel px-3 py-2.5 ${
        featured && deal.tone === 'active' ? 'border-l-2 border-l-faro' : ''
      } ${featured && deal.tone === 'won' ? 'border-l-2 border-l-ok' : ''}`}
    >
      <p className="truncate text-[13px] font-semibold text-ice">{deal.name}</p>
      <p className={`mt-1 truncate text-[11px] font-medium ${dealToneClass(deal.tone)}`}>
        {deal.note}
      </p>
    </div>
  );
}

function Traveler({ deal, stage }: { deal: DealCard; stage: 1 | 2 | 3 }) {
  return (
    <div className={`travel travel-${stage} absolute inset-0`}>
      <DealCardView deal={deal} featured />
    </div>
  );
}

function WorkspaceMock() {
  return (
    <div className="relative">
      {/* Organización propia */}
      <div className="reveal relative overflow-hidden rounded-xl border border-edge bg-hull lg:mr-20">
        {/* Barra superior */}
        <div className="flex items-center justify-between border-b border-edge px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-faro text-sm font-bold text-on-amber">
              A
            </span>
            <span className="text-sm font-semibold text-ice">Aurea Logística</span>
          </div>
          <div className="flex -space-x-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-hull bg-edge text-[10px] font-semibold text-ice">
              M
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-hull bg-flujo text-[10px] font-semibold text-void">
              R
            </span>
          </div>
        </div>

        <div className="flex">
          {/* Navegación lateral */}
          <nav className="hidden w-40 shrink-0 flex-col gap-0.5 border-r border-edge p-3 sm:flex">
            {SIDEBAR_ITEMS.map((item) => (
              <div
                key={item.label}
                className={`flex items-center justify-between rounded-md px-2.5 py-2 text-xs ${
                  item.label === 'Oportunidades'
                    ? 'border-l-2 border-l-flujo bg-panel font-semibold text-ice'
                    : 'text-mist'
                }`}
              >
                <span>{item.label}</span>
                {item.count !== null && (
                  <span className="text-[10px] opacity-70">{item.count}</span>
                )}
              </div>
            ))}
          </nav>

          {/* Pipeline */}
          <div className="grid min-w-0 flex-1 grid-cols-3 gap-2.5 p-3">
            {STAGES.map((stage, index) => (
              <div key={stage.title} className="min-w-0">
                <div className="flex items-center justify-between px-1 pb-2">
                  <span className="truncate text-[11px] font-semibold text-ice">
                    {stage.title}
                  </span>
                  <span className="ml-1 text-[10px] text-mist">{stage.count}</span>
                </div>
                <div className="relative h-[72px]">
                  <Traveler deal={stage.featured} stage={(index + 1) as 1 | 2 | 3} />
                </div>
                <div className="mt-2 space-y-2">
                  {stage.cards.map((card) => (
                    <DealCardView key={card.name} deal={card} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Costura de aislamiento: otra organización, invisible */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-3 right-0 hidden w-20 overflow-hidden rounded-r-xl border border-edge border-l-0 bg-[#1b1740] opacity-80 blur-[1px] lg:block"
      >
        <div className="p-3">
          <p className="truncate text-[10px] text-mist">Cromo Digital</p>
          <div className="mt-3 space-y-2.5">
            <div className="h-2 rounded bg-[#3a2f6b]" />
            <div className="h-2 w-3/4 rounded bg-[#3a2f6b]" />
            <div className="h-2 w-1/2 rounded bg-[#3a2f6b]" />
            <div className="h-9 rounded bg-[#2c2454]" />
            <div className="h-9 rounded bg-[#2c2454]" />
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="seam absolute bottom-3 top-3 right-20 hidden w-px lg:block"
      />
      <div className="absolute top-1/2 right-20 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
        <span className="whitespace-nowrap rounded-full border border-edge bg-void px-2.5 py-1 text-[10px] font-medium text-mist">
          Otra organización
        </span>
      </div>

      {/* Nota para pantallas donde la costura no cabe */}
      <p className="mt-3 text-xs text-mist lg:hidden">
        A la derecha de este espacio existe otra organización. Existe, pero no la ves.
      </p>
    </div>
  );
}

/* ── Página ────────────────────────────────────────────────────── */

function NavButton({
  href,
  children,
  variant,
}: {
  href: string;
  children: ReactNode;
  variant: 'solid' | 'ghost';
}) {
  const classes =
    variant === 'solid'
      ? 'rounded-md bg-faro px-4 py-2 text-sm font-semibold text-on-amber transition-colors hover:bg-faro-deep'
      : 'rounded-md px-4 py-2 text-sm font-medium text-ice transition-colors hover:text-faro';
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-edge bg-void">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="font-wide text-lg font-bold tracking-tight">Nexora</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-mist md:flex">
            <a href="#producto" className="transition-colors hover:text-ice">
              Producto
            </a>
            <a href="#roles" className="transition-colors hover:text-ice">
              Roles
            </a>
            <a href="#aislamiento" className="transition-colors hover:text-ice">
              Aislamiento
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <NavButton href="/login" variant="ghost">
              Entrar
            </NavButton>
            <NavButton href="/register" variant="solid">
              Crear tu organización
            </NavButton>
          </div>
        </div>
      </header>

      <main>
        {/* Héroe */}
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 md:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <h1 className="font-wide text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-5xl xl:text-[3.6rem]">
                Cada empresa, su propio sistema.
              </h1>
              <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-mist">
                Nexora es la plataforma donde tu equipo administra clientes,
                oportunidades y tareas en un espacio que pertenece solo a tu
                organización. Nada se mezcla, nada se comparte.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="rounded-md bg-faro px-5 py-3 text-sm font-semibold text-on-amber transition-colors hover:bg-faro-deep"
                >
                  Crear tu organización
                </Link>
                <a
                  href="#producto"
                  className="rounded-md border border-edge px-5 py-3 text-sm font-medium text-ice transition-colors hover:border-faro"
                >
                  Ver cómo funciona
                </a>
              </div>
              <p className="mt-6 max-w-[52ch] text-sm text-mist">
                El aislamiento entre organizaciones vive en la propia base de
                datos, no en una promesa de la aplicación.
              </p>
            </div>

            <WorkspaceMock />
          </div>
        </section>

        {/* Qué resuelve */}
        <section id="producto" className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <h2 className="max-w-[24ch] text-3xl font-bold tracking-tight md:text-4xl">
            Todo lo que tu equipo comercial mueve, en un mismo lugar.
          </h2>
          <div className="mt-12">
            {CAPABILITIES.map((item) => (
              <div
                key={item.title}
                className="grid gap-3 border-t border-edge py-8 md:grid-cols-[220px_1fr] md:gap-10"
              >
                <h3 className="text-xl font-semibold text-ice">{item.title}</h3>
                <p className="max-w-[62ch] leading-relaxed text-mist">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Roles */}
        <section id="roles" className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-2">
            {ROLES.map((role) => (
              <div
                key={role.title}
                className={`rounded-xl border p-8 ${
                  role.title === 'Administrador' ? 'border-faro' : 'border-edge'
                }`}
              >
                <h3 className="text-2xl font-bold tracking-tight">{role.title}</h3>
                <p className="mt-2 font-medium text-faro">{role.intro}</p>
                <ul className="mt-6 space-y-3">
                  {role.points.map((point) => (
                    <li key={point} className="flex gap-3 text-mist">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-flujo"
                      />
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-[62ch] text-sm leading-relaxed text-mist">
            Ningún rol puede ver datos de otra organización, y la pertenencia es
            única: cada persona pertenece a una sola empresa.
          </p>
        </section>

        {/* Aislamiento */}
        <section id="aislamiento" className="border-y border-edge bg-hull">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
            <h2 className="max-w-[26ch] text-3xl font-bold tracking-tight md:text-4xl">
              Lo tuyo no se comparte.
            </h2>
            <div className="mt-10 max-w-[68ch] space-y-5 leading-relaxed text-mist">
              <p>
                El aislamiento de Nexora no es una capa de la aplicación: vive en
                la base de datos. PostgreSQL decide, fila por fila, que los
                datos de tu organización solo puedan leerse y escribirse desde
                tu organización.
              </p>
              <p>
                Además, reglas de integridad protegen lo delicado: nadie puede
                elevar su propio rol, cambiarse de empresa, ni asignar tareas a
                personas de otra organización. La frontera no depende de que
                nadie se acuerde de validarla.
              </p>
            </div>
          </div>
        </section>

        {/* Cierre */}
        <section id="empezar" className="mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
          <h2 className="font-wide mx-auto max-w-[22ch] text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">
            Crea tu organización hoy.
          </h2>
          <p className="mx-auto mt-5 max-w-[48ch] leading-relaxed text-mist">
            Invita a tu equipo, carga tus primeros clientes y pon el pipeline a
            trabajar. Tarda menos de un minuto.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-block rounded-md bg-faro px-6 py-3.5 text-sm font-semibold text-on-amber transition-colors hover:bg-faro-deep"
            >
              Crear tu organización
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-edge">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-mist sm:flex-row">
          <span className="font-wide font-bold text-ice">Nexora</span>
          <nav className="flex gap-6">
            <a href="#producto" className="transition-colors hover:text-ice">
              Producto
            </a>
            <a href="#roles" className="transition-colors hover:text-ice">
              Roles
            </a>
            <a href="#aislamiento" className="transition-colors hover:text-ice">
              Aislamiento
            </a>
          </nav>
          <span>© {new Date().getFullYear()} Nexora</span>
        </div>
      </footer>
    </div>
  );
}
