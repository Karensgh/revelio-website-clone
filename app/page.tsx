import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  Building2,
  Check,
  CircleDollarSign,
  ClipboardCheck,
  Coins,
  FileCheck2,
  Globe2,
  Landmark,
  Linkedin,
  Mail,
  ShieldAlert,
  Sparkles,
  Zap
} from "lucide-react";

const calendlyUrl = "https://calendly.com/keyu-reveliolabs/discovery";

const startupProblems = [
  {
    title: "Expensive Consultants",
    body: "Traditional AML setup can cost $30-50K before you ship. Revelio gives early teams a practical framework without the consultant wait."
  },
  {
    title: "Regulatory Overwhelm",
    body: "Founders need clear answers, not regulatory guesswork. Start with policies and controls matched to your product, customers, and markets."
  },
  {
    title: "Months of Delays",
    body: "Manual policy creation slows launches. Move from questionnaire to operating compliance documentation in days, not months."
  }
];

const enterpriseProblems = [
  {
    title: "Overwhelmed Regulation Updates",
    body: "Teams spend 20+ hours each month checking regulator sites. Revelio filters FinCEN, FCA, MAS, and more into updates that matter."
  },
  {
    title: "Gap Analysis Takes Too Long",
    body: "When rules change, instantly see affected policies, controls, owners, and documentation instead of waiting weeks for manual analysis."
  },
  {
    title: "Audit Risk and Version Control",
    body: "Keep approval trails, version history, and change logs in one place so audit requests do not become a scramble."
  }
];

const regulatorUpdates = [
  ["FinCEN", "Policy Update", "High"],
  ["FCA", "Guidance", "Medium"],
  ["MAS", "Enforcement", "High"]
];

const affectedAreas = [
  ["Customer Due Diligence", "High"],
  ["Transaction Monitoring", "High"],
  ["Risk Assessment", "Medium"],
  ["Reporting Procedures", "Low"]
];

const policyUpdates = [
  "AML Policy",
  "KYC Procedures",
  "Risk Framework",
  "Compliance Manual"
];

const industries = [
  {
    icon: CircleDollarSign,
    title: "Payment Processors",
    body: "Set up MSB compliance for domestic and cross-border payments. Get ready for banking partners and card networks."
  },
  {
    icon: Coins,
    title: "Crypto & Digital Assets",
    body: "Navigate complex crypto AML requirements across jurisdictions. Stay compliant as regulations evolve rapidly."
  },
  {
    icon: Landmark,
    title: "Lending Platforms",
    body: "Launch consumer or commercial lending with proper AML frameworks. Meet bank and investor compliance expectations."
  },
  {
    icon: Building2,
    title: "Embedded Finance",
    body: "Integrate financial services into your platform with confidence. Satisfy banking-as-a-service provider requirements."
  },
  {
    icon: Globe2,
    title: "Cross-Border Remittance",
    body: "Handle multi-jurisdiction compliance for international money transfers. Track regulations in every market you operate."
  },
  {
    icon: BarChart3,
    title: "Investment Platforms",
    body: "Meet broker-dealer and investment adviser AML requirements. Ready for FINRA, SEC, or FCA registration."
  }
];

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="pill">
      <Sparkles size={14} aria-hidden="true" />
      {children}
    </span>
  );
}

function Badge({ level }: { level: string }) {
  return <span className={`status ${level.toLowerCase()}`}>{level}</span>;
}

