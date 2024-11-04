package com.sep490.sep490.service;

import com.google.firebase.cloud.StorageClient;
import com.sep490.sep490.common.exception.ApiInputException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
public class FirebaseStorageService {

    public String uploadFile(MultipartFile file) {
        long maxFileSize = 10 * 1024 * 1024; // 10MB in bytes

        try {
            if (file.getSize() > maxFileSize) {
                throw new ApiInputException("File size exceeds the maximum allowed size of 10MB.");
            }
            String fileName = file.getOriginalFilename();
            InputStream content = file.getInputStream();
            StorageClient.getInstance().bucket().create(fileName, content, file.getContentType());
            return String.format("https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                    StorageClient.getInstance().bucket().getName(),
                    fileName);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}
