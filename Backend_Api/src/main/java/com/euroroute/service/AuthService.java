package com.euroroute.service;

import com.euroroute.dto.UserDTO;
import com.euroroute.dto.SignInRequest;
import com.euroroute.dto.SignUpRequest;
import com.euroroute.dto.AuthResponse;
import com.euroroute.entity.User;
import com.euroroute.repository.UserRepository;
import com.euroroute.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Autowired
        private JwtTokenProvider jwtTokenProvider;

        @Autowired
        private AuthenticationManager authenticationManager;

        public AuthResponse signUp(SignUpRequest request) {
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already registered");
                }

                User user = User.builder()
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .fullName(request.getFullName())
                                .role(User.UserRole.DRIVER)
                                .isActive(true)
                                .build();

                User savedUser = userRepository.save(user);

                // Authenticate the user
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                SecurityContextHolder.getContext().setAuthentication(authentication);

                String token = jwtTokenProvider.generateToken(authentication.getPrincipal());

                return AuthResponse.builder()
                                .token(token)
                                .user(convertToDTO(savedUser))
                                .build();
        }

        public AuthResponse signIn(SignInRequest request) {
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                SecurityContextHolder.getContext().setAuthentication(authentication);

                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                String token = jwtTokenProvider.generateToken(authentication.getPrincipal());

                return AuthResponse.builder()
                                .token(token)
                                .user(convertToDTO(user))
                                .build();
        }

        public void signOut() {
                SecurityContextHolder.clearContext();
        }

        private UserDTO convertToDTO(User user) {
                return UserDTO.builder()
                                .id(user.getId())
                                .email(user.getEmail())
                                .fullName(user.getFullName())
                                .role(user.getRole().name().toLowerCase())
                                .isActive(user.isActive())
                                .build();
        }
}
