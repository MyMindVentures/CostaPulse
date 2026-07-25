-- EU locale seeds for experience inventory (nl/fr/es/de)

INSERT INTO public.experience_translations (
  experience_id, locale, title, short_description, description,
  category_label, location_name, highlights, inclusions
) VALUES
('85702731-ddd6-4dfa-bd94-e2d98519549d', 'nl', 'BBQ Experience', 'Een ontspannen outdoor BBQ met Mediterrane sfeer.', 'Geniet van een gehoste BBQ rond goed eten, lokale sfeer en een relaxed Costa Blanca-decor.', 'BBQ', 'Costa Blanca', '["Gehoste BBQ","Mediterrane setting","Kleine groepen","Relaxed sociaal"]'::jsonb, '["BBQ-setup","Voedselbereiding","Host","Basis servies"]'::jsonb),
('85702731-ddd6-4dfa-bd94-e2d98519549d', 'fr', 'Expérience BBQ', 'Un BBQ en extérieur détendu dans une ambiance méditerranéenne.', 'Profitez d’un BBQ animé autour de bonne cuisine, d’une ambiance locale et d’un cadre Costa Blanca décontracté.', 'BBQ', 'Costa Blanca', '["BBQ animé","Cadre méditerranéen","Petits groupes","Expérience sociale détendue"]'::jsonb, '["Installation BBQ","Préparation des plats","Hôte","Vaisselle de base"]'::jsonb),
('85702731-ddd6-4dfa-bd94-e2d98519549d', 'es', 'Experiencia BBQ', 'Una BBQ al aire libre relajada con ambiente mediterráneo.', 'Disfruta de una BBQ con anfitrión centrada en buena comida, ambiente local y un entorno fácil en Costa Blanca.', 'BBQ', 'Costa Blanca', '["BBQ con anfitrión","Ambiente mediterráneo","Grupos pequeños","Experiencia social relajada"]'::jsonb, '["Montaje de BBQ","Preparación de comida","Anfitrión","Vajilla básica"]'::jsonb),
('85702731-ddd6-4dfa-bd94-e2d98519549d', 'de', 'BBQ-Erlebnis', 'Ein entspanntes Outdoor-BBQ mit mediterranem Ambiente.', 'Genieße ein gehostetes BBQ rund um gutes Essen, lokale Atmosphäre und eine lockere Costa-Blanca-Kulisse.', 'BBQ', 'Costa Blanca', '["Gehostetes BBQ","Mediterranes Setting","Kleine Gruppen","Entspanntes soziales Erlebnis"]'::jsonb, '["BBQ-Setup","Essenszubereitung","Gastgeber","Basisgeschirr"]'::jsonb),
('f301e296-74e9-4b36-aabe-a6dd7ab2e676', 'nl', 'Boat Experience', 'Ontdek de prachtige kustlijn van de Costa Blanca op een privé luxe boot.', 'Stap aan boord en beleef de Costa Blanca vanaf de beste plek: de zee. Cruise langs dramatische kliffen, verborgen baaien en kristalhelder water met een lokale skipper. Zwem, snorkel, ontspan op dek en geniet van een flexibele route afgestemd op weer en jouw groep.', 'Boat Experience', 'Altea, Calpe en Moraira', '["Luxe boot met premium comfort","Kristalhelder zwemmen en snorkelen","Lokale skipper en persoonlijke route","Perfect voor koppels, families en groepen"]'::jsonb, '["Professionele lokale skipper","Brandstof","Water en frisdrank","IJs","Snorkeluitrusting","Veiligheidsuitrusting","Schoonmaak"]'::jsonb),
('f301e296-74e9-4b36-aabe-a6dd7ab2e676', 'fr', 'Expérience bateau', 'Découvrez le littoral spectaculaire de la Costa Blanca en bateau de luxe privé.', 'Montez à bord et vivez la Costa Blanca depuis le meilleur siège : la mer. Naviguez le long de falaises dramatiques, de criques cachées et d’eaux cristallines avec un skipper local. Nagez, snorkelez, détendez-vous sur le pont et profitez d’un itinéraire flexible adapté à la météo et à votre groupe.', 'Expérience bateau', 'Altea, Calpe et Moraira', '["Bateau de luxe au confort premium","Baignades et snorkelling en eau claire","Skipper local et itinéraire personnalisé","Idéal pour couples, familles et groupes"]'::jsonb, '["Skipper local professionnel","Carburant","Eau et softs","Glace","Équipement de snorkelling","Équipement de sécurité","Nettoyage"]'::jsonb),
('f301e296-74e9-4b36-aabe-a6dd7ab2e676', 'es', 'Experiencia en barco', 'Descubre la impresionante costa de Costa Blanca en un barco de lujo privado.', 'Sube a bordo y vive Costa Blanca desde el mejor asiento: el mar. Navega junto a acantilados, calas escondidas y aguas cristalinas con un patrón local. Nada, haz snorkel, relájate en cubierta y disfruta de una ruta flexible adaptada al tiempo y a tu grupo.', 'Experiencia en barco', 'Altea, Calpe y Moraira', '["Barco de lujo con confort premium","Paradas para nadar y snorkel","Patrón local y ruta personalizada","Ideal para parejas, familias y grupos"]'::jsonb, '["Patrón local profesional","Combustible","Agua y refrescos","Hielo","Equipo de snorkel","Equipo de seguridad","Limpieza"]'::jsonb),
('f301e296-74e9-4b36-aabe-a6dd7ab2e676', 'de', 'Boot-Erlebnis', 'Entdecke die spektakuläre Costa-Blanca-Küste auf einem privaten Luxury-Boot.', 'Geh an Bord und erlebe die Costa Blanca vom besten Platz aus: dem Meer. Cruise entlang dramatischer Klippen, verborgener Buchten und kristallklarem Wasser mit lokalem Skipper. Schwimmen, schnorcheln, an Deck entspannen und eine flexible Route genießen – abgestimmt auf Wetter und Gruppe.', 'Boot-Erlebnis', 'Altea, Calpe und Moraira', '["Luxury-Boot mit Premium-Komfort","Kristallklare Schwimm- und Schnorchelstopps","Lokaler Skipper und persönliche Route","Perfekt für Paare, Familien und Gruppen"]'::jsonb, '["Professioneller lokaler Skipper","Treibstoff","Wasser und Softdrinks","Eis","Schnorchelausrüstung","Sicherheitsausrüstung","Reinigung"]'::jsonb),
('4baf6c78-5c7c-44a0-8ef6-b0dc9cfe10e2', 'nl', 'Kayak Mentor', 'Een begeleide kayaksessie gericht op vertrouwen, techniek en kustverkenning.', 'Bouw vertrouwen op het water en ontdek de kustlijn met persoonlijke kayak-mentoring en praktische veiligheidsbegeleiding.', 'Kayak', 'Costa Blanca', '["Persoonlijke coaching","Kustroute","Peddeltechniek","Veiligheidsbegeleiding"]'::jsonb, '["Kayak","Peddel","Veiligheidsuitrusting","Mentorbegeleiding"]'::jsonb),
('4baf6c78-5c7c-44a0-8ef6-b0dc9cfe10e2', 'fr', 'Mentor kayak', 'Une session kayak guidée axée sur la confiance, la technique et l’exploration côtière.', 'Gagnez en confiance sur l’eau et découvrez le littoral avec un mentorat kayak personnalisé et des conseils de sécurité pratiques.', 'Kayak', 'Costa Blanca', '["Coaching personnel","Itinéraire côtier","Technique de pagaie","Conseils de sécurité"]'::jsonb, '["Kayak","Pagaie","Équipement de sécurité","Accompagnement mentor"]'::jsonb),
('4baf6c78-5c7c-44a0-8ef6-b0dc9cfe10e2', 'es', 'Mentor de kayak', 'Una sesión guiada de kayak centrada en confianza, técnica y exploración costera.', 'Gana confianza en el agua y descubre la costa con mentoría personal de kayak y orientación práctica de seguridad.', 'Kayak', 'Costa Blanca', '["Coaching personal","Ruta costera","Técnica de remo","Orientación de seguridad"]'::jsonb, '["Kayak","Remo","Equipo de seguridad","Guía del mentor"]'::jsonb),
('4baf6c78-5c7c-44a0-8ef6-b0dc9cfe10e2', 'de', 'Kajak-Mentor', 'Eine geführte Kajaksession mit Fokus auf Sicherheit, Technik und Küstenerkundung.', 'Baue Vertrauen auf dem Wasser auf und entdecke die Küste mit persönlichem Kajak-Mentoring und praktischer Sicherheitsanleitung.', 'Kajak', 'Costa Blanca', '["Persönliches Coaching","Küstenroute","Paddeltechnik","Sicherheitsanleitung"]'::jsonb, '["Kajak","Paddel","Sicherheitsausrüstung","Mentor-Begleitung"]'::jsonb),
('9ad8d4c9-ded0-490d-837e-453efeb8bea2', 'nl', 'Paddlesurf Mentor', 'Een persoonlijk begeleide paddleboardsessie op de Costa Blanca.', 'Leer, verbeter en verken de kust met een persoonlijke paddlesurf-mentor in een relaxed, safety-first sessie.', 'Paddlesurf', 'Costa Blanca', '["Persoonlijke coaching","Route in kalm water","Techniek- en veiligheidsbegeleiding"]'::jsonb, '["Paddleboard","Peddel","Veiligheidsuitrusting","Mentorbegeleiding"]'::jsonb),
('9ad8d4c9-ded0-490d-837e-453efeb8bea2', 'fr', 'Mentor paddlesurf', 'Une session de paddleboard guidée personnellement sur la Costa Blanca.', 'Apprenez, progressez et explorez la côte avec un mentor paddlesurf dans une session détendue et axée sur la sécurité.', 'Paddlesurf', 'Costa Blanca', '["Coaching personnel","Itinéraire en eau calme","Technique et conseils de sécurité"]'::jsonb, '["Paddleboard","Pagaie","Équipement de sécurité","Accompagnement mentor"]'::jsonb),
('9ad8d4c9-ded0-490d-837e-453efeb8bea2', 'es', 'Mentor de paddlesurf', 'Una sesión de paddleboard con guía personal en Costa Blanca.', 'Aprende, mejora y explora la costa con un mentor de paddlesurf en una sesión relajada y centrada en la seguridad.', 'Paddlesurf', 'Costa Blanca', '["Coaching personal","Ruta en aguas tranquilas","Técnica y orientación de seguridad"]'::jsonb, '["Paddleboard","Remo","Equipo de seguridad","Guía del mentor"]'::jsonb),
('9ad8d4c9-ded0-490d-837e-453efeb8bea2', 'de', 'Paddlesurf-Mentor', 'Eine persönlich geführte Paddleboard-Session an der Costa Blanca.', 'Lerne, verbessere dich und erkunde die Küste mit einem persönlichen Paddlesurf-Mentor in einer entspannten, sicherheitsorientierten Session.', 'Paddlesurf', 'Costa Blanca', '["Persönliches Coaching","Route in ruhigem Wasser","Technik- und Sicherheitsanleitung"]'::jsonb, '["Paddleboard","Paddel","Sicherheitsausrüstung","Mentor-Begleitung"]'::jsonb)
ON CONFLICT (experience_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  category_label = EXCLUDED.category_label,
  location_name = EXCLUDED.location_name,
  highlights = EXCLUDED.highlights,
  inclusions = EXCLUDED.inclusions;

INSERT INTO public.experience_variant_translations (variant_id, locale, name, description, subtitle, badge_label) VALUES
('d3983177-cea7-4ab2-b75c-8b05ec27a8a2', 'nl', 'Gehoste BBQ', NULL, NULL, NULL),
('d3983177-cea7-4ab2-b75c-8b05ec27a8a2', 'fr', 'BBQ animé', NULL, NULL, NULL),
('d3983177-cea7-4ab2-b75c-8b05ec27a8a2', 'es', 'BBQ con anfitrión', NULL, NULL, NULL),
('d3983177-cea7-4ab2-b75c-8b05ec27a8a2', 'de', 'Gehostetes BBQ', NULL, NULL, NULL),
('e117bd16-a25e-4ed8-9392-bb3fe113d661', 'nl', '3 uur', NULL, 'Essentiële Costa Blanca-cruise', 'Meest populair'),
('e117bd16-a25e-4ed8-9392-bb3fe113d661', 'fr', '3 heures', NULL, 'Croisière essentielle Costa Blanca', 'Le plus populaire'),
('e117bd16-a25e-4ed8-9392-bb3fe113d661', 'es', '3 horas', NULL, 'Crucero esencial Costa Blanca', 'Más popular'),
('e117bd16-a25e-4ed8-9392-bb3fe113d661', 'de', '3 Stunden', NULL, 'Essenzielle Costa-Blanca-Cruise', 'Am beliebtesten'),
('f0e78d46-97d7-4b34-aed7-4d3762ae4a75', 'nl', '6 uur', 'Verlengde kustescape met meer cruisen, zwemmen en tijd voor anker.', 'Verlengde kustescape', NULL),
('f0e78d46-97d7-4b34-aed7-4d3762ae4a75', 'fr', '6 heures', 'Évasion côtière prolongée avec plus de navigation, de baignade et de temps au mouillage.', 'Évasion côtière prolongée', NULL),
('f0e78d46-97d7-4b34-aed7-4d3762ae4a75', 'es', '6 horas', 'Escapada costera prolongada con más navegación, baño y tiempo fondeado.', 'Escapada costera prolongada', NULL),
('f0e78d46-97d7-4b34-aed7-4d3762ae4a75', 'de', '6 Stunden', 'Verlängerte Küstenflucht mit mehr Cruising, Schwimmen und Zeit vor Anker.', 'Verlängerte Küstenflucht', NULL),
('c22f95d7-1028-442c-814f-1953dd7e3ea1', 'nl', 'Begeleide sessie', NULL, NULL, NULL),
('c22f95d7-1028-442c-814f-1953dd7e3ea1', 'fr', 'Session guidée', NULL, NULL, NULL),
('c22f95d7-1028-442c-814f-1953dd7e3ea1', 'es', 'Sesión guiada', NULL, NULL, NULL),
('c22f95d7-1028-442c-814f-1953dd7e3ea1', 'de', 'Geführte Session', NULL, NULL, NULL),
('202332f8-4ec9-45a5-86a2-18c3395fd257', 'nl', 'Begeleide sessie', NULL, NULL, NULL),
('202332f8-4ec9-45a5-86a2-18c3395fd257', 'fr', 'Session guidée', NULL, NULL, NULL),
('202332f8-4ec9-45a5-86a2-18c3395fd257', 'es', 'Sesión guiada', NULL, NULL, NULL),
('202332f8-4ec9-45a5-86a2-18c3395fd257', 'de', 'Geführte Session', NULL, NULL, NULL)
ON CONFLICT (variant_id, locale) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  subtitle = EXCLUDED.subtitle,
  badge_label = EXCLUDED.badge_label;

INSERT INTO public.experience_policy_translations (policy_id, locale, title, description) VALUES
('54f3a03b-e646-4cfa-afa0-cd11f19e5260', 'nl', 'Gratis annuleren', 'Gratis annuleren tot 24 uur voor vertrek.'),
('54f3a03b-e646-4cfa-afa0-cd11f19e5260', 'fr', 'Annulation gratuite', 'Annulez gratuitement jusqu’à 24 heures avant le départ.'),
('54f3a03b-e646-4cfa-afa0-cd11f19e5260', 'es', 'Cancelación gratuita', 'Cancela gratis hasta 24 horas antes de la salida.'),
('54f3a03b-e646-4cfa-afa0-cd11f19e5260', 'de', 'Kostenlose Stornierung', 'Kostenlos stornieren bis 24 Stunden vor Abfahrt.'),
('42b79f28-ea81-47c2-a973-86d4826ce29e', 'nl', 'Directe bevestiging', 'Beschikbare slots worden direct bevestigd na succesvolle betaling.'),
('42b79f28-ea81-47c2-a973-86d4826ce29e', 'fr', 'Confirmation instantanée', 'Les créneaux disponibles sont confirmés immédiatement après un paiement réussi.'),
('42b79f28-ea81-47c2-a973-86d4826ce29e', 'es', 'Confirmación instantánea', 'Las plazas disponibles se confirman al instante tras un pago correcto.'),
('42b79f28-ea81-47c2-a973-86d4826ce29e', 'de', 'Sofortige Bestätigung', 'Verfügbare Slots werden nach erfolgreicher Zahlung sofort bestätigt.'),
('ac5863ae-55bd-49b5-822b-f881391482aa', 'nl', 'Weerbeleid', 'Routes kunnen wijzigen om veiligheidsredenen. Onveilige omstandigheden kunnen worden verplaatst of terugbetaald.'),
('ac5863ae-55bd-49b5-822b-f881391482aa', 'fr', 'Politique météo', 'Les itinéraires peuvent changer pour des raisons de sécurité. Les conditions dangereuses peuvent être reportées ou remboursées.'),
('ac5863ae-55bd-49b5-822b-f881391482aa', 'es', 'Política meteorológica', 'Las rutas pueden cambiar por seguridad. Condiciones inseguras pueden reprogramarse o reembolsarse.'),
('ac5863ae-55bd-49b5-822b-f881391482aa', 'de', 'Wetterrichtlinie', 'Routen können sich aus Sicherheitsgründen ändern. Bei unsicheren Bedingungen ist Umbuchung oder Erstattung möglich.'),
('b1edb6e1-30f9-4b8e-b38f-68dab9faceaa', 'nl', 'Aankomsttijd', 'Kom 15 minuten voor vertrek aan.'),
('b1edb6e1-30f9-4b8e-b38f-68dab9faceaa', 'fr', 'Heure d’arrivée', 'Veuillez arriver 15 minutes avant le départ.'),
('b1edb6e1-30f9-4b8e-b38f-68dab9faceaa', 'es', 'Hora de llegada', 'Por favor llega 15 minutos antes de la salida.'),
('b1edb6e1-30f9-4b8e-b38f-68dab9faceaa', 'de', 'Ankunftszeit', 'Bitte 15 Minuten vor Abfahrt eintreffen.'),
('16964a56-a896-443e-914f-6a25f94f8b26', 'nl', 'Mobiel ticket', 'Digitale bevestiging op je telefoon wordt geaccepteerd.'),
('16964a56-a896-443e-914f-6a25f94f8b26', 'fr', 'Billet mobile', 'La confirmation numérique sur votre téléphone est acceptée.'),
('16964a56-a896-443e-914f-6a25f94f8b26', 'es', 'Ticket móvil', 'Se acepta la confirmación digital en tu teléfono.'),
('16964a56-a896-443e-914f-6a25f94f8b26', 'de', 'Mobiles Ticket', 'Digitale Bestätigung auf dem Handy wird akzeptiert.')
ON CONFLICT (policy_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO public.experience_itinerary_step_translations (itinerary_step_id, locale, title, description) VALUES
('e10e76ff-4292-4a26-96bd-e91d12f626d6', 'nl', 'Ontmoet je skipper', 'Welkom, veiligheidsbriefing en routeplanning bij de geselecteerde marina.'),
('e10e76ff-4292-4a26-96bd-e91d12f626d6', 'fr', 'Rencontre avec votre skipper', 'Accueil, briefing sécurité et planification de l’itinéraire à la marina sélectionnée.'),
('e10e76ff-4292-4a26-96bd-e91d12f626d6', 'es', 'Conoce a tu patrón', 'Bienvenida, briefing de seguridad y planificación de la ruta en el puerto seleccionado.'),
('e10e76ff-4292-4a26-96bd-e91d12f626d6', 'de', 'Triff deinen Skipper', 'Willkommen, Sicherheitsbriefing und Routenplanung an der gewählten Marina.'),
('adbad2ca-cad4-4407-b466-98996ec538c8', 'nl', 'Cruise langs de kust', 'Vaar langs kliffen, baaien en kustlandmarks.'),
('adbad2ca-cad4-4407-b466-98996ec538c8', 'fr', 'Croisière le long de la côte', 'Naviguez le long des falaises, criques et points de repère côtiers.'),
('adbad2ca-cad4-4407-b466-98996ec538c8', 'es', 'Navega por la costa', 'Navega junto a acantilados, calas e hitos costeros.'),
('adbad2ca-cad4-4407-b466-98996ec538c8', 'de', 'Entlang der Küste cruisen', 'Segle an Klippen, Buchten und Küstenlandmarks vorbei.'),
('78b62ca8-3cb4-4bcf-925f-4ba6d23296c0', 'nl', 'Zwem- en snorkelstop', 'Anker in helder water om te zwemmen, snorkelen en te ontspannen.'),
('78b62ca8-3cb4-4bcf-925f-4ba6d23296c0', 'fr', 'Pause baignade et snorkelling', 'Mouillez en eau claire pour nager, snorkeler et vous détendre.'),
('78b62ca8-3cb4-4bcf-925f-4ba6d23296c0', 'es', 'Parada para nadar y snorkel', 'Fondea en aguas claras para nadar, hacer snorkel y relajarte.'),
('78b62ca8-3cb4-4bcf-925f-4ba6d23296c0', 'de', 'Schwimm- und Schnorchelstopp', 'Ankern in klarem Wasser zum Schwimmen, Schnorcheln und Entspannen.'),
('b58217cf-2a3e-4faa-a8e4-c36c336f64f4', 'nl', 'Drankjes en vrije tijd', 'Geniet van gekoelde drankjes en tijd op dek.'),
('b58217cf-2a3e-4faa-a8e4-c36c336f64f4', 'fr', 'Boissons et temps libre', 'Profitez de boissons fraîches et de temps sur le pont.'),
('b58217cf-2a3e-4faa-a8e4-c36c336f64f4', 'es', 'Bebidas y tiempo libre', 'Disfruta de bebidas frías y tiempo en cubierta.'),
('b58217cf-2a3e-4faa-a8e4-c36c336f64f4', 'de', 'Getränke und Freizeit', 'Genieße gekühlte Getränke und Zeit an Deck.'),
('4af05cb5-eed9-45ea-b947-f799fe6d3efb', 'nl', 'Terug naar de marina', 'Ontspan tijdens de cruise terug naar het ontmoetingspunt.'),
('4af05cb5-eed9-45ea-b947-f799fe6d3efb', 'fr', 'Retour à la marina', 'Détendez-vous pendant le retour vers le point de rendez-vous.'),
('4af05cb5-eed9-45ea-b947-f799fe6d3efb', 'es', 'Regreso al puerto', 'Relájate durante el regreso al punto de encuentro.'),
('4af05cb5-eed9-45ea-b947-f799fe6d3efb', 'de', 'Rückkehr zur Marina', 'Entspanne dich auf der Rückfahrt zum Treffpunkt.')
ON CONFLICT (itinerary_step_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO public.experience_requirement_translations (requirement_id, locale, title, description) VALUES
('44928a61-f673-4bc2-b17f-b0d7ea2a2885', 'nl', 'Volg de instructies van de skipper', 'Alle gasten moeten de veiligheidsinstructies van de skipper volgen.'),
('44928a61-f673-4bc2-b17f-b0d7ea2a2885', 'fr', 'Suivre les instructions du skipper', 'Tous les invités doivent suivre les consignes de sécurité du skipper.'),
('44928a61-f673-4bc2-b17f-b0d7ea2a2885', 'es', 'Sigue las instrucciones del patrón', 'Todos los huéspedes deben seguir las instrucciones de seguridad del patrón.'),
('44928a61-f673-4bc2-b17f-b0d7ea2a2885', 'de', 'Anweisungen des Skippers befolgen', 'Alle Gäste müssen die Sicherheitsanweisungen des Skippers befolgen.'),
('e882ea46-e418-4069-8a2d-7a18cd23ec50', 'nl', 'Geschikt voor de meeste gasten', 'Neem vooraf contact op met CostaPulse bij verminderde mobiliteit of speciale assistentie.'),
('e882ea46-e418-4069-8a2d-7a18cd23ec50', 'fr', 'Adapté à la plupart des invités', 'Contactez CostaPulse à l’avance en cas de mobilité réduite ou d’assistance particulière.'),
('e882ea46-e418-4069-8a2d-7a18cd23ec50', 'es', 'Apto para la mayoría de huéspedes', 'Contacta con CostaPulse con antelación si hay movilidad reducida o asistencia especial.'),
('e882ea46-e418-4069-8a2d-7a18cd23ec50', 'de', 'Für die meisten Gäste geeignet', 'Kontaktiere CostaPulse im Voraus bei eingeschränkter Mobilität oder besonderem Assistenzbedarf.'),
('1399d0d5-7747-4575-ba98-485d8255b6b3', 'nl', 'Neem zonbescherming mee', 'Neem zonnebrandcrème, zonnebril, zwemkleding en een handdoek mee.'),
('1399d0d5-7747-4575-ba98-485d8255b6b3', 'fr', 'Apportez une protection solaire', 'Apportez crème solaire, lunettes de soleil, maillot et serviette.'),
('1399d0d5-7747-4575-ba98-485d8255b6b3', 'es', 'Trae protección solar', 'Trae protector solar, gafas de sol, bañador y toalla.'),
('1399d0d5-7747-4575-ba98-485d8255b6b3', 'de', 'Sonnenschutz mitbringen', 'Sonnencreme, Sonnenbrille, Badekleidung und Handtuch mitbringen.')
ON CONFLICT (requirement_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
