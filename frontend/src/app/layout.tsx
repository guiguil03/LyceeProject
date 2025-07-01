import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="fr" data-fr-scheme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Marianne:wght@400;500;700;800&display=swap" rel="stylesheet" />
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
                      <button
                        className="fr-btn--menu fr-btn"
                        data-fr-opened="false"
                        aria-controls="modal-menu"
                        aria-haspopup="menu"
                        id="button-menu"
                        title="Menu"
                      >
                        Menu
                      </button>
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
          {children}
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
