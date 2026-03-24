import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

class FirebaseService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();

  Stream<User?> get userStream => _auth.authStateChanges();
  User? get currentUser => _auth.currentUser;

  Future<UserCredential?> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return null;

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final OAuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final UserCredential userCredential = await _auth.signInWithCredential(credential);
      final User? user = userCredential.user;

      if (user != null) {
        await _checkAndCreateProfile(user);
      }
      return userCredential;
    } catch (e) {
      print("Google Sign In Error: $e");
      return null;
    }
  }

  Future<void> signOut() async {
    await _googleSignIn.signOut();
    await _auth.signOut();
  }

  Future<void> _checkAndCreateProfile(User user) async {
    final userRef = _db.collection('users').doc(user.uid);
    final userSnap = await userRef.get();

    if (!userSnap.exists) {
      await userRef.set({
        'displayName': user.displayName,
        'email': user.email,
        'uid': user.uid,
        'purchasedCourses': {},
      });
    }
  }

  Future<Map<String, dynamic>?> fetchUserAccess(String userId) async {
    final userSnap = await _db.collection('users').doc(userId).get();
    if (userSnap.exists) {
      return (userSnap.data() as Map<String, dynamic>)['purchasedCourses'] ?? {};
    }
    return null;
  }

  Future<void> saveWatchHistory(String id, String title) async {
    if (currentUser == null) return;
    await _db.collection('users').doc(currentUser!.uid).collection('watchHistory').doc(id).set({
      'videoId': id,
      'title': title,
      'timestamp': FieldValue.serverTimestamp(),
    });
  }

  Stream<QuerySnapshot> getWatchHistory(String userId) {
    return _db.collection('users').doc(userId).collection('watchHistory').orderBy('timestamp', descending: true).limit(10).snapshots();
  }
}
