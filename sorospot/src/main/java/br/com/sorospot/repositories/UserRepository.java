package br.com.sorospot.repositories;

import br.com.sorospot.domains.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {
}
