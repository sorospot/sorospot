package br.com.sorospot.repositories;

import br.com.sorospot.domains.Occurrence;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OccurrenceRepository extends JpaRepository<Occurrence, Integer> {
	long countByUser_IdAndDeletedFalse(Integer userId);
	long countByUser_EmailAndDeletedFalse(String email);
}
