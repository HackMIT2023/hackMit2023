package com.plantplot.plant_plot.restcontroller;

import com.github.alperkurtul.firebaseuserauthentication.bean.FirebaseSignInSignUpResponseBean;
import com.github.alperkurtul.firebaseuserauthentication.service.UserAuthenticationServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FirebaseAuthRestcontroller {

    @Autowired
    private UserAuthenticationServiceImpl userAuthenticationServiceImpl;

    @GetMapping("/getIdToken")
    public String getIdToken() {
        FirebaseSignInSignUpResponseBean firebaseSignInSignUpResponseBean = userAuthenticationServiceImpl.signInWithEmailAndPassword("example@email.com","password");

        return firebaseSignInSignUpResponseBean.getIdToken();

    }


}
