package com.trajectory.backend.controller;

import com.trajectory.backend.service.UserService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth/users")
public class PublicUserController {

    private final UserService userService;

    public PublicUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{userId}/avatar")
    public ResponseEntity<byte[]> getAvatar(@PathVariable UUID userId) {
        try {
            byte[] avatarBytes = userService.downloadAvatar(userId);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .header("Cache-Control", "max-age=3600")
                    .body(avatarBytes);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
