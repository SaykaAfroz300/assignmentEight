import { Aperture, CalendarCheck, ShieldCheck, Zap } from "lucide-react";
import Logo from "@/components/layout/Logo";

const PERKS = [
    { icon: Zap, title: "Book in seconds", text: "Pick your hours and lock the room instantly." },
    { icon: CalendarCheck, title: "No double-bookings", text: "Confirmed slots are protected automatically." },
    { icon: ShieldCheck, title: "Verified hosts", text: "Every space is reviewed before it goes live." },
];

type Props = {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    footer: React.ReactNode;
};

/** Split-screen layout shared by Login and Register. */
export default function AuthShell({ title, subtitle, children, footer }: Props) {
    return (
        <div className="grid min-h-[calc(100dvh-var(--header-h))] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <section className="flex items-center justify-center px-5 py-12 sm:px-10">
                <div className="w-full max-w-md animate-fade-up">
                    <div className="mb-8 lg:hidden">
                        <Logo />
                    </div>
                    <h1 className="section-title !text-4xl">{title}</h1>
                    <p className="mt-3 text-base-content/65">{subtitle}</p>
                    <div className="mt-8">{children}</div>
                    <div className="mt-8 text-center text-sm text-base-content/65">{footer}</div>
                </div>
            </section>

            <aside className="bg-spotlight relative hidden overflow-hidden border-l border-base-content/10 lg:block" aria-hidden="true">
                <div className="bg-grid absolute inset-0" />
                <div className="relative flex h-full flex-col justify-between p-12">
                    <div className="grid flex-1 place-items-center">
                        <div className="relative grid size-72 place-items-center">
                            <span className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-primary/40" />
                            <span className="absolute inset-6 rounded-full border border-secondary/40" />
                            <span className="absolute inset-12 animate-pulse-ring rounded-full" />
                            <span className="grid size-36 animate-float place-items-center rounded-[2.2rem] bg-[image:var(--brand-gradient)] text-[#1c1203] shadow-[0_30px_80px_-20px_#ff6b4a]">
                                <Aperture size={72} strokeWidth={1.8} />
                            </span>
                        </div>
                    </div>

                    <div className="glass glow-border rounded-3xl p-6">
                        <p className="font-display text-xl font-semibold leading-snug">
                            &ldquo;Found a cyc wall ten minutes from home, booked it at 9pm, shot the lookbook the next morning.&rdquo;
                        </p>
                        <p className="mt-2 text-sm text-base-content/60">Maya R., fashion photographer</p>
                        <ul className="mt-6 grid gap-4 border-t border-base-content/10 pt-6">
                            {PERKS.map(({ icon: Icon, title, text }) => (
                                <li key={title} className="flex items-start gap-3">
                                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                                        <Icon size={18} />
                                    </span>
                                    <span>
                                        <span className="block text-sm font-semibold">{title}</span>
                                        <span className="block text-sm text-base-content/60">{text}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </aside>
        </div>
    );
}
