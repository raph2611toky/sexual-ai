"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./TermsOfService.css"

const TermsOfService = () => {
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
      title: "Conditions d'Utilisation",
      back: "Retour",
      introduction: "Introduction",
      acceptance: "Acceptation des Conditions",
      useOfServices: "Utilisation des Services",
      userResponsibilities: "Responsabilités de l'Utilisateur",
      intellectualProperty: "Propriété Intellectuelle",
      limitationOfLiability: "Limitation de Responsabilité",
      termination: "Résiliation",
      governingLaw: "Droit Applicable",
      amendments: "Modifications des Conditions",
      disputeResolution: "Résolution des Litiges",
      privacyPolicyLink: "Politique de Confidentialité",
      contact: "Informations de Contact",
      introText: `
        Bienvenue sur Sexual AI, une plateforme innovante conçue pour fournir des informations et des services liés à la santé sexuelle et reproductive, ainsi qu'à la gestion des cycles menstruels à Madagascar et au-delà. Ces Conditions d'Utilisation ("Conditions") constituent un accord légal entre vous ("Utilisateur" ou "Vous") et Sexual AI ("Nous", "Notre", ou "Société"), régissant votre accès et votre utilisation de notre application mobile, de nos services d'appel vocal basés sur l'intelligence artificielle, et de nos services de messagerie SMS. Notre mission est de promouvoir l'éducation sexuelle, la sensibilisation et l'accès à des ressources fiables dans un contexte culturellement adapté, en particulier pour les communautés malgaches. En accédant ou en utilisant l'un de nos services, vous acceptez d'être lié par ces Conditions dans leur intégralité, ainsi que par toutes les lois et réglementations applicables. Si vous n'acceptez pas ces termes, veuillez ne pas utiliser nos services. Ces Conditions sont rédigées pour être claires et détaillées afin de garantir une compréhension mutuelle entre vous et nous.
      `,
      acceptanceText: `
        Votre utilisation de Sexual AI, que ce soit par l'intermédiaire de notre application mobile, de notre assistant vocal accessible par appel téléphonique, ou de notre système de suivi par SMS, signifie que vous avez lu attentivement, compris et accepté ces Conditions d'Utilisation ainsi que notre Politique de Confidentialité, qui est intégrée par référence dans ce document. Cet accord s'applique à tous les utilisateurs, qu'ils accèdent à nos services via une connexion internet ou par des moyens hors ligne comme un appel vocal sans connexion internet. Vous reconnaissez que l'utilisation de nos services est volontaire et que vous êtes responsable de vous conformer à ces termes. Si vous utilisez Sexual AI au nom d'une organisation ou d'une entité, vous déclarez avoir l'autorité nécessaire pour engager cette entité à respecter ces Conditions. Toute violation de ces termes peut entraîner la suspension ou la résiliation de votre accès à nos services, comme décrit plus loin dans ce document.
      `,
      useOfServicesText: `
        Sexual AI offre une gamme de services visant à améliorer l'accès à l'information sur la santé sexuelle et reproductive. Ces services sont conçus pour répondre aux besoins des utilisateurs à Madagascar et dans d'autres régions où les ressources éducatives peuvent être limitées. Nos services incluent, sans s'y limiter :
      `,
      useOfServicesList: [
        "Un assistant vocal basé sur l'intelligence artificielle, accessible par appel téléphonique, qui fournit des réponses personnalisées en français et en malgache sur des sujets tels que la contraception, les infections sexuellement transmissibles (IST), et la gestion des cycles menstruels.",
        "Un système de suivi par SMS qui envoie des rappels personnalisés, des conseils de santé et des informations éducatives directement sur votre téléphone, même sans connexion internet.",
        "Une application mobile dotée de fonctionnalités telles que le suivi des cycles menstruels, des forums communautaires modérés pour des discussions sécurisées, et des contenus multimédias éducatifs adaptés aux réalités locales."
      ],
      useOfServicesText2: `
        Ces services sont destinés à un usage personnel et éducatif uniquement. Vous acceptez de ne pas utiliser Sexual AI à des fins illégales, immorales ou non autorisées, y compris, mais sans s'y limiter, la diffusion de fausses informations, l'exploitation commerciale non autorisée de nos contenus, ou toute activité qui pourrait nuire à la réputation ou au fonctionnement de Sexual AI. Nous nous réservons le droit de surveiller l'utilisation de nos services pour garantir leur conformité avec ces Conditions et pour protéger la sécurité et l'intégrité de notre plateforme. Toute utilisation abusive peut entraîner des mesures immédiates, telles que la limitation ou la suppression de votre accès.
      `,
      userResponsibilitiesText: `
        En tant qu'utilisateur de Sexual AI, vous jouez un rôle clé dans le maintien de l'intégrité et de la sécurité de nos services. Vos responsabilités incluent, mais ne se limitent pas à :
      `,
      userResponsibilitiesList: [
        "Fournir des informations précises, complètes et à jour lors de votre inscription ou de l'utilisation de nos services, telles que votre numéro de téléphone ou vos données personnelles, pour garantir une expérience personnalisée et efficace.",
        "Protéger vos informations d'identification et ne pas les partager avec des tiers afin de prévenir tout accès non autorisé à votre compte ou à vos données.",
        "Utiliser nos services de manière respectueuse et conforme aux lois locales et internationales, en évitant tout comportement qui pourrait être considéré comme abusif, discriminatoire ou nuisible envers d'autres utilisateurs ou notre plateforme.",
        "Signaler immédiatement tout problème technique, contenu inapproprié ou activité suspecte que vous pourriez rencontrer lors de l'utilisation de nos services, afin que nous puissions prendre des mesures rapides et appropriées.",
        "Ne pas tenter de contourner les mesures de sécurité de Sexual AI, y compris les tentatives d'accès non autorisé à nos serveurs, bases de données ou systèmes sous-jacents."
      ],
      userResponsibilitiesText2: `
        Le non-respect de ces responsabilités peut entraîner des conséquences graves, telles que la suspension temporaire ou permanente de votre accès à Sexual AI, ainsi que des poursuites légales si vos actions violent les lois applicables. Nous comptons sur votre coopération pour faire de Sexual AI une plateforme sûre, fiable et bénéfique pour tous.
      `,
      intellectualPropertyText: `
        Tout le contenu disponible sur Sexual AI, y compris, mais sans s'y limiter, les textes éducatifs, les graphiques, les logos, les scripts vocaux de notre assistant IA, les bases de données, et le code logiciel sous-jacent, est la propriété exclusive de Sexual AI ou de ses partenaires licenciés. Ce contenu est protégé par les lois sur la propriété intellectuelle en vigueur à Madagascar ainsi que par les conventions internationales applicables. Vous êtes autorisé à utiliser ce contenu uniquement dans le cadre de l'utilisation normale de nos services, comme prévu par ces Conditions. Toute reproduction, distribution, modification, ou utilisation commerciale de ce contenu sans notre autorisation écrite préalable est strictement interdite et peut entraîner des poursuites judiciaires. Si vous souhaitez utiliser notre contenu à des fins spécifiques, veuillez nous contacter pour obtenir une autorisation explicite.
      `,
      limitationOfLiabilityText: `
        Sexual AI s'engage à fournir des services de haute qualité, mais nous les offrons "tels quels" et "selon leur disponibilité". Nous ne garantissons pas que nos services seront exempts d'erreurs, ininterrompus, ou disponibles à tout moment, en raison de facteurs tels que les pannes de réseau, les mises à jour du système, ou les limitations technologiques dans certaines régions. En aucun cas, Sexual AI, ses dirigeants, employés ou partenaires ne pourront être tenus responsables des dommages directs, indirects, accessoires, spéciaux, consécutifs ou exemplaires découlant de votre utilisation ou de votre incapacité à utiliser nos services. Cela inclut, sans s'y limiter, la perte de données, les erreurs dans les informations fournies, ou les décisions que vous prenez sur la base des conseils fournis par notre plateforme. Nos services ne constituent pas un substitut aux conseils médicaux professionnels, et nous vous encourageons vivement à consulter un professionnel de santé qualifié pour toute question ou décision liée à votre santé personnelle.
      `,
      terminationText: `
        Nous nous réservons le droit de suspendre ou de résilier votre accès à tout ou partie de nos services à notre seule discrétion, avec ou sans préavis, en cas de violation de ces Conditions, d'utilisation abusive de nos services, ou pour toute autre raison que nous jugeons nécessaire pour protéger la sécurité, l'intégrité ou la réputation de Sexual AI. Par exemple, si vous utilisez nos forums pour publier du contenu inapproprié ou si vous tentez de compromettre nos systèmes, nous pouvons agir immédiatement. De votre côté, vous pouvez cesser d'utiliser nos services à tout moment en supprimant l'application ou en停止ant vos interactions avec nos systèmes SMS ou vocaux. La résiliation de votre accès n'affecte pas les obligations ou responsabilités que vous avez pu encourir avant la fin de votre utilisation.
      `,
      governingLawText: `
        Ces Conditions d'Utilisation sont régies par les lois en vigueur à Madagascar, sans égard aux principes de conflit de lois. Tout litige, différend ou réclamation découlant de ou lié à votre utilisation de Sexual AI sera soumis à la juridiction exclusive des tribunaux compétents situés à Fianarantsoa, Madagascar. En acceptant ces Conditions, vous consentez à cette juridiction et renoncez à toute objection concernant le lieu ou la commodité de ces tribunaux. Si une disposition de ces Conditions est jugée invalide ou inapplicable par un tribunal compétent, les autres dispositions resteront pleinement en vigueur.
      `,
      amendmentsText: `
        Sexual AI se réserve le droit de modifier ou de mettre à jour ces Conditions d'Utilisation à tout moment pour refléter les changements dans nos services, les exigences légales, ou nos pratiques opérationnelles. Toute modification sera effective dès sa publication sur notre application ou via une notification par SMS ou appel vocal, selon le cas. Nous vous encourageons à consulter régulièrement cette page pour rester informé des dernières versions de ces Conditions. Votre utilisation continue de nos services après la publication des modifications constitue votre acceptation de ces changements. Si vous n'acceptez pas les nouvelles conditions, vous devez cesser d'utiliser nos services immédiatement.
      `,
      disputeResolutionText: `
        En cas de différend lié à ces Conditions ou à votre utilisation de Sexual AI, nous vous encourageons à nous contacter en premier lieu pour tenter de résoudre le problème de manière amiable. Si une résolution informelle n'est pas possible, le litige sera soumis aux tribunaux de Fianarantsoa, comme mentionné dans la section "Droit Applicable". Nous nous engageons à agir de bonne foi pour résoudre les différends rapidement et équitablement, dans l'intérêt de toutes les parties impliquées.
      `,
      privacyPolicyLinkText: `
        Votre vie privée est importante pour nous. Pour plus d'informations sur la manière dont nous collectons, utilisons et protégeons vos données personnelles, veuillez consulter notre Politique de Confidentialité, accessible via notre application ou sur demande par SMS ou appel vocal. Cette politique fait partie intégrante de ces Conditions et complète les informations fournies ici.
      `,
      contactText: `
        Si vous avez des questions, des préoccupations ou des commentaires concernant ces Conditions d'Utilisation ou nos services en général, n'hésitez pas à nous contacter. Nous sommes disponibles pour vous assister et répondre à vos demandes via les moyens suivants :
      `,
      contactDetails: [
        "Email : sexualai24@gmail.com",
        "Adresse physique : Sexual AI, Tanambao Zoara Lot IB 368/3611, Fianarantsoa, Madagascar",
        "Numéros de téléphone : +261 38 47 023 93 / +261 37 52 848 68 / +261 32 16 447 65",
        "Horaires de contact : Du lundi au vendredi, de 8h00 à 17h00 (heure locale de Madagascar)"
      ],
      lastUpdated: "Dernière mise à jour : 3 juillet 2025"
    },
    mg: {
      title: "Fepetra fampiasana",
      back: "Hiverina",
      introduction: "Fampidirana",
      acceptance: "Fanekena ny fepetra",
      useOfServices: "Fampiasana ny tolotra",
      userResponsibilities: "Andraikitry ny mpampiasa",
      intellectualProperty: "Fanajana ny fananana ara-tsaina",
      limitationOfLiability: "Fetra ny andraikitra",
      termination: "Fampitsaharana",
      governingLaw: "Lalàna mifehy",
      amendments: "Fanovana ny fepetra",
      disputeResolution: "Famahana ny fifandirana",
      privacyPolicyLink: "Politikan'ny tsiambaratelo",
      contact: "Fifandraisana",
      introText: `
        Tongasoa eto amin'ny Sexual AI, sehatra vaovao natao hanomezana fampahalalana sy tolotra mifandraika amin'ny fahasalamana ara-nofo sy ny fitantanana ny fadimbolana eto Madagasikara sy any ivelany. Ireo Fepetra fampiasana ("Fepetra") ireo dia fifanarahana ara-dalàna eo aminao ("Mpampiasa" na "Ianao") sy ny Sexual AI ("Izahay", "Anay", na "Orinasa"), izay mifehy ny fidiranao sy ny fampiasanao ny fampiharana finday anay, ny tolotra antso an-telefaonina mifototra amin'ny faharanitan-tsaina artifisialy, ary ny tolotra hafatra SMS. Ny tanjonay dia ny hampiroborobo ny fanabeazana ara-nofo, ny fanentanana ary ny fidirana amin'ny loharanon-kevitra azo antoka ao anatin'ny toe-javatra mifanaraka amin'ny kolontsaina, indrindra ho an'ny fiarahamonina malagasy. Amin'ny fidirana na fampiasana ny iray amin'ireo tolotray, dia manaiky ianao ho voafehin'ireo Fepetra ireo amin'ny ankapobeny, ary koa ny lalàna sy fitsipika rehetra azo ampiharina. Raha tsy manaiky ireo fepetra ireo ianao, aza mampiasa ny tolotray. Ireo Fepetra ireo dia nosoratana ho mazava sy feno mba hiantohana ny fifankahazoana eo aminao sy izahay.
      `,
      acceptanceText: `
        Ny fampiasanao ny Sexual AI, na amin'ny alalan'ny fampiharana finday anay, ny mpanampy feo azo idirana amin'ny antso an-telefaonina, na ny rafitra fanaraha-maso amin'ny SMS, dia midika fa efa namaky tsara ianao, nahatakatra ary nanaiky ireo Fepetra fampiasana ireo ary koa ny Politikan'ny Tsiambaratelo, izay tafiditra ao anatin'ity tahirin-kevitra ity amin'ny alalan'ny fanondroana. Ity fifanarahana ity dia mihatra amin'ny mpampiasa rehetra, na miditra amin'ny tolotray amin'ny alalan'ny fifandraisana amin'ny Internet izy ireo na amin'ny fomba tsy mifandray toy ny antso an-telefaonina tsy misy Internet. Manaiky ianao fa ny fampiasana ny tolotray dia atao an-tsitrapo ary ianao no tompon'andraikitra amin'ny fanarahana ireo fepetra ireo. Raha mampiasa ny Sexual AI ho an'ny orinasa na fikambanana ianao, dia manambara ianao fa manana ny fahefana ilaina hanoloana io fikambanana io hanaraka ireo Fepetra ireo. Ny fanitsakitsahana ireo fepetra ireo dia mety hiteraka fampiatoana na fampitsaharana ny fidiranao amin'ny tolotray, araka ny voalaza amin'ny antsipiriany etsy ambany.
      `,
      useOfServicesText: `
        Ny Sexual AI dia manolotra tolotra isan-karazany mikendry ny hanatsara ny fidirana amin'ny fampahalalana momba ny fahasalamana ara-nofo sy ny fiterahana. Ireo tolotra ireo dia natao hanomezana fahafaham-po ny filan'ny mpampiasa eto Madagasikara sy any amin'ny faritra hafa izay mety ho voafetra ny loharanon-kevitra fanabeazana. Ny tolotray dia ahitana, tsy voafetra amin'izany:
      `,
      useOfServicesList: [
        "Mpanampy feo mifototra amin'ny faharanitan-tsaina artifisialy, azo idirana amin'ny alalan'ny antso an-telefaonina, izay manome valiny manokana amin'ny teny frantsay sy malagasy momba ny lohahevitra toy ny fandrindrana ny fiterahana, ny aretina azo avy amin'ny firaisana (IST), ary ny fitantanana ny fadimbolana.",
        "Rafitra fanaraha-maso amin'ny SMS izay mandefa fampahatsiahivana manokana, torohevitra momba ny fahasalamana ary fampahalalana fanabeazana mivantana amin'ny telefaoninao, na dia tsy misy fifandraisana amin'ny Internet aza.",
        "Fampiharana finday miaraka amin'ny fiasa toy ny fanaraha-maso ny fadimbolana, forum fiaraha-monina voafehy ho an'ny fifanakalozan-kevitra azo antoka, ary votoaty multimedia fanabeazana mifanaraka amin'ny zava-misy eo an-toerana."
      ],
      useOfServicesText2: `
        Ireo tolotra ireo dia natao ho an'ny fampiasana manokana sy fanabeazana ihany. Manaiky ianao tsy hampiasa ny Sexual AI ho an'ny tanjona tsy ara-dalàna, tsy mendrika na tsy nahazoana alalana, anisan'izany, fa tsy voafetra amin'ny, fiparitahana vaovao diso, fampiasana ara-barotra tsy nahazoana alalana ny votoatinay, na hetsika mety hanimba ny laza na ny fiasan'ny Sexual AI. Manan-jo hanara-maso ny fampiasana ny tolotray izahay mba hiantohana ny fanarahana ireo Fepetra ireo sy hiarovana ny fiarovana sy ny fahamendrehan'ny sehatray. Ny fampiasana tsy mety dia mety hiteraka fepetra avy hatrany, toy ny fampihenana na fanafoanana ny fidiranao.
      `,
      userResponsibilitiesText: `
        Amin'ny maha-mpampiasa ny Sexual AI anao, dia mitana anjara toerana lehibe amin'ny fitazonana ny fahamendrehana sy ny fiarovana ny tolotray ianao. Ny andraikitranao dia ahitana, tsy voafetra amin'izany:
      `,
      userResponsibilitiesList: [
        "Manome fampahalalana marina, feno ary manara-penitra rehefa misoratra anarana na mampiasa ny tolotray, toy ny laharan-telefaoninao na ny mombamomba anao manokana, mba hiantohana traikefa manokana sy mahomby.",
        "Miaro ny mombamomba anao ary tsy mizara izany amin'ny antoko fahatelo mba hisorohana ny fidirana tsy nahazoana alalana amin'ny kaontinao na ny angon-drakitrao.",
        "Mampiasa ny tolotray amin'ny fomba hajaina sy mifanaraka amin'ny lalàna eo an-toerana sy iraisam-pirenena, manalavitra ny fitondran-tena mety hoheverina ho manevateva, manavakavaka na manimba ny mpampiasa hafa na ny sehatray.",
        "Mitory avy hatrany ny olana ara-teknika, votoaty tsy mendrika na hetsika mampiahiahy mety hitranga rehefa mampiasa ny tolotray, mba hahafahanay mandray fepetra haingana sy mety.",
        "Tsy manandrana manodinkodina ny fepetra fiarovana ny Sexual AI, anisan'izany ny fiezahana hiditra tsy nahazoana alalana amin'ny mpizara, fotodrafitrasa na rafitra fototra anay."
      ],
      userResponsibilitiesText2: `
        Ny tsy fanajana ireo andraikitra ireo dia mety hiteraka voka-dratsy lehibe, toy ny fampiatoana vonjimaika na maharitra ny fidiranao amin'ny Sexual AI, ary koa ny fanenjehana ara-dalàna raha toa ka manitsakitsaka ny lalàna azo ampiharina ny zavatra ataonao. Miandry ny fiaraha-miasanao izahay mba hahatonga ny Sexual AI ho sehatra azo antoka, azo ianteherana ary mahasoa ho an'ny rehetra.
      `,
      intellectualPropertyText: `
        Ny votoatin'ny Sexual AI rehetra, anisan'izany, fa tsy voafetra amin'ny, lahatsoratra fanabeazana, sary, logo, script feon'ny mpanampy AI anay, fotodrafitrasa, ary kaody rindrambaiko fototra, dia fananan'ny Sexual AI manokana na ny mpiara-miombon'antoka nahazo alalana. Io votoaty io dia voaaro amin'ny lalàna momba ny fananana ara-tsaina manan-kery eto Madagasikara ary koa ny fifanarahana iraisam-pirenena azo ampiharina. Nahazo alalana hampiasa io votoaty io ianao ao anatin'ny fampiasana ara-dalàna ny tolotray ihany, araka ny voalaza ao amin'ireo Fepetra ireo. Ny famerenana, fizarana, fanovana, na fampiasana ara-barotra io votoaty io raha tsy nahazoana alalana an-tsoratra mialoha avy aminay dia voarara tanteraka ary mety hiteraka fanenjehana ara-dalàna. Raha te hampiasa ny votoatinay ho an'ny tanjona manokana ianao, azafady mifandraisa aminay mba hahazoana alalana mazava.
      `,
      limitationOfLiabilityText: `
        Ny Sexual AI dia manolo-tena hanome tolotra avo lenta, saingy manolotra azy ireo "toy ny misy" sy "araka ny fisian'izy ireo" izahay. Tsy manome antoka izahay fa tsy misy fahadisoana, tsy tapaka, na misy foana ny tolotray, noho ny antony toy ny tsy fahombiazan'ny tambajotra, fanavaozana ny rafitra, na fetra ara-teknolojia any amin'ny faritra sasany. Amin'ny toe-javatra rehetra, ny Sexual AI, ny mpitantana azy, ny mpiasa na ny mpiara-miombon'antoka dia tsy ho tompon'andraikitra amin'ny fahavoazana mivantana, tsy mivantana, tsy nahy, manokana, mifandray na ohatra avy amin'ny fampiasanao na ny tsy fahafahanao mampiasa ny tolotray. Izany dia ahitana, tsy voafetra amin'ny, fahaverezan'ny angona, fahadisoana amin'ny fampahalalana nomena, na fanapahan-kevitra noraisinao mifototra amin'ny torohevitra nomen'ny sehatray. Tsy manolo ny torohevitry ny mpitsabo matihanina ny tolotray, ary mamporisika anao fatratra izahay mba hifampidinika amin'ny matihanina ara-pahasalamana mahafeno fepetra ho an'ny fanontaniana na fanapahan-kevitra mifandraika amin'ny fahasalamanao manokana.
      `,
      terminationText: `
        Manan-jo hampiantso na hampitsahatra ny fidiranao amin'ny ampahany na ny rehetra amin'ny tolotray izahay araka ny fanapahan-kevitray manokana, miaraka na tsy misy fampandrenesana mialoha, raha toa ka misy fanitsakitsahana ireo Fepetra ireo, fampiasana tsy mety ny tolotray, na antony hafa heverinay ho ilaina hiarovana ny fiarovana, ny fahamendrehana na ny lazan'ny Sexual AI. Ohatra, raha mampiasa ny forum anay ianao hamoahana votoaty tsy mendrika na manandrana manimba ny rafitray, dia mety hanao zavatra avy hatrany izahay. Amin'ny anao, afaka mitsahatra tsy mampiasa ny tolotray amin'ny fotoana rehetra ianao amin'ny famafana ny fampiharana na fampiatoana ny fifandraisanao amin'ny rafitra SMS na feo anay. Ny fampitsaharana ny fidiranao dia tsy misy fiantraikany amin'ny adidy na andraikitra mety ho azonao talohan'ny n停止an'ny fampiasanao.
      `,
      governingLawText: `
        Ireo Fepetra fampiasana ireo dia fehezin'ny lalàna manan-kery eto Madagasikara, tsy misy fiheverana ny fitsipiky ny fifandonan'ny lalàna. Ny fifandirana, tsy fitoviana na fitakiana rehetra ateraky ny na mifandraika amin'ny fampiasanao ny Sexual AI dia hatolotra ny fahefana manokana ny tribonaly mahalala ao Fianarantsoa, Madagasikara. Amin'ny fanekena ireo Fepetra ireo, manaiky io fahefana io ianao ary mandà ny fanoherana rehetra momba ny toerana na ny fahamendrehan'ireo tribonaly ireo. Raha misy fepetra ao amin'ireo Fepetra ireo heverina ho tsy manan-kery na tsy azo ampiharina amin'ny tribonaly mahalala, ny fepetra sisa dia hitoetra manankery tanteraka.
      `,
      amendmentsText: `
        Ny Sexual AI dia manan-jo hanova na hanavao ireo Fepetra fampiasana ireo amin'ny fotoana rehetra mba hanehoana ny fiovana amin'ny tolotray, ny fepetra ara-dalàna, na ny fomba fiasanay. Ny fanovana rehetra dia hahomby raha vao apetraka eo amin'ny fampiharana anay na amin'ny alalan'ny fampandrenesana amin'ny SMS na antso an-telefaonina, araka ny tranga. Mamporisika anao izahay hijery ity pejy ity matetika mba hijanona ho fantatrao ny kinova farany amin'ireo Fepetra ireo. Ny fampiasanao mitohy ny tolotray aorian'ny famoahana ny fanovana dia maneho ny fanekenao ireo fiovana ireo. Raha tsy manaiky ny fepetra vaovao ianao, dia tsy maintsy mitsahatra mampiasa ny tolotray avy hatrany.
      `,
      disputeResolutionText: `
        Raha misy tsy fitoviana mifandraika amin'ireo Fepetra ireo na ny fampiasanao ny Sexual AI, mamporisika anao izahay hifandray aminay aloha mba hanandrana hamaha ny olana amin'ny fomba nifanarahana. Raha tsy azo atao ny famahana tsy ara-potoana, ny fifandirana dia hatolotra ny tribonaly ao Fianarantsoa, araka ny voalaza ao amin'ny fizarana "Lalàna mifehy". Manolo-tena hiasa amim-pahatsoram-po izahay mba hamaha ny fifandirana haingana sy ara-drariny, ho tombontsoan'ny antoko rehetra voakasik'izany.
      `,
      privacyPolicyLinkText: `
        Zava-dehibe ho anay ny tsiambaratelinao. Raha mila fampahalalana fanampiny momba ny fomba fanangonana, fampiasana ary fiarovana ny angon-drakitrao manokana, jereo ny Politikan'ny Tsiambaratelo anay, azo idirana amin'ny alalan'ny fampiharana anay na amin'ny fangatahana amin'ny SMS na antso an-telefaonina. Io politika io dia ampahany tsy azo sarahina amin'ireo Fepetra ireo ary mameno ny fampahalalana omena eto.
      `,
      contactText: `
        Raha manana fanontaniana, ahiahy na hevitra momba ireo Fepetra fampiasana ireo na ny tolotray amin'ny ankapobeny ianao, aza misalasala mifandray aminay. Misy hanampy anao sy hamaly ny fangatahanao izahay amin'ny alalan'ireto fomba manaraka ireto:
      `,
      contactDetails: [
        "Mailaka : sexualai24@gmail.com",
        "Adiresy ara-batana : Sexual AI, Tanambao Zoara Lot IB 368/3611, Fianarantsoa, Madagasikara",
        "Laharana telefaonina : +261 38 47 023 93 / +261 37 52 848 68 / +261 32 16 447 65",
        "Fotoana fifandraisana : Alatsinainy hatramin'ny Zoma, 8 ora maraina hatramin'ny 5 ora hariva (ora eo an-toerana eto Madagasikara)"
      ],
      lastUpdated: "Fanavaozana farany : 3 Jolay 2025"
    }
  }

  const t = (key) => translations[language][key] || key

  return (
    <div className="terms-of-service-container">
      <header className="terms-of-service-header">
        <div className="terms-of-service-header-content">
          <div className="terms-of-service-header-left">
            <button className="terms-of-service-back-btn" onClick={() => navigate(-1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 className="terms-of-service-title">{t("title")}</h1>
          </div>
          <div className="terms-of-service-controls">
            <button className="terms-of-service-control-btn" onClick={toggleLanguage}>
              {language.toUpperCase()}
            </button>
            <button className="terms-of-service-control-btn" onClick={toggleTheme}>
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </header>

      <div className="terms-of-service-content">
        <h2>{t("introduction")}</h2>
        <p>{t("introText")}</p>

        <h2>{t("acceptance")}</h2>
        <p>{t("acceptanceText")}</p>

        <h2>{t("useOfServices")}</h2>
        <p>{t("useOfServicesText")}</p>
        <ul>
          {t("useOfServicesList").map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p>{t("useOfServicesText2")}</p>

        <h2>{t("userResponsibilities")}</h2>
        <p>{t("userResponsibilitiesText")}</p>
        <ul>
          {t("userResponsibilitiesList").map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p>{t("userResponsibilitiesText2")}</p>

        <h2>{t("intellectualProperty")}</h2>
        <p>{t("intellectualPropertyText")}</p>

        <h2>{t("limitationOfLiability")}</h2>
        <p>{t("limitationOfLiabilityText")}</p>

        <h2>{t("termination")}</h2>
        <p>{t("terminationText")}</p>

        <h2>{t("governingLaw")}</h2>
        <p>{t("governingLawText")}</p>

        <h2>{t("amendments")}</h2>
        <p>{t("amendmentsText")}</p>

        <h2>{t("disputeResolution")}</h2>
        <p>{t("disputeResolutionText")}</p>

        <h2>{t("privacyPolicyLink")}</h2>
        <p>{t("privacyPolicyLinkText")}</p>

        <h2>{t("contact")}</h2>
        <p>{t("contactText")}</p>
        <ul>
          {t("contactDetails").map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <p className="terms-of-service-footer">{t("lastUpdated")}</p>
      </div>
    </div>
  )
}

export default TermsOfService