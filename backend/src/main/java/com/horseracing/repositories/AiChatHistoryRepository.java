package com.horseracing.repositories;

import com.horseracing.entities.AiChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface AiChatHistoryRepository extends JpaRepository<AiChatHistory, Integer> {
    
    List<AiChatHistory> findTop50ByUserIdOrderByCreatedAtDesc(Integer userId);
    
    @Transactional
    void deleteByUserId(Integer userId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM ai_chat_histories WHERE user_id = :userId AND id < COALESCE((" +
                   "SELECT MIN(id) FROM (SELECT TOP 50 id FROM ai_chat_histories WHERE user_id = :userId ORDER BY id DESC) as temp" +
                   "), 0)", nativeQuery = true)
    void keepOnlyLast50Messages(@Param("userId") Integer userId);
}
