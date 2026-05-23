import random

from pyresparser import ResumeParser

from services.courses_data import FIELD_COURSES, interview_videos, resume_videos
from services.youtube_catalog import resolve_youtube
from services.pdf_reader import extract_text_from_pdf

DS_KEYWORDS = {
    "tensorflow", "keras", "pytorch", "machine learning", "deep learning", "flask", "streamlit"
}
WEB_KEYWORDS = {
    "react", "django", "node js", "react js", "php", "laravel", "magento", "wordpress",
    "javascript", "angular js", "c#", "asp.net", "flask",
}
ANDROID_KEYWORDS = {"android", "android development", "flutter", "kotlin", "xml", "kivy"}
IOS_KEYWORDS = {"ios", "ios development", "swift", "cocoa", "cocoa touch", "xcode"}
UIUX_KEYWORDS = {
    "ux", "adobe xd", "figma", "zeplin", "balsamiq", "ui", "prototyping", "wireframes",
    "user research", "user experience",
}

FIELD_SKILLS = {
    "Data Science": [
        "Data Visualization", "Predictive Analysis", "Statistical Modeling", "Scikit-learn",
        "Tensorflow", "Pytorch", "ML Algorithms",
    ],
    "Web Development": ["React", "Django", "Node JS", "Javascript", "Flask", "Angular JS"],
    "Android Development": ["Android", "Kotlin", "Flutter", "XML", "Java", "SQLite"],
    "IOS Development": ["Swift", "Xcode", "Objective-C", "Cocoa Touch"],
    "UI-UX Development": ["Figma", "Adobe XD", "Prototyping", "Wireframes", "User Research"],
}


def _pick_courses(field: str, count: int = 5) -> list[dict]:
    courses = FIELD_COURSES.get(field, [])
    shuffled = list(courses)
    random.shuffle(shuffled)
    return [{"name": n, "url": u} for n, u in shuffled[:count]]


def _predict_field(skills: list) -> dict:
    for skill in skills or []:
        s = skill.lower()
        if s in DS_KEYWORDS:
            return {"field": "Data Science", "recommended_skills": FIELD_SKILLS["Data Science"]}
        if s in WEB_KEYWORDS:
            return {"field": "Web Development", "recommended_skills": FIELD_SKILLS["Web Development"]}
        if s in ANDROID_KEYWORDS:
            return {"field": "Android Development", "recommended_skills": FIELD_SKILLS["Android Development"]}
        if s in IOS_KEYWORDS:
            return {"field": "IOS Development", "recommended_skills": FIELD_SKILLS["IOS Development"]}
        if s in UIUX_KEYWORDS:
            return {"field": "UI-UX Development", "recommended_skills": FIELD_SKILLS["UI-UX Development"]}
    return {"field": "NA", "recommended_skills": [], "message": "No career track matched yet."}


def _candidate_level(resume_text: str, page_count) -> str:
    if page_count is not None and page_count < 1:
        return "NA"
    text = resume_text or ""
    if any(k in text for k in ("INTERNSHIP", "INTERNSHIPS", "Internship", "Internships")):
        return "Intermediate"
    if any(k in text for k in ("EXPERIENCE", "WORK EXPERIENCE", "Experience", "Work Experience")):
        return "Experienced"
    return "Fresher"


def _score_resume(resume_text: str) -> tuple[int, list[dict]]:
    text = resume_text or ""
    score = 0
    tips = []

    checks = [
        (["Objective", "Summary"], 6, "Objective / Summary"),
        (["Education", "School", "College"], 12, "Education"),
        (["EXPERIENCE", "Experience"], 16, "Experience"),
        (["INTERNSHIPS", "INTERNSHIP", "Internships", "Internship"], 6, "Internships"),
        (["SKILLS", "SKILL", "Skills", "Skill"], 7, "Skills section"),
        (["HOBBIES", "Hobbies"], 4, "Hobbies"),
        (["INTERESTS", "Interests"], 5, "Interests"),
        (["ACHIEVEMENTS", "Achievements"], 13, "Achievements"),
        (["CERTIFICATIONS", "Certifications", "Certification"], 12, "Certifications"),
        (["PROJECTS", "PROJECT", "Projects", "Project"], 19, "Projects"),
    ]

    for keywords, points, label in checks:
        found = any(k in text for k in keywords)
        if found:
            score += points
            tips.append({"label": label, "passed": True, "points": points})
        else:
            tips.append({"label": label, "passed": False, "points": points})

    return score, tips


def analyze_resume(pdf_path: str, course_count: int = 5) -> dict:
    resume_data = ResumeParser(pdf_path).get_extracted_data()
    if not resume_data:
        raise ValueError("Could not parse resume. Upload a text-based PDF.")

    resume_text = extract_text_from_pdf(pdf_path)
    prediction = _predict_field(resume_data.get("skills") or [])
    field = prediction["field"]
    courses = _pick_courses(field, course_count) if field != "NA" else []
    level = _candidate_level(resume_text, resume_data.get("no_of_pages"))
    score, tips = _score_resume(resume_text)

    youtube = resolve_youtube(
        "resume_writing" if score < 50 else None,
        field,
        level,
    )

    return {
        "analysis_mode": "nlp",
        "profile": {
            "name": resume_data.get("name"),
            "email": resume_data.get("email"),
            "phone": resume_data.get("mobile_number"),
            "degree": resume_data.get("degree"),
            "pages": resume_data.get("no_of_pages"),
        },
        "skills": resume_data.get("skills") or [],
        "predicted_field": field,
        "candidate_level": level,
        "recommended_skills": prediction.get("recommended_skills", []),
        "prediction_message": prediction.get("message"),
        "courses": courses,
        "resume_score": score,
        "resume_tips": tips,
        "bonus_videos": {
            "resume": random.choice(resume_videos),
            "interview": random.choice(interview_videos),
        },
        "youtube_video": youtube,
        "ai_analysis": None,
    }
