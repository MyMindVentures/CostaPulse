import Image from "next/image";
import {
  CalendarCheck,
  Check,
  CreditCard,
  Heart,
  ScanLine,
  Store,
  TicketPercent,
  Users
} from "lucide-react";
import type { SiteLogoAsset } from "@/server/repositories/media-assets";
import type { PartnerQrMaterial } from "@/server/repositories/partner-referrals";

const stepIcons = [ScanLine, CalendarCheck, CreditCard, TicketPercent];
const featureIcons = [TicketPercent, Users, Users, Heart];

function applyReward(template: string, basisPoints: number) {
  const reward = new Intl.NumberFormat("en", {
    style: "percent",
    maximumFractionDigits: 2
  }).format(basisPoints / 10000);
  return template.replaceAll("{reward}", reward);
}

export function PartnerQrMaterialPage({
  material,
  siteLogo
}: {
  material: PartnerQrMaterial;
  siteLogo: SiteLogoAsset;
}) {
  const c = material.content;

  return (
    <main className="bg-sand text-navy min-h-screen print:bg-white">
      {material.status !== "active" ? (
        <div className="bg-coral px-4 py-3 text-center font-semibold text-white print:hidden">
          This QR code cannot accept referrals until this business is active.
        </div>
      ) : null}
      <div className="grid min-h-screen lg:grid-cols-5">
        <section className="relative isolate overflow-hidden px-6 py-8 sm:px-10 lg:col-span-3 lg:px-14 lg:py-10">
          {material.background ? (
            <>
              <Image
                src={material.background.url}
                alt={material.background.alt}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 60vw, 100vw"
              />
              <div className="absolute inset-0 -z-0 bg-white/70" />
            </>
          ) : (
            <div className="via-sand to-turquoise/30 absolute inset-0 -z-10 bg-gradient-to-br from-white" />
          )}

          <div className="relative z-10 flex h-full flex-col">
            <Image
              src={siteLogo.url}
              alt={siteLogo.alt}
              width={300}
              height={90}
              className="h-auto w-64 max-w-full object-contain object-left"
              priority
            />

            <div className="mt-10 max-w-3xl lg:mt-12">
              <h1 className="font-serif text-5xl leading-tight sm:text-6xl lg:text-7xl">
                {c.headlinePrimary}
                <span className="text-turquoise block">{c.headlineAccent}</span>
              </h1>
              <p className="text-ink mt-8 max-w-md text-lg leading-relaxed sm:text-xl">
                {applyReward(c.intro, material.rewardBasisPoints)}
              </p>
            </div>

            <section className="bg-navy mt-10 rounded-3xl p-6 text-white shadow-xl sm:p-8 lg:mt-auto">
              <h2 className="text-xl font-semibold">{c.howTitle}</h2>
              <ol className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {c.steps.map((step, index) => {
                  const Icon = stepIcons[index] ?? ScanLine;
                  return (
                    <li key={step.title} className="min-w-0">
                      <span className="text-turquoise flex size-14 items-center justify-center rounded-full bg-white">
                        <Icon aria-hidden="true" size={26} />
                      </span>
                      <h3 className="mt-4 font-semibold">
                        {index + 1}. {step.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-white/85">
                        {step.description}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </section>

            <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {c.features.map((feature, index) => {
                const Icon = featureIcons[index] ?? Heart;
                return (
                  <li key={feature.title} className="flex gap-3">
                    <Icon
                      aria-hidden="true"
                      className="text-turquoise shrink-0"
                    />
                    <span>
                      <strong className="text-turquoise block text-sm tracking-wide uppercase">
                        {feature.title}
                      </strong>
                      <span className="text-ink text-sm">
                        {feature.description}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <aside className="m-4 flex flex-col rounded-3xl bg-white/95 px-6 py-8 shadow-xl sm:m-6 sm:px-10 lg:col-span-2 lg:m-6 lg:ml-0">
          <div className="text-center">
            <Store aria-hidden="true" className="mx-auto" size={40} />
            <p className="text-turquoise mt-3 font-semibold tracking-wider uppercase">
              {c.partnerKicker}
            </p>
            {material.logo ? (
              <Image
                src={material.logo.url}
                alt={material.logo.alt}
                width={260}
                height={120}
                className="mx-auto mt-3 max-h-24 w-auto object-contain"
              />
            ) : (
              <h2 className="mt-3 font-serif text-4xl uppercase sm:text-5xl">
                {material.name}
              </h2>
            )}
            {material.logo ? (
              <h2 className="mt-2 font-serif text-3xl">{material.name}</h2>
            ) : null}
            {material.businessType ? (
              <p className="text-ink mt-1 tracking-widest uppercase">
                {material.businessType}
              </p>
            ) : null}
          </div>

          <div className="border-sand mx-auto mt-7 w-full max-w-sm rounded-3xl border-4 bg-white p-4">
            <div
              aria-label={`QR code for ${material.name}`}
              className="aspect-square w-full"
              dangerouslySetInnerHTML={{ __html: material.qrSvg }}
            />
          </div>
          <p className="text-turquoise mt-3 text-center font-serif text-2xl">
            {c.scanLabel}
          </p>
          <p className="text-muted mt-1 text-center text-xs break-all print:hidden">
            {material.referralUrl}
          </p>

          <div className="mt-6 text-center">
            <h3 className="font-serif text-4xl">
              {applyReward(c.rewardTitle, material.rewardBasisPoints)}
            </h3>
            <p className="mt-1">{c.rewardDescription}</p>
          </div>

          <div className="border-border mt-6 grid gap-6 border-t pt-6 sm:grid-cols-2">
            {[
              [c.customerBenefitsTitle, c.customerBenefits],
              [c.partnerBenefitsTitle, c.partnerBenefits]
            ].map(([title, benefits]) => (
              <section key={title as string}>
                <h3 className="font-semibold tracking-wide uppercase">
                  {title as string}
                </h3>
                <ul className="mt-3 space-y-2">
                  {(benefits as string[]).map((benefit) => (
                    <li key={benefit} className="flex gap-2 text-sm">
                      <Check
                        aria-hidden="true"
                        className="text-turquoise mt-0.5 shrink-0"
                        size={18}
                      />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <footer className="mt-auto pt-8">
            <div className="bg-turquoise/10 rounded-2xl p-5 text-center">
              <Heart aria-hidden="true" className="text-turquoise mx-auto" />
              <p className="text-turquoise mt-2 font-semibold tracking-wide uppercase">
                {c.supportTitle}
              </p>
              <p className="mt-1 font-serif text-xl">{c.supportMessage}</p>
            </div>
          </footer>
        </aside>
      </div>
    </main>
  );
}
