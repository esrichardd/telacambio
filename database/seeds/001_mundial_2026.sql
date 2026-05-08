-- =============================================================================
-- SEED 001: Álbum Mundial 2026
-- Descripción: Datos iniciales del álbum Panini FIFA World Cup 2026.
-- Ejecutar con el service role key desde el dashboard de Supabase
-- o via Supabase CLI: supabase db seed
--
-- NOTA: Las barajitas individuales (stickers) deben cargarse por separado
-- una vez confirmada la numeración oficial del álbum.
-- Este seed solo inserta el álbum base.
-- =============================================================================

insert into albums (name, slug, description, total_stickers, is_active)
values (
  'Panini FIFA World Cup 2026',
  'mundial-2026',
  'Álbum oficial Panini del FIFA World Cup 2026, celebrado en Estados Unidos, México y Canadá. El álbum más grande de la historia con 48 selecciones participantes.',
  670,   -- número estimado, actualizar con el oficial
  true
);


-- =============================================================================
-- SEED: Trading spots pre-cargados
-- Lugares verificados en ciudades con alta densidad de coleccionistas.
-- Agregar más según crezca la comunidad.
-- =============================================================================

-- Medellín, Colombia
insert into trading_spots (name, description, address, city, country_code, lat, lng, is_verified)
values
  (
    'Parque Sabaneta',
    'Parque principal de Sabaneta, punto de encuentro tradicional de coleccionistas los fines de semana.',
    'Parque Principal, Sabaneta, Antioquia',
    'Medellín',
    'CO',
    6.1514, -75.6166,
    true
  ),
  (
    'Centro Comercial Santa Fe',
    'Área de food court, nivel 2. Punto de encuentro los sábados.',
    'Cra. 43A #7 Sur-170, Medellín',
    'Medellín',
    'CO',
    6.2003, -75.5786,
    true
  ),
  (
    'Parque El Poblado',
    'Parque central de El Poblado, ideal para intercambios en las tardes.',
    'Calle 9 #43E-2, El Poblado, Medellín',
    'Medellín',
    'CO',
    6.2099, -75.5677,
    true
  );

-- Bogotá, Colombia
insert into trading_spots (name, description, address, city, country_code, lat, lng, is_verified)
values
  (
    'Parque de la 93',
    'Zona norte de Bogotá, punto de encuentro en el parque los domingos.',
    'Calle 93A #11A-35, Bogotá',
    'Bogotá',
    'CO',
    4.6763, -74.0479,
    true
  ),
  (
    'Centro Comercial Andino',
    'Plaza central del CC Andino, zona Zona Rosa.',
    'Cra. 11 #82-71, Bogotá',
    'Bogotá',
    'CO',
    4.6656, -74.0529,
    true
  );

-- Caracas, Venezuela
insert into trading_spots (name, description, address, city, country_code, lat, lng, is_verified)
values
  (
    'Centro Comercial Sambil',
    'Planta baja, cerca de la entrada principal. Punto clásico de intercambio.',
    'Av. Libertador, Chacao, Caracas',
    'Caracas',
    'VE',
    10.4917, -66.8525,
    true
  );

-- Ciudad de México
insert into trading_spots (name, description, address, city, country_code, lat, lng, is_verified)
values
  (
    'Parque México',
    'Parque central de la Colonia Condesa, domingos en la mañana.',
    'Av. México, Colonia Condesa, CDMX',
    'Ciudad de México',
    'MX',
    19.4117, -99.1741,
    true
  );

-- Buenos Aires, Argentina
insert into trading_spots (name, description, address, city, country_code, lat, lng, is_verified)
values
  (
    'Feria de San Telmo',
    'Domingos en la Feria, zona de coleccionistas cerca de la entrada principal.',
    'Defensa 1000, San Telmo, Buenos Aires',
    'Buenos Aires',
    'AR',
    -34.6212, -58.3714,
    true
  );
