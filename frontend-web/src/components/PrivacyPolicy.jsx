"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./PrivacyPolicy.css"

const PrivacyPolicy = () => {
  const navigate = useNavigate()
  const [language, setLanguage] = useState("fr")
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "fr"
    const savedTheme = localStorage.getItem("theme") || "light"
    setLanguage(savedLanguage)
    setTheme(savedTheme)
    document.documentElement.setAttribute("data-theme", savedTheme)
  }, [])

  const toggleLanguage = () => {
    const newLang = language === "fr" ? "mg" : "fr"
    setLanguage(newLang)
    localStorage.setItem("language", newLang)
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
  }

  const translations = {
    fr: {
      title: "Politique de Confidentialité et Conditions d'Utilisation",
      back: "Retour",
    },
    mg: {
      title: "Politika momba ny tsiambaratelo sy fepetra fampiasana",
      back: "Hiverina",
    },
  }

  const t = (key) => translations[language][key] || key

  return (
    <div className="privacy-policy-container">
      <header className="privacy-policy-header">
        <div className="privacy-policy-header-content">
          <div className="privacy-policy-header-left">
            <button className="privacy-policy-back-btn" onClick={() => navigate(-1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 className="privacy-policy-title">{t("title")}</h1>
          </div>
          <div className="privacy-policy-controls">
            <button className="privacy-policy-control-btn" onClick={toggleLanguage}>
              {language.toUpperCase()}
            </button>
            <button className="privacy-policy-control-btn" onClick={toggleTheme}>
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </header>

      <div className="privacy-policy-content">
        <h2>Politique de Confidentialité</h2>
        <p>
          Chez Sexual AI, nous accordons une importance primordiale à la protection de vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, protégeons et partageons vos informations lorsque vous utilisez notre application, nos services et notre site web.
        </p>

        <h3>1. Collecte des Informations</h3>
        <p>Nous collectons les types d'informations suivants :</p>
        <ul>
          <li><strong>Informations personnelles</strong> : Nom, adresse e-mail, numéro de téléphone, date de naissance, sexe, et autres informations fournies lors de l'inscription.</li>
          <li><strong>Données de santé</strong> : Informations sur votre cycle menstruel, symptômes, et autres données de santé que vous choisissez de partager.</li>
          <li><strong>Données techniques</strong> : Adresse IP, type de navigateur, système d'exploitation, et données d'utilisation de l'application.</li>
          <li><strong>Données de localisation</strong> : Informations de localisation approximative basées sur l'adresse IP ou les données GPS (si autorisé).</li>
        </ul>

        <h3>2. Utilisation des Informations</h3>
        <p>Nous utilisons vos informations pour :</p>
        <ul>
          <li>Fournir et améliorer nos services, y compris le suivi des cycles menstruels et les recommandations personnalisées.</li>
          <li>Vous envoyer des notifications et rappels SMS (si activé).</li>
          <li>Répondre à vos questions via notre assistant IA.</li>
          <li>Analyser l'utilisation pour améliorer l'expérience utilisateur.</li>
          <li>Respecter les obligations légales.</li>
        </ul>

        <h3>3. Protection des Données</h3>
        <p>
          Nous utilisons des mesures de sécurité avancées, telles que le chiffrement des données, pour protéger vos informations. Seuls les employés autorisés et les partenaires de confiance ayant signé des accords de confidentialité peuvent accéder à vos données.
        </p>

        <h3>4. Partage des Informations</h3>
        <p>
          Nous ne vendons ni ne louons vos données personnelles. Nous pouvons partager des données anonymisées ou agrégées avec des partenaires à des fins d'analyse ou de recherche, sans révéler votre identité.
        </p>

        <h3>5. Conservation des Données</h3>
        <p>
          Nous conservons vos données aussi longtemps que nécessaire pour fournir nos services ou respecter les obligations légales. Vous pouvez demander la suppression de vos données via les paramètres de votre compte.
        </p>

        <h3>6. Cookies</h3>
        <p>
          Nous utilisons des cookies pour améliorer l'expérience utilisateur, analyser le trafic et personnaliser le contenu. Vous pouvez gérer les cookies via les paramètres de votre navigateur.
        </p>

        <h3>7. Droits des Utilisateurs</h3>
        <p>Vous avez le droit de :</p>
        <ul>
          <li>Accéder à vos données personnelles.</li>
          <li>Demander la correction ou la suppression de vos données.</li>
          <li>Vous opposer au traitement de vos données.</li>
          <li>Demander la portabilité de vos données.</li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à l'adresse indiquée ci-dessous.
        </p>

        <h3>8. Transferts Internationaux</h3>
        <p>
          Vos données peuvent être transférées vers des serveurs situés en dehors de votre pays, mais nous nous assurons que ces transferts respectent les lois applicables en matière de protection des données.
        </p>

        <h3>9. Modifications de la Politique</h3>
        <p>
          Nous pouvons mettre à jour cette politique de confidentialité. Les modifications seront publiées sur cette page, et nous vous informerons des changements importants.
        </p>

        <h2>Conditions d'Utilisation</h2>
        <h3>1. Acceptation des Conditions</h3>
        <p>
          En utilisant l'application Sexual AI, vous acceptez les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
        </p>

        <h3>2. Utilisation des Services</h3>
        <p>
          Vous acceptez d'utiliser nos services de manière légale et appropriée. Vous ne devez pas :
        </p>
        <ul>
          <li>Utiliser l'application pour des activités illégales ou non autorisées.</li>
          <li>Tenter d'accéder sans autorisation à nos systèmes ou réseaux.</li>
          <li>Publier ou partager du contenu nuisible, diffamatoire ou inapproprié.</li>
        </ul>

        <h3>3. Propriété Intellectuelle</h3>
        <p>
          Tout le contenu de l'application, y compris les textes, graphiques, logos et logiciels, est la propriété de Sexual AI ou de ses fournisseurs et est protégé par les lois sur le droit d'auteur.
        </p>

        <h3>4. Responsabilité</h3>
        <p>
          Nos services sont fournis "tels quels". Nous ne garantissons pas que les services seront ininterrompus ou sans erreur. Nous ne sommes pas responsables des dommages indirects, consécutifs ou spéciaux découlant de l'utilisation de nos services.
        </p>

        <h3>5. Résiliation</h3>
        <p>
          Nous nous réservons le droit de suspendre ou de résilier votre accès à nos services en cas de violation des présentes conditions ou pour toute autre raison jugée appropriée.
        </p>

        <h3>6. Limitation de Responsabilité</h3>
        <p>
          Dans la mesure permise par la loi, Sexual AI ne sera pas responsable des pertes de données, de profits, ou de tout autre dommage indirect découlant de l'utilisation ou de l'incapacité à utiliser nos services.
        </p>

        <h3>7. Modifications des Services</h3>
        <p>
          Nous pouvons modifier, suspendre ou interrompre tout aspect de nos services à tout moment, sans préavis.
        </p>

        <h3>8. Droit Applicable</h3>
        <p>
          Ces conditions sont régies par les lois de [Madagascar/juridiction]. Tout litige sera soumis aux tribunaux compétents de [votre juridiction].
        </p>

        <h3>9. Contact</h3>
        <p>
          Pour toute question concernant cette politique ou ces conditions, contactez-nous à : <br />
          Email : sexualai24@gmail.com <br />
          Adresse : Sexual AI, Tanambao Zoara Lot IB 368/3611, [Fianarantsoa, Madagascar]
          Telephone : +261 38 47 023 93 / +261 37 52 848 68 / +261 32 16 447 65
        </p>

        <p className="privacy-policy-footer">
          Dernière mise à jour : 3 juillet 2025
        </p>
      </div>
    </div>
  )
}

export default PrivacyPolicy