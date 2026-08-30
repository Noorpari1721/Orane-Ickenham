import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Eye,
  Cookie,
} from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 pb-20 pt-32 text-white">

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#D4AF37]/[0.05] blur-[140px]" />
        <div className="absolute -right-40 bottom-0 h-[32rem] w-[32rem] rounded-full bg-[#D4AF37]/[0.04] blur-[160px]" />
      </div>

      <div className="relative mx-auto max-w-4xl">

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white/70 transition hover:border-[#D4AF37]/50 hover:text-[#D4AF37]"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="mt-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]">
            <ShieldCheck size={30} />
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.28em] text-[#D4AF37]">
            Your Privacy Matters
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-5 text-sm text-white/45">
            Last updated: 26 August 2026
          </p>
        </div>

        <div className="mt-16 space-y-6">

          <section className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 sm:p-8">
            <p className="leading-8 text-white/65">
              At Orane Ickenham, we respect your privacy and are committed to
              protecting your personal information. This Privacy Policy explains
              how we collect, use and protect your information when you visit our
              salon, contact us, use our website or make a booking.
            </p>
          </section>

          <PolicySection
            number="1"
            title="Information We May Collect"
            icon={<Eye size={20} />}
          >
            <PolicyList items={[
              "Your name",
              "Telephone number",
              "Email address",
              "Appointment and treatment history",
              "Booking preferences",
              "Information you voluntarily provide that is relevant to providing your treatment safely",
              "Payment and transaction information",
              "Communications including enquiries, feedback or complaints",
              "Website usage and technical information where applicable",
            ]} />

            <p>
              We will only collect information that is reasonably necessary for
              providing our services or operating our business.
            </p>
          </PolicySection>

          <PolicySection
            number="2"
            title="How We Use Your Information"
            icon={<Lock size={20} />}
          >
            <PolicyList items={[
              "Manage, confirm, change or cancel appointments",
              "Provide the treatments and services you have requested",
              "Contact you regarding your appointment",
              "Process payments and maintain appropriate business records",
              "Respond to enquiries, complaints or treatment concerns",
              "Maintain treatment and customer records where appropriate",
              "Improve our services and customer experience",
              "Meet legal, regulatory, accounting and insurance obligations",
              "Send promotional or marketing communications where permitted by law",
            ]} />
          </PolicySection>

          <PolicySection
            number="3"
            title="Marketing Communications"
            icon={<ShieldCheck size={20} />}
          >
            <p>
              Where required, we will only send you marketing communications where
              you have agreed to receive them.
            </p>

            <p>
              You can ask us to stop sending marketing communications at any time
              by contacting us or using any unsubscribe option provided.
            </p>
          </PolicySection>

          <PolicySection
            number="4"
            title="Payments"
            icon={<Lock size={20} />}
          >
            <p>
              Payments may be processed through third-party payment providers. We
              do not normally store your complete debit or credit card details
              ourselves.
            </p>

            <p>
              Payment providers will process your information in accordance with
              their own privacy and security policies.
            </p>
          </PolicySection>

          <PolicySection
            number="5"
            title="Sharing Your Information"
            icon={<ShieldCheck size={20} />}
          >
            <p>
              We do not sell your personal information.
            </p>

            <p>
              We may share limited personal information with trusted third parties
              where necessary to operate our business, such as booking, website,
              payment, IT, accounting or professional service providers.
            </p>

            <p>
              We may also disclose information where required by law, regulation,
              court order or another lawful authority.
            </p>
          </PolicySection>

          <PolicySection
            number="6"
            title="Keeping Your Information Secure"
            icon={<Lock size={20} />}
          >
            <p>
              We take reasonable steps to protect personal information against
              loss, misuse, unauthorised access, disclosure or alteration.
            </p>

            <p>
              Access to customer information is limited to people who reasonably
              require it to perform their duties.
            </p>
          </PolicySection>

          <PolicySection
            number="7"
            title="How Long We Keep Your Information"
            icon={<ShieldCheck size={20} />}
          >
            <p>
              We retain personal information only for as long as reasonably
              necessary for the purpose for which it was collected and to comply
              with applicable legal, accounting, insurance or regulatory
              requirements.
            </p>

            <p>
              When information is no longer required, it will be securely deleted
              or disposed of where appropriate.
            </p>
          </PolicySection>

          <PolicySection
            number="8"
            title="Your Data Protection Rights"
            icon={<ShieldCheck size={20} />}
          >
            <p>
              Under UK data protection law, depending on the circumstances, you
              may have the right to:
            </p>

            <PolicyList items={[
              "Request access to personal information we hold about you",
              "Ask us to correct inaccurate or incomplete information",
              "Request deletion of your information",
              "Request restriction of how your information is used",
              "Object to certain uses of your information",
              "Withdraw consent where processing is based on your consent",
              "Request transfer of certain information where applicable",
            ]} />

            <p>
              If you wish to exercise any of these rights, please contact us using
              the details provided on our website.
            </p>

            <p>
              You also have the right to raise a complaint with the Information
              Commissioner's Office (ICO) if you have concerns about how your
              personal information has been handled.
            </p>
          </PolicySection>

          <PolicySection
            number="9"
            title="Cookies & Our Website"
            icon={<Cookie size={20} />}
          >
            <p>
              Our website may use cookies and similar technologies to help the
              website function, improve your experience and understand how visitors
              use our website.
            </p>

            <p>
              You can usually control or disable cookies through your browser
              settings. Please note that disabling certain cookies may affect how
              parts of the website function.
            </p>
          </PolicySection>

        </div>

        <div className="mt-12 rounded-[28px] border border-[#D4AF37]/20 bg-[#D4AF37]/[0.05] p-6 text-center sm:p-8">
          <p className="text-sm leading-7 text-white/65">
            If you have any questions about this Privacy Policy or how your
            information is handled, please contact Orane Ickenham.
          </p>

          <Link
            href="/contact"
            className="mt-5 inline-flex rounded-full border border-[#D4AF37]/40 px-6 py-3 text-sm text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black"
          >
            Contact Us
          </Link>
        </div>

      </div>
    </main>
  );
}

function PolicySection({
  number,
  title,
  icon,
  children,
}: {
  number: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 sm:p-8">

      <div className="flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#D4AF37]">
            Section {number}
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
            {title}
          </h2>

        </div>

      </div>

      <div className="mt-6 space-y-4 leading-8 text-white/65">
        {children}
      </div>

    </section>
  );
}

function PolicyList({
  items,
}: {
  items: string[];
}) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3"
        >
          <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4AF37]" />

          <span>
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}