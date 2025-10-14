package br.com.sorospot.repositories;

import br.com.sorospot.domains.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
}
