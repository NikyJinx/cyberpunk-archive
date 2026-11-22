// ============================================================
//  NIGHT CITY ARCHIVE — catalogo del Night Market (window.MK)
//  Armi, armature ed equipaggiamento: voci base, voci custom (meta "markethb")
//  e lettore del formato a blocchi per l'importazione.
//  Il cyberware resta in js/cyberware.js (CW); quello importato va nel cyberware custom.
// ============================================================
window.MK = (() => {
  const num = v => { const n = parseFloat(String(v ?? "").replace(/[.,](?=\d{3}(?!\d))/g, "").replace(",", ".")); return isNaN(n) ? 0 : n; };
  const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();

  // categorie di prezzo del manuale
  const PRICES = [["Cheap", 10], ["Everyday", 20], ["Costly", 50], ["Premium", 100], ["Expensive", 500], ["Very Expensive", 1000], ["Luxury", 5000], ["Super Luxury", 10000]];
  const priceCat = cost => { if (!(cost > 0)) return "—"; let c = PRICES[0][0]; PRICES.forEach(([l, v]) => { if (cost >= v) c = l; }); return c; };
  const TYPES = [["weapon", "Armi"], ["armor", "Armature"], ["gear", "Equipaggiamento"], ["cyber", "Cyberware"], ["deck", "Cyberdeck"], ["netitem", "Programmi e hardware"], ["deckprog", "Programmi e hardware"], ["drug", "Droghe"]];
  const QUALITY = [["poor", "Poor"], ["standard", "Standard"], ["excellent", "Excellent"]];

  // W(id, nome, categoria, costo, extra) · le statistiche mancanti vengono dalla categoria (CPR.WEAPON_TYPES)
  const W = (id, name, cat, cost, x = {}) => ({ id, type: "weapon", name, cat, cost, ...x });
  const A = (id, name, sp, pen, cost, desc) => ({ id, type: "armor", name, sp, pen, cost, desc });
  const G = (id, name, cost, desc, x = {}) => ({ id, type: "gear", name, cost, desc, gcat: "equip", ...x });
  const GUN = "12 Days of Gunmas";
  const BASE = [
    // armi del manuale base
    W("w-mpistol", "Medium Pistol", "mpistol", 50, { conceal: true, hands: 1, desc: "Pistola semiautomatica standard." }),
    W("w-hpistol", "Heavy Pistol", "hpistol", 100, { conceal: true, hands: 1, desc: "Pistola di grosso calibro." }),
    W("w-vhpistol", "Very Heavy Pistol", "vhpistol", 100, { hands: 1, desc: "Pistola enorme: non si nasconde." }),
    W("w-smg", "SMG", "smg", 100, { conceal: true, hands: 1, desc: "Mitraglietta compatta. Autofire e fuoco di soppressione." }),
    W("w-hsmg", "Heavy SMG", "hsmg", 100, { hands: 1, desc: "Mitraglietta pesante. Autofire e fuoco di soppressione." }),
    W("w-shotgun", "Shotgun", "shotgun", 500, { hands: 2, desc: "Fucile a pompa: slug o pallettoni (Shotgun Shell)." }),
    W("w-ar", "Assault Rifle", "ar", 500, { hands: 2, desc: "Fucile d'assalto. Autofire e fuoco di soppressione." }),
    W("w-sniper", "Sniper Rifle", "sniper", 500, { hands: 2, desc: "Fucile di precisione per le lunghe distanze." }),
    W("w-bow", "Bow / Crossbow", "bow", 100, { hands: 2, desc: "Arco o balestra: frecce, si recuperano." }),
    W("w-gl", "Grenade Launcher", "gl", 500, { hands: 2, desc: "Lanciagranate: danno ad area." }),
    W("w-rl", "Rocket Launcher", "rl", 500, { hands: 2, desc: "Lanciarazzi: danno ad area." }),
    W("w-lmelee", "Light Melee Weapon", "lmelee", 50, { conceal: true, hands: 1, desc: "Coltello, tirapugni… Ignora metà della SP." }),
    W("w-mmelee", "Medium Melee Weapon", "mmelee", 50, { hands: 1, desc: "Mazza, machete… Ignora metà della SP." }),
    W("w-hmelee", "Heavy Melee Weapon", "hmelee", 100, { hands: 2, desc: "Katana, spranga… Ignora metà della SP." }),
    W("w-vhmelee", "Very Heavy Melee Weapon", "vhmelee", 500, { hands: 2, desc: "Motosega, mazza da demolizione… Ignora metà della SP." }),
    // 12 Days of Gunmas (armi esotiche)
    W("g-waa", "Arasaka WAA Bullpup Assault Weapon", "ar", 1000, { src: GUN, skill: "shoulderarms", dmg: "5d6", mag: 30, rof: 1, hands: 2, auto: 4, exotic: true,
      special: "Autofire (4) · Fuoco di soppressione · Smartgun Link · Può usare munizioni non base",
      desc: "Fucile d'assalto bullpup in dotazione ai soldati Arasaka negli anni 2020. Robusto, affidabile e predisposto per lo smartgun." }),
    W("g-multiammo", "Constitutional Arms Multi-Ammo Pistol", "vhpistol", 500, { src: GUN, dmg: "4d6", mag: 5, rof: 1, hands: 1, exotic: true,
      special: "Caricatore misto: fino a 5 tipi di munizioni da Very Heavy Pistol, scegli quale sparare a ogni colpo",
      desc: "Revolver con selettore rapido e display sotto la tacca di mira, per scegliere tra risposta letale e non letale." }),
    W("g-chainknife", "IMI Chainknife", "mmelee", 500, { src: GUN, dmg: "2d6", rof: 1, hands: 1, exotic: true,
      special: "Con un'Azione si avvia (e si spegne): avviato è una Very Heavy Melee Weapon di qualità Excellent, 4d6 e +1 a colpire, finché non la posi o la riponi",
      desc: "Sega da combattimento a forma di coltello da sopravvivenza, usata dal Mossad. Passa le armature come fossero garza." }),
    W("g-dragon", "Kendachi Dragon Flamethrower", "shotgun", 1000, { src: GUN, skill: "heavyweapons", dmg: "3d6", mag: 2, rof: 1, hands: 1, exotic: true, noAim: true, noCrit: true,
      special: "Solo munizioni Incendiary Shotgun Shell (stesso costo) · i bersagli incendiati subiscono 4 danni a fine turno finché non spendono un'Azione per spegnersi (sostituisce un fuoco più debole, non si somma) · niente Critical Injury né colpi mirati",
      desc: "Il lanciafiamme a mano preferito da tutti, un classico del 2020." }),
    W("g-hellbringer", "Magnum Opus Hellbringer", "vhpistol", 1000, { src: GUN, dmg: "5d6", mag: 3, rof: 1, hands: 1, exotic: true,
      special: "Con BODY sotto 10 si inceppa dopo ogni colpo: un'Azione per sbloccarla",
      desc: "Revolver enorme in titanio e acciaio, tre colpi e nessuna elettronica: ogni colpo deve contare." }),
    W("g-malorian", "Malorian Arms Sub-Flechette Gun", "hsmg", 5000, { src: GUN, dmg: "3d6", mag: 25, rof: 1, hands: 1, auto: 4, exotic: true, quality: "excellent", ablate: 4,
      special: "Autofire (4) · Fuoco di soppressione · Smartgun Link · Solo le sue munizioni Armor-Piercing (stesso costo delle AP): ablano l'armatura di 4 invece che di 1",
      desc: "Mitraglietta a flechette semi-bullpup con otturatore rotante. Le sue flechette passano ogni armatura in uso." }),
    W("g-crusher", "Militech Crusher", "vhpistol", 500, { src: GUN, dmg: "3d6", mag: 6, rof: 1, hands: 1, exotic: true,
      special: "Spara solo Shotgun Shell base",
      desc: "Shotgun grande come una pistola, nato nella seconda guerra centroamericana per il combattimento ravvicinato." }),
    W("g-ars5", "Mustang Arms ARS-5 Submachine Gun", "hsmg", 1000, { src: GUN, dmg: "3d6", mag: 40, rof: 1, hands: 1, auto: 3, exotic: true,
      special: "Autofire (3) · Fuoco di soppressione · Smartgun Link · Mirino a infrarossi · Mirino da cecchino",
      desc: "La mitraglietta delle giovani corporazioni e delle forze dell'ordine del 2020, ora ristampata." }),
    W("g-boltgun", "Nomad Pneumatic Bolt Gun", "sniper", 500, { src: GUN, skill: "shoulderarms", dmg: "4d6", mag: 8, rof: 1, hands: 2, exotic: true,
      special: "Spara frecce · Può usare munizioni non base",
      desc: "Arma ad aria compressa dei Nomadi con quattro canne rotanti. Serve a tormentare i guidatori e bucare gomme." }),
    W("g-cityhunter", "Nova Model 757 Cityhunter", "hpistol", 1000, { src: GUN, dmg: "3d6", mag: 18, rof: 2, hands: 1, conceal: true, exotic: true,
      special: "Smartgun Link · Può sparare Smart Ammunition · Munizioni proprie: 18 colpi al prezzo di 10",
      desc: "Revolver a munizioni senza bossolo (tround) con accenditore elettrico, sembra ancora nuovo." }),
    W("g-st5", "Stolbovoy ST-5 Assault Rifle", "ar", 100, { src: GUN, dmg: "5d6", mag: 20, rof: 1, hands: 2, auto: 4, exotic: true, quality: "poor",
      special: "Autofire (4) · Fuoco di soppressione · Inceppata: 50% che spari lo stesso (e si sblocca), altrimenti perdi l'Azione ma si sblocca · Può usare munizioni non base",
      desc: "Funziona con caldo, gelo, fango e sabbia: quasi tutti gli ST-5 sono ancora in servizio." }),
    W("g-teendreem", "Teen Dreem", "smg", 20, { src: GUN, dmg: "2d6", mag: 10, rof: 1, hands: 1, conceal: true, auto: 3, exotic: true, quality: "poor",
      special: "Autofire e soppressione con almeno 2 colpi, svuotano il caricatore · Dopo un autofire o una soppressione la canna si scioglie: arma distrutta",
      desc: "Reliquia pop degli anni 2020 per poser nostalgici. Attento a non scottarti." }),
    // armature
    A("a-leathers", "Leathers", 4, 0, 20, "Giacca e pantaloni di pelle pesante."),
    A("a-kevlar", "Kevlar", 7, 0, 50, "Tessuto antiproiettile, si porta sotto i vestiti."),
    A("a-lightjack", "Light Armorjack", 11, 0, 100, "Giacca imbottita con piastre leggere."),
    A("a-bodyweight", "Bodyweight Suit", 11, 0, 1000, "Tuta aderente: si indossa sotto i vestiti."),
    A("a-mediumjack", "Medium Armorjack", 12, -2, 500, "Piastre più spesse: −2 a REF, DEX e MOVE."),
    A("a-heavyjack", "Heavy Armorjack", 13, -2, 1000, "Armatura pesante: −2 a REF, DEX e MOVE."),
    A("a-flak", "Flak", 15, -4, 500, "Armatura militare: −4 a REF, DEX e MOVE."),
    A("a-metalgear", "Metalgear", 18, -4, 5000, "Armatura completa a piastre: −4 a REF, DEX e MOVE."),
    // equipaggiamento comune
    G("e-agent", "Agent", 100, "Smartphone con IA personale: chiamate, mappe, ricerche."),
    G("e-cellphone", "Telefono usa e getta", 50, "Cellulare economico, si butta dopo l'uso."),
    G("e-radio", "Radio Communicator", 100, "Ricetrasmittente a corto raggio (circa 1,6 km)."),
    G("e-flashlight", "Torcia", 20, "Illumina un cono di 100 m."),
    G("e-glowstick", "Glow Stick", 10, "Luce chimica per 4 ore."),
    G("e-rope", "Corda (60 m)", 20, "Corda di nylon."),
    G("e-ducttape", "Nastro americano", 20, "Ripara (quasi) tutto."),
    G("e-binoculars", "Binocolo", 50, "Ingrandisce ×6."),
    G("e-handcuffs", "Manette", 50, "Per tenere fermo qualcuno."),
    G("e-lockpick", "Grimaldelli", 20, "Kit per scassinare le serrature."),
    G("e-techtool", "Tech Tool", 100, "Attrezzi multiuso del Tech."),
    G("e-medbag", "Medtech Bag", 100, "Kit medico per le cure sul campo."),
    G("e-grapple", "Grapple Gun", 100, "Spara un rampino con 30 m di cavo."),
    G("e-shield", "Scudo antiproiettile", 100, "Scudo con 10 HP che si mette tra te e i colpi.", { label: "Scudo" }),
    // espansioni (12 Days of …, Hornet's Pharmacy, Midnight with the Upload)
    W("c-cuddlefish", "Captain Cuddlefish Ultra Snag-em", "lmelee", 200, {"src": "12 Days of CutieMAS", "dmg": "1d6", "rof": 2, "hands": 1, "conceal": true, "exotic": true, "special": "Attacchi in mischia fino a 10 m · Colpo mirato a un oggetto in mano a −6 invece di −8: non serve fare danni e l'oggetto finisce in mano tua · Non si installa nel cyberware · Vestitini da collezione a 20 o 50 eb", "desc": "Peluche dell'eroe di un anime per bambini: stringilo e spara una catena d'acciaio adesiva."}),
    W("c-fisherkitty", "Hello Cutie Fisher Kitty", "hpistol", 500, {"src": "12 Days of CutieMAS", "skill": "archery", "dmg": "2d6", "mag": 4, "rof": 2, "hands": 1, "conceal": true, "exotic": true, "noCrit": true, "special": "Al massimo 50 m · I mini-arpioni restano attaccati anche senza fare danni (un'Azione per toglierne uno) · Niente Critical Injury · Con un'Azione li elettrifichi: 2d6 diretti agli HP a chi ne ha 2, 3d6 a chi ne ha 3 o più · Incompatibile con gli accessori del caricatore", "desc": "Lancia-arpioni anti-blindato riciclato in un guscio a forma di gatto."}),
    W("c-gungun", "Hello Cutie Gun-Gun Friend-Friend", "ar", 1000, {"src": "12 Days of CutieMAS", "dmg": "5d6", "mag": 25, "rof": 1, "hands": 2, "auto": 4, "quality": "excellent", "special": "Autofire (4) · Fuoco di soppressione · 2 slot accessori · Con un'Azione monti nel telaio un'arma a distanza a una mano: si occulta senza prove, si estrae senza Azione e, estratta, il grilletto spara quella", "desc": "Replica funzionante del protagonista di un anime sportivo."}),
    W("c-hypurr", "Hello Cutie Hypurr-Hammer", "vhmelee", 1000, {"src": "12 Days of CutieMAS", "dmg": "4d6", "rof": 1, "hands": 2, "special": "Non dimezza la SP · Con BODY 9 o più fa 5d6 e, quando causa una Critical Injury, tiri due volte e scegli · Con BODY 8 o meno ti insulta dopo ogni attacco", "desc": "Martello gigante con un nucleo scorrevole ultra-denso, in quattro razze di gatto."}),
    W("c-janushex", "Hello Cutie Janus Hex", "vhpistol", 500, {"src": "12 Days of CutieMAS", "dmg": "1d6", "mag": 2, "rof": 1, "hands": 1, "conceal": true, "quality": "excellent", "special": "Solo Heavy Scent Ball (4 per 20 eb): chi ha occhi di carne fa Resist Torture/Drugs VD 15, o ha −3 a colpire e alle Perception visive per un'ora (−1 se lo supera) · 2 slot accessori · Incompatibile con gli accessori del caricatore", "desc": "Pistola da idol per tenere a bada i fan che salgono sul palco."}),
    W("c-modball", "Hello Cutie ModBall Gun", "mpistol", 500, {"src": "12 Days of CutieMAS", "mag": 5, "rof": 2, "hands": 1, "conceal": true, "special": "Solo munizioni ModBall, fino a 5 tipi caricati insieme: Dazzle Dazzle (flashbang su un bersaglio, 10 eb), Mega Ouchie (biotossina, 20 eb), Ouchie (veleno, 10 eb), Slippy (lubrificante, 5 eb), Splashie (vernice infiammabile, 5 eb) · Col kit ModBall (100 eb) chiunque le fabbrica · 1 slot accessori", "desc": "Revolver da paintball aziendale con munizioni a effetti."}),
    W("c-ocelot", "Hello Cutie My Friend The Ocelot", "shotgun", 1500, {"src": "12 Days of CutieMAS", "dmg": "5d6", "mag": 12, "rof": 1, "hands": 2, "auto": 4, "autoRange": "smg", "quality": "excellent", "special": "Solo Slug · Autofire (4) con la tabella degli SMG, consuma 4 slug invece di 10 · Fuoco di soppressione · Si ricarica solo accarezzandolo con la chiave biometrica (un'Azione) · 1 slot accessori", "desc": "Fucile da difesa domestica ricoperto di Realskinn a macchie d'ocelot. Fa le fusa."}),
    W("c-thundercat", "Hello Cutie Thundercat Bat", "mmelee", 750, {"src": "12 Days of CutieMAS", "dmg": "2d6", "rof": 2, "hands": 2, "quality": "excellent", "special": "Stun Baton a due mani · Chi viene colpito fa Resist Torture/Drugs VD 15, o subisce Orecchio Danneggiato senza danni bonus (anche tu, se non hai protezioni per le orecchie)", "desc": "Manganello stordente a forma di mazza da baseball, con altoparlante sonico."}),
    W("r-thermaldagger", "Centurion Essentials Thermal Dagger", "mmelee", 1000, {"src": "12 Days of REDMAS", "dmg": "2d6", "rof": 2, "hands": 1, "conceal": true, "exotic": true, "quality": "excellent", "special": "Chi viene colpito è Strongly On Fire · Nome inciso sulla lama: +10 eb", "desc": "Pugnale termico: il segreto per tagliare la plastica dura è un coltello caldo."}),
    W("r-natpistol", "Nat's Long-Barreled Pistol", "vhpistol", 500, {"src": "12 Days of REDMAS", "dmg": "4d6", "mag": 8, "rof": 1, "hands": 1, "quality": "excellent", "range": "lbpistol", "special": "Tabella delle distanze Long Barrel Pistol · 3 slot accessori", "desc": "Versione a canna lunga di una pistola classica, regalo di un Nomade."}),
    W("r-etack", "Pursuit Security E-TACK Rapid Responder", "mpistol", 500, {"src": "12 Days of REDMAS", "dmg": "2d6", "mag": 18, "rof": 2, "hands": 1, "conceal": true, "quality": "poor", "special": "Caricatore esteso installato · Stun Bayonet non rimovibile · Raffica: 3 colpi a pressione, danno da Heavy Pistol (3d6) e munizioni trattate come Armor-Piercing; si disattiva con meno di 3 colpi · 1 slot accessori", "desc": "Pistola leggera e facile da nascondere: quando contano i secondi, non affidarti a un solo proiettile."}),
    { ...A("a-lightmetalgear", "Light Metalgear", 16, -3, 1000, "Metalgear segmentata e più leggera: SP 16, −3 a REF, DEX e MOVE."), ...{"src": "12 Days of REDMAS"} },
    { ...A("a-esporma", "Esporma Environment Suit", 8, 0, 5000, "Tuta stagna armata: copre sempre testa e corpo (SP 8 ciascuno) e si ripara insieme. Protegge dalle radiazioni, ha ossigeno per 30 minuti (un'ora per ricaricarlo dall'aria) e ogni ora senza perdere SP ne recupera 1."), ...{"src": "12 Days of GEARMAS", "both": true} },
    // droghe da strada: durata, effetto primario, VD di Resist Torture/Drugs, effetto secondario se la prova fallisce
    { id: "h-berserker", type: "drug", name: "Berserker", cost: 100, dur: "10 minuti", primary: "Le Critical Injury non fanno danni bonus. Le penalità a STAT e Azioni da Seriously o Mortally Wounded e da Facedown perso sono dimezzate. Diventi molto aggressivo.", dv: 17, secondary: "2 di perdita d'umanità. Dipendenza: finché dura, il Death Save base sale di 1.", src: "Hornet's Pharmacy" },
    { id: "h-primetime", type: "drug", name: "Prime Time", cost: 50, dur: "4 ore", primary: "Perdi 4d6 di umanità, che tornano alla fine dell'effetto (non scendi sotto 0). +2 a COOL e WILL, senza aumentare gli HP. Emozioni represse.", dv: 17, secondary: "1 di perdita d'umanità. Dipendenza: −2 a COOL quando non sei sotto effetto.", src: "Hornet's Pharmacy" },
    { id: "h-sixgun", type: "drug", name: "Sixgun", cost: 100, dur: "4 ore", primary: "−2 a MOVE e REF (minimo 1). +2 alla Velocità nella NET. I Jack Out non sicuri non causati da programmi contano come sicuri. Una volta per turno puoi perdere 1 di umanità per una NET Action in più.", dv: 17, secondary: "Dipendenza: −2 alla Velocità nella NET quando non sei sotto effetto.", src: "Hornet's Pharmacy" },
    { id: "h-timewarp", type: "drug", name: "Timewarp", cost: 100, dur: "1 minuto", primary: "+3 ai tiri d'iniziativa; se sei già in combattimento, la tua iniziativa attuale sale di 3.", dv: 17, secondary: "Dipendenza: −2 ai tiri d'iniziativa quando non sei sotto effetto.", mod: {"target": "init", "v": 3}, src: "Hornet's Pharmacy" },
    G("h-delaying", "Delaying Compound", 50, "Mescolato con un'Azione a una fiala di veleno o biotossina, ne ritarda l'effetto di un minuto o di un'ora. Più dosi non si sommano.", {"label": "Composto per veleni", "src": "Hornet's Pharmacy"}),
    G("h-distilling", "Distilling Compound", 100, "Mescolato con un'Azione a una fiala di veleno o biotossina, alza di 2 la VD di Resist Torture/Drugs. Più dosi non si sommano.", {"label": "Composto per veleni", "src": "Hornet's Pharmacy"}),
    G("h-osmosis", "Osmosis Compound", 50, "Mescolato con un'Azione a una fiala di veleno o biotossina, la fa passare dalla pelle: la spalmi su una superficie fino a 60 × 60 cm e colpisce il primo che la tocca. Dura un'ora, si lava con l'acqua; notarla: Perception VD 17.", {"label": "Composto per veleni", "src": "Hornet's Pharmacy"}),
    G("h-sedative", "Sedative", 0, "Farmaceutico del Medtech (Medical Tech, specialità Farmaceutica). Su un bersaglio consenziente: dorme 4 ore e la Surgery su di lui ha +2. Su uno non consenziente: Resist Torture/Drugs VD 15 o privo di sensi per un minuto, o finché non subisce danni o qualcuno lo sveglia.", {"label": "Farmaco (Medtech)", "src": "Hornet's Pharmacy"}),
    G("h-veritas", "Veritas", 0, "Farmaceutico del Medtech (Medical Tech, specialità Farmaceutica). Resist Torture/Drugs VD 17 o per 10 minuti è confuso e suggestionabile: −5 ad Acting, Concentration, Conversation, Deduction, Human Perception e Persuasion.", {"label": "Farmaco (Medtech)", "src": "Hornet's Pharmacy"}),
    G("h-suzumebachi", "Suzumebachi Assassin Drone", 5000, "Drone volante a forma d'insetto, grande come un tascabile: attacca chi corrisponde a un volto caricato finché non è freddo all'infrarosso o finisce le munizioni, poi scappa. MOVE 6, SP 7, 10 HP; disattivarlo: Electronic/Security Tech VD 17, 5 minuti. Camera con visione notturna, IR e UV, Dartgun con 8 frecce alla biotossina, Airhypo. Portata: il perimetro dell'edificio, o 50 m da un'Architettura portatile.", {"label": "Drone", "src": "Hornet's Pharmacy"}),
    G("h-airhypobayonet", "Airhypo Bayonet", 100, "Per armi a distanza non esotiche con Shoulder Arms. Invece dei danni, se colpisci in mischia inietti la dose caricata (una sola sostanza; ricaricare è un'Azione). Se manchi, la dose non si perde.", {"label": "Accessorio per armi", "src": "Hornet's Pharmacy"}),
    G("h-grapplebarrel", "Grapple Gun Underbarrel", 100, "Per balestre non esotiche e armi a distanza non esotiche con Shoulder Arms: l'arma si usa anche come Grapple Gun, ma intanto non può attaccare.", {"label": "Accessorio per armi", "src": "Hornet's Pharmacy"}),
    G("h-silencer", "Silencer", 100, "Per armi a distanza non esotiche e non esplosive, esclusi archi e balestre: per sentire lo sparo serve una Perception con VD decisa dal GM (arma, distanza, rumore). L'impatto si nota comunque.", {"label": "Accessorio per armi", "src": "Hornet's Pharmacy"}),
    G("r-stunbayonet", "Stun Bayonet", 100, "Per armi a distanza non esotiche con Shoulder Arms: l'arma si usa anche come Stun Baton.", {"label": "Accessorio per armi", "src": "12 Days of REDMAS"}),
    G("c-ravegrenade", "Hello Cutie Chromatic Rave Grenade", 50, "Granata (Athletics), non va nel lanciagranate. Si attacca dove cade e per 2 round fa musica e luci (anche da un Memory Chip): chi inizia il turno in un'area di 10 × 10 m fa Concentration VD 13 o ha −2 a tutto fino a fine turno. Al terzo round esplode come una Smoke Grenade piena di glitter (il chip si distrugge).", {"label": "Granata", "src": "12 Days of CutieMAS"}),
    G("r-hdshield", "High-Density Bulletproof Shield", 200, "Scudo antiproiettile da 15 HP. Non va in un Pop-up Shield.", {"label": "Scudo", "src": "12 Days of REDMAS"}),
    G("g-packshield", "SkidRow PackShield", 100, "Zaino da Businesswear che si apre in uno scudo antiproiettile da 10 HP: protegge solo impugnato, sulle spalle è un carryall. Non va in un Pop-up Shield.", {"label": "Scudo", "src": "12 Days of GEARMAS"}),
    G("c-underjack", "Húsafell Hydraulic Underjack", 1000, "Maglia con supporti idraulici: indossata dà +2 al BODY (massimo 10), senza aumentare HP né Death Save. Non si somma con altri aumenti del BODY (Grafted Muscle and Bone Lace, Linear Frame…).", {"label": "Indossabile", "src": "12 Days of CutieMAS", "bonus": [{"target": "STAT:BODY", "v": 2, "name": "Húsafell Underjack (indossata, BODY max 10)"}]}),
    G("r-cyberdudeglove", "CyberDude Smart Glove", 750, "Guanto senza dita con Subdermal Grip e 2 slot per opzioni del Cyberbraccio o dei Cyberarti (stesso costo d'installazione). Metterlo o toglierlo è un'Azione; intanto le opzioni della mano sotto, tranne quelle nelle dita, non si usano. Non si occulta.", {"label": "Indossabile", "src": "12 Days of REDMAS"}),
    G("g-xtradexglove", "Dynalar Xtra-Dex Smart Glove", 1000, "Guanto con 2 slot per opzioni del Cyberbraccio o dei Cyberarti, che conta come una Modular Finger Cyberhand per un massimo di 5 cyberdita; funziona collegato con gli Interface Plugs. Metterlo o toglierlo è un'Azione; intanto le opzioni del braccio sotto non si usano. Non si occulta.", {"label": "Indossabile", "src": "12 Days of GEARMAS"}),
    G("r-smartears", "Smart Ears", 1000, "Orecchie esterne stampate su misura con Radio Scanner/Music Player non rimovibile e 2 slot per opzioni del Cyberudito (un'ora per cambiarle). Una sola coppia alla volta.", {"label": "Indossabile", "src": "12 Days of REDMAS"}),
    G("r-cyberconductor", "Zetatech CyberConductor", 1000, "Ospita fino a 3 cyberdeck (un'ora per montarne uno). Nella NET, con una Meat Action passi da uno all'altro: tutti i programmi attivi si derezzano e subisci 3 danni diretti agli HP. I deck non condividono programmi né hardware.", {"label": "Netrunning", "src": "12 Days of REDMAS"}),
    G("g-cyberscanner", "Cyberscanner", 1000, "Bacchetta che in un minuto, a 2 m, legge il cyberware installato di chi resta fermo. Con un solo impianto Hardened, potenziato o sconosciuto dà errore.", {"label": "Attrezzo", "src": "12 Days of GEARMAS"}),
    G("g-smartsticks", "DPI Smartsticks", 500, "Bacchette elettroniche: +1 a Play Instrument (Drums). Non si somma con altri strumenti che danno bonus.", {"label": "Attrezzo", "src": "12 Days of GEARMAS", "bonus": [{"target": "skill:instrument", "v": 1, "name": "DPI Smartsticks (Drums)"}]}),
    G("g-cybercam", "Cybercam EX-1", 1000, "Videocamera professionale da testa: le storie del Media pubblicate in diretta con l'EX-1 hanno +1 di credibilità, sommabile con le prove verificabili.", {"label": "Attrezzo", "src": "12 Days of GEARMAS"}),
    G("g-sniffer", "Hammered Industries Green Light Go Sniffer", 100, "Con un'Azione analizza una dose di farmaco o droga: luce verde se è pura, rossa se è stata tagliata. Non dice cos'è.", {"label": "Attrezzo", "src": "12 Days of GEARMAS"}),
    G("g-ioncuffs", "Ion Cuffs", 500, "Manette: le opzioni non Hardened di un cyberarto non Hardened ammanettato smettono di funzionare finché non le togli. Con BODY 13 o più si spezzano facilmente.", {"label": "Attrezzo", "src": "12 Days of GEARMAS"}),
    G("g-mastertoolkit", "Master Mechanic's Tool Kit", 20000, "+4 a Basic Tech, Cybertech, Land, Sea e Air Vehicle Tech, Electronics/Security Tech e Weaponstech per gli usi da Maker. È una copertura di acciaio spesso e la sposta solo chi ha BODY 10 o più.", {"label": "Attrezzo", "src": "12 Days of GEARMAS"}),
    G("g-minimag", "MiniMag Speakers by Telectronics", 50, "Altoparlanti magnetici da 2,5 cm, collegati senza fili all'Agent entro 100 m, in vari colori.", {"label": "Attrezzo", "src": "12 Days of GEARMAS"}),
    G("g-magviewer", "Optitech MagViewer", 500, "Binocolo fino a 800 m. Una Complementary Skill Check riuscita con il MagViewer per un colpo singolo o mirato oltre 51 m dà +1 in più. Non si somma con Sniping Scope o TeleOttica.", {"label": "Attrezzo", "src": "12 Days of GEARMAS"}),
    G("g-metrocar", "Zonda Metrocar", 1000, "Compact Groundcar da due posti: SDP 25, velocità di combattimento MOVE 10, narrativa 48 km/h. Nomad Access 1. Incompatibile con Heavy Chassis e Seating Upgrade; con l'AV Engine Upgrade vola alla stessa velocità; la velocità non si potenzia.", {"label": "Veicolo", "src": "12 Days of GEARMAS", "gcat": "veicoli"}),
    { id: "d-kiramaadv", type: "deck", name: "Kirama Advanced Deck", slots: 5, cost: 500, special: "5 slot per programmi o hardware · Ogni Jack Out non sicuro conta come sicuro", desc: "Il top di Kirama: per andare oltre serve un deck su misura o un'altra marca.", src: "Midnight with the Upload" },
    { id: "d-kiramaentry", type: "deck", name: "Kirama Entry Deck", slots: 5, cost: 100, special: "5 slot solo per programmi · Al massimo un Attacker, un Defender, un Booster e un Black ICE · Ogni Jack Out non sicuro conta come sicuro", desc: "La scelta sicura con pochi soldi, o la trappola da cui molti principianti non escono più.", src: "Midnight with the Upload" },
    { id: "d-kiramatrain", type: "deck", name: "Kirama Training Deck", slots: 5, cost: 20, special: "5 slot solo per programmi · Per collegarti e restare collegato devi stare entro 2 m dall'Access Point · Il danno diretto al cervello raddoppia", desc: "Il primo cyberdeck di ogni Netrunner, e per molti anche l'ultimo.", src: "Midnight with the Upload" },
    { id: "d-mtassault", type: "deck", name: "Microtech Assault", slots: 9, cost: 500, special: "4 slot solo per programmi (solo Black ICE) + 5 slot solo per hardware", desc: "Se accetti i suoi limiti è un paradiso, non una prigione.", src: "Midnight with the Upload" },
    { id: "d-mtscout", type: "deck", name: "Microtech Scout", slots: 5, cost: 500, special: "5 slot per programmi o hardware · Appena fai Jack In usi Pathfinder una volta senza NET Action", desc: "Molto usato come deck di scorta.", src: "Midnight with the Upload" },
    { id: "d-mtwarrior", type: "deck", name: "Microtech Warrior", slots: 7, cost: 1000, special: "7 slot solo per programmi · Appena fai Jack In attivi un programma Armor senza NET Action", desc: "Iperaggressivo: dritto all'uccisione e poi fuori.", src: "Midnight with the Upload" },
    { id: "d-hummingbird", type: "deck", name: "Raven Microcyb Hummingbird", slots: 2, cost: 1000, special: "2 slot solo per hardware · Una NET Action in più ogni turno", desc: "Per chi vuole contare solo sulle proprie capacità.", src: "Midnight with the Upload" },
    { id: "d-kestrel", type: "deck", name: "Raven Microcyb Kestrel 2", slots: 7, cost: 1000, special: "7 slot solo per programmi · Appena fai Jack In attivi fino a 2 Speedy Gonzalvez senza NET Action", desc: "Uno dei più venduti di Raven: ai Netrunner piace andare veloci.", src: "Midnight with the Upload" },
    { id: "d-phoenix", type: "deck", name: "Raven Microcyb Phoenix", slots: 6, cost: 1000, special: "6 slot per programmi o hardware · Con un Jack Out sicuro i programmi distrutti durante la Netrun tornano funzionanti", desc: "Costa come un deck su misura, ma risparmi sui Black ICE distrutti.", src: "Midnight with the Upload" },
    { id: "d-kerberos", type: "deck", name: "SGI Technologies Kerberos", slots: 11, cost: 1000, special: "6 slot solo per programmi (solo Black ICE Cerbero/Hellhound) + 5 slot solo per hardware", desc: "Potenza pura: trascina i nemici all'inferno.", src: "Midnight with the Upload" },
    { id: "d-verdant", type: "deck", name: "SGI Technologies Verdant Knight", slots: 9, cost: 500, special: "9 slot solo per programmi, e solo Sword e Shield", desc: "Semplice, contro le Architetture piene di Black ICE anti-programma.", src: "Midnight with the Upload" },
    { id: "d-warlock", type: "deck", name: "SGI Technologies Warlock's Book", slots: 9, cost: 500, special: "9 slot per programmi o hardware · Niente Attacker né Black ICE", desc: "Se devi solo scivolare tra le Architetture, non serve altro.", src: "Midnight with the Upload" },
    { id: "d-kaliya", type: "deck", name: "Zetatech Kaliya", slots: 9, cost: 500, special: "3 slot solo per Flak + 6 slot per programmi o hardware · Nessun Defender tranne Flak, nessun Black ICE tranne Asp", desc: "Economico, a forma di serpente segmentato.", src: "Midnight with the Upload" },
    { id: "d-micromate", type: "deck", name: "Zetatech MicroMate", slots: 9, cost: 500, special: "9 slot per programmi o hardware · Niente Defender · Il danno diretto al cervello raddoppia", desc: "Portatile: si dice che per farlo così piccolo abbiano tolto delle sicurezze.", src: "Midnight with the Upload" },
    { id: "d-parraline", type: "deck", name: "Zetatech Parraline 6000", slots: 9, cost: 500, special: "3 slot solo per programmi + 6 slot solo per hardware", desc: "Il deck di punta di Zetatech, per chi è fissato con l'hardware.", src: "Midnight with the Upload" },
  ];

  let HB = [];
  const setHomebrew = rec => { HB = ((rec && rec.items) || []).map(x => ({ ...x, custom: true })); };
  const all = () => { const ids = new Set(HB.map(x => x.id)); return [...BASE.filter(x => !ids.has(x.id)), ...HB]; };
  const byId = id => all().find(x => x.id === id) || null;

  // statistiche complete di un'arma (quelle mancanti dalla categoria)
  const weaponStats = it => {
    const T = (window.CPR && CPR.weaponType(it.cat)) || {};
    return { skill: it.skill || T.skill || "handgun", dmg: it.dmg || T.dmg || "", rof: it.rof || T.rof || 1, mag: it.mag ?? T.mag ?? "", auto: it.auto ?? T.auto ?? 0, hands: it.hands || 1 };
  };
  const qualityLabel = q => (QUALITY.find(x => x[0] === q) || [, ""])[1];
  // l'arma come va nella scheda (tab Combattimento)
  const toSheetWeapon = it => {
    const s = weaponStats(it), T = (window.CPR && CPR.weaponType(it.cat)) || {};
    const note = [it.quality && it.quality !== "standard" ? qualityLabel(it.quality) : "", it.exotic ? "Exotic" : "", it.special].filter(Boolean).join(" · ");
    return { cat: it.cat || "", name: it.name, skill: s.skill, dmg: s.dmg, rof: s.rof, mag: s.mag === "" ? "" : String(s.mag), ...(it.auto != null && it.auto !== T.auto ? { auto: it.auto } : {}),
      ...(it.quality && it.quality !== "standard" ? { quality: it.quality } : {}), ...(it.range ? { range: it.range } : {}), ...(it.autoRange ? { autoRange: it.autoRange } : {}), note, market: it.id };
  };

  // ---------- formato a blocchi ----------
  // ## Nome            (anche «▶ Nome»)
  // Tipo: Arma | Armatura | Equipaggiamento | Cyberware
  // Chiave: valore     (una per riga; le righe senza chiave continuano il campo precedente)
  const KEYS = {
    type: ["tipo", "type"], cat: ["categoria", "category", "classe"], group: ["gruppo", "group"], skill: ["abilita", "skill", "weapon skill"],
    dmg: ["danno", "damage", "single shot damage"], mag: ["caricatore", "magazine", "standard magazine", "mag"], rof: ["rof", "rate of fire", "cadenza"],
    hands: ["mani", "hands", "hands required"], conceal: ["occultabile", "concealable", "can be concealed", "nascondibile"],
    cost: ["costo", "cost", "prezzo", "price"], quality: ["qualita", "quality"], auto: ["autofire"],
    special: ["speciale", "special", "special features", "alt. fire modes & special features", "funzioni speciali"],
    desc: ["descrizione", "description", "desc"], sp: ["sp", "stopping power"], pen: ["malus", "penalty", "penalita"],
    inst: ["installazione", "install", "installation"], pu: ["pu", "humanity loss", "perdita di umanita", "hl"],
    slots: ["slot", "slots"], req: ["richiede", "requires", "requisiti"], src: ["fonte", "source"], qty: ["quantita", "qty"],
    dur: ["durata", "duration", "lasts"], primary: ["effetto primario", "primary effect", "primario"], secondary: ["effetto secondario", "secondary effect", "secondario"],
    dv: ["vd", "dv", "secondary effect dv"], rules: ["regole", "regole del deck"],
  };
  const KEY_OF = {}; Object.entries(KEYS).forEach(([k, l]) => l.forEach(a => { KEY_OF[a] = k; }));
  const TYPE_OF = { arma: "weapon", armi: "weapon", weapon: "weapon", armatura: "armor", armor: "armor", armour: "armor",
    equipaggiamento: "gear", equip: "gear", gear: "gear", oggetto: "gear", item: "gear", cyberware: "cyber", cyber: "cyber", impianto: "cyber",
    droga: "drug", drug: "drug", "street drug": "drug", "droga da strada": "drug", cyberdeck: "deck", deck: "deck" };
  const yes = v => /^(si|sì|yes|y|true|1|x)$/i.test(String(v).trim());
  const findCat = v => {
    const n = norm(v).replace(/\(.*?\)/g, "").trim(); if (!n || !window.CPR) return "";
    const T = CPR.WEAPON_TYPES.find(t => t.id === n || norm(t.label) === n) || CPR.WEAPON_TYPES.find(t => n.includes(norm(t.label)));
    return T ? T.id : CPR.guessWeapon(n, "");
  };
  const findSkill = v => { const n = norm(v); if (!n || !window.CPR) return ""; const k = CPR.SKILLS.find(s => s.id === n || norm(s.label) === n || norm(s.label).replace(/[^a-z]/g, "") === n.replace(/[^a-z]/g, "")); return k ? k.id : ""; };
  const GROUP_ALIAS = { cyberoptics: "optics", cyberocchio: "optics", ottiche: "optics", cyberaudio: "audio", internal: "internal", interni: "internal", "impianti interni": "internal",
    external: "external", esterni: "external", "impianti esterni": "external", cyberarm: "arm", cyberbraccio: "arm", cyberleg: "leg", cybergamba: "leg", cyberlimbs: "limbcover", coperture: "limbcover" };
  const findGroup = v => {
    const n = norm(v); if (!n || !window.CW) return "";
    const g = CW.GROUPS.find(x => x.id === n || norm(x.label) === n) || CW.GROUPS.find(x => norm(x.label).startsWith(n) || n.startsWith(norm(x.label).split(" ")[0]));
    return g ? g.id : (GROUP_ALIAS[n] || "");
  };
  const slug = s => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

  function parse(text) {
    const blocks = [], lines = String(text || "").replace(/\r/g, "").split("\n");
    let cur = null, last = null;
    lines.forEach((raw, i) => {
      const line = raw.trim();
      const head = line.match(/^(?:#{1,3}|▶|►|>)\s*(.+)$/);
      if (head) { cur = { name: head[1].trim(), f: {}, line: i + 1 }; blocks.push(cur); last = null; return; }
      if (!cur || !line) { if (!line) last = last === "desc" ? "desc" : null; return; }
      const m = line.match(/^([A-Za-zÀ-ÿ.&' ]{2,40}):\s*(.*)$/);
      const k = m && KEY_OF[norm(m[1])];
      if (k) { cur.f[k] = m[2].trim(); last = k; return; }
      // riga senza chiave: continua il campo precedente (o la descrizione)
      const into = last && ["desc", "special"].includes(last) ? last : "desc";
      cur.f[into] = [cur.f[into], line].filter(Boolean).join(" "); last = into;
    });
    const items = [], errors = [];
    blocks.forEach(b => {
      const f = b.f, err = msg => errors.push(`${b.name} (riga ${b.line}): ${msg}`);
      const type = TYPE_OF[norm(f.type)] || (f.sp ? "armor" : f.primary ? "drug" : f.pu || f.group ? "cyber" : f.dmg || f.cat ? "weapon" : "");
      if (!type) return err("manca «Tipo:» (Arma, Armatura, Equipaggiamento o Cyberware)");
      const cost = num(f.cost); if (!f.cost) err("manca «Costo:», messo a 0");
      const base = { name: b.name, cost, desc: f.desc || "", ...(f.src ? { src: f.src } : {}) };
      if (type === "weapon") {
        const qWords = norm(f.quality);
        const cat = findCat(f.cat || b.name); if (!cat) return err(`categoria dell'arma non riconosciuta («${f.cat || ""}»): usa ad es. Heavy Pistol, SMG, Assault Rifle, Medium Melee Weapon`);
        const dmg = (f.dmg || "").replace(/\s+/g, "");
        if (dmg && !/^n\/?a$/i.test(dmg) && window.CPR && !CPR.parse(dmg)) return err(`danno non valido («${f.dmg}»)`);
        const autoM = (f.auto || f.special || "").match(/autofire\s*\(?\s*(\d+)/i) || (f.auto ? [0, f.auto] : null);
        items.push({ ...base, type, id: "mk-" + slug(b.name), cat, ...(findSkill(f.skill) ? { skill: findSkill(f.skill) } : {}),
          ...(dmg && !/^n\/?a$/i.test(dmg) ? { dmg } : {}), ...(num(f.mag) ? { mag: num(f.mag) } : {}), ...(num(f.rof) ? { rof: num(f.rof) } : {}),
          ...(num(f.hands) ? { hands: num(f.hands) } : {}), ...(f.conceal ? { conceal: yes(f.conceal) } : {}),
          ...(autoM && num(autoM[1]) ? { auto: num(autoM[1]) } : {}),
          ...(/poor/.test(qWords) ? { quality: "poor" } : /excellent|eccellente|high/.test(qWords) ? { quality: "excellent" } : {}),
          ...(/exotic|esotic/.test(qWords) || /exotic/i.test(f.cat || "") ? { exotic: true } : {}), ...(f.special ? { special: f.special } : {}) });
      } else if (type === "armor") {
        if (!num(f.sp)) return err("manca «SP:»");
        items.push({ ...base, type, id: "mk-" + slug(b.name), sp: num(f.sp), pen: -Math.abs(num(f.pen)) });
      } else if (type === "drug") {
        items.push({ ...base, type, id: "mk-" + slug(b.name), dur: f.dur || "", primary: f.primary || f.desc || "", dv: num(f.dv) || 15, secondary: f.secondary || "" });
      } else if (type === "deck") {
        if (!num(f.slots)) return err("manca «Slot:»");
        items.push({ ...base, type, id: "mk-" + slug(b.name), slots: num(f.slots), special: f.rules || f.special || "" });
      } else if (type === "gear") {
        items.push({ ...base, type, id: "mk-" + slug(b.name), gcat: /veicol|vehicle/.test(norm(f.cat)) ? "veicoli" : "equip", ...(f.cat ? { label: f.cat } : {}) });
      } else {
        const g = findGroup(f.group || f.cat); if (!g) return err(`gruppo del cyberware non riconosciuto («${f.group || f.cat || ""}»): usa ad es. Neuralware, Cyberottiche, Impianti Interni`);
        const pu = String(f.pu || "");
        const dice = (pu.match(/\d+d\d+(?:\/2)?/i) || [""])[0], avg = pu.match(/\((\d+)\)/) ? num(pu.match(/\((\d+)\)/)[1]) : dice ? 0 : num(pu);
        const avgOf = d => { const m = d.match(/(\d+)d(\d+)/); if (!m) return 0; const a = +m[1] * (+m[2] + 1) / 2; return Math.ceil(/\/2$/.test(d) ? a / 2 : a); };
        items.push({ ...base, type, id: "cw-" + slug(b.name), g, inst: f.inst || "Clinica", cat: priceCat(cost), pu: avg || avgOf(dice), dice: dice || "N/A",
          slots: f.slots === "" || f.slots == null ? 1 : num(f.slots), req: f.req || "", fx: [] });
      }
    });
    return { items, errors, blocks: blocks.length };
  }

  // la voce di nuovo nel formato a blocchi (per modificarla)
  function toText(it) {
    const L = [`## ${it.name}`];
    const add = (k, v) => { if (v !== "" && v != null && v !== false) L.push(`${k}: ${v}`); };
    if (it.type === "weapon") {
      const T = (window.CPR && CPR.weaponType(it.cat)) || {};
      add("Tipo", "Arma"); add("Categoria", T.label || it.cat); add("Abilità", it.skill && window.CPR ? (CPR.skill(it.skill) || {}).label : "");
      add("Danno", it.dmg); add("Caricatore", it.mag); add("ROF", it.rof); add("Mani", it.hands); add("Occultabile", it.conceal ? "sì" : it.conceal === false ? "no" : "");
      add("Autofire", it.auto); add("Qualità", [it.exotic ? "Exotic" : "", it.quality ? qualityLabel(it.quality) : ""].filter(Boolean).join(", ")); add("Speciale", it.special);
    } else if (it.type === "armor") { add("Tipo", "Armatura"); add("SP", it.sp); add("Malus", it.pen ? Math.abs(it.pen) : ""); }
    else if (it.type === "gear") { add("Tipo", "Equipaggiamento"); add("Categoria", it.label || (it.gcat === "veicoli" ? "Veicolo" : "")); }
    else if (it.type === "drug") { add("Tipo", "Droga"); add("Durata", it.dur); add("Effetto primario", it.primary); add("VD", it.dv); add("Effetto secondario", it.secondary); }
    else if (it.type === "deck") { add("Tipo", "Cyberdeck"); add("Slot", it.slots); add("Regole", it.special); }
    else {
      add("Tipo", "Cyberware"); add("Gruppo", window.CW ? (CW.GROUPS.find(g => g.id === it.g) || {}).label : it.g); add("Installazione", it.inst);
      add("PU", it.dice && it.dice !== "N/A" ? `${it.dice} (${it.pu})` : it.pu); add("Slot", it.slots); add("Richiede", it.req);
    }
    add("Costo", it.cost); add("Fonte", it.src); add("Descrizione", it.desc);
    return L.join("\n");
  }
  const TEMPLATE = `## Magnum Opus Hellbringer
Tipo: Arma
Categoria: Very Heavy Pistol
Abilità: Handgun
Danno: 5d6
Caricatore: 3
ROF: 1
Mani: 1
Occultabile: no
Qualità: Exotic
Costo: 1000
Speciale: Si inceppa dopo ogni colpo se BODY < 10 (un'Azione per sbloccarla)
Descrizione: Revolver enorme in titanio, tre colpi e niente elettronica.

## Giubbotto rinforzato
Tipo: Armatura
SP: 12
Malus: 2
Costo: 500
Descrizione: Giacca con piastre in ceramica.

## Kit da scasso
Tipo: Equipaggiamento
Costo: 100
Descrizione: Grimaldelli elettronici e meccanici.

## Occhio da cecchino
Tipo: Cyberware
Gruppo: Cyberottiche
Installazione: Clinica
PU: 1d6 (3)
Slot: 1
Richiede: Cyberocchio
Costo: 500
Descrizione: +1 ai tiri oltre i 50 m.`;

  return { PRICES, priceCat, TYPES, QUALITY, qualityLabel, BASE, all, byId, setHomebrew, weaponStats, toSheetWeapon, parse, toText, TEMPLATE, norm };
})();
