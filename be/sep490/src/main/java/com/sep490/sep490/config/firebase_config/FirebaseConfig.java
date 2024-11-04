package com.sep490.sep490.config.firebase_config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Bean
    public FirebaseApp initializeFirebase() throws IOException {
        try (InputStream serviceAccount = getClass().getClassLoader().getResourceAsStream("firebase/ses-sep490-g44-995f1-firebase-adminsdk-nc5k3-06d3cd131c.json")) {
            if (serviceAccount == null) {
                throw new IOException("Firebase service account file not found");
            }

            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setStorageBucket("ses-sep490-g44-995f1.appspot.com")
                    .build();

            return FirebaseApp.initializeApp(options);
        } catch (IOException e) {
            e.printStackTrace();
            throw e;
        }
    }
}

