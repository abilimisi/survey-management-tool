import OptionList from "./OptionList";
import QuestionActions from "./QuestionActions";

function QuestionCard({
    question,
    index,

    onEditQuestion,
    onDeleteQuestion,

    onAddOption,
    onEditOption,
    onDeleteOption
}) {

    const showOptions =
        ["radio", "checkbox", "select"].includes(
            question.question_type
        );

    const correctAnswer =
        question.options.find(
            option => option.is_correct
        );

    return (

        <div className="question-card">

            <div className="question-header">

                <div className="question-title">

                    <span className="question-number">
                        Question {index + 1}
                    </span>

                    <span className="question-type">
                        {question.question_type.toUpperCase()}
                    </span>

                </div>

            </div>

            <div className="question-body">

                <p>

                    <strong>Question :</strong>

                    {question.question}

                </p>

                <p>

                    <strong>Required :</strong>

                    {question.required ? "Yes" : "No"}

                </p>

                <p>

                    <strong>Display Order :</strong>

                    {question.display_order}

                </p>

            </div>

            <hr />

            {showOptions ? (

                <OptionList

                    question={question}

                    onAddOption={onAddOption}

                    onEditOption={onEditOption}

                    onDeleteOption={onDeleteOption}

                />

            ) : (

                <div className="text-answer-box">

                    <strong>

                        Correct Answer

                    </strong>

                    <div>

                        {

                            correctAnswer

                                ?

                                correctAnswer.option_text

                                :

                                "Not Configured"

                        }

                    </div>

                </div>

            )}

            <QuestionActions

                question={question}

                onEdit={onEditQuestion}

                onDelete={onDeleteQuestion}

            />

        </div>

    );

}

export default QuestionCard;