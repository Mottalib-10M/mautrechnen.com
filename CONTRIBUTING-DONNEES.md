# Données de Mautrechnen (de-maut-vignette)

Aucun prix n'est écrit dans une page : tout vient de quatre fichiers de `src/data/`, lus au build.

## 1. `params-2026.json` : vignettes, péages, tunnels (relevé à la main, daté)

- `retrieved_at` : date de lecture des grilles. `sources` : chaque clé = une page de l'exploitant (ASFINAG,
  BAZG, DARS, SFDI/edalnice, NÚSZ, NDS, APRR, Vinci, ATMB, SFTRF, GSB, Autostrade per l'Italia, A22, HAC,
  AZM, BINA-Istra, Ausol, AP-6, Sund & Bælt, Øresundsbron), avec son libellé de/en/nl.
- `vignetten` : produits, prix et date de fin de validité du tarif (`preise_bis`) par pays. Prix 2027 :
  champ absent tant que l'exploitant ne les a pas publiés ; la page dit « noch nicht veröffentlicht ».
- `streckenmaut`, `tunnel`, `barrieren`, `systeme` (paires d'entrée/sortie des systèmes fermés, lues sur la
  grille 2026 de l'exploitant), `italien_tarife` (tarif kilométrique TTC : montant italien = **estimation**).
- `kanten` : type de chaque arête payante du réseau ; `nv` = tronçon non vérifié, jamais chiffré (`nv_gruende`).
- Changer un tarif : modifier la valeur ET sa source, mettre à jour `retrieved_at`, lancer `npx vitest run`
  (les exemples officiels sont rejoués dans `src/lib/engine/engine.test.ts`).
- Licence : tarifs publiés par les exploitants, faits non protégés, cités avec leur source sur chaque page.

## 2. `sprit.json` : prix moyens nationaux du carburant (automatique)

Weekly Oil Bulletin de la Commission européenne (prix TTC, relevé du lundi, 18 pays, 26 semaines).
Réutilisation autorisée avec mention de la source (décision 2011/833/UE). Script : `python3 scripts/update-data.py`
(`--datei fichier.xlsx` pour rejouer un fichier local). Suisse : absente du bulletin, prix saisi par l'utilisateur.

## 3. `kurse.json` : cours de référence BCE (CHF, CZK, HUF, DKK)

Écrit par le même script (taux de référence de l'euro de la BCE, réutilisation libre avec mention de la source).

## 4. `netz.json` : réseau routier (généré)

`node scripts/build-net.mjs` lit `scripts/data/nodes.json` et `scripts/data/edges.txt`, interroge OSRM
(données OpenStreetMap, licence ODbL : « © les contributeurs d'OpenStreetMap », mention en pied de page) et
écrit distances et durées. Ajouter un lieu : un nœud + ses arêtes (troisième jeton = pays), puis le script.

## Mise à jour automatique

`.github/workflows/update-data.yml` : mardi et jeudi à 9:00 UTC (le bulletin paraît en général le mardi),
script, build et tests, commit des deux fichiers s'ils ont changé. Un téléchargement raté laisse les données
de la semaine précédente ; un test raté bloque le commit.
