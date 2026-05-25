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
            <span className="philly-svg-wrapper">
              <img
                src="/assets/home/philly-midnight.svg"
                alt="Philadelphia"
                className="philly-svg philly-midnight"
              />
              <img
                src="/assets/home/philly-kelly.svg"
                alt="Philadelphia"
                className="philly-svg philly-kelly"
              />
            </span>
          </Link>
          .
        </h1>
        <p className="hero-title intro-title second-line" id="hero-subtitle">
          Currently, I work at{" "}
          <Link href="#" id="link-google">
            Google
          </Link>
          , designing agentic experiences for{" "}
          <Link href="#" id="link-analytics">
            Analytics
          </Link>
          , and teach design at{" "}
          <Link href="#" id="link-upenn">
            UPenn
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
