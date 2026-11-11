package com.vowandveil;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class AuthControllerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("vow_and_veil_test")
            .withUsername("testuser")
            .withPassword("testpass");

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerAndCreateWedding() throws Exception {
        String csrfResponse = mockMvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode csrfJson = objectMapper.readTree(csrfResponse);
        String csrfToken = csrfJson.get("token").asText();

        String requestBody = "{\"firstName\":\"Ava\",\"lastName\":\"Stone\",\"email\":\"ava@example.com\",\"password\":\"Password123\"}";
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
                        .header("X-XSRF-TOKEN", csrfToken)
                        .cookie(new Cookie("XSRF-TOKEN", csrfToken))
                        .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("ava@example.com"));

        String weddingBody = "{\"weddingName\":\"Sunset Affair\",\"partnerOneName\":\"Ava\",\"partnerTwoName\":\"Noah\",\"city\":\"Chicago\",\"planningStage\":\"DISCOVERY\"}";
        mockMvc.perform(put("/api/weddings/current")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(weddingBody)
                        .with(SecurityMockMvcRequestPostProcessors.user("ava@example.com").roles("USER"))
                        .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.weddingName").value("Sunset Affair"));
    }
}
