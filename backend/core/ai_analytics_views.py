from .services.ai_analytics_service import (
    build_analytics_prompt,
)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .services.ai_analytics_service import ask_ai_analytics


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ai_analytics(request):

    question = request.data.get("question")

    if not question:
        return Response(
            {"error": "Question is required."},
            status=400
        )

    try:

        answer = ask_ai_analytics(question)

        return Response({
            "question": question,
            "answer": answer
        })

    except Exception as e:

        return Response(
            {
                "error": "Unable to generate AI analytics response.",
                "details": str(e)
            },
            status=500
        )