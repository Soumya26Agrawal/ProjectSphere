package com.cts.mfrp.project_sphere.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AIController {

    private final ChatClient chatClient;
    public AIController(ChatClient.Builder builder){
        this.chatClient=builder.build();
    }

    @GetMapping("/ai")
    public String ask(@RequestParam String q){
        return chatClient.prompt().user(q).call().content();
    }

}
