# sorospot — Google Maps integration

This project is a Spring Boot application. It includes a small service and controller to call the Google Maps Geocoding API using WebClient.

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
