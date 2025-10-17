package br.com.sorospot.controllers;

import br.com.sorospot.services.GoogleMapsService;
import br.com.sorospot.repositories.OccurrenceRepository;
import br.com.sorospot.repositories.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import br.com.sorospot.repositories.UserRepository;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;

public class MapsControllerTest {

    @Test
    public void geocodeShouldReturnJsonFromService() {
        GoogleMapsService googleMapsService = Mockito.mock(GoogleMapsService.class);
        String fakeJson = "{\"results\":[],\"status\":\"OK\"}";
        Mockito.when(googleMapsService.geocode(Mockito.anyString())).thenReturn(Mono.just(fakeJson));

    OccurrenceRepository occurrenceRepository = Mockito.mock(OccurrenceRepository.class);
    CategoryRepository categoryRepository = Mockito.mock(CategoryRepository.class);
    UserRepository userRepository = Mockito.mock(UserRepository.class);
    MapsController controller = new MapsController(googleMapsService, occurrenceRepository, categoryRepository, userRepository);
        WebTestClient webTestClient = WebTestClient.bindToController(controller).build();

        webTestClient.get()
                .uri(uriBuilder -> uriBuilder.path("/api/maps/geocode").queryParam("address", "X").build())
                .exchange()
                .expectStatus().isOk()
                .expectBody(String.class).isEqualTo(fakeJson);
    }
}
