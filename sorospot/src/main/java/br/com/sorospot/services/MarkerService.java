package br.com.sorospot.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.sorospot.dtos.Marker;

import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class MarkerService {

    private final ObjectMapper mapper = new ObjectMapper();
    private final File storage = new File("markers.json");

    public synchronized List<Marker> list() {
        if (!storage.exists()) return Collections.emptyList();
        try {
            return mapper.readValue(storage, new TypeReference<List<Marker>>(){});
        } catch (IOException e) {
            return Collections.emptyList();
        }
    }

    public synchronized Marker add(Marker m) {
        List<Marker> all = new ArrayList<>(list());
        if (m.getId() == null || m.getId().isEmpty()) m.setId(UUID.randomUUID().toString());
        all.add(m);
        try { mapper.writeValue(storage, all); } catch (IOException ignored) {}
        return m;
    }
}
