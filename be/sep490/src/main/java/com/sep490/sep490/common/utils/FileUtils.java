package com.sep490.sep490.common.utils;

import com.sep490.sep490.common.exception.ApiInputException;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

public class FileUtils {
    private static String uploadDir = "E:/upload-file";
    public static String saveFile(MultipartFile file) {
        File destinationFile = new File(uploadDir, file.getOriginalFilename());

        try {
            file.transferTo(destinationFile);
            return destinationFile.getAbsolutePath();
        } catch (IOException e) {
            throw new ApiInputException("Xảy ra lỗi khi tải tệp!");
        }
    }
}
