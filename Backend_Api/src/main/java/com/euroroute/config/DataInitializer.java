package com.euroroute.config;

import com.euroroute.entity.User;
import com.euroroute.entity.User.UserRole;
import com.euroroute.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

/**
 * Initialize default admin user on application startup
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Check if admin user already exists
        boolean adminExists = userRepository.findByEmail("admin@euroreute.com").isPresent();

        if (!adminExists) {
            // Create default admin user
            User adminUser = new User();
            adminUser.setId(UUID.randomUUID().toString());
            adminUser.setEmail("admin@euroreute.com");
            adminUser.setFullName("Admin User");
            adminUser.setPassword(passwordEncoder.encode("admin123456"));
            adminUser.setRole(UserRole.ADMIN);
            adminUser.setActive(true);

            userRepository.save(adminUser);
            System.out.println("✓ Default admin user created successfully");
            System.out.println("  Email: admin@euroreute.com");
            System.out.println("  Password: admin123456");
        } else {
            System.out.println("✓ Admin user already exists, skipping initialization");
        }
    }
}
