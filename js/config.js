// ============================================================
//  CONFIGURAZIONE DEL SITO
// ============================================================
//  Lascia supabaseUrl e supabaseAnonKey VUOTI per la modalità
//  LOCALE: i dati restano solo nel browser di chi li inserisce
//  (comodo per provare, ma gli altri giocatori non li vedono).
//
//  Compilali per la modalità CLOUD (gratuita con Supabase):
//  tutti vedono lo stesso database, e solo chi fa login può
//  modificare. Istruzioni passo passo nel file README.md.
// ============================================================
window.SITE_CONFIG = {
  // Titolo di default (poi lo puoi cambiare dal sito, in ⚙ Impostazioni)
  title: "NIGHT CITY ARCHIVE",
  tagline: "Dossier, fazioni e colonna sonora della nostra campagna",

  // Esempio: "https://abcdefghijkl.supabase.co"
  supabaseUrl: "https://bygjuhuibbciifoijllu.supabase.co",
  // Supabase → Project Settings → API → "anon public" key
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5Z2p1aHVpYmJjaWlmb2lqbGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5MTIzMjIsImV4cCI6MjExMDQ4ODMyMn0.asl4yBNgnvwy91qANJn68vTtor44qkxjElQhl9P7jKw",
};
