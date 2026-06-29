"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./DataDeletion.css"

const DataDeletion = () => {
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
      title: "Suppression des Données",
      back: "Retour",
      introTitle: "Introduction",
      introText:
        "Chez Sexual AI, nous respectons votre droit à la confidentialité et au contrôle de vos données personnelles. Cette page explique comment demander la suppression de vos données, quelles informations peuvent être supprimées, les délais de traitement, ainsi que les cas où certaines données peuvent être conservées pour des raisons légales, de sécurité ou de prévention des abus.",
      rightsTitle: "Votre droit à la suppression",
      rightsText:
        "Vous pouvez demander la suppression de votre compte et des données personnelles associées à votre utilisation de Sexual AI. Cette demande peut concerner les informations de profil, les données liées aux services SMS ou vocaux, les préférences, les historiques d’utilisation, les données de suivi du cycle menstruel, les messages ou tout autre contenu que vous avez fourni volontairement dans nos services.",
      dataTitle: "Données concernées par la suppression",
      dataIntro: "Lorsque votre demande est validée, nous pouvons supprimer ou anonymiser les données suivantes :",
      dataList: [
        "Informations de compte : nom, adresse e-mail, numéro de téléphone, identifiants et préférences de compte.",
        "Données de santé fournies volontairement : informations liées au cycle menstruel, symptômes, rappels, notes personnelles ou informations similaires.",
        "Données d’utilisation : historique de connexion, interactions avec l’assistant IA, préférences de langue, paramètres de notification et données techniques associées.",
        "Données de communication : demandes envoyées par SMS, appels vocaux, formulaires de contact ou messages transmis à notre équipe d’assistance.",
        "Contenus communautaires associés à votre compte, lorsque leur suppression ne nuit pas à la sécurité ou à la cohérence des échanges déjà publiés."
      ],
      requestTitle: "Comment demander la suppression",
      requestIntro: "Vous pouvez demander la suppression de vos données par l’un des moyens suivants :",
      requestList: [
        "Depuis l’application : ouvrez les paramètres du compte, puis choisissez l’option de suppression du compte ou des données si elle est disponible.",
        "Par e-mail : envoyez une demande à sexualai24@gmail.com avec l’objet “Demande de suppression de données”.",
        "Par téléphone ou SMS : contactez notre équipe via les numéros officiels indiqués dans la section Contact."
      ],
      requestText:
        "Pour protéger votre compte, nous pouvons vous demander de confirmer votre identité avant de traiter la demande. Cette vérification sert uniquement à éviter qu’une autre personne demande la suppression de vos données sans votre autorisation.",
      infoTitle: "Informations à fournir dans votre demande",
      infoIntro: "Afin de traiter votre demande rapidement, veuillez indiquer :",
      infoList: [
        "Votre nom ou identifiant utilisé dans l’application, si applicable.",
        "L’adresse e-mail ou le numéro de téléphone associé à votre compte.",
        "Le type de demande : suppression complète du compte, suppression partielle de certaines données, ou retrait d’un contenu précis.",
        "Une courte précision si vous souhaitez supprimer uniquement certaines catégories de données."
      ],
      delayTitle: "Délais de traitement",
      delayText:
        "Nous faisons de notre mieux pour traiter les demandes de suppression dans un délai raisonnable après vérification de l’identité. Dans la majorité des cas, la suppression ou l’anonymisation est effectuée sous 30 jours. Certaines données présentes dans des sauvegardes techniques peuvent nécessiter un délai supplémentaire avant d’être définitivement effacées, mais elles ne seront plus utilisées activement après validation de votre demande.",
      retainedTitle: "Données pouvant être conservées",
      retainedText:
        "Certaines informations peuvent être conservées lorsque cela est nécessaire pour respecter une obligation légale, résoudre un litige, prévenir la fraude, protéger la sécurité de nos utilisateurs, maintenir l’intégrité de nos services ou démontrer qu’une demande de suppression a bien été traitée. Lorsque la conservation n’exige pas votre identification directe, nous privilégions l’anonymisation ou la minimisation des données.",
      consequencesTitle: "Conséquences de la suppression",
      consequencesText:
        "La suppression de vos données peut entraîner la fermeture définitive de votre compte et la perte d’accès à certains services, historiques, rappels, préférences, contenus personnalisés ou fonctionnalités liées à votre profil. Après suppression, il peut être impossible de restaurer vos informations, sauf si une sauvegarde technique existe encore temporairement pendant sa période normale de conservation.",
      childrenTitle: "Protection des utilisateurs sensibles",
      childrenText:
        "Étant donné la nature sensible des informations liées à la santé sexuelle et reproductive, nous traitons les demandes de suppression avec une attention particulière. Si une demande concerne une personne mineure ou une personne vulnérable, nous pouvons appliquer des vérifications supplémentaires afin de protéger ses droits, sa sécurité et sa confidentialité.",
      securityTitle: "Sécurité et confidentialité pendant la procédure",
      securityText:
        "Toutes les demandes de suppression sont traitées de manière confidentielle. Les informations fournies pour vérifier votre identité ne sont utilisées que pour gérer votre demande. Nous limitons l’accès à ces demandes aux personnes autorisées et appliquons des mesures de sécurité adaptées pour éviter tout accès non autorisé.",
      changeTitle: "Mise à jour de cette page",
      changeText:
        "Nous pouvons modifier cette page afin de refléter l’évolution de nos services, de nos pratiques de sécurité ou des obligations légales applicables. Les mises à jour importantes seront publiées dans l’application ou communiquées par les moyens appropriés.",
      contactTitle: "Contact",
      contactText:
        "Pour toute question ou demande relative à la suppression de vos données, vous pouvez nous contacter via les moyens suivants :",
      contactDetails: [
        "Email : sexualai24@gmail.com",
        "Adresse physique : Sexual AI, Tanambao Zoara Lot IB 368/3611, Fianarantsoa, Madagascar",
        "Numéros de téléphone : +261 38 47 023 93 / +261 37 52 848 68 / +261 32 16 447 65",
        "Horaires de contact : Du lundi au vendredi, de 8h00 à 17h00 (heure locale de Madagascar)"
      ],
      lastUpdated: "Dernière mise à jour : 3 juillet 2025"
    },
    mg: {
      title: "Famafana angon-drakitra",
      back: "Hiverina",
      introTitle: "Fampidirana",
      introText:
        "Ao amin'ny Sexual AI, manaja ny zonao amin'ny tsiambaratelo sy ny fifehezana ny angon-drakitrao manokana izahay. Ity pejy ity dia manazava ny fomba fangatahana famafana angon-drakitra, ireo fampahalalana azo fafana, ny fe-potoana fikarakarana, ary ireo tranga mety hitazonana angona sasany noho ny antony ara-dalàna, fiarovana na fisorohana fampiasana tsy mety.",
      rightsTitle: "Zonao hangataka famafana",
      rightsText:
        "Afaka mangataka ny famafana ny kaontinao sy ny angon-drakitra manokana mifandray amin'ny fampiasanao ny Sexual AI ianao. Izany fangatahana izany dia mety hahakasika ny mombamomba ny kaonty, ny angona mifandray amin'ny tolotra SMS na antso, ny safidy napetraka, ny tantaran'ny fampiasana, ny angona fanaraha-maso ny fadimbolana, ny hafatra na votoaty hafa nomenao an-tsitrapo tao amin'ny tolotray.",
      dataTitle: "Angona mety hofafana",
      dataIntro: "Rehefa voamarina ny fangatahanao, afaka mamafa na manafina ny maha-ianao anao amin'ireto angona ireto izahay :",
      dataList: [
        "Mombamomba ny kaonty : anarana, adiresy mailaka, laharan-telefaonina, mari-pamantarana ary safidin'ny kaonty.",
        "Angona ara-pahasalamana nomena an-tsitrapo : fampahalalana momba ny fadimbolana, soritr'aretina, fampahatsiahivana, fanamarihana manokana na fampahalalana mitovy amin'izany.",
        "Angona fampiasana : tantaran'ny fidirana, fifandraisana tamin'ny mpanampy AI, safidin'ny fiteny, fikirakirana fampandrenesana ary angona teknika mifandray amin'izany.",
        "Angona fifandraisana : fangatahana nalefa tamin'ny SMS, antso an-telefaonina, taratasy fifandraisana na hafatra nalefa tamin'ny ekipa mpanampy.",
        "Votoaty fiarahamonina mifandray amin'ny kaontinao, raha azo fafana nefa tsy manimba ny fiarovana na ny firindran'ny fifanakalozan-kevitra efa nivoaka."
      ],
      requestTitle: "Fomba fangatahana famafana",
      requestIntro: "Afaka mangataka famafana angon-drakitra ianao amin'ireto fomba ireto :",
      requestList: [
        "Ao amin'ny fampiharana : sokafy ny fikirakirana kaonty, dia fidio ny safidy famafana kaonty na angon-drakitra raha misy izany.",
        "Amin'ny mailaka : alefaso any amin'ny sexualai24@gmail.com ny fangatahana miaraka amin'ny lohateny hoe “Demande de suppression de données”.",
        "Amin'ny antso na SMS : mifandraisa amin'ny ekipanay amin'ny laharana ofisialy voalaza ao amin'ny fizarana Fifandraisana."
      ],
      requestText:
        "Mba hiarovana ny kaontinao, mety hangataka fanamarinana ny maha-ianao anao izahay alohan'ny hikarakarana ny fangatahana. Izany fanamarinana izany dia natao hisorohana olona hafa hangataka famafana ny angon-drakitrao tsy nahazo alalana avy aminao.",
      infoTitle: "Fampahalalana tokony homena",
      infoIntro: "Mba hahafahana mikarakara haingana ny fangatahanao, azafady farito :",
      infoList: [
        "Ny anaranao na ny mari-pamantarana ampiasainao ao amin'ny fampiharana, raha misy.",
        "Ny adiresy mailaka na laharan-telefaonina mifandray amin'ny kaontinao.",
        "Ny karazana fangatahana : famafana kaonty manontolo, famafana ampahany amin'ny angona, na fanesorana votoaty manokana.",
        "Fanazavana fohy raha angona sokajy sasany ihany no tianao hofafana."
      ],
      delayTitle: "Fe-potoana fikarakarana",
      delayText:
        "Miezaka izahay hikarakara ny fangatahana famafana ao anatin'ny fotoana ara-drariny aorian'ny fanamarinana ny maha-ianao anao. Amin'ny ankamaroan'ny tranga, ny famafana na fanesorana ny maha-ianao anao dia tanterahina ao anatin'ny 30 andro. Ny angona sasany ao anatin'ny tahiry fiarovana ara-teknika dia mety mila fotoana fanampiny vao voafafa tanteraka, saingy tsy hampiasaina mavitrika intsony rehefa voamarina ny fangatahanao.",
      retainedTitle: "Angona mety hotazonina",
      retainedText:
        "Mety hotazonina ny fampahalalana sasany raha ilaina amin'ny fanajana adidy ara-dalàna, famahana fifandirana, fisorohana hosoka, fiarovana ny mpampiasa, fitazonana ny fahamarinan'ny tolotra, na porofo fa efa nokarakaraina ny fangatahana famafana. Raha tsy ilaina ny famantarana mivantana anao, dia aleonay manafina ny maha-ianao anao na mampihena araka izay azo atao ny angona tehirizina.",
      consequencesTitle: "Vokatry ny famafana",
      consequencesText:
        "Ny famafana ny angon-drakitrao dia mety hiteraka fanakatonana tanteraka ny kaontinao sy fahaverezan'ny fidirana amin'ny tolotra sasany, tantara, fampahatsiahivana, safidy, votoaty manokana na asa mifandray amin'ny mombamomba anao. Rehefa voafafa ny angona, dia mety tsy ho azo averina intsony, afa-tsy raha mbola misy vonjimaika ao amin'ny tahiry fiarovana ara-teknika mandritra ny fe-potoana fitahirizana mahazatra.",
      childrenTitle: "Fiarovana ireo mpampiasa marefo",
      childrenText:
        "Noho ny maha-saropady ny fampahalalana momba ny fahasalamana ara-nofo sy fiterahana, dia karakarainay amim-pitandremana manokana ny fangatahana famafana. Raha mikasika zaza tsy ampy taona na olona marefo ny fangatahana, dia mety hampihatra fanamarinana fanampiny izahay mba hiarovana ny zony, ny fiarovana azy ary ny tsiambaratelony.",
      securityTitle: "Fiarovana sy tsiambaratelo mandritra ny dingana",
      securityText:
        "Karakaraina amin'ny tsiambaratelo ny fangatahana famafana rehetra. Ny fampahalalana omena hanamarinana ny maha-ianao anao dia ampiasaina fotsiny hitantanana ny fangatahanao. Feranay ho an'ny olona nahazo alalana ihany ny fidirana amin'ireo fangatahana ireo ary mampihatra fepetra fiarovana mifanaraka amin'izany izahay hisorohana fidirana tsy nahazoana alalana.",
      changeTitle: "Fanavaozana ity pejy ity",
      changeText:
        "Afaka manova ity pejy ity izahay mba hifanaraka amin'ny fivoaran'ny tolotray, ny fomba fiarovanay na ny adidy ara-dalàna mihatra. Ny fanavaozana lehibe dia hapetraka ao amin'ny fampiharana na hampitaina amin'ny fomba mety.",
      contactTitle: "Fifandraisana",
      contactText:
        "Raha manana fanontaniana na fangatahana momba ny famafana ny angon-drakitrao ianao, afaka mifandray aminay amin'ireto fomba manaraka ireto :",
      contactDetails: [
        "Mailaka : sexualai24@gmail.com",
        "Adiresy ara-batana : Sexual AI, Tanambao Zoara Lot IB 368/3611, Fianarantsoa, Madagascar",
        "Laharana telefaonina : +261 38 47 023 93 / +261 37 52 848 68 / +261 32 16 447 65",
        "Fotoana fifandraisana : Alatsinainy hatramin'ny Zoma, 8 ora maraina hatramin'ny 5 ora hariva (ora eto Madagasikara)"
      ],
      lastUpdated: "Fanavaozana farany : 3 Jolay 2025"
    }
  }

  const t = (key) => translations[language][key] || key

  const renderList = (items) => (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  )

  return (
    <div className="data-deletion-container">
      <header className="data-deletion-header">
        <div className="data-deletion-header-content">
          <div className="data-deletion-header-left">
            <button className="data-deletion-back-btn" onClick={() => navigate(-1)} aria-label={t("back")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="data-deletion-title">{t("title")}</h1>
          </div>

          <div className="data-deletion-controls">
            <button className="data-deletion-control-btn" onClick={toggleLanguage}>
              {language.toUpperCase()}
            </button>
            <button className="data-deletion-control-btn" onClick={toggleTheme}>
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </header>

      <main className="data-deletion-content">
        <section>
          <h2>{t("introTitle")}</h2>
          <p>{t("introText")}</p>
        </section>

        <section>
          <h2>{t("rightsTitle")}</h2>
          <p>{t("rightsText")}</p>
        </section>

        <section>
          <h2>{t("dataTitle")}</h2>
          <p>{t("dataIntro")}</p>
          {renderList(t("dataList"))}
        </section>

        <section>
          <h2>{t("requestTitle")}</h2>
          <p>{t("requestIntro")}</p>
          {renderList(t("requestList"))}
          <p>{t("requestText")}</p>
        </section>

        <section>
          <h2>{t("infoTitle")}</h2>
          <p>{t("infoIntro")}</p>
          {renderList(t("infoList"))}
        </section>

        <section>
          <h2>{t("delayTitle")}</h2>
          <p>{t("delayText")}</p>
        </section>

        <section>
          <h2>{t("retainedTitle")}</h2>
          <p>{t("retainedText")}</p>
        </section>

        <section>
          <h2>{t("consequencesTitle")}</h2>
          <p>{t("consequencesText")}</p>
        </section>

        <section>
          <h2>{t("childrenTitle")}</h2>
          <p>{t("childrenText")}</p>
        </section>

        <section>
          <h2>{t("securityTitle")}</h2>
          <p>{t("securityText")}</p>
        </section>

        <section>
          <h2>{t("changeTitle")}</h2>
          <p>{t("changeText")}</p>
        </section>

        <section>
          <h2>{t("contactTitle")}</h2>
          <p>{t("contactText")}</p>
          {renderList(t("contactDetails"))}
        </section>

        <p className="data-deletion-footer">{t("lastUpdated")}</p>
      </main>
    </div>
  )
}

export default DataDeletion
