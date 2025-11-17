package br.com.sorospot.controllers;

import br.com.sorospot.services.OccurrenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/occurrence")
public class OccurrenceRestController {

    @Autowired
    private OccurrenceService occurrenceService;

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> changeStatus(
        @PathVariable Integer id,
        @RequestBody Map<String, String> body,
        @RequestHeader("X-User-Email") String userEmail
    ) {
        String status = body.get("status");
        boolean ok = occurrenceService.changeOccurrenceStatus(id, status, userEmail);
        if (ok) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }
}