function QuestionActions({

    question,

    onEdit,

    onDelete

}) {

    return (

        <div className="question-actions">

            <button

                className="edit-btn"

                onClick={() => onEdit(question)}

            >

                ✏ Edit Question

            </button>

            <button

                className="delete-btn"

                onClick={() => {

                    if (

                        window.confirm(

                            "Delete this question?"

                        )

                    ) {

                        onDelete(question.id);

                    }

                }}

            >

                🗑 Delete Question

            </button>

        </div>

    );

}

export default QuestionActions;