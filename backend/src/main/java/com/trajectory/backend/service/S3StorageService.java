package com.trajectory.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

@Service
@Slf4j
public class S3StorageService {

    private final S3Client s3Client;

    public S3StorageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    /**
     * Uploads a file to S3 and returns the object key.
     */
    public String uploadFile(String bucketName, String key, byte[] bytes, String contentType) {
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
            log.error("Failed to upload file to S3: {}/{}", bucketName, key, e);
            throw new RuntimeException("S3 upload failure", e);
        }
    }

    /**
     * Downloads a file from S3.
     */
    public byte[] downloadFile(String bucketName, String key) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(getObjectRequest);
            return objectBytes.asByteArray();
        } catch (Exception e) {
            log.error("Failed to download file from S3: {}/{}", bucketName, key, e);
            throw new RuntimeException("S3 download failure", e);
        }
    }

    /**
     * Deletes a file from S3.
     */
    public void deleteFile(String bucketName, String key) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
            s3Client.deleteObject(deleteObjectRequest);
            log.info("Deleted file successfully from S3: {}/{}", bucketName, key);
        } catch (Exception e) {
            log.error("Failed to delete file from S3: {}/{}", bucketName, key, e);
            throw new RuntimeException("S3 delete failure", e);
        }
    }

    /**
     * Sanitizes a filename to avoid path traversal and invalid characters.
     */
    public static String sanitizeFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return "unnamed_file";
        }
        // Extract base name
        String name = filename;
        int lastSlash = Math.max(filename.lastIndexOf('/'), filename.lastIndexOf('\\'));
        if (lastSlash != -1) {
            name = filename.substring(lastSlash + 1);
        }
        // Replace non-alphanumeric, dot, underscore, hyphen with underscore
        name = name.replaceAll("[^a-zA-Z0-9._-]", "_");
        // Collapse multiple underscores or dots
        name = name.replaceAll("_{2,}", "_");
        name = name.replaceAll("\\.{2,}", ".");
        return name;
    }
}
