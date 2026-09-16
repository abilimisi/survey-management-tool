import logging

from rest_framework.decorators import (
    api_view,
    permission_classes,
)

from rest_framework.permissions import (
    IsAuthenticated,
)

from rest_framework.response import Response

from .services.ai_analytics_service import (
    ask_ai_analytics,
)


logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ai_analytics(request):

    question = request.data.get("question")

    if not question:
        return Response(
            {
                "error": "Question is required."
            },
            status=400
        )

    question = str(question).strip()

    if not question:
        return Response(
            {
                "error": "Question is required."
            },
            status=400
        )

    # Optional protection against unnecessarily large prompts
    if len(question) > 500:
        return Response(
            {
                "error": (
                    "Question is too long. "
                    "Please keep it under 500 characters."
                )
            },
            status=400
        )

    try:

        answer = ask_ai_analytics(question)

        return Response({
            "question": question,
            "answer": answer
        })

    except Exception:

        logger.exception(
            "PANELSPHERE AI Analytics error"
        )

        return Response(
            {
                "error": (
                    "Unable to generate AI analytics response."
                )
            },
            status=500
        )