export const metadata = {
  title: "Firecrawl Crawler",
  description: "Simple Firecrawl crawler UI"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
