package com.horseracing.repositories;

import com.horseracing.entities.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Integer> {
    List<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(Integer walletId);
    Optional<WalletTransaction> findByPayosOrderCode(Long payosOrderCode);
    List<WalletTransaction> findByTransactionTypeOrderByCreatedAtDesc(String transactionType);
    long countByTransactionTypeAndStatus(String transactionType, String status);
}
