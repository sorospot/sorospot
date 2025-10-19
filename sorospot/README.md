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

## Additional notes and API

This repository includes a simple pin/occurrence API used by the map UI. The backend stores occurrences in an H2 file database (jdbc:h2:file:./data/projeto_upx) and uploaded photos in the `uploads/` folder.

Endpoints (overview)

- POST /api/maps/markers — create a marker (multipart/form-data). Fields: `title` (required), `description`, `color` (e.g. `#ff0000`), `image` (file). Provide header `X-User-Email` to set the owner (optional; demo fallback used when missing).
- PUT /api/maps/markers/{id} — update marker (multipart/form-data). Fields: `title`, `description`, `color`, `image` (new image to append), `removePhotos` (comma-separated filenames to delete). Header `X-User-Email` must match owner when deleting the entire marker.
- DELETE /api/maps/markers/{id} — delete a marker (requires owner header `X-User-Email`).
- GET /api/maps/occurrences — list all occurrences. Each item includes `photos` (array), `photo` (first) and `color`.
- GET /api/maps/my-occurrences — list occurrences owned by header `X-User-Email`.

curl examples

Create a marker with an image:

curl -v -F "title=My pin" -F "description=Hello" -F "color=#00ff00" -F "image=@./img.jpg" -H "X-User-Email: me@example.com" http://localhost:8080/api/maps/markers

Update a marker (remove specific photos and upload a new one):

curl -v -X PUT -F "title=Edited" -F "removePhotos=uuid1.jpg,uuid2.jpg" -F "image=@./new.jpg" -H "X-User-Email: me@example.com" http://localhost:8080/api/maps/markers/1

PowerShell multipart note

PowerShell helpers sometimes fail to include the multipart boundary header when assembling requests, which causes server-side errors like "the request was rejected because no multipart boundary was found". When testing multipart endpoints prefer `curl -F` or use the browser UI which uses FormData.

Running tests

Use the Maven wrapper to run tests locally (Windows PowerShell):

.\mvnw.cmd test

H2 file locking

If you see an error like "Database may be already in use" when starting or testing the app, another process (IDE or a running JVM) may be holding the H2 file. Stop other processes or run tests in a clean shell.
