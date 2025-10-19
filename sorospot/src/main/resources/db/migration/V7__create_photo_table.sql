-- Create photo table. Data migration is handled by a Java-based migration (V8).
CREATE TABLE IF NOT EXISTS photo (
  id INT PRIMARY KEY AUTO_INCREMENT,
  occurrence_id INT,
  filename VARCHAR(1024),
  created_at TIMESTAMP
);

