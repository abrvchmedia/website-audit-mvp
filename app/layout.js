import "./globals.css";

export const metadata = {
  title: "Authority Audit Engine",
  description: "Premium website authority, SEO, performance & security audit platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
