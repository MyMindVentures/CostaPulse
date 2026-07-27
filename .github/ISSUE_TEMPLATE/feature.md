---
name: Feature
about: Implementeer één afgebakende CostaPulse-feature
title: "[Feature] "
labels:
  - feature
  - needs-review
assignees: []
---

# [Feature] Duidelijke en uitvoerbare titel

## Context

Beschrijf kort:

- waarom deze wijziging nodig is;
- wie deze functionaliteit gebruikt;
- welk probleem ermee wordt opgelost;
- waar de functionaliteit zich in CostaPulse bevindt.

## Gewenst resultaat

Na voltooiing moet:

> Beschrijf hier in één concrete zin wat de gebruiker volledig moet kunnen doen.

---

## User Story

**Als** `[gebruikersrol]`  
**wil ik** `[actie of functionaliteit]`  
**zodat** `[gewenste waarde of uitkomst]`.

---

## Scope

### In scope

- 
- 
- 

### Buiten scope

- 
- 

Voeg geen functionaliteit toe die niet expliciet binnen deze issue staat.

---

## 1. Database, Tables & Relations

Inspecteer eerst het actuele Supabase-schema en de gegenereerde TypeScript-types.

### Bestaande tabellen

- `table_name`
- `related_table_name`

### Benodigde wijzigingen

- [ ] Geen databasewijzigingen
- [ ] Nieuwe tabel
- [ ] Nieuwe kolom
- [ ] Foreign key of relation
- [ ] Constraint
- [ ] Index
- [ ] View
- [ ] RPC
- [ ] Trigger
- [ ] RLS-policy
- [ ] Migration

### Specificatie

| Onderdeel | Specificatie |
|---|---|
| Tabel | `table_name` |
| Kolom | `column_name` |
| Type | `data_type` |
| Verplicht | Ja / Nee |
| Default | `default_value` |
| Relatie | `related_table.id` |
| Delete behavior | `CASCADE / RESTRICT / SET NULL` |

### Relationele regels

- 
- 
- 

Alle schemawijzigingen moeten via een Supabase migration worden uitgevoerd.

---

## 2. Storage & Relations

### Storage-impact

- [ ] Geen storagewijzigingen
- [ ] Bestaande bucket gebruiken
- [ ] Nieuwe bucket nodig
- [ ] Upload ondersteunen
- [ ] Media aanpassen
- [ ] Media verwijderen
- [ ] Volgorde beheren
- [ ] Primary media instellen

### Specificatie

| Onderdeel | Waarde |
|---|---|
| Bucket | `bucket_name` |
| Zichtbaarheid | Public / Private |
| Padstructuur | `entity-type/entity-id/filename.ext` |
| Databasekoppeling | `table.column` |
| Bestandstypes | `image/jpeg, image/png, image/webp` |
| Maximale grootte | `... MB` |

### Storage-regels

- Uploads moeten gekoppeld zijn aan een geldig database-record.
- Database en Storage moeten onderling consistent blijven.
- Vervangen van een bestand moet het oude object correct opruimen.
- Verwijderen moet zowel de storage-koppeling als relevante metadata afhandelen.
- Toegang moet via Storage policies worden afgedwongen.

---

## 3. Backend

### Backendverantwoordelijkheid

Beschrijf welke logica uitsluitend server-side mag worden uitgevoerd.

### Implementatie

- [ ] Bestaande backendfunctie gebruiken
- [ ] Server Action
- [ ] API-route
- [ ] Supabase RPC
- [ ] Supabase Edge Function
- [ ] Database trigger
- [ ] Webhook
- [ ] Geen nieuwe backendimplementatie

### Backendflow

```text
Request ontvangen
→ authenticatie controleren
→ capability controleren
→ input valideren
→ relaties en businessregels controleren
→ database- en/of storageactie uitvoeren
→ auditlog registreren
→ gestructureerd resultaat teruggeven
```

### Businessregels

- 
- 
- 

### Validatie

- [ ] Verplichte velden
- [ ] Datatypes en formaten
- [ ] Geldige relaties
- [ ] Duplicate prevention
- [ ] Statusovergangen
- [ ] Bestandsrestricties
- [ ] Ownership
- [ ] Role capability

### Foutafhandeling

Ondersteun duidelijke fouten voor:

- niet ingelogd;
- onvoldoende rechten;
- ongeldige invoer;
- record niet gevonden;
- duplicate of conflict;
- mislukte databaseactie;
- mislukte storageactie.

Privileged en multi-table workflows mogen niet rechtstreeks vanuit de browser worden uitgevoerd.

