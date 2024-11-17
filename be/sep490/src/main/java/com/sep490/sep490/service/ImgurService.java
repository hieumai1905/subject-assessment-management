package com.sep490.sep490.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sep490.sep490.common.exception.ApiInputException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.*;
import java.io.IOException;
@Service
@Slf4j
public class ImgurService {

    private static final String IMGUR_API_URL = "https://api.imgur.com/3/upload";
    private static final String CLIENT_ID = "3ccaa58710d08b2"; // 34acc2612c08566972f72126956a745767119785

    public String uploadImageToImgur(MultipartFile file) {
        try {
            // Tạo RestTemplate
            RestTemplate restTemplate = new RestTemplate();

            // Tạo HttpHeaders để thêm Client ID vào header
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Client-ID " + CLIENT_ID);

            // Tạo một MultiValueMap để gửi file
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image", file.getBytes());  // Gửi dữ liệu ảnh dưới dạng byte[]

            // Nếu cần, có thể thêm các tham số như title, description
            body.add("title", "My uploaded image");

            // Tạo HttpEntity với headers và body
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // Gửi yêu cầu POST lên Imgur
            ResponseEntity<String> response = restTemplate.exchange(IMGUR_API_URL, HttpMethod.POST, requestEntity, String.class);
            log.info("url: {}", response.getBody());
            // Trả về kết quả từ Imgur
            return parseImgurResponse(response.getBody());
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    // Phương thức lấy URL ảnh từ JSON trả về
    private String parseImgurResponse(String responseBody) {
        // Dùng thư viện JSON như Jackson hoặc Gson để parse JSON
        // Giả sử bạn sử dụng thư viện Jackson để parse JSON
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(responseBody);
            JsonNode dataNode = rootNode.path("data");
            return dataNode.path("link").asText();
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}

