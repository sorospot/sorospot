package br.com.sorospot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

@SpringBootApplication
public class SorospotApplication {

	public static void main(String[] args) {
		// Carregar o .env pra dev local
		File envFile = new File(".env");
		if (envFile.exists() && envFile.isFile()) {
			try (BufferedReader br = new BufferedReader(new FileReader(envFile))) {
				String line;
				while ((line = br.readLine()) != null) {
					line = line.trim();
					if (line.isEmpty() || line.startsWith("#")) continue;
					int eq = line.indexOf('=');
					if (eq <= 0) continue;
					String key = line.substring(0, eq).trim();
					String value = line.substring(eq + 1).trim();
					// Remove surrounding quotes se houver
					if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
						value = value.substring(1, value.length() - 1);
					}
					// Definir como propriedade do sistema (Spring Boot lê variáveis de ambiente e system properties)
					System.setProperty(key, value);
					// Se carregamos a variável do Google Maps, também expor como propriedade esperada
					if ("GOOGLE_MAPS_API_KEY".equals(key) && value != null && !value.isEmpty()) {
						System.setProperty("google.maps.apiKey", value);
						// Log minimal info (mascarar a chave)
						String masked = value.length() > 8 ? value.substring(0, 4) + "..." + value.substring(value.length() - 4) : "****";
						System.out.println("[bootstrap] GOOGLE_MAPS_API_KEY carregada (mascarada): " + masked);
					}
						// Also check MSSQL related env vars and log masked values to help debugging
						String jdbc = System.getProperty("MSSQL_JDBC_URL", System.getenv("MSSQL_JDBC_URL"));
						String user = System.getProperty("MSSQL_DB_USER", System.getenv("MSSQL_DB_USER"));
						if (jdbc != null || user != null) {
							String maskedJdbc = jdbc == null ? "(not set)" : (jdbc.length() > 20 ? jdbc.substring(0, 20) + "..." : jdbc);
							String maskedUser = user == null ? "(not set)" : (user.length() > 2 ? user.substring(0, 1) + "..." + user.substring(user.length()-1) : "*");
							System.out.println("[bootstrap] MSSQL config detected - JDBC=" + maskedJdbc + " user=" + maskedUser);
						}
				}
			} catch (IOException e) {
				System.err.println("Não foi possível ler .env: " + e.getMessage());
			}
		}

		SpringApplication.run(SorospotApplication.class, args);
	}

}
