// ============================================================
//  NIGHT CITY ARCHIVE — Headquarters (window.HQ)
//  Migliorie dell'HQ della crew e loro upgrade, pagati con gli HQ IP.
//  Regole: ogni miglioria si compra una volta e si potenzia una volta (salvo indicazione);
//  con «opts» gli upgrade sono a scelta e si comprano in qualsiasi ordine (quali: meta hq.picks[id]);
//  la crew riceve tanti HQ IP quanti IP riceve dalla colonna Group dopo una missione.
// ============================================================
window.HQ = (() => {
  // I(id, nome, costo, costo dell'upgrade, upgrade massimi, ruoli che ne beneficiano, effetto, effetto dell'upgrade, extra)
  const I = (id, name, cost, upCost, maxUp, roles, eff, up, x = {}) => ({ id, name, cost, upCost, maxUp, roles, eff, up, ...x });
  const BASE = [
    I("evidence", "Evidence Wall", 40, 40, 1, "Lawman, Media",
      "Lawman e Media hanno +2 a Composition, Criminology, Cryptography, Deduction, Education, Forgery, Library Search e Photography/Film nelle indagini in corso.",
      "Il bonus dei Lawman sale a +3. Per i Media resta +2, ma quando pubblicano una storia preparata con l'Evidence Wall il loro Credibility Rank sale di 1 per la credibilità."),
    I("garage", "Garage", 40, 40, 1, "Tutti, Nomad",
      "Arriva con una Compact Groundcar della crew: si migliora con i Vehicle Upgrade ma non si vende, e non usa la Moto dei Nomad. Se viene distrutta oltre la riparazione si perdono miglioria e upgrade (gli HQ IP non tornano) e va ricomprata.",
      "I Nomad, con tutti i veicoli integri e a HP pieni, possono spendere una settimana di downtime per rifare le scelte della Moto: cambiare Vehicle Upgrade o interi veicoli."),
    I("lockup", "Lockup", 40, 40, 1, "Tutti, Lawman",
      "Stanza insonorizzata dove tenere prigioniero un personaggio: scappa solo con BODY 13 o più. Altri però possono venire a cercarlo.",
      "Fino a tre prigionieri in celle separate. I Lawman hanno +2 a Interrogation su chi è rimasto almeno un giorno nel Lockup."),
    I("lounge", "Lounge", 40, 40, 1, "Fixer, Media",
      "Negli incontri di persona nel Lounge, i Fixer della crew hanno +2 a Bribery, Bureaucracy, Business, Conversation, Human Perception, Persuasion e Trading.",
      "Fixer e Media hanno +2 a tutte le prove per organizzare un incontro di persona con chi rientra nei loro Contacts and Clients (Fixer) o Access/Sources (Media), a giudizio del GM."),
    I("medbay", "Medbay", 40, 40, 1, "Tutti, Medtech",
      "I membri della crew guariscono naturalmente come se avessero BODY +2. I Medtech nel Medbay hanno +2 a First Aid, Paramedic e Surgery.",
      "Un Medtech può usare Science (Chemistry) per migliorare, fabbricare e inventare Street Drugs come un Tech con Maker; la sua Expertise (Upgrade, Fabrication, Invention) vale quanto il suo livello di Medical Tech."),
    I("morale", "Morale Boost", 40, 40, 10, "Tutti",
      "Svago e arredamento per la crew (videogiochi, liquori, biliardo, sauna, home theater, murales, canestro, vasca con i piedini…): il Lifestyle mensile di ogni membro costa 50 eb in meno.",
      "Si potenzia fino a 10 volte, ogni volta con un beneficio nuovo (vedi la tabella).", {
        levels: [
          "All'inizio di ogni mese ogni membro della crew può recuperare 1d6/2 di umanità, fino alla sua umanità massima (data dal cyberware installato).",
          "I membri della crew guariscono naturalmente come se avessero BODY +1. Si somma al bonus del Medbay.",
          "La crew (compresi i Team Member migliorati degli Exec) ha +1 a LUCK. È uno dei pochi modi per dare punti Fortuna a un NPC.",
          "All'inizio di ogni mese ogni membro può recuperare 1d6 di umanità, fino alla sua umanità massima. Sostituisce il beneficio del 1° upgrade.",
          "I Fixer della crew hanno +2 a Trading per alzare la paga a persona di un lavoro. Gli altri membri possono contrattare un aumento del 20% della paga a persona come un Fixer con Operator 5, ma senza bonus a Trading.",
          "Facendo Hustle (CP:R pag. 381) i membri della crew tirano due volte sulla tabella e scelgono il risultato che preferiscono.",
          "La crew (compresi i Team Member migliorati degli Exec) ha un altro +1 a LUCK.",
          "Facendo Hustle i membri della crew tirano due volte e guadagnano entrambi i risultati. Sostituisce il beneficio del 6° upgrade.",
          "All'inizio di ogni mese ogni membro tira due volte 1d6, tiene il più alto e lo aggiunge alla sua umanità, fino all'umanità massima. Sostituisce il beneficio del 4° upgrade.",
          "A scelta: con il GM create un beneficio unico pensato per la vostra crew.",
        ] }),
    I("rent", "Rent Reduction", 40, 40, 2, "Chi vive nell'HQ",
      "Chi vive nell'HQ paga l'affitto della categoria sotto nella tabella Real Estate (CP:R pag. 378), saltando le righe «Given to you by a Corp»; una stanza di Cube Hotel scende a 100 eb al mese. Non vale per un HQ senza affitto.",
      "Ogni upgrade aggiunge un letto (e, se il GM vuole, una stanza) senza aumentare l'affitto. Si ripete finché i letti non raddoppiano: es. un Cargo Container al massimo 2 letti (1 upgrade), un appartamento a due camere 4 letti (2 upgrade). Il massimo si cambia con ✎ secondo l'HQ."),
    I("server", "Server Room", 40, 40, 1, "Tutti, Netrunner",
      "L'HQ ha un'Architettura NET: costruitela con Home Security 2045 (CP:R pag. 217) e 20.000 eb. Quello che comprate non si rivende né si toglie, e i fondi non spesi si perdono.",
      "Un Netrunner può usare Electronics/Security Tech per migliorare, fabbricare e inventare Cyberdeck, hardware e programmi come un Tech con Maker; la sua Expertise vale quanto il suo Interface."),
    I("studio", "Studio", 40, 40, 1, "Rockerboy",
      "Nello Studio un Rockerboy ha +2 ad Acting, Composition, Play Instrument, Paint/Draw/Sculpt e Photography/Film.",
      "Un Rockerboy può passare una settimana di downtime a rifinire un'opera: +2 alle prove per crearla. Se fallisce, può riprovare un'altra settimana con un altro +2 (si accumula) finché non la finisce, la abbandona o fa un 1 su una delle prove (Fumble Recovery non aiuta): allora i bonus svaniscono. L'arte leggendaria (VD 29) cambia sempre il mondo.",
      { projects: "Opera" }),
    I("training", "Training Area", 40, 40, 1, "Tutti, Solo",
      "Con una settimana di downtime un membro della crew fa pratica in Athletics, Archery, Autofire, Brawling, Evasion, Handgun, Heavy Weapons, Martial Arts, Melee Weapon o Shoulder Arms: +1 alle prove con quell'abilità finché la crew non riceve di nuovo IP di gruppo o non fa pratica di nuovo.",
      "I Solo scelgono due abilità diverse della lista: contano entrambe come allenate."),
    // due upgrade a scelta, in qualsiasi ordine (opts): il terzo progetto del manuale e l'Upgraded Workshop homebrew
    I("workshop", "Workshop", 40, 40, 2, "Tech",
      "Quando un Tech usa Upgrade, Fabrication o Invention Expertise nel Workshop, può assegnare lo stesso tempo a un secondo progetto senza spenderne altro.",
      "Due upgrade a scelta, comprati uno alla volta nell'ordine che volete.",
      { projects: "Progetto", projOpt: "wip", opts: [
        { id: "third", name: "Terzo progetto", eff: "Lo stesso tempo vale anche per un terzo progetto." },
        { id: "wip", name: "Upgraded Workshop (homebrew)", eff: "Come nello Studio, un Tech può portare avanti un lavoro in corso. Ogni settimana di downtime passata sul progetto dà +2 (si accumula) alle prove di Upgrade, Fabrication o Invention per quel progetto, finché non lo finisce, lo abbandona o fa un 1 naturale su una delle prove: allora i bonus svaniscono." },
      ] }),
    I("workstation", "Workstation", 40, 40, 1, "Exec",
      "Un Team Member di un Exec della crew (scelto all'acquisto) diventa membro della crew: riceve IP quando li riceve il suo Exec e una parte uguale della paga dei lavori a cui partecipa (IP e soldi li spende il GM). È fedele al suo capo, non alla Corporazione, e lo segue se cambia azienda. Se si perde l'accesso alla Workstation non guadagna più IP né paga, ma tiene quello già speso.",
      "Il Team Member non usa più il sistema di Lealtà (CP:R pag. 154): resta fedele finché il suo Exec non lo tradisce. Se la Workstation potenziata va persa, la crew deve ripristinarla prima di spendere HQ IP in altro; altrimenti il Team Member si sente tradito e se ne va."),
  ];
  let HB = [];
  // voci custom e voci base modificate (stesso id = sostituisce quella base)
  const setHomebrew = items => { HB = (items || []).map(x => ({ ...x, custom: true })); };
  const all = () => { const ids = new Set(HB.map(x => x.id)); return [...BASE.filter(x => !ids.has(x.id)), ...HB]; };
  const byId = id => all().find(x => x.id === id) || null;
  // livello: 0 = non comprata, 1 = comprata, 1 + n = n upgrade
  const maxLevel = it => 1 + Math.max(0, +it.maxUp || 0);
  const nextCost = (it, lvl) => lvl <= 0 ? +it.cost || 0 : lvl < maxLevel(it) ? +it.upCost || 0 : null;
  return { BASE, all, byId, setHomebrew, maxLevel, nextCost };
})();
