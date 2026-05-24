import Link from "next/link";

export default function Home() {
  return (
    <main className="main-content">
      <h1 className="hero-title intro-title" id="hero-title">
        Hi, my name is{" "}
        <Link href="#" className="nowrap-link" id="link-ulises">
          Ulises Reyes-Kaura
        </Link>
        , I am a product designer and professor based in{" "}
        <Link href="#" id="link-philadelphia">
          Philadelphia
        </Link>
        . Currently, I work at{" "}
        <Link href="#" id="link-google">
          Google
        </Link>
        , designing agentic experiences for{" "}
        <Link href="#" className="nowrap-link" id="link-google-analytics">
          Google Analytics
        </Link>
        , and teach design at{" "}
        <Link href="#" id="link-upenn">
          UPenn
        </Link>
      </h1>
    </main>
  );
}
