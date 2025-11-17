package br.com.sorospot.repositories;

import br.com.sorospot.domains.Occurrence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;

@Repository
public interface OccurrenceRepository extends JpaRepository<Occurrence, Integer> {
	long countByUser_IdAndDeletedFalse(Integer userId);
	long countByUser_EmailAndDeletedFalse(String email);
	java.util.List<Occurrence> findByUser_IdAndDeletedFalse(Integer userId);
	
	@Query("SELECT o FROM Occurrence o JOIN FETCH o.user u WHERE o.deleted = false AND u.deleted = false")
	java.util.List<Occurrence> findAllActiveWithActiveUsers();
}
