import json
import os

from .analytics_service import get_ai_analytics_context


def build_analytics_prompt(question):

    analytics = get_ai_analytics_context()

    analytics_json = json.dumps(
        analytics,
        indent=2,
        default=str
    )

    prompt = f"""
You are the AI Analytics Assistant for PANELSPHERE,
a survey management platform.

Your job is to analyze survey performance data
and provide useful business insights.

Rules:

1. Use only the supplied analytics data.
2. Do not invent numbers.
3. Do not claim causation unless the data supports it.
4. If the data is insufficient, clearly say so.
5. Keep the answer concise and business-focused.
6. Mention exact metrics when useful.
7. Provide recommendations only when supported by the data.

User question:

{question}

PANELSPHERE analytics data:

{analytics_json}
"""

    return prompt


from groq import Groq
from django.conf import settings

from .analytics_service import get_ai_analytics_context


def ask_ai_analytics(question):
    """
    Generate an AI-powered analytics response using Groq.
    """

    analytics_context = get_ai_analytics_context()

    prompt = f"""
You are the AI Analytics Assistant for PANELSPHERE,
a survey management platform.

Your job is to analyze the supplied analytics data and answer
the user's question.

IMPORTANT RULES:

1. Use ONLY the analytics data provided below.
2. Never invent numbers.
3. Never assume data that is not provided.
4. If the data is insufficient to answer, clearly say so.
5. Do not expose personal information such as email addresses,
   dates of birth, IP addresses, or other PII.
6. Keep the answer concise and business-focused.
7. When mentioning a metric, use the exact value from the data.
8. Do not claim causation unless the data explicitly supports it.
9. When recommending an action, clearly distinguish it as a recommendation.
10. Prefer concrete observations over generic statements.

ANALYTICS DATA:

{analytics_context}

USER QUESTION:

{question}

Provide a clear answer suitable for a survey operations manager.
"""

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
                    "Answer only from the supplied analytics context."
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