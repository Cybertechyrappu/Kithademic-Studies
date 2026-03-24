class Course {
  final String id;
  final String title;
  final String description;
  final String price;
  final List<String> features;
  final bool isPurchasable;

  Course({
    required this.id,
    required this.title,
    required this.description,
    required this.price,
    required this.features,
    this.isPurchasable = false,
  });

  bool get isFree => price == "0" || price.toLowerCase() == "free";
}

class Lesson {
  final String title;
  final String videoId;

  Lesson({required this.title, required this.videoId});
}

class BasicVideo {
  final String id;
  final String title;

  BasicVideo({required this.id, required this.title});
}
