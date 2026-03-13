-- 1. Suppression de l'ancienne table pour repartir sur une base propre
DROP TABLE IF EXISTS properties;

-- 2. Création de la table properties
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  lat FLOAT8,
  lng FLOAT8,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  type TEXT NOT NULL CHECK (type IN ('house', 'apartment')),
  sqm INTEGER,
  peb TEXT,
  floor INTEGER,
  features TEXT[],
  image_url TEXT,
  gallery_urls TEXT[],
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Sécurité (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON properties;
DROP POLICY IF EXISTS "Allow public insert" ON properties;
DROP POLICY IF EXISTS "Allow public update" ON properties;
DROP POLICY IF EXISTS "Allow public delete" ON properties;
DROP POLICY IF EXISTS "Allow authenticated insert" ON properties;
DROP POLICY IF EXISTS "Allow authenticated update" ON properties;
DROP POLICY IF EXISTS "Allow authenticated delete" ON properties;

CREATE POLICY "Allow public read" ON properties FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON properties FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON properties FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON properties FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Insertion de 10 biens fictifs à Bruxelles avec données techniques complètes
INSERT INTO properties (title, description, price, location, address, lat, lng, bedrooms, bathrooms, type, sqm, peb, floor, features, image_url, gallery_urls, is_available) VALUES
(
  'Élégant Appartement Haussmannien - Ixelles',
  'Situé au cœur du quartier prisé de Flagey, cet appartement de prestige allie charme de l''ancien et confort moderne. Vous serez séduits par ses hauts plafonds ornés de moulures, son parquet en chêne massif et sa luminosité exceptionnelle. À deux pas des étangs d''Ixelles, il offre un cadre de vie urbain et verdoyant unique à Bruxelles.',
  385000,
  'Ixelles',
  'Place Eugène Flagey 18, 1050 Ixelles',
  50.827, 
  4.373,
  2,
  1,
  'apartment',
  95,
  'B',
  3,
  ARRAY['Hauts plafonds', 'Parquet chêne', 'Cuisine équipée', 'Double vitrage'],
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
  true
),
(
  'Maison de Maître avec Jardin - Uccle',
  'Nichée dans une avenue calme et arborée d''Uccle, cette demeure d''exception de 280m² propose des volumes généreux. Elle dispose d''un vaste salon avec feu ouvert, d''une cuisine dînatoire haut de gamme et d''un magnifique jardin privatif sans vis-à-vis. Un véritable havre de paix proche du Bois de la Cambre.',
  895000,
  'Uccle',
  'Avenue Victoria 5, 1000 Bruxelles',
  50.803,
  4.376,
  4,
  3,
  'house',
  280,
  'D',
  NULL,
  ARRAY['Jardin arboré', 'Garage 2 places', 'Feu ouvert', 'Cave à vin', 'Système alarme'],
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'],
  true
),
(
  'Loft d''Artiste sous Verrière - Saint-Gilles',
  'Ancien atelier de confection transformé en loft contemporain spectaculaire. L''espace est baigné de lumière grâce à une immense verrière zénithale d''origine. Avec ses murs en briques apparentes, ses structures métalliques et sa cuisine design, ce bien incarne l''esprit créatif.',
  520000,
  'Saint-Gilles',
  'Chaussée de Waterloo 102, 1060 Saint-Gilles',
  50.830,
  4.346,
  2,
  2,
  'apartment',
  150,
  'C',
  2,
  ARRAY['Mezzanine', 'Verrière zénithale', 'Briques apparentes', 'Cuisine design'],
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80'],
  true
),
(
  'Appartement Vue Cinquantenaire - Etterbeek',
  'Un pied-à-terre idéal situé à une minute à pied du Parc du Cinquantenaire. Cet appartement cosy profite d''un agencement optimisé avec une chambre spacieuse, un dressing sur-mesure et un balcon filant offrant une vue dégagée sur les façades bruxelloises.',
  275000,
  'Etterbeek',
  'Avenue d''Auderghem 42, 1040 Etterbeek',
  50.840,
  4.389,
  1,
  1,
  'apartment',
  75,
  'C',
  3,
  ARRAY['Vue dégagée', 'Balcon', 'Dressing sur-mesure', 'Ascenseur'],
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', 'https://images.unsplash.com/photo-1556912177-332309831f50?w=800&q=80'],
  true
),
(
  'Villa d''Exception et Piscine - Woluwe',
  'Architecture minimaliste et prestations de luxe pour cette villa située dans le quartier très résidentiel des ambassades. Équipée d''une domotique intégrale, elle propose cinq suites parentales, une piscine intérieure chauffée et un jardin paysager.',
  1250000,
  'Woluwe-Saint-Pierre',
  'Avenue de Tervueren 250, 1150 Woluwe-Saint-Pierre',
  50.835,
  4.432,
  5,
  4,
  'house',
  350,
  'A',
  NULL,
  ARRAY['Piscine intérieure', 'Domotique', 'Jacuzzi', 'Jardin paysager', 'Suites parentales'],
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80', 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80'],
  true
),
(
  'Studio Design Art Déco - Schaerbeek',
  'Entièrement rénové en 2023, ce studio de 35m² préserve les éléments architecturaux de son immeuble Art Déco. Situé sur une avenue majestueuse proche de la Gare du Nord, il dispose d''une cuisine intelligente escamotable.',
  165000,
  'Schaerbeek',
  'Rue du Progrès 15, 1210 Saint-Josse-ten-Noode',
  50.859,
  4.360,
  0,
  1,
  'apartment',
  35,
  'C',
  1,
  ARRAY['Rénovation 2023', 'Art Déco', 'Meubles intelligents', 'Haute rentabilité'],
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80'],
  true
),
(
  'Maison de Ville & Studio - Forest',
  'Située à proximité immédiate de l''Altitude 100, cette maison bourgeoise offre un potentiel rare. Elle comprend trois chambres lumineuses, un charmant jardin de ville exposé sud-ouest et un sous-sol totalement aménagé.',
  475000,
  'Forest',
  'Place de l''Altitude Cent 5, 1190 Forest',
  50.817,
  4.339,
  3,
  2,
  'house',
  180,
  'D',
  NULL,
  ARRAY['Jardin exposé sud-ouest', 'Sous-sol aménagé', 'Cuisine ouverte', 'Véranda'],
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80'],
  true
),
(
  'Penthouse Royal avec Terrasse - Centre',
  'Unique et rare, ce penthouse de 200m² domine le centre historique de Bruxelles. Ses immenses baies vitrées offrent une vue à 360° sur l''Hôtel de Ville. Sa terrasse privée de 60m² en teck est une véritable oasis.',
  780000,
  'Bruxelles-Centre',
  'Boulevard Anspach 10, 1000 Bruxelles',
  50.846,
  4.352,
  3,
  2,
  'apartment',
  200,
  'B',
  6,
  ARRAY['Terrasse 60m²', 'Vue 360°', 'Triple vitrage', 'Dernier étage', 'Prestige'],
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80', 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&q=80', 'https://images.unsplash.com/photo-1499955085172-a104c9463ece?w=800&q=80'],
  true
),
(
  'Duplex Contemporain - Auderghem',
  'Parfaitement situé en lisière de la Forêt de Soignes, ce duplex familial de construction récente propose un confort énergétique exceptionnel (PEB B). Terrasse ensoleillée sans vis-à-vis.',
  420000,
  'Auderghem',
  'Chaussée de Wavre 1500, 1160 Auderghem',
  50.816,
  4.425,
  3,
  2,
  'apartment',
  140,
  'B',
  2,
  ARRAY['Lisière Forêt', 'PEB B', 'Garage inclus', 'Résidence sécurisée', 'Concierge'],
  'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&q=80', 'https://images.unsplash.com/photo-1542156822-6924d1a71aba?w=800&q=80'],
  true
),
(
  'Maison de Charme à Rénover - Molenbeek',
  'À deux pas du canal et du centre-ville, cette maison typiquement bruxelloise séduira les amateurs de projets de rénovation. Elle conserve de magnifiques cheminées d''époque et un petit jardin arrière.',
  285000,
  'Molenbeek',
  'Quai du Hainaut 33, 1080 Molenbeek-Saint-Jean',
  50.850,
  4.337,
  3,
  1,
  'house',
  160,
  'G',
  NULL,
  ARRAY['Projet rénovation', 'Canal', 'Cheminées d''époque', 'Potentiel énorme'],
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80', 'https://images.unsplash.com/photo-1512914890251-2f96a9b0bbe2?w=800&q=80'],
  true
);
