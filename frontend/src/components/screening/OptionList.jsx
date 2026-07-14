function OptionList({

    question,

    onAddOption,

    onEditOption,

    onDeleteOption

}) {

    return (

        <div className="option-section">

            <div className="option-header">

                <h4>Options</h4>

                <button
                    className="primary-btn"
                    onClick={() =>
                        onAddOption(question)
                    }
                >
                    + Add Option
                </button>

            </div>

            {

                question.options.length > 0 ? (

                    <ul className="option-list">

                        {

                            question.options.map(option => (

                                <li
                                    key={option.id}
                                    className="option-item"
                                >

                                    <div className="option-left">

                                        <span>

                                            {

                                                option.is_correct

                                                ? "✅"

                                                : "○"

                                            }

                                        </span>

                                        <span>

                                            {option.option_text}

                                        </span>

                                    </div>

                                    <div className="option-actions">

                                        <button

                                            className="edit-btn"

                                            onClick={() =>

                                                onEditOption(
                                                    question,
                                                    option
                                                )

                                            }

                                        >

                                            Edit

                                        </button>

                                        <button

                                            className="delete-btn"

                                            onClick={() =>

                                                onDeleteOption(
                                                    option.id
                                                )

                                            }

                                        >

                                            Delete

                                        </button>

                                    </div>

                                </li>

                            ))

                        }

                    </ul>

                ) : (

                    <div className="no-options">

                        No Options Added

                    </div>

                )

            }

        </div>

    );

}

export default OptionList;