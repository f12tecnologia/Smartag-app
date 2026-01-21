import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.EXTERNAL_DATABASE_URL;

if (!connectionString) {
  console.error('EXTERNAL_DATABASE_URL is not set');
}

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database successfully');
    const res = await client.query('SELECT current_schema(), current_user');
    console.log('Database context:', res.rows[0]);
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection error:', error.message);
    return false;
  }
};

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 100), duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error.message);
    throw error;
  }
};

export const initializeDatabase = async () => {
  console.log('Initializing database schema...');
  
  try {
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    const existingTables = tables.rows.map(r => r.table_name);
    console.log('Existing tables:', existingTables);

    if (!existingTables.includes('users')) {
      await pool.query(`
        CREATE TABLE users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Users table created');
    } else {
      console.log('Users table already exists');
    }

    if (!existingTables.includes('qr_codes')) {
      await pool.query(`
        CREATE TABLE qr_codes (
          id VARCHAR(255) PRIMARY KEY,
          url TEXT NOT NULL,
          title VARCHAR(255),
          description TEXT,
          clicks INTEGER DEFAULT 0,
          type VARCHAR(50) DEFAULT 'url',
          category VARCHAR(100),
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('QR codes table created');
      
      console.log('Inserting QR codes data from CSV...');
      await pool.query(`
        INSERT INTO qr_codes (id, url, title, created_at, clicks, description) VALUES
        ('19c4d4ad-7b40-4c5b-878c-273b4e1669f6','https://www.dreamsparkshow.com.br/loja/?ingToken=PromoFoz&cupom=DIAC30OFF','Promo Dia do Cliente 30% OFF','2025-09-10 13:49:33.588966+00',5,'Link da promoção de dia do cliente'),
        ('1b579f68-e06f-4e63-9585-79bfda379089','https://wa.me/554535278100?text=Ol%C3%A1!%20Vim%20por%20indica%C3%A7%C3%A3o%20da%20taxista%20Sandra%20Regina%20Soares%20(26882)%20e%20gostaria%20de%20saber%20mais%20sobre%20os%20atrativos%20Dreams.','Parceiro Sandra 26882','2026-01-16 02:48:52.596133+00',2,''),
        ('29ecc110-19fb-46a7-92c0-43b335934620','https://wa.me/554535278100?text=Ol%C3%A1.%20Ganhei%20um%20ingresso%20para%20o%20Vale%20dos%20Dinossauros%20(v%C3%A1lido%20para%201%20crian%C3%A7a)%20e%20gostaria%20de%20saber%20mais%20sobre%20os%20outros%20ingressos%20do%20Dreams.','Titular da Reserva Vale dos Dinossauros','2026-01-15 14:51:59.735271+00',0,''),
        ('2c921936-08ff-4529-bd89-d3bdd23d9990','https://wa.me/554535278100?text=Ol%C3%A1.%20Vim%20por%20indica%C3%A7%C3%A3o%20do%20Aldo%20Araujo,%20do%20GB%20Hot%C3%A9is,%20e%20gostaria%20de%20garantir%20meus%20ingressos%20com%20desconto','Parceria Aldo Araujo GB Hotéis','2026-01-08 20:36:30.516046+00',3,''),
        ('36016f9a-6b74-471e-abd0-8ed0c5a9e823','https://wa.me/554535278100?text=Ol%C3%A1!%20Vim%20por%20indica%C3%A7%C3%A3o%20da%20taxista%20Vanessa%20Rodrigues%20(26883)%20e%20gostaria%20de%20saber%20mais%20sobre%20os%20atrativos%20Dreams.','Parceiro Vanessa 26883','2026-01-16 02:47:10.931809+00',1,''),
        ('5045d337-9947-4382-9f8c-ea713ba1da92','https://www.dreamsparkshow.com.br/loja/?cupom=PARC25-QRA3','10% OFF Arte A3 Parceiros','2025-10-17 19:38:58.193484+00',0,'QR Code com 10% no Passaporte 6 nas artes A3 dos parceiros'),
        ('6ab0308e-5fb3-4d47-87f8-28a5d66ad8c0','https://dreamsparkshow.com.br/','Dreamsparkshow','2025-09-09 21:30:16.024872+00',2,'Dreamsparkshow'),
        ('7c82d717-b237-4e4e-a9b2-6856e9dbb82d','https://dreamsparkshow.com.br/','Site - Parceria Catuaí Shopping','2025-12-04 17:41:38.2637+00',0,''),
        ('94dd1f2e-efa4-40c6-87cc-98b2d0430338','https://www.dreamsparkshow.com.br/loja/?cupom=FUTEXP-20&bookingagency=25526','20% Pass Mundo Futsal','2025-12-08 19:27:49.720582+00',35,''),
        ('a9da4287-00cb-4bbf-b41a-4f8532bad434','https://www.dreamsparkshow.com.br/loja/?_gl=1*np64et*_gcl_au*NzQ5MTkwNzI4LjE3NTQ5MzU3Mjk.*_ga*MTk2MzMxMTI0My4xNzU0OTM1NzI5*_ga_V4QYNZL3G1*czE3NTc0NDQ2NjIkbzMkZzEkdDE3NTc0NDUzMjIkajYwJGwwJGgw*_ga_2LYH18ZHZR*czE3NTc0NDQ2NjIkbzQkZzEkdDE3NTc0NDUzMjIkajYwJGwwJGgxMTE3MTQyODA2*_ga_FGQZ6NP26N*czE3NTc0NDQ2NjMkbzQkZzEkdDE3NTc0NDUzMjIkajYwJGwwJGgw','Loja Foz','2025-09-09 21:31:53.537805+00',7,'Loja Foz'),
        ('ace66207-971f-4203-b188-02e50876538c','https://dreamsparkshow.com.br/portal-do-agente/?_gl=1*8h76ed*_gcl_au*NTQxMDEyMTk2LjE3NjU0NjUwODM.*_ga*MTk2MzMxMTI0My4xNzU0OTM1NzI5*_ga_V4QYNZL3G1*czE3Njc5MTA1MzIkbzEwJGcwJHQxNzY3OTEwNTMyJGo2MCRsMCRoMA..*_ga_2LYH18ZHZR*czE3Njc5MTA1MzIkbzE1JGcwJHQxNzY3OTEwNTMyJGo2MCRsMCRoOTMwMDA4NTEx','Teste','2026-01-08 22:16:30.029523+00',1,'Teste'),
        ('aed0344a-b900-46c7-af96-77eefadf14ed','https://api.whatsapp.com/send/?phone=554535278100&text=Ol%C3%A1%2C+vim+por+indicação+da+Ariane+Fiorentin+e+quero+garantir+meus+ingressos+com+desconto.&type=phone_number&app_absent=0','Parceria Ariane Fiorentin Hospedagens','2026-01-08 13:35:00.002581+00',1,'Link parceria teste'),
        ('c3870957-850e-4a2a-9cbc-6a336ab308d4','https://dreams-park-show.reservio.com/staff/b456aa6c-b6ea-48e8-b3d9-2a04da60c51b','Agendamento Dreams Ice Bar','2025-09-26 12:16:02.129155+00',12,''),
        ('c4a55224-85dc-40f2-b672-f54718adb313','https://wa.me/554535278100?text=Ol%C3%A1!%20Vim%20por%20indica%C3%A7%C3%A3o%20do%20taxista%20Jucimar%20Felisberto%20(26884)%20e%20gostaria%20de%20saber%20mais%20sobre%20os%20atrativos%20Dreams.','Parceiro Jucimar 26884','2026-01-16 02:44:11.796735+00',1,''),
        ('d4e0f7d6-11ce-4597-8aa2-8035f110506d','https://wa.me/554535278100?text=Ol%C3%A1.%20Ganhei%20um%20ingresso%20para%20o%20Maravilhas%20do%20Mundo%20e%20gostaria%20de%20saber%20mais%20sobre%20os%20outros%20ingressos%20do%20Dreams.','Titular da Reserva Maravilhas do Mundo','2026-01-15 14:52:32.864972+00',5,''),
        ('d74eaecf-dd05-447e-93e0-0624c79cd0c0','https://www.dreamsparkshow.com.br/loja/?cupom=PARC25-MARAN10&bookingagency=23348','QR Code Maran - parceria comercial 10%','2025-09-29 15:10:59.918067+00',77,''),
        ('daf1f438-a563-4118-9882-84f744dac65b','https://wa.me/554535278100?text=Ol%C3%A1.%20Estou%20hospedado(a)%20em%20um%20Airbnb%20Iguassu%20Personnalite%20e%20gostaria%20de%20garantir%20meus%20ingressos%20com%20desconto.','Parceria Iguassu Personnalite','2026-01-08 17:49:22.688615+00',2,''),
        ('e06f0f66-c125-4401-b47a-7110b2ff8978','https://dreamsparkshow.com.br/','Site Dreams - displays hotéis','2025-09-29 15:13:06.426783+00',48,''),
        ('f50734b1-5b53-4ac6-8a05-953612e89839','https://www.dreamsparkshow.com.br/loja/?_gl=1*3sw1n3*_ga*MTk2MzMxMTI0My4xNzU0OTM1NzI5*_ga_2LYH18ZHZR*czE3NTc1NDA5OTckbzgkZzEkdDE3NTc1NDEzMjYkajYwJGwwJGg0MDM3MDc2NjA.*_gcl_au*NzQ5MTkwNzI4LjE3NTQ5MzU3Mjk.*_ga_FGQZ6NP26N*czE3NTc1NDA5OTckbzgkZzEkdDE3NTc1NDEzMjYkajYwJGwwJGgw*_ga_V4QYNZL3G1*czE3NTc1NDA5OTckbzgkZzEkdDE3NTc1NDEzMjYkajYwJGwwJGgw','Loja Foz Vale dos Dinossauros','2025-09-10 21:56:13.745898+00',4,'Loja Foz Vale dos Dinossauros'),
        ('f94ee4d5-743e-411b-823a-23a74cc5cf9b','https://www.dreamsparkshow.com.br/loja/?cupom=FUTEXP-20&bookingagency=25526','20% OFF Pass 6 Mundo Futsal','2025-11-14 15:52:39.333573+00',32,'')
        ON CONFLICT (id) DO NOTHING
      `);
      console.log('QR codes data inserted');
    } else {
      const qrCheck = await pool.query('SELECT COUNT(*) FROM qr_codes');
      console.log('QR codes table exists with', qrCheck.rows[0].count, 'rows');
    }

    if (existingTables.includes('profiles')) {
      console.log('Profiles table exists (using external schema)');
    }

    console.log('Database initialization complete');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error.message);
    return false;
  }
};
