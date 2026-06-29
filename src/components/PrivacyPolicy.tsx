import { useEffect, useState } from "react";

interface PrivacyPolicyProps {
  onBackToHome: () => void;
}

export default function PrivacyPolicy({ onBackToHome }: PrivacyPolicyProps) {
  const [activeSection, setActiveSection] = useState("introduction");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["introduction", "collection", "usage", "cookies", "sharing"];
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
    { id: "introduction", label: "Introduction" },
    { id: "collection", label: "Information We Collect" },
    { id: "usage", label: "How We Use Your Data" },
    { id: "cookies", label: "Cookies & Tracking" },
    { id: "sharing", label: "Third-Party Sharing" }
  ];

  return (
    <div className="w-full flex flex-col bg-surface-bright pb-16 animate-in fade-in duration-300">
      <main className="pt-24 pb-16 px-4 sm:px-6 md:px-8 max-w-[1280px] mx-auto w-full">
        {/* Hero Header */}
        <section className="mb-12 border-b border-surface-container pb-12">
          <span className="font-label-lg text-xs md:text-sm text-primary uppercase tracking-widest block mb-1">
            Legal Transparency
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-on-surface font-extrabold tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="font-body-lg text-sm sm:text-base md:text-lg text-secondary max-w-2xl font-medium">
            Your privacy is the core of our community trust. Learn how Adaptation Family collects, uses, and safeguards your performance data and personal information.
          </p>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
          {/* Side Navigation (Jump to section) */}
          <aside className="hidden lg:block lg:col-span-3 h-fit sticky top-28 z-20">
            <nav className="flex flex-col gap-3 border-l-2 border-surface-container pl-6">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`text-left font-semibold text-xs md:text-sm py-1 block relative group transition-colors duration-200 cursor-pointer ${
                    activeSection === section.id ? "text-primary font-bold" : "text-secondary hover:text-primary"
                  }`}
                >
                  {activeSection === section.id && (
                    <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full"></div>
                  )}
                  {section.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Legal Text */}
          <div className="lg:col-span-9 space-y-16">
            {/* Section: Introduction */}
            <article className="scroll-mt-32" id="introduction">
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold mb-4 text-on-surface">
                Introduction
              </h2>
              <div className="font-body-md text-sm sm:text-base text-secondary space-y-4 leading-relaxed font-normal">
                <p>
                  Welcome to Adaptation Family. We are committed to protecting your personal data and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at <a href="mailto:privacy@adaptationfamily.com" className="text-primary hover:underline font-semibold">privacy@adaptationfamily.com</a>.
                </p>
                <p>
                  When you visit our website and use our services, you trust us with your personal information. We take your privacy very seriously. In this privacy notice, we describe our privacy policy. We seek to explain to you in the clearest way possible what information we collect, how we use it and what rights you have in relation to it.
                </p>
              </div>
            </article>

            {/* Section: Information We Collect */}
            <article className="scroll-mt-32" id="collection">
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold mb-6 text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl sm:text-2xl">analytics</span>
                Information We Collect
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col gap-2">
                  <h3 className="font-semibold text-xs md:text-sm text-on-surface uppercase tracking-wider">
                    Personal Data
                  </h3>
                  <p className="font-body-md text-sm text-secondary leading-relaxed font-normal">
                    Names, email addresses, contact preferences, and athletic profiles provided during registration.
                  </p>
                </div>
                <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col gap-2">
                  <h3 className="font-semibold text-xs md:text-sm text-on-surface uppercase tracking-wider">
                    Performance Metrics
                  </h3>
                  <p className="font-body-md text-sm text-secondary leading-relaxed font-normal">
                    Heart rate data, workout frequency, and historical athletic statistics uploaded to our analytics engine.
                  </p>
                </div>
              </div>
            </article>

            {/* Section: How We Use Your Data */}
            <article className="scroll-mt-32" id="usage">
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold mb-4 text-on-surface">
                How We Use Your Data
              </h2>
              <div className="font-body-md text-sm sm:text-base text-secondary space-y-4 leading-relaxed font-normal">
                <p>
                  We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                </p>
                <ul className="list-none space-y-3 pt-2">
                  <li className="flex gap-3 items-start text-sm sm:text-base">
                    <span className="material-symbols-outlined text-primary shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span>To generate personalized athletic insights and performance reports.</span>
                  </li>
                </ul>
              </div>
            </article>

            {/* Section: Cookies */}
            <article className="scroll-mt-32 p-6 sm:p-8 bg-surface-container-highest/50 rounded-xl" id="cookies">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex-1">
                  <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold mb-4 text-on-surface">
                    Cookies & Tracking
                  </h2>
                  <p className="font-body-md text-sm sm:text-base text-secondary leading-relaxed font-normal">
                    We use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice.
                  </p>
                </div>
                <div className="shrink-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-container flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-on-primary-container text-3xl sm:text-4xl">cookie</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Section: Third-Party Sharing */}
            <article className="scroll-mt-32" id="sharing">
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold mb-4 text-on-surface">
                Third-Party Sharing
              </h2>
              <p className="font-body-md text-sm sm:text-base text-secondary leading-relaxed mb-6 font-normal">
                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
              </p>
              <div className="overflow-x-auto border border-surface-container rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-surface-container-high">
                      <th className="py-3 px-4 text-xs font-bold text-on-surface uppercase tracking-wider">Recipient Category</th>
                      <th className="py-3 px-4 text-xs font-bold text-on-surface uppercase tracking-wider">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-sm text-secondary font-normal">
                    <tr className="border-b border-surface-container">
                      <td className="py-4 px-4 font-semibold text-on-surface">Cloud Providers</td>
                      <td className="py-4 px-4">Secure data storage and processing (AWS/Google Cloud).</td>
                    </tr>
                    <tr className="border-b border-surface-container">
                      <td className="py-4 px-4 font-semibold text-on-surface">Payment Processors</td>
                      <td className="py-4 px-4">Processing subscription and donation transactions.</td>
                    </tr>
                    <tr className="border-b border-surface-container">
                      <td className="py-4 px-4 font-semibold text-on-surface">Analytics Partners</td>
                      <td className="py-4 px-4">Improving user experience and performance tracking.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>

            {/* Last Updated */}
            <article className="pt-6 border-t border-surface-container">
              <p className="font-semibold text-xs text-secondary">
                Last Updated: December 14, 2026
              </p>
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
