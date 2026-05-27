import Link from "next/link";

export default function Home() {
  return (
    <main className="main-content">
      <div className="bio-container">
        <h1 className="hero-title intro-title first-line" id="hero-title">
          My name is{" "}
          <Link href="/about" className="nowrap-link highlight-name" id="link-ulises">
            Ulises Reyes-Kaura
          </Link>
          . I am a{" "}
          <Link href="#" className="nowrap-link highlight-work" id="link-product-designer">
            product designer
          </Link>{" "}
          and{" "}
          <Link href="#" className="highlight-education" id="link-educator">
            educator
          </Link>{" "}
          based in{" "}
          <Link 
            href="https://en.wikipedia.org/wiki/Philadelphia" 
            id="link-philadelphia" 
            className="highlight-geography"
            target="_blank"
            rel="noopener noreferrer"
          >
            Philadelphia
          </Link>
          .
        </h1>
        <p className="hero-title intro-title second-line" id="hero-subtitle">
          Currently, I work at{" "}
          <Link 
            href="https://about.google" 
            id="link-google" 
            className="google-svg-link highlight-work"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="google-text">Google</span>
            <img
              src="/assets/home/google-logo.svg"
              alt="Google"
              className="google-svg"
            />
          </Link>
          , designing agentic experiences for{" "}
          <Link 
            href="https://marketingplatform.google.com/about/analytics/" 
            id="link-analytics" 
            className="analytics-svg-link highlight-work"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="analytics-text">Analytics</span>
            <img
              src="/assets/home/analytics.svg"
              alt="Analytics"
              className="analytics-svg"
            />
          </Link>
          , and teach design at{" "}
          <Link 
            href="https://ipd.me.upenn.edu/about/" 
            id="link-upenn" 
            className="upenn-svg-link highlight-education"
            target="_blank"
            rel="noopener noreferrer"
          >
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
