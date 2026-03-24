import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:kithademic_studies/ui/theme.dart';
import 'package:kithademic_studies/ui/screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    // Note: For native Android/iOS, you must add google-services.json/GoogleService-Info.plist manually.
    // For Web, provide your Firebase options here if not already configured via CLI.
    await Firebase.initializeApp(
      options: const FirebaseOptions(
        apiKey: "AIzaSyDm97rTDsP1sELznlVKLogPBkMiy0fpc9c",
        authDomain: "kithademic-studies.firebaseapp.com",
        projectId: "kithademic-studies",
        storageBucket: "kithademic-studies.firebasestorage.app",
        messagingSenderId: "962734931999",
        appId: "1:962734931999:web:3d335b466bafca1065552a",
        measurementId: "G-NXT6ZVKHSH",
      ),
    );
  } catch (e) {
    debugPrint("Firebase initialization failed. Native setup might be missing: $e");
  }
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Kithademic Studies',
      theme: AppTheme.darkTheme,
      home: const HomeScreen(),
    );
  }
}
