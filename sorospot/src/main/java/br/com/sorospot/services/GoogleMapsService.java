package br.com.sorospot.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;

@Service
public class GoogleMapsService {

    private final WebClient webClient;

    private final String apiKey;

    public GoogleMapsService(WebClient.Builder webClientBuilder, @Value("${google.maps.apiKey}") String apiKey) {
        this.webClient = webClientBuilder.baseUrl("https://maps.googleapis.com/maps/api").build();
        this.apiKey = apiKey;
    }

    /**
     * Faz geocoding (endereço -> lat/lng).
     * Retorna o JSON cruzin fornecido da API do Google.
     */
    public Mono<String> geocode(String address) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/geocode/json")
                        .queryParam("address", address)
                        .queryParam("key", apiKey)
                        .build())
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(String.class);
    }

    /**
     * Geocode simplificado retorna apenas formatted address + lat/lng + status TESTES
     */
    public Mono<Optional<GeocodeResult>> geocodeSimple(String address) {
        ObjectMapper mapper = new ObjectMapper();
        return geocode(address)
                .map(body -> {
                    try {
                        JsonNode root = mapper.readTree(body);
                        String status = root.path("status").asText();
                        JsonNode results = root.path("results");
                        if (results.isArray() && results.size() > 0) {
                            JsonNode first = results.get(0);
                            String formatted = first.path("formatted_address").asText();
                            JsonNode loc = first.path("geometry").path("location");
                            double lat = loc.path("lat").asDouble();
                            double lng = loc.path("lng").asDouble();
                            return Optional.of(new GeocodeResult(formatted, lat, lng, status));
                        }
                        return Optional.of(new GeocodeResult(null, 0, 0, status));
                    } catch (Exception e) {
                        return Optional.empty();
                    }
                });
    }

    /**
     * Faz reverse geocoding (lat,lng -> endereço).
     */
    public Mono<String> reverseGeocode(double lat, double lng) {
        String latlng = lat + "," + lng;
        return webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/geocode/json")
                        .queryParam("latlng", latlng)
                        .queryParam("key", apiKey)
                        .build())
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(String.class);
    }
}
