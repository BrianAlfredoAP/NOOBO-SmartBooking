import mysql from 'mysql2/promise.js';
import bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'smartbooking_db',
});

const email = 'mahasiswa@campus.ac.id';
try {
  console.log('1) findByEmail query...');
  const [rows] = await pool.execute(
    `SELECT u.id_user, u.role_id, r.name AS role, u.nama, u.email, u.password_hash, u.status_aktif, u.created_at
     FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ? LIMIT 1`,
    [email],
  );
  console.log('   ROWS:', JSON.stringify(rows));

  if (rows[0]) {
    console.log('2) bcrypt.compare...');
    const match = await bcrypt.compare('password123', rows[0].password_hash);
    console.log('   MATCH:', match, '| role:', rows[0].role, '| aktif:', rows[0].status_aktif);

    console.log('3) sessions INSERT...');
    const fakeToken = 'diag-refresh-token';
    const tokenHash = createHash('sha256').update(fakeToken).digest('hex');
    const expiry = new Date(Date.now() + 7 * 86400000);
    await pool.execute(
      `INSERT INTO sessions (id_user, token_hash, waktu_kedaluwarsa, status) VALUES (?, ?, ?, 'ACTIVE')`,
      [rows[0].id_user, tokenHash, expiry],
    );
    console.log('   SESSION INSERT OK');
    // cleanup
    await pool.execute(`DELETE FROM sessions WHERE token_hash = ?`, [tokenHash]);
    console.log('   cleaned up');
  } else {
    console.log('   NO USER FOUND');
  }
} catch (e) {
  console.error('ERROR:', e.message);
  console.error('CODE:', e.code);
  console.error('SQL_STATE:', e.sqlState, '| SQL_MSG:', e.sqlMessage);
} finally {
  await pool.end();
}
