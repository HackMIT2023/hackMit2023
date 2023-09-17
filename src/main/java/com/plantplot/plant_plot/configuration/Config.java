package com.plantplot.plant_plot.configuration;

import com.github.alperkurtul.firebaseuserauthentication.service.UserAuthenticationServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Config {

    @Bean
    public UserAuthenticationServiceImpl userAuthenticationServiceImpl() {
        return new UserAuthenticationServiceImpl();
    };

}