---

## 4. User Roles & Capabilities

Gebruik de bestaande CostaPulse-rollen, `profiles`, `user_roles`, RLS-policies en server-side capability checks.

| Rol | Bekijken | Aanmaken | Aanpassen | Verwijderen |
|---|---:|---:|---:|---:|
| Administrator | ✓ | ✓ | ✓ | ✓ |
| Content Manager |  |  |  |  |
| Operations Staff |  |  |  |  |
| Experience Provider |  |  |  |  |
| Customer |  |  |  |  |

### Vereiste capabilities

- `entity.read`
- `entity.create`
- `entity.update`
- `entity.delete`

### Autorisatieregels

- Rechten moeten server-side worden afgedwongen.
- RLS moet directe Supabase-requests beveiligen.
- Frontendchecks mogen uitsluitend voor de gebruikerservaring worden gebruikt.
- Verborgen knoppen gelden niet als beveiliging.
- Gevoelige acties moeten worden gelogd.

---

## 5. Navigation & Routing

### Betrokken routes

| Route | Functie | Toegang |
|---|---|---|
| `/admin/resource` | Overzicht | Relevante rollen |
| `/admin/resource/new` | Nieuw record | `entity.create` |
| `/admin/resource/[id]` | Detail | `entity.read` |
| `/admin/resource/[id]/edit` | Aanpassen | `entity.update` |

### Navigatiegedrag

- [ ] Navigatie-item toevoegen
- [ ] Bestaand navigatie-item aanpassen
- [ ] Role-aware visibility
- [ ] Route guard
- [ ] Breadcrumbs
- [ ] Active state
- [ ] Success redirect
- [ ] Unauthorized redirect
- [ ] Not-found state

### Redirects

| Situatie | Bestemming |
|---|---|
| Succesvol aangemaakt | `/admin/resource/[id]` |
| Succesvol aangepast | `/admin/resource/[id]` |
| Succesvol verwijderd | `/admin/resource` |
| Niet ingelogd | Bestaande loginroute |
| Geen toegang | Bestaande unauthorized-flow |

---

## 6. Pages, Sections & Data

### Betrokken pagina

`/admin/resource`

### Te bouwen of aan te passen

#### Page header

- Titel
- Beschrijving
- Primaire actie
- Relevante status of metadata

#### Content

- Overzicht, tabel, kaarten of detailweergave
- Relevante filters
- Zoekfunctie
- Sorteermogelijkheden
- Acties per record

#### Formulier

| Veld | Type | Verplicht | Validatie |
|---|---|---:|---|
| `name` | Text | Ja | Minimaal 2 tekens |
| `status` | Select | Ja | Geldige bestaande status |
| `description` | Textarea | Nee | Maximale lengte bepalen |

#### Data source

- Bestaande tabel, view of RPC:
- Benodigde relaties:
- Sorteervolgorde:
- Filters:
- Paginering:

### Verplichte UI-states

- [ ] Loading state
- [ ] Empty state
- [ ] Error state
- [ ] Success feedback
- [ ] Unauthorized state
- [ ] Not-found state
- [ ] Disabled of submitting state
- [ ] Confirmatiedialoog voor destructieve acties

### Componentgebruik

Controleer eerst bestaande:

- layouts;
- paginaheaders;
- formulieren;
- dialogs;
- tabellen;
- kaarten;
- statusbadges;
- media-componenten;
- notificaties;
- loading- en error-componenten.

Maak geen tweede component wanneer een bestaande component uitgebreid of hergebruikt kan worden.

---

## 7. Userflow

### Primaire flow

```text
1. Gebruiker opent de betrokken pagina.
2. Het systeem controleert authenticatie en capabilities.
3. De actuele data wordt opgehaald.
4. De gebruiker start de gewenste actie.
5. De gebruiker vult of selecteert de vereiste gegevens.
6. De frontend valideert de basisinvoer.
7. De backend valideert rechten, relaties en businessregels.
8. De wijziging wordt veilig uitgevoerd.
9. Een gevoelige actie wordt geregistreerd in het auditlog.
10. De gebruiker ontvangt duidelijke feedback.
11. De interface toont onmiddellijk de actuele data.
```

### Alternatieve flows

#### Geen toegang

```text
Gebruiker opent route
→ capability ontbreekt
→ data of actie wordt niet beschikbaar gesteld
→ gebruiker krijgt een duidelijke melding of redirect
```

#### Validatiefout

