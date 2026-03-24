import 'package:flutter/material.dart';
import '../../models/course.dart';
import '../theme.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';

class ClassroomScreen extends StatefulWidget {
  final String videoId;
  final String title;
  final List<Lesson>? lessons;

  const ClassroomScreen({super.key, required this.videoId, required this.title, this.lessons});

  @override
  State<ClassroomScreen> createState() => _ClassroomScreenState();
}

class _ClassroomScreenState extends State<ClassroomScreen> {
  late YoutubePlayerController _controller;
  late String _currentVideoId;
  late String _currentTitle;

  @override
  void initState() {
    super.initState();
    _currentVideoId = widget.videoId;
    _currentTitle = widget.title;
    _controller = YoutubePlayerController.fromVideoId(
      videoId: _currentVideoId,
      autoPlay: true,
      params: const YoutubePlayerParams(showControls: true, mute: false, showFullscreenButton: true),
    );
  }

  void _playVideo(String id, String title) {
    setState(() {
      _currentVideoId = id;
      _currentTitle = title;
    });
    _controller.loadVideoById(videoId: id);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0, leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => Navigator.pop(context))),
      body: Column(
        children: [
          YoutubePlayer(controller: _controller),
              Padding(
                padding: const EdgeInsets.all(20.0),
                child: Align(child: Text(_currentTitle, style: const TextStyle(fontSize: 18, color: AppColors.accentGold, fontWeight: FontWeight.bold), textAlign: TextAlign.left)),
              ),
              Expanded(
                child: Container(
                  decoration: const BoxDecoration(color: AppColors.glassBg, borderRadius: BorderRadius.vertical(top: Radius.circular(30))),
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("Syllabus", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 15),
                      if (widget.lessons != null)
                        Expanded(
                          child: ListView.builder(
                            itemCount: widget.lessons!.length,
                            itemBuilder: (context, index) {
                              final lesson = widget.lessons![index];
                              bool active = lesson.videoId == _currentVideoId;
                              return ListTile(
                                leading: Icon(Icons.play_circle_fill, color: active ? AppColors.accentGold : Colors.grey, size: 20),
                                title: Text("${index + 1}. ${lesson.title}", style: TextStyle(color: active ? Colors.white : Colors.grey, fontSize: 13, fontWeight: active ? FontWeight.bold : FontWeight.normal)),
                                selected: active,
                                onTap: () => _playVideo(lesson.videoId, lesson.title),
                              );
                            },
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
