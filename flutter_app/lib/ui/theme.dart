import 'package:flutter/material.dart';

class AppColors {
  static const Color primaryGreen = Color(0xFF022C22);
  static const Color deepBg = Color(0xFF001A14);
  static const Color accentGold = Color(0xFFEEBB5D);
  static const Color glassBg = Color(0x0DFFFFFF); // 5% White
  static const Color glassBorder = Color(0x1AFFFFFF); // 10% White
  static const Color textLight = Colors.white;
}

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      primaryColor: AppColors.primaryGreen,
      canvasColor: AppColors.deepBg,
      scaffoldBackgroundColor: AppColors.deepBg,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.accentGold,
        secondary: AppColors.primaryGreen,
        background: AppColors.deepBg,
      ),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(color: AppColors.textLight, fontFamily: 'Amiri', fontWeight: FontWeight.bold),
        headlineMedium: TextStyle(color: AppColors.textLight, fontWeight: FontWeight.bold),
        titleMedium: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        bodyMedium: TextStyle(color: Colors.grey, fontSize: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.accentGold,
          foregroundColor: Colors.black,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(50)),
          padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 12),
          textStyle: const TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}
