import { useEffect, useState } from "react";

function OptionModal({

    open,

    editingOption,

    selectedQuestion,

    onClose,

    onSave

}) {

    const [form, setForm] = useState({

        option_text: "",

        is_correct: false,

        display_order: 1

    });

    useEffect(() => {

        if (!open) return;

        if (editingOption) {

            setForm({

                option_text: editingOption.option_text,

                is_correct: editingOption.is_correct,

                display_order: editingOption.display_order

            });

        }

        else {

            const nextOrder =
                selectedQuestion?.options?.length + 1 || 1;

            setForm({

                option_text: "",

                is_correct: false,

                display_order: nextOrder

            });

        }

    }, [

        editingOption,

        open,

        selectedQuestion

    ]);

    const handleChange = (e) => {

        const {

            name,

            value,

            type,

            checked

        } = e.target;

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

                            editingOption

                                ?

                                "Edit Option"

                                :

                                "Add Option"

                        }

                    </h2>

                    <button

                        className="close-btn"

                        onClick={onClose}

                    >

                        ✕

                    </button>

                </div>

                {

                    selectedQuestion &&

                    <div
                        style={{
                            marginBottom:20,
                            background:"#f5f5f5",
                            padding:10,
                            borderRadius:6
                        }}
                    >

                        <strong>

                            Question

                        </strong>

                        <br />

                        {

                            selectedQuestion.question

                        }

                    </div>

                }

                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label>

                            Option Text

                        </label>

                        <input

                            type="text"

                            name="option_text"

                            value={form.option_text}

                            onChange={handleChange}

                            required

                        />

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

                            id="correct"

                            type="checkbox"

                            name="is_correct"

                            checked={form.is_correct}

                            onChange={handleChange}

                        />

                        <label htmlFor="correct">

                            Correct Answer

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

                                editingOption

                                    ?

                                    "Update Option"

                                    :

                                    "Create Option"

                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default OptionModal;