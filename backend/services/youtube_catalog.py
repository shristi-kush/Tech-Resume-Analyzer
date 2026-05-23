"""Curated YouTube videos mapped by topic — used when AI or rules recommend learning content."""

from typing import Dict, Optional

YOUTUBE_CATALOG = {
    "resume_writing": {
        "title": "How to Write a Resume (Tips & Examples)",
        "url": "https://youtu.be/Tt08KmFfIYQ",
    },
    "resume_format": {
        "title": "Resume Format & Structure Guide",
        "url": "https://youtu.be/y8YH0Qbu5h4",
    },
    "interview_prep": {
        "title": "Job Interview Tips — What to Expect",
        "url": "https://youtu.be/HG68Ymazo18",
    },
    "behavioral_interview": {
        "title": "Behavioral Interview Questions & Answers",
        "url": "https://youtu.be/BOvAAoxM4vg",
    },
    "data_science": {
        "title": "Data Science Career Path & Skills",
        "url": "https://youtu.be/ua-CiDNNj30",
    },
    "machine_learning": {
        "title": "Machine Learning for Beginners",
        "url": "https://youtu.be/i_LwzRVP7bg",
    },
    "web_development": {
        "title": "Full Stack Web Development Roadmap",
        "url": "https://youtu.be/e1IyzVyrLSU",
    },
    "react": {
        "title": "React JS Crash Course",
        "url": "https://youtu.be/Dorf8i6lCuk",
    },
    "android": {
        "title": "Android Development for Beginners",
        "url": "https://youtu.be/fis26HvvDII",
    },
    "ios": {
        "title": "Swift Tutorial — Full Course for Beginners",
        "url": "https://youtu.be/comQ1-x2a1Q",
    },
    "ui_ux": {
        "title": "UI/UX Design — What You Need to Know",
        "url": "https://youtu.be/9BdtGjoIN4E",
    },
    "internship": {
        "title": "How to Get an Internship (Resume & Tips)",
        "url": "https://youtu.be/1mHjMNZZvFo",
    },
    "fresher_career": {
        "title": "Career Tips for Fresh Graduates",
        "url": "https://youtu.be/BYUy1yvjHxE",
    },
    "projects_portfolio": {
        "title": "Build a Developer Portfolio That Gets Hired",
        "url": "https://youtu.be/owm1QpV7BRE",
    },
    "certifications": {
        "title": "Best Certifications for Tech Careers",
        "url": "https://youtu.be/0m9QUoW5OvY",
    },
}

FIELD_TO_YOUTUBE = {
    "Data Science": "data_science",
    "Web Development": "web_development",
    "Android Development": "android",
    "IOS Development": "ios",
    "UI-UX Development": "ui_ux",
    "NA": "fresher_career",
}

LEVEL_TO_YOUTUBE = {
    "Fresher": "fresher_career",
    "Intermediate": "internship",
    "Experienced": "interview_prep",
}


def resolve_youtube(category: Optional[str], predicted_field: str, candidate_level: str) -> Optional[Dict]:
    """Return {title, url, category, reason} or None if not applicable."""
    key = (category or "").strip().lower().replace(" ", "_").replace("-", "_")
    if key in YOUTUBE_CATALOG:
        entry = YOUTUBE_CATALOG[key]
        return {
            "applicable": True,
            "title": entry["title"],
            "url": entry["url"],
            "category": key,
            "reason": f"Recommended for {key.replace('_', ' ')}.",
        }

    fallback_key = FIELD_TO_YOUTUBE.get(predicted_field) or LEVEL_TO_YOUTUBE.get(candidate_level)
    if fallback_key and fallback_key in YOUTUBE_CATALOG:
        entry = YOUTUBE_CATALOG[fallback_key]
        return {
            "applicable": True,
            "title": entry["title"],
            "url": entry["url"],
            "category": fallback_key,
            "reason": f"Matched to your track ({predicted_field}) and level ({candidate_level}).",
        }

    return None