```text
Gebruiker verstuurt formulier
→ validatie faalt
→ relevante velden tonen een foutmelding
→ reeds ingevulde gegevens blijven behouden
```

#### Backendfout

```text
Actie wordt verstuurd
→ backendactie mislukt
→ geen ongeldige gedeeltelijke status blijft bestaan
→ gebruiker krijgt een bruikbare foutmelding
→ actie kan opnieuw worden geprobeerd
```

#### Verwijderen

```text
Gebruiker kiest verwijderen
→ confirmatiedialoog wordt getoond
→ backend controleert rechten en relaties
→ record en gekoppelde resources worden correct verwerkt
→ auditlog wordt geregistreerd
→ overzicht wordt bijgewerkt
```

---

## Acceptance Criteria

- [ ] De volledige beschreven userflow werkt.
- [ ] Alleen functionaliteit binnen de scope is geïmplementeerd.
- [ ] Het actuele Supabase-schema is als single source of truth gebruikt.
- [ ] Er zijn geen tabellen, kolommen, relaties of statussen gegokt.
- [ ] Databasewijzigingen zijn via migrations uitgevoerd.
- [ ] RLS en server-side autorisatie beschermen de functionaliteit.
- [ ] Database- en storagegegevens blijven consistent.
- [ ] Privileged workflows gebeuren server-side.
- [ ] De juiste rollen kunnen de juiste acties uitvoeren.
- [ ] Onbevoegde gebruikers kunnen de acties ook niet via directe requests uitvoeren.
- [ ] Bestaande routes, layouts en componenten zijn hergebruikt.
- [ ] Loading-, empty-, error-, success- en unauthorized-states zijn aanwezig.
- [ ] Destructieve acties vereisen bevestiging.
- [ ] De pagina werkt op desktop, tablet en mobiel.
- [ ] TypeScript geeft geen nieuwe fouten.
- [ ] Lint en build slagen.
- [ ] Er zijn geen regressies in bestaande functionaliteit.

---

## Testscenario’s

### Happy path

- [ ] Bevoegde gebruiker kan de volledige primaire flow uitvoeren.
- [ ] De opgeslagen data verschijnt correct na refresh.
- [ ] Gerelateerde data en media zijn correct gekoppeld.

### Permissions

- [ ] Niet-ingelogde gebruiker wordt geblokkeerd.
- [ ] Gebruiker zonder capability wordt geblokkeerd.
- [ ] Bevoegde gebruiker krijgt uitsluitend toegestane acties.

### Validation

- [ ] Verplichte velden worden afgedwongen.
- [ ] Ongeldige data wordt geweigerd.
- [ ] Duplicate of conflicterende data wordt correct afgehandeld.

### Failure states

- [ ] Databasefout toont bruikbare feedback.
- [ ] Storagefout veroorzaakt geen inconsistente database-status.
- [ ] Een mislukte request kan veilig opnieuw worden uitgevoerd.

---

## Technische validatie

Voer minimaal uit:

```bash
npm run typecheck
npm run lint
npm run build
```

Controleer daarnaast:

- migrations;
- databaseconstraints;
- RLS-policies;
- Storage policies;
- server-side capability checks;
- browserconsole;
- netwerkrequests;
- responsive gedrag;
- fout- en edge cases.

---

## Implementatieregels voor de Coding Agent

1. Inspecteer eerst de bestaande repository en Supabase-architectuur.
2. Behandel Supabase als de enige source of truth.
3. Controleer bestaande tables, relations, types, policies, backendfuncties, routes en componenten.
4. Gok geen schema’s, velden, statussen of businessregels.
5. Bouw geen alternatieve of dubbele implementatie.
6. Wijzig de database uitsluitend via migrations.
7. Voer gevoelige mutaties uitsluitend server-side uit.
8. Gebruik frontend role checks alleen voor UX.
9. Houd de implementatie beperkt tot deze issue.
10. Rapporteer onduidelijkheden of conflicten in de uiteindelijke implementatiesamenvatting.

---

## Definition of Done

Deze issue is pas voltooid wanneer:

- database, storage, backend en frontend correct geïntegreerd zijn;
- authenticatie en autorisatie server-side werken;
- de primaire en alternatieve userflows zijn getest;
- alle acceptance criteria zijn afgevinkt;
- typecheck, lint en build slagen;
- geen bestaande functionaliteit is gebroken.

---

## Implementatiesamenvatting

Na uitvoering toevoegen:

### Gewijzigde onderdelen

- 

### Database migrations

- 

### Nieuwe of aangepaste routes

- 

### Tests en validatie

- 

### Bekende beperkingen

- 
