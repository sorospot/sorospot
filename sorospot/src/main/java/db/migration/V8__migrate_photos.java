package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class V8__migrate_photos extends BaseJavaMigration {
    @Override
    public void migrate(Context context) throws Exception {
        var conn = context.getConnection();
        try (PreparedStatement ps = conn.prepareStatement("SELECT id, photo FROM occurrence WHERE photo IS NOT NULL AND TRIM(photo) <> ''")) {
            ResultSet rs = ps.executeQuery();
            try (PreparedStatement insert = conn.prepareStatement("INSERT INTO photo (occurrence_id, filename, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)")) {
                while (rs.next()) {
                    int id = rs.getInt(1);
                    String photoStr = rs.getString(2);
                    if (photoStr == null) continue;
                    String[] parts = photoStr.split(";");
                    for (String p : parts) {
                        String clean = p == null ? null : p.trim();
                        if (clean == null || clean.isEmpty()) continue;
                        insert.setInt(1, id);
                        insert.setString(2, clean);
                        insert.addBatch();
                    }
                }
                insert.executeBatch();
            }
        }
    }
}
