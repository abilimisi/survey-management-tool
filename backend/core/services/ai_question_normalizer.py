import re


COMMON_SPELLING_FIXES = {
    # Campaign
    "campain": "campaign",
    "campagin": "campaign",
    "campaing": "campaign",
    "camapign": "campaign",

    # Panelist
    "panellist": "panelist",
    "panellists": "panelists",
    "panelistt": "panelist",
    "panelits": "panelists",

    # Vendor
    "vendr": "vendor",
    "venor": "vendor",
    "vender": "vendor",

    # Project
    "projet": "project",
    "projec": "project",

    # Common analytics words
    "complet": "complete",
    "complte": "complete",
    "completetion": "completion",
    "completition": "completion",

    "recpient": "recipient",
    "recpients": "recipients",
    "reciepient": "recipient",

    "invatation": "invitation",
    "invitaion": "invitation",
    "invitationss": "invitations",

    "clickd": "clicked",
    "cliked": "clicked",

    "strated": "started",
    "statred": "started",

    "terminatd": "terminated",
    "termianted": "terminated",

    "quata": "quota",
    "quoto": "quota",

    "securty": "security",
    "securit": "security",

    "percantage": "percentage",
    "precentage": "percentage",

    "rat": "rate",
}


def normalize_ai_question(question):
    question = question.lower().strip()

    # Normalize whitespace
    question = re.sub(r"\s+", " ", question)

    # Correct known word-level spelling mistakes
    words = question.split()

    corrected_words = [
        COMMON_SPELLING_FIXES.get(word, word)
        for word in words
    ]

    return " ".join(corrected_words)