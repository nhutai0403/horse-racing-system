package com.horseracing.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.horseracing.entities.AiChatHistory;
import com.horseracing.entities.User;
import com.horseracing.entities.Wallet;
import com.horseracing.entities.enums.Role;
import com.horseracing.repositories.AiChatHistoryRepository;
import com.horseracing.repositories.WalletRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.client.RestTemplate;

import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiChatService {

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    private final ResourceLoader resourceLoader;
    private final AiChatHistoryRepository aiChatHistoryRepository;
    private final WalletRepository walletRepository;
    private final RestTemplate restTemplate = createRestTemplateWithTimeout();

    private static RestTemplate createRestTemplateWithTimeout() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = 
            new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(30000); // 30 seconds
        factory.setReadTimeout(30000);    // 30 seconds
        return new RestTemplate(factory);
    }
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String systemPrompt = "";

    @PostConstruct
    public void init() {
        try {
            Resource resource = resourceLoader.getResource("classpath:prompts/system-prompt.txt");
            try (Reader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)) {
                this.systemPrompt = FileCopyUtils.copyToString(reader);
                log.info("Loaded System Prompt successfully.");
            }
        } catch (Exception e) {
            log.error("Could not load system prompt file. Using default empty prompt.", e);
            this.systemPrompt = "Bạn là trợ lý ảo. Hãy giúp đỡ người dùng.";
        }
    }

    public String chat(String userMessage) {
        return chat(userMessage, null);
    }

    public String chat(String userMessage, User user) {
        if (geminiApiKey == null || geminiApiKey.isEmpty() || geminiApiKey.contains("your-gemini-api-key")) {
            return "{\"text\": \"Lỗi: Chưa cấu hình Gemini API Key. Vui lòng thêm GEMINI_API_KEY vào biến môi trường.\" }";
        }

        // 1. Save user's message to database if authenticated
        if (user != null) {
            try {
                AiChatHistory userMsg = AiChatHistory.builder()
                        .user(user)
                        .sender("USER")
                        .message(userMessage)
                        .build();
                aiChatHistoryRepository.save(userMsg);
            } catch (Exception e) {
                log.error("Error saving user message to database", e);
            }
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + geminiApiKey;

        try {
            ObjectNode rootNode = objectMapper.createObjectNode();

            // 2. Customize System Instruction based on user role and data
            String rolePrompt = "";
            if (user == null) {
                rolePrompt = "\nVai trò người dùng: GUEST (Khách vãng lai - chưa đăng nhập).\n"
                        + "Gợi ý điều hướng: Nếu người dùng hỏi tổng quan về hệ thống hoặc có ý định muốn thực hiện các thao tác cần đăng nhập (như xem giải đấu chi tiết, đặt cược, nạp tiền), hãy trả về chuỗi JSON chứa hành động NAVIGATE đến '/login' hoặc '/signup' để hướng dẫn họ đăng ký/đăng nhập.";
            } else {
                Role role = user.getRole();
                String balanceInfo = "";
                if (role == Role.SPECTATOR) {
                    Optional<Wallet> walletOpt = walletRepository.findByUserId(user.getId());
                    BigDecimal balance = walletOpt.map(Wallet::getBalance).orElse(BigDecimal.ZERO);
                    balanceInfo = " (Số dư ví hiện tại: " + balance + " VND)";
                }
                rolePrompt = "\nVai trò người dùng: " + role.name() + " (Đã đăng nhập).\n"
                        + "Thông tin tài khoản: Tên: " + user.getFullName() + ", Email: " + user.getEmail() + balanceInfo + ".\n";

                if (role == Role.SPECTATOR) {
                    rolePrompt += "Hướng dẫn nghiệp vụ: Tập trung hỗ trợ người xem đặt cược, nạp/rút tiền qua PayOS, xem lịch sử đặt cược. "
                            + "\n- Nếu họ muốn đặt cược hoặc hỏi xem nên đặt cược vào chú ngựa nào: Hãy hướng dẫn họ xem thông tin lịch sử thi đấu để phân tích, tự động chuyển hướng màn hình bằng cách trả về hành động NAVIGATE đến '/spectator/results'."
                            + "\n- Nếu họ muốn xuất file báo cáo (PDF hoặc Excel) về lịch sử cược/tiền nạp, hãy đề xuất trả về hành động DOWNLOAD_FILE với url '/api/v1/reports/pdf/wallet-transactions' hoặc '/api/v1/reports/excel/wallet-transactions'.";
                } else if (role == Role.HORSE_OWNER) {
                    rolePrompt += "Hướng dẫn nghiệp vụ: Tập trung hỗ trợ chủ ngựa quản lý ngựa của mình, đăng ký giải đấu cho ngựa, thương thảo với Jockey (Nài ngựa). "
                            + "\n- Nếu họ muốn quản lý ngựa hoặc đăng ký đua, hãy chuyển hướng họ bằng hành động NAVIGATE đến '/owner/horses'.";
                } else if (role == Role.JOCKEY) {
                    rolePrompt += "Hướng dẫn nghiệp vụ: Tập trung hỗ trợ nài ngựa xem lịch đua và hợp đồng thỏa thuận với chủ ngựa. "
                            + "\n- Nếu họ hỏi về lịch đua hoặc thỏa thuận hợp đồng, chuyển hướng bằng hành động NAVIGATE đến '/jockey/schedule'.";
                } else if (role == Role.RACE_REFEREE) {
                    rolePrompt += "Hướng dẫn nghiệp vụ: Tập trung hỗ trợ trọng tài ghi nhận vi phạm, xem lịch bắt giải đấu. "
                            + "\n- Giao diện làm việc của trọng tài ở đường dẫn '/referee/schedule'.";
                } else if (role == Role.ADMIN) {
                    rolePrompt += "Hướng dẫn nghiệp vụ: Tập trung hỗ trợ quản trị viên duyệt yêu cầu nâng cấp vai trò, quản lý người dùng, thiết lập giải đấu. "
                            + "\n- Giao diện duyệt nâng cấp ở '/admin/upgrades'.";
                }
            }

            String finalSystemInstruction = this.systemPrompt + "\n" + rolePrompt + "\n"
                    + "QUY TẮC ĐỊNH DẠNG PHẢN HỒI (QUAN TRỌNG NHẤT):\n"
                    + "Bạn có hai cách phản hồi:\n"
                    + "1. Trả về văn bản nói chuyện thông thường bằng tiếng Việt.\n"
                    + "2. Khi người dùng muốn xem biểu đồ, tải báo cáo hoặc chuyển hướng màn hình, hãy trả về chuỗi JSON chuẩn (không chứa bất kỳ chữ hay dấu ```json ở đầu/cuối, chỉ trả về chuỗi JSON thô có dấu { và }), cấu trúc JSON:\n"
                    + "{\n"
                    + "  \"text\": \"Thông điệp phản hồi chính gửi người dùng bằng tiếng Việt...\",\n"
                    + "  \"actions\": [\n"
                    + "    { \"type\": \"NAVIGATE\", \"payload\": \"/đường_dẫn\" },\n"
                    + "    { \"type\": \"DOWNLOAD_FILE\", \"payload\": { \"url\": \"/đường_dẫn_api\", \"label\": \"Nút tải xuống\" } }\n"
                    + "  ],\n"
                    + "  \"chart\": {\n"
                    + "    \"type\": \"BAR\", // hoặc PIE, LINE\n"
                    + "    \"title\": \"Tiêu đề biểu đồ\",\n"
                    + "    \"data\": [\n"
                    + "      { \"label\": \"Nhãn 1\", \"value\": 100 },\n"
                    + "      { \"label\": \"Nhãn 2\", \"value\": 150 }\n"
                    + "    ]\n"
                    + "  }\n"
                    + "}\n"
                    + "Hãy tự động phân tích câu hỏi để trả về hành động chuyển hướng màn hình hoặc biểu đồ phù hợp nhất.";

            ObjectNode systemInstruction = objectMapper.createObjectNode();
            ArrayNode sysParts = objectMapper.createArrayNode();
            ObjectNode sysText = objectMapper.createObjectNode();
            sysText.put("text", finalSystemInstruction);
            sysParts.add(sysText);
            systemInstruction.set("parts", sysParts);
            rootNode.set("system_instruction", systemInstruction);

            // 3. Build the contents array containing conversation log (up to 50 messages)
            ArrayNode contentsArray = objectMapper.createArrayNode();
            if (user != null) {
                List<AiChatHistory> history = aiChatHistoryRepository.findTop50ByUserIdOrderByCreatedAtDesc(user.getId());
                Collections.reverse(history); // chronological order

                for (AiChatHistory h : history) {
                    ObjectNode contentObj = objectMapper.createObjectNode();
                    contentObj.put("role", h.getSender().equalsIgnoreCase("USER") ? "user" : "model");
                    ArrayNode partsArray = objectMapper.createArrayNode();
                    ObjectNode textPart = objectMapper.createObjectNode();
                    textPart.put("text", h.getMessage());
                    partsArray.add(textPart);
                    contentObj.set("parts", partsArray);
                    contentsArray.add(contentObj);
                }
            } else {
                // For Guest: just current message
                ObjectNode contentObj = objectMapper.createObjectNode();
                contentObj.put("role", "user");
                ArrayNode partsArray = objectMapper.createArrayNode();
                ObjectNode textPart = objectMapper.createObjectNode();
                textPart.put("text", userMessage);
                partsArray.add(textPart);
                contentObj.set("parts", partsArray);
                contentsArray.add(contentObj);
            }

            rootNode.set("contents", contentsArray);

            // Send request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(rootNode.toString(), headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            String replyText = "Xin lỗi, tôi không thể lấy được câu trả lời từ AI lúc này.";

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                JsonNode candidates = jsonResponse.path("candidates");
                if (candidates.isArray() && candidates.size() > 0) {
                    JsonNode firstCandidate = candidates.get(0);
                    JsonNode parts = firstCandidate.path("content").path("parts");
                    if (parts.isArray() && parts.size() > 0) {
                        replyText = parts.get(0).path("text").asText();
                    }
                }
            }

            // 4. Save AI's response to database if authenticated
            if (user != null) {
                try {
                    AiChatHistory aiReply = AiChatHistory.builder()
                            .user(user)
                            .sender("AI")
                            .message(replyText)
                            .build();
                    aiChatHistoryRepository.save(aiReply);
                    
                    // Maintain only last 50 messages
                    aiChatHistoryRepository.keepOnlyLast50Messages(user.getId());
                } catch (Exception e) {
                    log.error("Error saving AI response to database", e);
                }
            }

            // 5. Structure and validate response for the client (JSON Wrapping)
            String trimmedReply = replyText.trim();
            // Remove markdown format if AI wrapped it in ```json ... ```
            if (trimmedReply.startsWith("```json")) {
                trimmedReply = trimmedReply.substring(7);
                if (trimmedReply.endsWith("```")) {
                    trimmedReply = trimmedReply.substring(0, trimmedReply.length() - 3);
                }
                trimmedReply = trimmedReply.trim();
            } else if (trimmedReply.startsWith("```")) {
                trimmedReply = trimmedReply.substring(3);
                if (trimmedReply.endsWith("```")) {
                    trimmedReply = trimmedReply.substring(0, trimmedReply.length() - 3);
                }
                trimmedReply = trimmedReply.trim();
            }

            try {
                JsonNode parsedNode = objectMapper.readTree(trimmedReply);
                if (parsedNode.isObject() && parsedNode.has("text")) {
                    return trimmedReply; // It's already valid custom JSON
                }
            } catch (Exception e) {
                // Not valid JSON, wrap it
            }

            ObjectNode wrappedResponse = objectMapper.createObjectNode();
            wrappedResponse.put("text", replyText);
            return wrappedResponse.toString();

        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            ObjectNode errorNode = objectMapper.createObjectNode();
            errorNode.put("text", "Đã xảy ra lỗi khi kết nối với AI: " + e.getMessage());
            return errorNode.toString();
        }
    }
}
