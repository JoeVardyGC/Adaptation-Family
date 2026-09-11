import { useEffect, useState } from "react";

interface TermsOfServiceProps {
  onBackToHome: () => void;
}

export default function TermsOfService({ onBackToHome }: TermsOfServiceProps) {
  const [activeSection, setActiveSection] = useState("acceptance");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["acceptance", "conduct", "intellectual", "liability", "termination", "governing"];
      const scrollPosition = window.scrollY + 160;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveSection(id);
    }
  };

  const sections = [
    { id: "acceptance", label: "Acceptance of Terms" },
    { id: "conduct", label: "User Conduct" },
    { id: "intellectual", label: "Intellectual Property" },
    { id: "liability", label: "Limitation of Liability" },
    { id: "termination", label: "Termination" },
    { id: "governing", label: "Governing Law" }
  ];

  return (
    <div className="w-full flex flex-col bg-surface-bright pb-16 animate-in fade-in duration-300">
      <main className="pt-24 pb-16 px-4 sm:px-6 md:px-8 max-w-[1280px] mx-auto w-full">
        {/* Hero Header */}
        <section className="mb-12 border-l-[12px] border-primary-container pl-6">
          <p className="font-label-lg text-xs md:text-sm text-primary uppercase tracking-widest mb-1">
            Legal Center
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-on-surface font-extrabold tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="font-body-lg text-sm sm:text-base md:text-lg text-secondary max-w-2xl font-medium">
            Last updated: October 24, 2023. These terms govern your use of the Adaptation Family platform and all associated athletic services.
          </p>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start relative">
          {/* Table of Contents Sidebar */}
          <aside className="hidden md:block md:col-span-3 sticky top-28 z-20">
            <nav className="flex flex-col gap-3">
              <p className="font-label-md text-xs text-secondary uppercase tracking-wider mb-2">
                Sections
              </p>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`text-left font-semibold text-xs md:text-sm py-1.5 border-l-2 pl-4 transition-all duration-200 cursor-pointer ${
                    activeSection === section.id
                      ? "text-primary border-primary font-bold bg-primary/5 rounded-r-lg"
                      : "text-secondary border-transparent hover:text-primary hover:border-primary-container"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
            <div className="mt-8 p-4 bg-surface-container rounded-xl">
              <p className="font-semibold text-xs text-on-surface mb-1">
                Need help?
              </p>
              <p className="text-xs text-secondary mb-3 leading-relaxed">
                Our legal team is available for any clarifications regarding these terms.
              </p>
              <a
                href="mailto:legal@adaptationfamily.com"
                className="text-primary text-xs font-bold hover:underline"
              >
                Contact Legal
              </a>
            </div>
          </aside>

          {/* Legal Content */}
          <div className="md:col-span-9 space-y-6">
            {/* Section 1 */}
            <article
              className="bg-white border border-[#e5e5e5] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 md:p-8 rounded-xl scroll-mt-32"
              id="acceptance"
            >
              <h2 className="font-display text-lg sm:text-xl md:text-2xl font-extrabold text-on-surface mb-4 flex items-center gap-3">
                <span className="bg-primary-container text-on-primary-container w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold">
                  1
                </span>
                Acceptance of Terms
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-secondary leading-relaxed font-normal">
                <p>
                  By accessing or using the services provided by Adaptation Family ("we," "us," or "our"), including our website, mobile application, and athletic training programs, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.
                </p>
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms of Service on this page and updating the "Last updated" date. Your continued use of the platform after such changes constitutes your acceptance of the new terms.
                </p>
              </div>
            </article>

            {/* Section 2 */}
            <article
              className="bg-white border border-[#e5e5e5] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 md:p-8 rounded-xl scroll-mt-32"
              id="conduct"
            >
              <h2 className="font-display text-lg sm:text-xl md:text-2xl font-extrabold text-on-surface mb-4 flex items-center gap-3">
                <span className="bg-primary-container text-on-primary-container w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold">
                  2
                </span>
                User Conduct
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-secondary leading-relaxed font-normal">
                <p>
                  Users of Adaptation Family are expected to maintain the highest standards of professional and athletic integrity. Prohibited behaviors include but are not limited to:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
                  <li>Engaging in any activity that disrupts or interferes with our services.</li>
                  <li>Attempting to gain unauthorized access to any portion of the platform.</li>
                  <li>Using the platform for any illegal or unauthorized purpose.</li>
                  <li>Harassing, threatening, or intimidating other users or staff members.</li>
                  <li>Posting or transmitting fraudulent, deceptive, or misleading content.</li>
                </ul>
              </div>
            </article>

            {/* Section 3 */}
            <article
              className="bg-white border border-[#e5e5e5] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 md:p-8 rounded-xl scroll-mt-32"
              id="intellectual"
            >
              <h2 className="font-display text-lg sm:text-xl md:text-2xl font-extrabold text-on-surface mb-4 flex items-center gap-3">
                <span className="bg-primary-container text-on-primary-container w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold">
                  3
                </span>
                Intellectual Property
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-secondary leading-relaxed font-normal">
                <p>
                  The service and its original content, features, and functionality are and will remain the exclusive property of Adaptation Family and its licensors. Our trademarks, logos, and service marks may not be used in connection with any product or service without the prior written consent of Adaptation Family.
                </p>
                <p>
                  Any feedback, comments, or suggestions you may provide regarding the services is entirely voluntary and we will be free to use such feedback as we see fit and without any obligation to you.
                </p>
              </div>
            </article>

            {/* Section 4 */}
            <article
              className="bg-white border border-[#e5e5e5] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 md:p-8 rounded-xl scroll-mt-32"
              id="liability"
            >
              <h2 className="font-display text-lg sm:text-xl md:text-2xl font-extrabold text-on-surface mb-4 flex items-center gap-3">
                <span className="bg-primary-container text-on-primary-container w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold">
                  4
                </span>
                Limitation of Liability
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-secondary leading-relaxed font-normal">
                <p>
                  In no event shall Adaptation Family, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
                  <li>Your access to or use of or inability to access or use the service.</li>
                  <li>Any conduct or content of any third party on the service.</li>
                  <li>Any content obtained from the service.</li>
                  <li>Unauthorized access, use or alteration of your transmissions or content.</li>
                </ul>
              </div>
            </article>

            {/* Section 5 */}
            <article
              className="bg-white border border-[#e5e5e5] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 md:p-8 rounded-xl scroll-mt-32"
              id="termination"
            >
              <h2 className="font-display text-lg sm:text-xl md:text-2xl font-extrabold text-on-surface mb-4 flex items-center gap-3">
                <span className="bg-primary-container text-on-primary-container w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold">
                  5
                </span>
                Termination
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-secondary leading-relaxed font-normal">
                <p>
                  We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                </p>
                <p>
                  If you wish to terminate your account, you may simply discontinue using the service or contact our support team to request account deletion.
                </p>
              </div>
            </article>

            {/* Section 6 */}
            <article
              className="bg-white border border-[#e5e5e5] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 md:p-8 rounded-xl scroll-mt-32"
              id="governing"
            >
              <h2 className="font-display text-lg sm:text-xl md:text-2xl font-extrabold text-on-surface mb-4 flex items-center gap-3">
                <span className="bg-primary-container text-on-primary-container w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold">
                  6
                </span>
                Governing Law
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-secondary leading-relaxed font-normal">
                <p>
                  These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which Adaptation Family is headquartered, without regard to its conflict of law provisions.
                </p>
                <p>
                  Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
                </p>
              </div>
            </article>
          </div>
        </div>

        {/* Action Button to go home */}
        <div className="w-full mt-12 flex justify-center">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white hover:bg-neutral-800 font-normal text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            BACK TO HOME
          </button>
        </div>
      </main>
    </div>
  );
}
