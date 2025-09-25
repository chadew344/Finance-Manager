package com.financemanager.backend.controller;

import com.financemanager.backend.dto.auth.reponse.AuthenticationResponse;
import com.financemanager.backend.dto.auth.request.AuthenticationRequest;
import com.financemanager.backend.util.APIResponse;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
@CrossOrigin
@Slf4j
@RequiredArgsConstructor
public class UserProfileController {

}
