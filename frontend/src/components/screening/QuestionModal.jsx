import { useEffect, useState } from "react";

function QuestionModal({

    open,

    editingQuestion,

    onClose,

    onSave

}) {

    const [form, setForm] = useState({

        question: "",

        question_type: "radio",

        required: true,

        display_order: 1

    });

    useEffect(() => {

        if (!open) return;

        if (editingQuestion) {

            setForm({

                question: editingQuestion.question,

                question_type: editingQuestion.question_type,

                required: editingQuestion.required,

                display_order: editingQuestion.display_order

            });

        }

        else {

            setForm({

                question: "",

                question_type: "radio",

                required: true,

                display_order: 1

            });

        }

    }, [editingQuestion, open]);

    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setForm(prev => ({

            ...prev,

            [name]:

                type === "checkbox"

                    ? checked

                    : value

        }));

    };

    const handleSubmit = (e) => {

        e.preventDefault();

        onSave(form);

    };

    if (!open) return null;

    return (

        <div className="modal-overlay">

            <div className="supplier-modal">

                <div className="modal-header">

                    <h2>

                        {

                            editingQuestion

                                ? "Edit Question"

                                : "Add Question"

                        }

                    </h2>

                    <button

                        className="close-btn"

                        onClick={onClose}

                    >

                        ✕

                    </button>

                </div>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label>

                            Question

                        </label>

                        <input

                            type="text"

                            name="question"

                            value={form.question}

                            onChange={handleChange}

                            required

                        />

                    </div>

                    <div className="form-group">

                        <label>

                            Question Type

                        </label>

                        <select

                            name="question_type"

                            value={form.question_type}

                            onChange={handleChange}

                        >

                            <option value="radio">

                                Radio

                            </option>

                            <option value="checkbox">

                                Checkbox

                            </option>

                            <option value="text">

                                Text

                            </option>

                            <option value="number">

                                Number

                            </option>

                            <option value="select">

                                Dropdown

                            </option>

                        </select>

                    </div>

                    <div className="form-group">

                        <label>

                            Display Order

                        </label>

                        <input

                            type="number"

                            name="display_order"

                            value={form.display_order}

                            onChange={handleChange}

                        />

                    </div>

                    <div className="checkbox-row">

                        <input

                            type="checkbox"

                            id="required"

                            name="required"

                            checked={form.required}

                            onChange={handleChange}

                        />

                        <label htmlFor="required">

                            Required Question

                        </label>

                    </div>

                    <div className="modal-footer">

                        <button

                            type="button"

                            className="secondary-btn"

                            onClick={onClose}

                        >

                            Cancel

                        </button>

                        <button

                            type="submit"

                            className="primary-btn"

                        >

                            {

                                editingQuestion

                                    ? "Update Question"

                                    : "Create Question"

                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default QuestionModal;