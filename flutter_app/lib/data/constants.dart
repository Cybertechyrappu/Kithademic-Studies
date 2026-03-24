import '../models/course.dart';

final List<BasicVideo> basicVideos = [
  BasicVideo(id: "42d2zuCqRY4", title: "Ramzan Talk | Yaseen Sidheeq Nurani"),
  BasicVideo(id: "pWBPJlPFqRY", title: "എത്രയാണ് അറിവ് സമ്പാദിക്കേണ്ടത്"),
  BasicVideo(id: "qvZPXKDLfLc", title: "സൂഫിസം | Yaseen Sidheeq Nurani"),
  BasicVideo(id: "Myr2DVUwaXk", title: "ഒരേയൊരു മനുഷ്യൻ | യാസീൻ സിദ്ദീഖ് നൂറാനി"),
  BasicVideo(id: "HGuknpnuHXs", title: "മുസ്ലിം വ്യക്തി നിയമം : മാനദണ്ഡങ്ങളിലെ നീതിബോധം"),
  BasicVideo(id: "RHoOG42BnnI", title: "അശ്‌റഖ ബൈത്ത്  |  Yaseen Sidheeq Nurani"),
];

final List<Course> courses = [
  Course(
    id: "c_01",
    title: "പ്രാക്റ്റിക്കൽ ഫിഖ്ഹ് കോഴ്സ് - Batch 4",
    price: "200",
    isPurchasable: false,
    description: "KITHADEMIC STUDIES നിങ്ങൾക്കായി ഒരുക്കുന്നു, പ്രായോഗിക ജീവിതത്തിൽ ഉപകാരപ്പെടും വിധം ഫിഖ്ഹിനെ ലളിതമായി പരിചയപ്പെടുത്തുന്ന ഒരു പ്രത്യേക കോഴ്സ്.",
    features: ["ട്യൂട്ടർ: യാസീൻ സിദ്ദീഖ് നൂറാനി", "ക്ലാസ് രീതി: റെക്കോർഡ് ചെയ്ത വീഡിയോകൾ", "ക്ലാസ്സുകളുടെ എണ്ണം: ആഴ്ചയിൽ 4", "സബ്സ്ക്രിപ്ഷൻ ഫീ: 1 മാസത്തേക്ക് ₹200"],
  ),
  Course(
    id: "c_02",
    title: "അഖീദ കോഴ്സ്",
    price: "0",
    isPurchasable: false,
    description: "വിശ്വാസ കാര്യങ്ങളെ കുറിച്ചുള്ള പഠനം.",
    features: ["ട്യൂട്ടർ: യാസീൻ സിദ്ദീഖ് നൂറാനി", "ക്ലാസ് രീതി: റെക്കോർഡ് ചെയ്ത വീഡിയോകൾ", "Free Course"],
  ),
];

final Map<String, List<Lesson>> courseContent = {
  "c_01": [
    Lesson(title: "Introduction to Course", videoId: "pWBPJlPFqRY"),
    Lesson(title: "Chapter 1: Basics", videoId: "KMT1J3Lg6h0"),
  ],
  "c_02": [
    Lesson(title: "Part-1 Aqeeda Foundation Course", videoId: "Mj2_llpeq_Q"),
    Lesson(title: "Part-2 Aqeeda Foundation Course", videoId: "-FAi2iOkQF4"),
  ],
};

const String adminPhone = "919876543210"; // Updated with placeholder format
