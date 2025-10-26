package br.com.sorospot.repositories.user;

import br.com.sorospot.domain.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, Integer> {
    
    Optional<Users> findByEmail(String email);
    
    Optional<Users> findByCpf(String cpf);
    
    boolean existsByEmail(String email);
    
    boolean existsByCpf(String cpf);
    
    Optional<Users> findByEmailAndDeletedFalse(String email);
}
