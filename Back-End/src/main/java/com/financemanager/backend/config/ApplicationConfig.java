package com.financemanager.backend.config;

import com.financemanager.backend.repository.UserRepository;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {
    private final UserRepository userRepository;

//    @Bean
//    public UserDetailsService userDetailsService(){
//        return email -> userRepository.findByEmail(email)
//                .map(user ->
//                        new org.springframework.security.core.userdetails.User(
//                                user.getEmail(),
//                                user.getPassword(),
//                                List.of(new SimpleGrantedAuthority(
//                                        "ROLE_PERSONAL"))
//                        )).orElseThrow(
//                        ()-> new UsernameNotFoundException("User not found")
//                );
//    }

    @Bean
    public UserDetailsService userDetailsService() {
        return email -> userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public AuditorAware<Long> auditorAware() {
        return new ApplicationAuditorAware();
    }


    @Bean
    public PhoneNumberUtil getPhoneNumberUtil() {
        return PhoneNumberUtil.getInstance();
    }
}
