-- Seed initial Chatswood shops
insert into public.shops (id, name, type, emoji, cuisine, tags, multiplier, lat, lng, street, city_slug)
values
  ('croissant', 'Pierre''s Patisserie', 'Bakery',     '🥐', 'Western', array['Vegan'],              2, -33.7958, 151.1788, 'Victoria Ave', 'chatswood'),
  ('matcha',    'Aoba Matcha Bar',      'Cafe',       '🍵', 'Asian',   array['Vegan','Late-night'], 1, -33.7960, 151.1820, 'Help St',      'chatswood'),
  ('bbq',       'Seoul BBQ House',      'Restaurant', '🥩', 'Asian',   array['Halal','Late-night'], 3, -33.7984, 151.1830, 'Spring St',    'chatswood'),
  ('ramen',     'Tonkotsu King',        'Restaurant', '🍜', 'Asian',   array['Late-night'],         2, -33.7984, 151.1782, 'Albert Ave',   'chatswood'),
  ('boba',      'Cha Cha Tea',          'Cafe',       '🧋', 'Drinks',  array['Vegan'],              1, -33.7950, 151.1800, 'Victoria Ave', 'chatswood'),
  ('donut',     'Doughboi',             'Bakery',     '🍩', 'Sweets',  array[]::text[],             2, -33.7952, 151.1832, 'Help St',      'chatswood')
on conflict (id) do nothing;
