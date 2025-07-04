import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "LycéeConnect - Plateforme de mise en relation lycées-entreprises",
  description:
    "Trouvez les lycées professionnels qui correspondent à vos besoins en alternance et stages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-fr-scheme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Marianne:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>

        {/* Scripts DSFR */}
        <script
          type="module"
          src="https://unpkg.com/@gouvfr/dsfr@1.11.2/dist/dsfr.module.min.js"
        />
        <script
          type="text/javascript"
          noModule
          src="https://unpkg.com/@gouvfr/dsfr@1.11.2/dist/dsfr.nomodule.min.js"
        />
      </body>
    </html>
  );
}
