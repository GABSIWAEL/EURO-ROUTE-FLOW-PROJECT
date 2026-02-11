package com.euroroute.controller;

import com.euroroute.dto.*;
import com.euroroute.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" }, allowCredentials = "true")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signUp(@RequestBody SignUpRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.signUp(request);
        setAuthCookie(response, authResponse.getToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signIn(@RequestBody SignInRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.signIn(request);
        setAuthCookie(response, authResponse.getToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/signout")
    public ResponseEntity<Void> signOut(HttpServletResponse response) {
        authService.signOut();
        // Clear the auth cookie
        Cookie cookie = new Cookie("authToken", "");
        cookie.setMaxAge(0);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to true in production with HTTPS
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
    }

    private void setAuthCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("authToken", token);
        cookie.setMaxAge((int) (jwtExpirationMs / 1000)); // Convert to seconds
        cookie.setPath("/");
        cookie.setHttpOnly(true); // Prevent JavaScript access
        cookie.setSecure(false); // Set to true in production with HTTPS
        response.addCookie(cookie);
    }
}
