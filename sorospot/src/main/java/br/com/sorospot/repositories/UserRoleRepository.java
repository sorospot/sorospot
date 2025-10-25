package br.com.sorospot.repositories;

import br.com.sorospot.domains.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRoleRepository extends JpaRepository<UserRole, Integer> {
}
