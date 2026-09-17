import json

from groq import Groq
from django.conf import settings

from .ai_domain_service import detect_ai_domain
from .analytics_service import get_ai_analytics_context
from .analytics_intent_service import detect_analytics_intent
from .ai_analytics_logic import get_deterministic_answer

from .panelist_analytics_service import get_panelist_ai_context
from .panelist_intent_service import detect_panelist_intent
from .panelist_ai_logic import get_panel_deterministic_result

from .project_analytics_service import get_project_ai_context
from .project_intent_service import detect_project_intent
from .project_ai_logic import get_project_deterministic_result

from .vendor_analytics_service import get_vendor_ai_context
from .vendor_intent_service import detect_vendor_intent
from .vendor_ai_logic import get_vendor_deterministic_result

from .campaign_analytics_service import get_campaign_ai_context
from .campaign_intent_service import detect_campaign_intent
from .campaign_ai_logic import get_campaign_deterministic_result

from .ai_question_normalizer import normalize_ai_question

def get_ai_context_and_result(question):
    """
    Determine the AI domain, build the appropriate context,
    detect intent, and calculate the deterministic result.
    """

    normalized_question = normalize_ai_question(question)
    domain = detect_ai_domain(normalized_question)

    if domain == "panelist":
        context = get_panelist_ai_context()
        intent = detect_panelist_intent(normalized_question)

        deterministic_result = get_panel_deterministic_result(
            intent,
            context,
        )

        return {
            "domain": "panelist",
            "context": context,
            "deterministic_result": deterministic_result,
        }

    if domain == "campaign":
        context = get_campaign_ai_context()

        intent = detect_campaign_intent(question)

        deterministic_result = get_campaign_deterministic_result(
            intent,
            context,
        )

        return {
            "domain": "campaign",
            "context": context,
            "deterministic_result": deterministic_result,
        }

    if domain == "project":
        context = get_project_ai_context()
        intent = detect_project_intent(question)

        deterministic_result = get_project_deterministic_result(
            intent,
            context,
        )

        return {
            "domain": "project",
            "context": context,
            "deterministic_result": deterministic_result,
        }

    if domain == "vendor":
        context = get_vendor_ai_context()
        intent = detect_vendor_intent(question)

        deterministic_result = get_vendor_deterministic_result(
            intent,
            context,
        )

        return {
            "domain": "vendor",
            "context": context,
            "deterministic_result": deterministic_result,
        }

    # Default: existing survey analytics
    context = get_ai_analytics_context()
    intent = detect_analytics_intent(question)

    deterministic_result = get_deterministic_answer(
        intent,
        context,
    )

    return {
        "domain": "analytics",
        "context": context,
        "deterministic_result": deterministic_result,
    }

def build_ai_prompt(
    question,
    domain,
    context,
    deterministic_result,
):
    """
    Build the prompt sent to Groq.

    The database-derived result is authoritative.
    Groq must explain it and must not invent analytics.
    """

    context_json = json.dumps(
        context,
        indent=2,
        default=str,
    )

    deterministic_json = json.dumps(
        deterministic_result,
        indent=2,
        default=str,
    )

    prompt = f"""
You are PANELSPHERE AI Analytics Assistant,
an internal assistant for a survey management platform.

Your job is to answer the user's analytics question clearly
and concisely for a survey operations manager.

DOMAIN:
{domain}

USER QUESTION:
{question}

DETECTED INTENT:
{deterministic_result.get("intent")}

DETERMINISTIC RESULT:
{deterministic_json}

AVAILABLE AGGREGATED DATA:
{context_json}

IMPORTANT RULES:

1. Django has calculated the factual analytics.
2. The DETERMINISTIC RESULT is authoritative.
3. Use only the supplied data.
4. Never invent numbers, names, percentages, dates, or facts.
5. Never modify or recalculate a supplied metric.
6. Do not expose personal information.
7. Never reveal:
   - email addresses
   - dates of birth
   - IP addresses
   - personal identifiers
   - survey tokens
   - authentication tokens
   - private URLs
8. Only use aggregated business data.
9. If the deterministic result is None or insufficient,
   clearly state that the available data is insufficient.
10. Do not claim causation unless the supplied data explicitly
    establishes causation.
11. Keep the answer concise.
12. Answer the exact question first.
13. Include the relevant metric or supporting numbers when useful.
14. Do not provide unsupported recommendations.
15. If a recommendation is requested but the supplied data
    does not support one, clearly say so.
16. For rankings, explain the ranking using the supplied metric.
17. If multiple items are tied, mention the tie rather than
    pretending there is only one winner.
18. For campaign email metrics, "email_sent" and "send_rate"
    represent the application's email-sent event only.
    Do not describe this as confirmed email delivery,
    inbox receipt, or successful delivery unless the supplied
    data explicitly contains a delivery metric.

RESPONSE STYLE:

- Give the direct answer first.
- Use short paragraphs or bullets when useful.
- Avoid unnecessary introductions.
- Avoid repeating the entire dataset.
- Do not mention internal implementation details unless asked.
"""

    return prompt


def ask_ai_analytics(question):
    """
    Main AI service.

    Django calculates the facts.
    Groq explains those facts.
    """

    ai_data = get_ai_context_and_result(question)

    domain = ai_data["domain"]
    context = ai_data["context"]
    deterministic_result = ai_data["deterministic_result"]

    prompt = build_ai_prompt(
        question=question,
        domain=domain,
        context=context,
        deterministic_result=deterministic_result,
    )

    client = Groq(
        api_key=settings.GROQ_API_KEY,
    )

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are PANELSPHERE's analytics assistant. "
                    "Django calculates the facts. "
                    "You explain the supplied facts. "
                    "Never invent or change analytics values."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.2,
        max_tokens=500,
    )

    return response.choices[0].message.content