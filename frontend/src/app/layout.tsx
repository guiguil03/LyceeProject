import type { Metadata } from "next";
import "./globals.css";
import DSFRProvider from "@/components/DSFRProvider";

export const metadata: Metadata = {
  title: "LycéeConnect - Plateforme de mise en relation lycées-entreprises",
  description: "Trouvez les lycées professionnels qui correspondent à vos besoins en alternance et stages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-fr-scheme="light" data-fr-js="true" data-fr-theme="light">
      <head>
                <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://unpkg.com/@gouvfr/dsfr@1.11.2/dist/dsfr.min.css" />
        <link rel="stylesheet" href="https://unpkg.com/@gouvfr/dsfr@1.11.2/dist/utility/icons/icons.min.css" />
 
      </head>
      <body>
        {/* Header DSFR */}
        <header className="fr-header">
          <div className="fr-header__body">
            <div className="fr-container">
              <div className="fr-header__body-row">
                <div className="fr-header__brand fr-enlarge-link">
                  <div className="fr-header__brand-top">
                    <div className="fr-header__logo">
                      <p className="fr-logo">
                        République
                        <br />Française
                      </p>
                    </div>
                    <div className="fr-header__navbar">
                      <a 
                        href="/login"
                        className="fr-btn fr-btn--secondary fr-btn--sm fr-btn--icon-left fr-icon-account-line"
                        title="Se connecter"
                      >
                        Connexion
                      </a>
                    </div>
                  </div>
                  <div className="fr-header__service">
                    <a href="/" title="Accueil - LycéeConnect">
                      <p className="fr-header__service-title">LycéeConnect</p>
                    </a>
                    <p className="fr-header__service-tagline">
                      Plateforme de mise en relation lycées-entreprises
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="fr-container-fluid">
          <DSFRProvider>
            {children}
          </DSFRProvider>
        </main>

        {/* Footer DSFR */}
        <footer className="fr-footer" role="contentinfo" id="footer">
          <div className="fr-container">
            <div className="fr-footer__body">
              <div className="fr-footer__brand fr-enlarge-link">
                <div className="fr-footer__brand-top">
                  <div className="fr-footer__logo">
                    <p className="fr-logo" title="République française">
                      République
                      <br />Française
                    </p>
                  </div>
                </div>
              </div>
              <div className="fr-footer__content">
                <p className="fr-footer__content-desc">
                  LycéeConnect facilite la mise en relation entre les lycées professionnels 
                  et les entreprises pour l'alternance et les stages.
                </p>
                <ul className="fr-footer__content-list">
                  <li className="fr-footer__content-item">
                    <a className="fr-footer__content-link" href="/mentions-legales">Mentions légales</a>
                  </li>
                  <li className="fr-footer__content-item">
                    <a className="fr-footer__content-link" href="/politique-confidentialite">Politique de confidentialité</a>
                  </li>
                  <li className="fr-footer__content-item">
                    <a className="fr-footer__content-link" href="/accessibilite">Accessibilité</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="fr-footer__bottom">
              <ul className="fr-footer__bottom-list">
                <li className="fr-footer__bottom-item">
                  <a className="fr-footer__bottom-link" href="https://www.education.gouv.fr">
                    Ministère de l'Éducation nationale
                  </a>
                </li>
              </ul>
              <div className="fr-footer__bottom-copy">
                <p>
                  Sauf mention contraire, tous les contenus de ce site sont sous{" "}
                  <a
                    href="https://github.com/etalab/licence-ouverte/blob/master/LO.md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    licence etalab-2.0
                  </a>
                </p>
              </div>
            </div>
          </div>
        </footer>

        {/* Scripts DSFR - chargement asynchrone pour éviter les problèmes d'hydratation */}
        <script
          type="module"
          src="https://unpkg.com/@gouvfr/dsfr@1.11.2/dist/dsfr.module.min.js"
          async
        />
        <script
          type="text/javascript"
          noModule
          src="https://unpkg.com/@gouvfr/dsfr@1.11.2/dist/dsfr.nomodule.min.js"
          async
        />
      </body>
    </html>
  );
}
