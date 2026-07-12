package com.trajectory.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@Slf4j
public class StorageService {

    private final S3Client s3Client;
    private final Path fallbackDir;
    private boolean useFallback = false;

    public StorageService(S3Client s3Client) {
        this.s3Client = s3Client;
        this.fallbackDir = Paths.get(System.getProperty("user.dir"), "local-storage");
        try {
            Files.createDirectories(fallbackDir);
        } catch (IOException e) {
            log.error("Could not create local storage fallback directory", e);
        }
    }

    public String uploadFile(String bucketName, String key, byte[] bytes, String contentType) {
        if (!useFallback) {
            try {
                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .contentType(contentType)
                        .build();

                s3Client.putObject(putObjectRequest, RequestBody.fromBytes(bytes));
                log.info("Uploaded file successfully to S3: {}/{}", bucketName, key);
                return key;
            } catch (Exception e) {
                log.warn("S3 upload failed, switching to local fallback: {}", e.getMessage());
                useFallback = true;
            }
        }

        // Fallback implementation
        try {
            Path filePath = fallbackDir.resolve(bucketName + "_" + key.replace("/", "_"));
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, bytes);
            log.info("Uploaded file successfully to local fallback: {}", filePath);
            return key;
        } catch (IOException e) {
            log.error("Failed to upload file to local fallback", e);
            throw new RuntimeException("Storage failure", e);
        }
    }

    public byte[] downloadFile(String bucketName, String key) {
        if (!useFallback) {
            try {
                GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .build();

                ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(getObjectRequest);
                return objectBytes.asByteArray();
            } catch (Exception e) {
                log.warn("S3 download failed, trying local fallback: {}", e.getMessage());
            }
        }

        // Fallback implementation
        try {
            Path filePath = fallbackDir.resolve(bucketName + "_" + key.replace("/", "_"));
            if (Files.exists(filePath)) {
                return Files.readAllBytes(filePath);
            }
            throw new RuntimeException("File not found in storage");
        } catch (IOException e) {
            log.error("Failed to download file from local fallback", e);
            throw new RuntimeException("Storage failure", e);
        }
    }

    public void deleteFile(String bucketName, String key) {
        if (!useFallback) {
            try {
                DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .build();
                s3Client.deleteObject(deleteObjectRequest);
                return;
            } catch (Exception e) {
                log.warn("S3 delete failed, trying local fallback: {}", e.getMessage());
            }
        }

        try {
            Path filePath = fallbackDir.resolve(bucketName + "_" + key.replace("/", "_"));
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.error("Failed to delete file from local fallback", e);
        }
    }
}
