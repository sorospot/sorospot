package br.com.sorospot.repositories;

import br.com.sorospot.domains.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    Optional<Category> findByType(String type);
}
