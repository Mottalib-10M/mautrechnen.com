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
- Périodes : chaque tarif porte `preise_bis` (dernier jour de trajet couvert ; `null` = l'exploitant n'annonce
  pas de fin). Après cette date, le calculateur ne chiffre pas le poste et affiche « noch nicht veröffentlicht »
  (vignettes) ou le motif `tarif_offen` (péages), aller et retour comptés chacun à leur date.
- Nouveau tarif publié : l'ajouter dans le même objet sous `folge` = `{ "ab": "AAAA-MM-JJ", "preise_bis": …,
  "quelle": …, "preis" | "paare" | "produkte": … }` (résolu par `src/lib/engine/tarif.ts` selon la date du
  trajet), avec sa source dans `sources`, puis un test dans `engine.test.ts`.
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

## Échéances des tarifs

Vérifié le 2026-10-22 sur les seuls sites officiels (champ `tarife_geprueft`). « À paraître » = rien de publié
ce jour-là : le calculateur ne chiffre pas les trajets après la fin de validité.

| Poste | Tarif affiché | Fin de validité (dernier jour de trajet) | Tarif suivant au 2026-10-22 | Où regarder |
|---|---|---|---|---|
| Autriche, vignettes 1 jour, 10 jours, 2 mois (voiture, moto) | 9,60 / 12,80 / 32,00 € ; 3,80 / 5,10 / 12,80 € | 30/11/2026 | **À paraître** : pas de Vignettenpreisverordnung 2026 au BGBl (RIS), page ASFINAG « gültig ab 1. Dezember 2025 », Mautordnung VS 88 du 6/10/2026 (annexe 1) aux prix 2026 | ris.bka.gv.at (« Vignettenpreisverordnung », parue le 22/10/2025 l'an dernier) ; asfinag.at/maut-vignette/vignette/ |
| Autriche, vignette annuelle 2026 | 106,80 € / 42,70 € | 31/01/2027 (achat pour un début jusqu'au 30/11/2026) | **À paraître** : annuelle 2027 valable du 01/12/2026 au 31/01/2028, numérique seulement | idem |
| Autriche, Streckenmaut A9, A10 Tauern, A11 Karawanken, A13 Brenner, S16 Arlberg | 19 / 15 / 9 / 12,50 / 13 € | 31/12/2026 (« Tarife 2026, ab 1.1.2026 gültig ») | **À paraître** | asfinag.at/maut-vignette/streckenmaut/ ; Mautordnung (version suivant VS 88) |
| Felbertauernstraße | 13,50 € | aucune date sur la boutique officielle | à revérifier en janvier | shop.felbertauernstrasse.at |
| Großglockner | 46,50 € (36,50 € dès le 15/10/2026) | fermeture d'hiver début novembre 2026 | **À paraître** (saison 2027) | grossglockner.at |
| Suisse, vignette | 40 CHF (fixé par la loi) | sans échéance ; vignette 2027 du 01/12/2026 au 31/01/2028 au même prix | inchangé | bazg.admin.ch |
| Tunnel du Grand-Saint-Bernard | 33,50 € aller simple | « dès 01.02.2026 », pas de fin annoncée | à revérifier en février 2027 | letunnel.com |
| Slovénie, e-vignette | 16 / 32 / 117,50 € (2A) | 31/12/2026 (borne prudente : DARS ne publie pas de fin) | **À paraître** : aucune annonce DARS | evinjeta.dars.si/en/about-e-vignette |
| Tchéquie, e-vignette | 230 / 300 / 480 / 2 570 CZK | 31/12/2026 (« Price list valid from 1/1/2026 », prix indexés chaque année) | **À paraître** | edalnice.cz/en/price-list |
| Hongrie, e-matrica | 5 550 / 6 900 / 11 170 / 61 760 HUF (annuelle jusqu'au 31/01/2027) | 31/12/2026 | **À paraître** : aucune actualité NÚSZ sur 2027 | nemzetiutdij.hu (actualités) |
| Slovaquie, e-známka | 8,10 / 10,80 / 17,10 / 90 € | 31/12/2026 (borne prudente : prix fixés par la loi 488/2013, pas de date sur la page) | **À paraître** : aucune annonce NDS | eznamka.sk/en/evignettes/types-and-prices |
| France, APRR, ASF, Escota (Sanef non lu) | grilles « valables à partir du 1/02/2026 » | 31/01/2027 | **À paraître** (publication fin janvier) | voyage.aprr.fr ; vinci-autoroutes.com |
| Tunnels du Mont-Blanc et du Fréjus | 55,50 € aller simple, 69,20 € aller-retour | 31/12/2026 (« au 1er janvier 2026 ») | **À paraître** | atmb.com ; sftrf.fr |
| Italie, Autostrade per l'Italia et A22 (Brenner) | €/km « aggiornate al 1° gennaio 2026 » | 31/12/2026 | **À paraître** (publication fin décembre) | autostrade.it ; autobrennero.it |
| Croatie, HAC, AZM, Bina-Istra | grilles en ligne | aucune date de fin publiée (`null`) | à revérifier ; free-flow annoncé par la presse pour le 01/03/2027 (non vérifié) | hac.hr ; azm.hr ; bina-istra.com |
| Espagne, Ausol (AP-7) et AP-6 | « temporada 2026 », « T26 » | 31/12/2026 | **À paraître** | autopistadelsol.com ; autopistas.com |
| Danemark, Storebælt / Øresund | 235 / 470 DKK | 31/12/2026 (« prices effective from 1 January 2026 ») / pas de fin (« valid from Sept 14 2026 ») | **À paraître** / inchangé | storebaelt.dk ; oresundsbron.com |

Calendrier de relecture : 15 novembre et 1er décembre 2026 (Autriche), 20 décembre 2026 puis 2 janvier 2027
(CZ, HU, SK, SI, Streckenmaut, Italie, Espagne, tunnels, Storebælt), fin janvier 2027 (France).
