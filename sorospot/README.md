# sorospot — Google Maps integration

This project is a Spring Boot application. It includes a small service and controller to call the Google Maps Geocoding API using WebClient.

How to get an API key

1. Go to https://console.cloud.google.com/
2. Create/select a project.
3. Enable the Maps Geocoding API (APIs & Services > Library).
4. Create an API key (APIs & Services > Credentials).
5. Restrict the key (HTTP referrers or IPs) for security.

Run locally (Windows PowerShell)

# set environment variable (PowerShell)

$env:GOOGLE_MAPS_API_KEY = "YOUR_KEY_HERE"

# run with Maven wrapper

./mvnw.cmd spring-boot:run

Open the web map page

- After starting the app, open http://localhost:8080/mapa in your browser to see the embedded Google Map.

Using a .env file (local dev)

- You can create a `.env` file in the project root containing your environment variables. Example: copy `.env.example` to `.env` and fill the key.
- Important: `.env` is added to `.gitignore` in this project — do NOT commit your `.env` file.

  ```text
  GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
  ```

How your group can validate the key is private

- Never commit the actual API key to the repo. If you accidentally committed it, rotate (regenerate) the key immediately in Google Cloud and revoke the old one.
- Check git history for accidental commits:
  - `git log -S 'YOUR_KEY_PART' --source --all` or `git grep 'AIza' $(git rev-list --all)` can help search for likely API key patterns.
- Use `.env.example` in the repo so everyone has the example but not the real secret.
- In CI (GitHub Actions, GitLab CI, etc.) store the key in the project's Secrets (GitHub: Settings > Secrets). Your CI can inject the secret at build/run time without exposing it in the code.
- For extra protection in production, use a secrets manager such as Google Secret Manager or HashiCorp Vault and grant access only to service accounts that need it.

Key restrictions (strongly recommended)

- On Google Cloud Console, restrict the API key by:
  - Application restrictions: HTTP referrers (websites) or IP addresses.
  - API restrictions: limit the key to the Maps JavaScript API and Geocoding API.
- Restricting the key significantly reduces risk if it is leaked.

Automated checks and CI gating

- Add linting or a pre-commit hook (e.g., `git-secrets`, `truffleHog`) to block accidental commits of secret-like strings.
- In GitHub Actions, add a job that scans for secrets in PRs and fails the build if any are found.

How to set the environment variable on Windows (alternatives)

- PowerShell (temporary for current session):

  ```powershell
  $env:GOOGLE_MAPS_API_KEY = "YOUR_KEY_HERE"
  ```

- Command Prompt (temporary for current session):

  ```cmd
  set GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
  ```

- Persistently (System Environment Variables):
  - Open Settings > System > About > Advanced system settings > Environment Variables and add `GOOGLE_MAPS_API_KEY`.

Test the endpoints

- Forward geocode (address -> lat/lng):
  GET http://localhost:8080/api/maps/geocode?address=Av.+Paulista,+São+Paulo

- Reverse geocode (lat,lng -> address):
  GET http://localhost:8080/api/maps/reverse?lat=-23.561414&lng=-46.655881

Notes

- API key must be valid and have billing enabled for Maps APIs in many cases.
- The service returns the raw JSON response from Google. For production, map and validate fields before returning to clients.
