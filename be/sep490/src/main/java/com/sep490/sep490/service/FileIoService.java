package com.sep490.sep490.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class FileIoService {

    @Value("${filebin.api.url}")
    private String fileBinApiUrl;

    public String uploadFileToBin(MultipartFile file) {
        try {
            // Create RestTemplate instance
            RestTemplate restTemplate = new RestTemplate();

            // Extract filename from MultipartFile
            String filename = file.getOriginalFilename();
            String mimeType =  MediaType.APPLICATION_OCTET_STREAM_VALUE; // Default to binary

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(mimeType));

            // Create HttpEntity with the file content
            HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

            // Generate bin using current timestamp
            String bin = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

            // Format the URL with bin and filename
            String uploadUrl = fileBinApiUrl + "/" + bin + "/" + filename;

            // Add upload timestamp to the headers
            String uploadTimestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            headers.add("Upload-Timestamp", uploadTimestamp);

            // Call API
            ResponseEntity<String> response = restTemplate.exchange(
                    uploadUrl,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                return uploadUrl;
            } else {
                throw new RuntimeException("File upload failed with status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to FileBin", e);
        }
    }
}
