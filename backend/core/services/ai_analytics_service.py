import json

from groq import Groq
from django.conf import settings

from .analytics_service import (
    get_ai_analytics_context,
)

from .analytics_intent_service import (
    detect_analytics_intent,
)

from .ai_analytics_logic import (
    get_deterministic_answer,
)


def build_analytics_prompt(
    question,
    analytics,
    deterministic_result,
):
    """
    Build the prompt sent to Groq.

    Django provides the factual analytics.
    Groq is responsible for explaining the results.
    """

    analytics_json = json.dumps(
        analytics,
        indent=2,
        default=str
    )

    deterministic_json = json.dumps(
        deterministic_result,
        indent=2,
        default=str
    )

    prompt = f"""
You are the AI Analytics Assistant for PANELSPHERE,
a survey management platform.

Your job is to explain survey analytics to a
survey operations manager.

IMPORTANT RULES:

1. Use ONLY the supplied analytics data.
2. Never invent numbers.
3. Never change or recalculate the supplied metrics.
4. Django has already calculated the factual result.
5. Treat the deterministic result as authoritative.
6. If the deterministic result is None or insufficient,
   clearly say that the available data is insufficient.
7. Do not expose personal information such as:
   - email addresses
   - dates of birth
   - IP addresses
   - personal identifiers
8. Keep the answer concise and business-focused.
9. Mention exact metrics when useful.
10. Do not claim causation unless the data explicitly supports it.
11. Clearly identify recommendations as recommendations.
12. Do not make recommendations unsupported by the data.

USER QUESTION:

{question}

DETECTED ANALYTICS INTENT:

{deterministic_result.get("intent")}

DETERMINISTIC ANALYTICS RESULT:

{deterministic_json}

FULL PANELSPHERE ANALYTICS DATA:

{analytics_json}

Provide a clear answer suitable for a survey operations manager.
"""

    return prompt


def ask_ai_analytics(question):
    """
    Generate an AI-powered analytics response using Groq.

    Django calculates the important business facts.
    Groq explains those facts in natural language.
    """

    # ---------------------------------------------------------
    # STEP 1: Get analytics from Django
    # ---------------------------------------------------------

    analytics_context = get_ai_analytics_context()

    # ---------------------------------------------------------
    # STEP 2: Detect what the user is asking
    # ---------------------------------------------------------

    intent = detect_analytics_intent(question)

    # ---------------------------------------------------------
    # STEP 3: Calculate the factual result
    # ---------------------------------------------------------

    deterministic_result = get_deterministic_answer(
        intent,
        analytics_context
    )

    # ---------------------------------------------------------
    # STEP 4: Build controlled prompt
    # ---------------------------------------------------------

    prompt = build_analytics_prompt(
        question=question,
        analytics=analytics_context,
        deterministic_result=deterministic_result,
    )

    # ---------------------------------------------------------
    # STEP 5: Send the controlled data to Groq
    # ---------------------------------------------------------

    client = Groq(
        api_key=settings.GROQ_API_KEY
    )

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are PANELSPHERE's analytics assistant. "
                    "Django calculates the facts. "
                    "You explain the facts. "
                    "Never invent or change analytics values."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.2,
        max_tokens=700,
    )

    return response.choices[0].message.content