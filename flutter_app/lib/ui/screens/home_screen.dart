import 'package:flutter/material.dart';
import 'package:kithademic_studies/services/firebase_service.dart';
import 'package:kithademic_studies/data/constants.dart';
import 'package:kithademic_studies/models/course.dart';
import 'package:kithademic_studies/ui/widgets/video_card.dart';
import 'package:kithademic_studies/ui/screens/classroom_screen.dart';
import 'package:kithademic_studies/ui/theme.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:url_launcher/url_launcher.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  final FirebaseService _firebaseService = FirebaseService();
  String _currentCourseTab = 'premium';

  void _switchTab(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  void _openAuthModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(40),
          decoration: BoxDecoration(
            color: const Color(0xFF0A1E19),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
            border: Border.all(color: AppColors.accentGold.withOpacity(0.3)),
          ),
          child: StreamBuilder<User?>(
            stream: _firebaseService.userStream,
            builder: (context, snapshot) {
              User? user = snapshot.data;
              if (user == null) {
                return Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('Get Access', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.accentGold)),
                    const SizedBox(height: 10),
                    const Text('Access your courses and track your progress.', style: TextStyle(color: Colors.grey, fontSize: 13), textAlign: TextAlign.center),
                    const SizedBox(height: 30),
                    ElevatedButton.icon(
                      icon: const Icon(Icons.login),
                      label: const Text('Continue with Google'),
                      onPressed: () async {
                        await _firebaseService.signInWithGoogle();
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.black,
                        minimumSize: const Size(double.infinity, 50),
                      ),
                    ),
                  ],
                );
              } else {
                return Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    CircleAvatar(radius: 40, backgroundImage: NetworkImage(user.photoURL ?? 'https://cdn-icons-png.flaticon.com/512/149/149071.png')),
                    const SizedBox(height: 15),
                    Text(user.displayName ?? 'Student', style: const TextStyle(fontSize: 22, color: AppColors.accentGold, fontWeight: FontWeight.bold)),
                    Text(user.email ?? '', style: const TextStyle(color: Colors.grey)),
                    const SizedBox(height: 25),
                    
                    const Row(children: [ Icon(Icons.history, color: AppColors.accentGold, size: 18), SizedBox(width: 8), Text('Recent Activity', style: TextStyle(color: AppColors.accentGold, fontSize: 13)) ]),
                    const Divider(color: AppColors.glassBorder),
                    
                    SizedBox(
                      height: 150,
                      child: StreamBuilder(
                        stream: _firebaseService.getWatchHistory(user.uid),
                        builder: (context, snapshot) {
                          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
                          final history = snapshot.data!.docs;
                          if (history.isEmpty) return const Center(child: Text('No history.', style: TextStyle(color: Colors.grey)));
                          return ListView.builder(
                            itemCount: history.length,
                            itemBuilder: (context, index) {
                              final data = history[index].data() as Map<String, dynamic>;
                              return ListTile(
                                leading: Image.network('https://img.youtube.com/vi/${data['videoId']}/mqdefault.jpg', width: 60, height: 34, fit: BoxFit.cover),
                                title: Text(data['title'], style: const TextStyle(fontSize: 12, color: Colors.white), maxLines: 1, overflow: TextOverflow.ellipsis),
                                visualDensity: VisualDensity.compact,
                                onTap: () {
                                   Navigator.pop(context);
                                  _openClassroom(data['videoId'], data['title']);
                                },
                              );
                            },
                          );
                        },
                      ),
                    ),
                    
                    const SizedBox(height: 20),
                    OutlinedButton(
                      onPressed: () async {
                        await _firebaseService.signOut();
                        Navigator.pop(context);
                      },
                      style: OutlinedButton.styleFrom(foregroundColor: Colors.red, side: const BorderSide(color: Colors.red), minimumSize: const Size(double.infinity, 50)),
                      child: const Text('Log Out'),
                    ),
                  ],
                );
              }
            },
          ),
        );
      },
    );
  }

  void _openClassroom(String videoId, String title, [List<Lesson>? lessons]) {
     if (_firebaseService.currentUser == null) {
      _openAuthModal();
      return;
    }
    Navigator.push(context, MaterialPageRoute(builder: (context) => ClassroomScreen(videoId: videoId, title: title, lessons: lessons)));
  }

  void _buyCourse(Course course) async {
    final user = _firebaseService.currentUser;
    if (user == null) {
       _openAuthModal();
      return;
    }
    final msg = "🎓 *New Enrollment*%0a%0aHello Admin,%0aI'd like to pay for 1 month of:%0a*Course:* ${course.title}%0a*Course ID:* ${course.id}%0a*Price:* ₹${course.price}%0a%0a*My UID:* ${user.uid}%0a%0aPlease send UPI details.";
    final uri = Uri.parse("https://wa.me/$adminPhone?text=$msg");
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Parallax-like Background
          Positioned.fill(
            child: Container(color: AppColors.deepBg),
          ),
           
          SafeArea(
            child: IndexedStack(
              index: _currentIndex,
              children: [
                _buildHomeSection(),
                _buildCoursesSection(),
                _buildVideosSection(),
              ],
            ),
          ),
          
          _buildBottomNav(),
        ],
      ),
    );
  }

  Widget _buildHomeSection() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text("بِسْمِ ٱللَّٰهِ", style: TextStyle(fontFamily: 'Amiri', fontSize: 32, color: AppColors.accentGold)),
          const SizedBox(height: 10),
          const Text("Welcome to Kithademic Studies", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 5),
          const Text("Knowledge is the light of the heart.", style: TextStyle(color: Colors.grey, fontSize: 13)),
          const SizedBox(height: 30),
          ElevatedButton(
            onPressed: () { if (_firebaseService.currentUser != null) _switchTab(1); else _openAuthModal(); },
            child: const Text("Get Started"),
          ),
        ],
      ),
    );
  }

  Widget _buildCoursesSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Column(
        children: [
          const Text("Our Courses", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.accentGold)),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _tabButton("Premium", _currentCourseTab == 'premium', () => setState(() => _currentCourseTab = 'premium')),
              const SizedBox(width: 10),
              _tabButton("Free", _currentCourseTab == 'free', () => setState(() => _currentCourseTab = 'free')),
            ],
          ),
          const SizedBox(height: 25),
          Expanded(
            child: ListView.builder(
              itemCount: courses.where((c) => _currentCourseTab == 'premium' ? !c.isFree : c.isFree).length,
              itemBuilder: (context, index) {
                final course = courses.where((c) => _currentCourseTab == 'premium' ? !c.isFree : c.isFree).toList()[index];
                return _buildCourseCard(course);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _tabButton(String text, bool active, VoidCallback onTap) {
    return ElevatedButton(
      onPressed: onTap,
      style: ElevatedButton.styleFrom(backgroundColor: active ? AppColors.accentGold : Colors.black.withOpacity(0.3), foregroundColor: active ? Colors.black : Colors.grey, minimumSize: const Size(110, 40)),
      child: Text(text),
    );
  }

  Widget _buildCourseCard(Course c) {
    return Card(
      color: AppColors.glassBg,
      shape: RoundedRectangleBorder(side: BorderSide(color: AppColors.glassBorder), borderRadius: BorderRadius.circular(20)),
      margin: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [ Text(c.title, style: const TextStyle(fontSize: 18, color: AppColors.accentGold, fontWeight: FontWeight.bold)), Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: c.isFree ? Colors.green : AppColors.accentGold, borderRadius: BorderRadius.circular(10)), child: Text(c.isFree ? "FREE" : "Paid", style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 10)))]),
                 const SizedBox(height: 10),
                 Text(c.description, style: const TextStyle(fontSize: 13, color: Colors.grey)),
                 const SizedBox(height: 15),
                 ...c.features.map((f) => Padding(padding: const EdgeInsets.only(bottom: 4), child: Row(children: [ const Icon(Icons.check_circle, color: AppColors.accentGold, size: 14), const SizedBox(width: 8), Text(f, style: const TextStyle(fontSize: 12, color: Colors.grey)) ]))),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: Colors.black.withOpacity(0.2)),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(c.isFree ? "FREE" : "₹${c.price}", style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                ElevatedButton(
                  onPressed: () { if (c.isFree) _openClassroom(courseContent[c.id]![0].videoId, courseContent[c.id]![0].title, courseContent[c.id]); else _buyCourse(c); },
                  child: Text(c.isFree ? "Open" : "Buy"),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVideosSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Column(
        children: [
          const Text("Videos", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.accentGold)),
          const SizedBox(height: 25),
          Expanded(
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 1, childAspectRatio: 1.5, mainAxisSpacing: 20),
              itemCount: basicVideos.length,
              itemBuilder: (context, index) => VideoCard(video: basicVideos[index], onTap: () => _openClassroom(basicVideos[index].id, basicVideos[index].title, [Lesson(title: basicVideos[index].title, videoId: basicVideos[index].id)])),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNav() {
    return Positioned(
      bottom: 20, left: 20, right: 20,
      child: Container(
        height: 70,
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.8),
          borderRadius: BorderRadius.circular(50),
          border: Border.all(color: AppColors.glassBorder),
          boxShadow: [ BoxShadow(color: Colors.black.withOpacity(0.5), blurRadius: 20, offset: const Offset(0, 10)) ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _navIcon(0, Icons.home, "Home"),
            _navIcon(1, Icons.book, "Courses"),
            _navIcon(2, Icons.play_circle_fill, "Videos"),
            _navIcon(3, Icons.person, "Profile"),
          ],
        ),
      ),
    );
  }

  Widget _navIcon(int index, IconData icon, String label) {
    bool active = _currentIndex == index;
    if (index == 3) {
       return StreamBuilder<User?>(
        stream: _firebaseService.userStream,
        builder: (context, snapshot) {
          User? user = snapshot.data;
          return IconButton(
            onPressed: _openAuthModal,
            icon: user != null ? CircleAvatar(radius: 15, backgroundImage: NetworkImage(user.photoURL ?? '')) : Icon(icon, color: Colors.grey),
          );
        },
      );
    }
    return IconButton(
      onPressed: () => _switchTab(index),
      icon: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: active ? AppColors.accentGold : Colors.grey),
          if (active) Container(width: 4, height: 4, decoration: const BoxDecoration(color: AppColors.accentGold, shape: BoxShape.circle))
        ],
      ),
    );
  }
}
