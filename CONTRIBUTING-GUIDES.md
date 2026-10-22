# Écrire ou modifier une page (Mautrechnen)

Une page = un fichier `src/content/outils/<id>.ts` (modèle : `vignette-oesterreich.ts`). Le cœur du site (routes,
menus, pied de page, sitemap, hreflang, schémas JSON-LD, pages associées) lit ce fichier seul : rien d'autre à toucher.

## Le fichier

```ts
export default defineGuide({
  id: 'maut-italien',          // = nom du fichier
  group: 'maut',               // 'vignette' | 'maut' | 'sprit' | 'strecke' (menu)
  order: 20,
  tool: 'maut',                // calculateur en tête : 'reise' | 'maut' | 'vignette' | 'sprit'
  land: 'IT',                  // vignette, sprit : pays du calculateur
  laender: ['IT', 'AT'],       // maut : pays des lieux proposés dans les listes
  von: 'b_brenner', nach: 'rom', // maut : trajet par défaut ; reise : départ et arrivée par défaut
  related: ['…'],              // ids d'autres pages (une page absente dans la langue n'est pas listée)
  sources: ['aspiCalcolo', 'a22'], // clés de src/data/params-2026.json → sources
  de: { … }, en: { … }, nl: { … }, // en obligatoire ; de et nl là où ces lecteurs cherchent
});
```

Chaque langue : `slug`, `nav`, `card`, `title` (50 à 60 caractères, terme-clé en tête, année 2026, jamais un nom de
pays ni « Rechner », « Calculator », « Wie », « How » en premier mot), `description` (150 à 160 caractères), `h1`,
`intro` (une phrase), `resume(h)` (UN paragraphe de 120 mots au moins, sans retour à la ligne : bloc citable),
`faqs(h)` (3 à 5 questions, réponses de 40 à 90 mots, jamais une question déjà posée ailleurs sur le site, dans
aucune langue), `body(h)` (HTML : `<h2>`, `<p>`, `<ul>`, tableaux par `h.table`). Total visible (résumé + corps + FAQ)
: 500 mots au moins par langue.

## Les chiffres

Aucun prix écrit en dur : tout vient de `h.P` (params-2026.json, lu chez l'exploitant, daté) ou du moteur `h.M`
(`h.M.vignette`, `h.M.reise`, `h.M.maut`, `h.M.preis`…), formaté par `h.eur`, `h.l3` (prix au litre), `h.geld`
(devise), `h.num`, `h.date`. Un tronçon dont le prix n'a pas été lu (Sanef, concessions italiennes hors ASPI et A22)
se dit « nicht verifiziert / not verified / niet geverifieerd », sans montant. Le péage italien est une **estimation**
et se dit ainsi. Tarifs 2027 : « noch nicht veröffentlicht / not yet published / nog niet gepubliceerd ».

Les dates de référence : `h.today` (jour du build), `h.P.retrieved_at` (lecture des tarifs), `h.M.SPRIT_STAND`
(semaine du Weekly Oil Bulletin), `h.M.KURSE.stand` (cours BCE).

## Liens

Liens internes par `h.a('id', 'texte')`, sources par `h.src('clé')`. Aucun lien vers un revendeur de vignettes, un
club automobile, une application ou un autre site de l'éditeur. Le site ne se présente jamais comme l'ASFINAG, le
BAZG, la DARS ou un autre exploitant.

## Typographie

Allemand, anglais, néerlandais : **pas d'espace avant « : ; ? ! »**. Guillemets : „…“ en allemand, “…” en anglais,
‘…’ ou “…” en néerlandais. Pas de tiret cadratin. Nombres et dates toujours par les fonctions `h.*`.

## Contrôles

`npm run check` puis `python3 scripts/check-regles.py .`, `node scripts/check-contraste.mjs .`,
`node scripts/check-saisie.mjs . --max=60`, `node scripts/check-nombres.mjs .`, `python3 scripts/check-snippets.py dist`.
Tout à 0 avant un commit.
