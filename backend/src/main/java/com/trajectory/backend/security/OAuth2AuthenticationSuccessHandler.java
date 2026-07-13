package com.trajectory.backend.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import com.trajectory.backend.service.RefreshTokenService;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;

    public OAuth2AuthenticationSuccessHandler(JwtTokenProvider tokenProvider, RefreshTokenService refreshTokenService) {
        this.tokenProvider = tokenProvider;
        this.refreshTokenService = refreshTokenService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        if (response.isCommitted()) {
            logger.debug("Response has already been committed. Unable to redirect to targetUrl");
            return;
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateTokenForUser(principal);
        String refreshToken = refreshTokenService.createRefreshToken(principal.getId()).getToken();

        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/login")
                .queryParam("token", token)
                .queryParam("refreshToken", refreshToken)
                .queryParam("email", principal.getEmail())
                .queryParam("name", principal.getUsername())
                .queryParam("userId", principal.getId().toString())
                .build().toUriString();

        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
