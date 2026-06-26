package com.horseracing.repositories;

import com.horseracing.entities.User;
import com.horseracing.entities.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    List<User> findByRole(Role role);

    long countByRole(Role role);
}
