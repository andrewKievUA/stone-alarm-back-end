 CREATE USER 'firebaseServer4'@'%' IDENTIFIED  WITH mysql_native_password BY  '1234';
 GRANT ALL PRIVILEGES ON * . * TO 'firebaseServer4'@'%';
FLUSH PRIVILEGES

-- % для всех айпишников