export default function Home() {
  return (
    <main>
      <nav className="nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Revelio home">
          <Image
            src="/revelio-logo.png"
            alt=""
            width={46}
            height={46}
            priority
          />
        </a>
        <div className="nav-links">
          <a href="#problem">Problem</a>
          <a href="#features">Solutions</a>
          <a href="#industries">Industries</a>
          <a className="nav-cta" href="#interest-form">
            Book a Demo
          </a>
        </div>
      </nav>

      <section className="hero-shell" id="top">
        <div className="hero">
          <div className="hero-copy">
            <Pill>AI compliance infrastructure</Pill>
            <h1>
              Launch Faster
              <span>Stay Compliant Forever</span>
            </h1>
            <p>
              AI agents monitor global regulations, update your control
              framework, and keep every policy audit-ready as your fintech
              grows.
            </p>
            <h2>
              Built for startup speed and enterprise rigor{" "}
              <span>by alumni of PayPal, Mercury, Block, and Google.</span>
            </h2>
            <div className="hero-actions">
              <a href="#features" className="secondary-link">
                Learn how
              </a>
              <a href={calendlyUrl} className="primary-button">
                Book a Call <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="backed">
            <p>Backed & supported by:</p>
            <div className="logo-strip">
              <Image
                src="/aws-startups.png"
                alt="AWS Startup Programs"
                width={237}
                height={60}
              />
              <Image
                src="/google-startups.png"
                alt="Google for Startups"
                width={116}
                height={100}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section problem-section" id="problem">
        <div className="section-heading">
          <h2>Compliance Shouldn&apos;t Block Your Growth</h2>
          <p>
            Manual compliance work slows every stage of a fintech company, from
            first launch to multi-jurisdiction operations.
          </p>
        </div>

        <div className="problem-grid">
          <article className="problem-column">
            <span className="column-label">For Startup</span>
            {startupProblems.map((problem) => (
              <div className="problem-card" key={problem.title}>
                <ShieldAlert size={20} aria-hidden="true" />
                <div>
                  <h3>{problem.title}</h3>
                  <p>{problem.body}</p>
                </div>
              </div>
            ))}
          </article>
          <article className="problem-column enterprise">
            <span className="column-label">For Enterprise</span>
            {enterpriseProblems.map((problem) => (
              <div className="problem-card" key={problem.title}>
                <ShieldAlert size={20} aria-hidden="true" />
                <div>
                  <h3>{problem.title}</h3>
                  <p>{problem.body}</p>
                </div>
              </div>
            ))}
          </article>
        </div>
      </section>

      <section className="section features-section" id="features">
        <div className="section-heading">
          <Pill>Automate the work behind compliance</Pill>
          <h2>Your AML Compliance Copilot</h2>
          <p>
            Revelio turns regulatory change into concrete policy updates,
            control actions, and audit trails your team can trust.
          </p>
        </div>

        <div className="feature-row">
          <div className="feature-copy">
            <span className="eyebrow">No-integration Set Up</span>
            <h3>48-Hour Framework Setup</h3>
            <p>
              Answer a focused questionnaire about your business model,
              customers, transaction types, and jurisdictions. Revelio converts
              that context into policies, procedures, controls, and a risk
              framework tailored to your launch.
            </p>
          </div>
          <div className="mock-card setup-card">
            <label>
              Are you a MSB
              <button type="button">Yes</button>
            </label>
            {["Business Type", "Transaction Volume", "AML Framework", "Jurisdiction"].map(
              (item) => (
                <div className="input-row" key={item}>
                  <span>{item}</span>
                  <Check size={16} aria-hidden="true" />
                </div>
              )
            )}
            <div className="updates-list">
              {regulatorUpdates.map(([agency, type, level]) => (
                <div key={agency}>
                  <BellRing size={16} aria-hidden="true" />
                  <span>
                    {agency} - {type}
                  </span>
                  <Badge level={level} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="feature-row reverse">
          <div className="feature-copy">
            <span className="eyebrow">Real-Time Monitoring</span>
            <h3>Automated Regulatory Intelligence</h3>
            <p>
              AI agents monitor FinCEN, FCA, MAS, and 20+ other regulators
              around the clock. The system filters updates by license,
              jurisdiction, and control impact so your team sees signal, not
              noise.
            </p>
          </div>
          <div className="mock-card intelligence-card">
            <div className="radar">
              <span />
              <BellRing size={34} aria-hidden="true" />
            </div>
            {regulatorUpdates.map(([agency, type, level]) => (
              <div className="signal" key={agency}>
                <div>
                  <strong>{agency}</strong>
                  <span>{type}</span>
                </div>
                <Badge level={level} />
              </div>
            ))}
          </div>
        </div>

        <div className="feature-row">
          <div className="feature-copy">
            <span className="eyebrow">AI-powered Gap Analysis</span>
            <h3>Instant Gap Analysis</h3>
            <p>
              When regulations change, see exactly which policies, controls,
              and procedures are affected, with a clear impact level for each
              area.
            </p>
          </div>
          <div className="mock-card impact-card">
            <div className="card-title">
              <BadgeCheck size={20} aria-hidden="true" />
              <strong>Impact Analysis Complete</strong>
            </div>
            <h4>Affected Areas:</h4>
            {affectedAreas.map(([area, level]) => (
              <div className="impact-row" key={area}>
                <span>{area}</span>
                <Badge level={level} />
              </div>
            ))}
          </div>
        </div>

        <div className="feature-row reverse">
          <div className="feature-copy">
            <span className="eyebrow">All In One Place</span>
            <h3>One-Click Policy Updates</h3>
            <p>
              Review suggested policy language, approve the change, and apply
              it across your documentation with complete audit trails.
            </p>
          </div>
          <div className="mock-card policy-card">
            <div className="card-title">
              <FileCheck2 size={20} aria-hidden="true" />
              <strong>One-Click Policy Updates</strong>
            </div>
            {policyUpdates.map((policy) => (
              <div className="policy-row" key={policy}>
                <span>{policy}</span>
                <em>Ready</em>
              </div>
            ))}
            <button type="button">
              Apply All Updates <Zap size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <section className="section industries-section" id="industries">
        <div className="section-heading">
          <h2>Built for High-Risk Fintechs</h2>
          <p>
            Support for the business models where compliance pressure arrives
            early and changes often.
          </p>
        </div>
        <div className="industry-grid">
          {industries.map(({ icon: Icon, title, body }) => (
            <article className="industry-card" key={title}>
              <Icon size={28} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section form-section" id="interest-form">
        <div className="form-panel">
          <div className="form-copy">
            <span className="eyebrow">Get started</span>
            <h2>Ready to launch compliance-ready?</h2>
            <p>
              Tell us where you are in your compliance journey. We&apos;ll follow
              up within one business day.
            </p>
          </div>
          <form action="mailto:keyu@reveliolabs.app" method="post" encType="text/plain">
            <div className="two-col">
              <label>
                First name
                <input name="firstName" placeholder="Jane" />
              </label>
              <label>
                Last name
                <input name="lastName" placeholder="Smith" />
              </label>
            </div>
            <label>
              Email
              <input name="email" type="email" placeholder="jane@openai.com" />
            </label>
            <label>
              Company name
              <input name="company" placeholder="Your company name" />
            </label>
            <label>
              What are you most interested in?
              <select name="interest" defaultValue="">
                <option value="" disabled>
                  Select one
                </option>
                <option>Startup Use Case</option>
                <option>Enterprise Use Case</option>
              </select>
            </label>
            <label>
              Message
              <textarea name="message" rows={4} />
            </label>
            <button className="submit-button" type="submit">
              Send message
            </button>
            <div className="response-note">
              <ClipboardCheck size={16} aria-hidden="true" />
              We&apos;ll get back to you within 24 hours.
            </div>
          </form>
        </div>
      </section>

      <footer className="footer">
        <a className="footer-logo" href="#top" aria-label="Revelio home">
          <Image src="/revelio-logo.png" alt="" width={56} height={56} />
        </a>
        <div className="footer-links">
          <a href="https://www.linkedin.com/company/reveliolabs/">
            <Linkedin size={16} aria-hidden="true" />
            LinkedIn
          </a>
          <a href="mailto:keyu@reveliolabs.app">
            <Mail size={16} aria-hidden="true" />
            Email
          </a>
        </div>
        <p>&copy; 2026. All rights reserved.</p>
      </footer>
    </main>
  );
}
