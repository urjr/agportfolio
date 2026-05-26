import Link from "next/link";

export default function Home() {
  return (
    <main className="main-content">
      <div className="bio-container">
        <h1 className="hero-title intro-title first-line" id="hero-title">
          My name is{" "}
          <Link href="#" className="nowrap-link" id="link-ulises">
            Ulises Reyes-Kaura
          </Link>
          . I am a{" "}
          <Link href="#" className="nowrap-link" id="link-product-designer">
            product designer
          </Link>{" "}
          and{" "}
          <Link href="#" id="link-educator">
            educator
          </Link>{" "}
          based in{" "}
          <Link href="#" id="link-philadelphia" className="philly-svg-link">
            <span className="philly-text">Philadelphia</span>
            <img
              src="/assets/home/philly-kelly.svg"
              alt="Philadelphia"
              className="philly-svg"
            />
          </Link>
        </h1>
        <p className="hero-title intro-title second-line" id="hero-subtitle">
          Currently, I work at{" "}
          <Link href="#" id="link-google" className="google-svg-link">
            <span className="google-text">Google</span>
            <img
              src="/assets/home/google-logo.svg"
              alt="Google"
              className="google-svg"
            />
          </Link>
          , designing agentic experiences for{" "}
          <Link href="#" id="link-analytics" className="analytics-svg-link">
            <span className="analytics-text">Analytics</span>
            <img
              src="/assets/home/analytics.svg"
              alt="Analytics"
              className="analytics-svg"
            />
          </Link>
          , and teach design at{" "}
          <Link href="#" id="link-upenn" className="upenn-svg-link">
            <span className="upenn-text">UPenn</span>
            <img
              src="/assets/home/penn.svg"
              alt="UPenn"
              className="upenn-svg"
            />
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
