import Link from "next/link";

export default function NotFound() {
  return (
    <main className="main-content" style={{ flexDirection: "column" }}>
      <h1 className="hero-title" style={{ fontSize: "clamp(3rem, 10vw, 8rem)", whiteSpace: "normal" }}>
        404
      </h1>
      <p
        style={{
          marginTop: "1rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          fontSize: "0.85rem",
          fontWeight: 500,
        }}
      >
        Page Not Found
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          marginTop: "2.5rem",
          textTransform: "uppercase",
          fontSize: "0.8rem",
          letterSpacing: "0.15em",
          fontWeight: 600,
          borderBottom: "1px solid #000",
          paddingBottom: "2px",
        }}
      >
        Back Home
      </Link>
    </main>
  );
}
