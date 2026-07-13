import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    getQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,

    createOption,
    updateOption,
    deleteOption
} from "../../api/screeningApi";

import "./ScreeningQuestions.css";

function ScreeningQuestions() {
  const { projectId } = useParams();

  const [questions, setQuestions] = useState([]);

  const [showQuestionModal, setShowQuestionModal] = useState(false);

  const [editingQuestion, setEditingQuestion] = useState(null);

  const [questionForm, setQuestionForm] = useState({
    question: "",
    question_type: "radio",
    required: true,
    display_order: 1,
  });

  const [showOptionModal, setShowOptionModal] =
    useState(false);

  const [editingOption, setEditingOption] =
      useState(null);

  const [selectedQuestion, setSelectedQuestion] =
      useState(null);

  const [optionForm, setOptionForm] = useState({

      option_text: "",

      is_correct: false,

  });

  useEffect(() => {
    loadQuestions();
  }, [projectId]);

  const loadQuestions = async () => {
    try {
      const data = await getQuestions(projectId);
      setQuestions(data);
    } catch (err) {
      console.error(err);
    }
  };
  const handleSaveQuestion = async (e) => {

        e.preventDefault();

        try {

            if (editingQuestion) {

                await updateQuestion(
                    editingQuestion.id,
                    questionForm
                );

            } else {

                await createQuestion(
                    projectId,
                    questionForm
                );

            }

            await loadQuestions();

            setShowQuestionModal(false);

            setEditingQuestion(null);

            setQuestionForm({
                question: "",
                question_type: "radio",
                required: true,
                display_order: 1,
            });

        } catch (err) {

            console.error(err);

        }

    };

    const handleSaveOption = async (e) => {

        e.preventDefault();

        try {

            if(editingOption){

                await updateOption(

                    editingOption.id,

                    optionForm

                );

            }

            else{

                await createOption(

                    selectedQuestion.id,

                    optionForm

                );

            }

            await loadQuestions();

            setShowOptionModal(false);

            setEditingOption(null);

            setSelectedQuestion(null);

            setOptionForm({

                option_text:"",

                is_correct:false,

            });

        }

        catch(err){

            console.error(err);

        }

    };

  return (
    <div>

      {/* Page Header */}
      <div className="section-header">
        <div>

            <h2>Pre Screening Questions</h2>

            <p>

            Manage qualification questions before respondents enter the client survey.

            </p>

        </div>

        <button
          className="add-supplier-btn"
          onClick={() => {
            setEditingQuestion(null);

            setQuestionForm({
              question: "",
              question_type: "radio",
              required: true,
              display_order: 1,
            });

            setShowQuestionModal(true);
          }}
        >
          + Add Question
        </button>
      </div>

      {/* Question List */}
      <div className="question-list">

        {questions.length > 0 ? (

          questions.map((q, index) => (

            <div
              key={q.id}
              className="question-card"
            >

              <div className="question-header">
                <div className="question-title">

                    <span className="question-number">

                    Question {index+1}

                    </span>

                    <span className="question-type">

                    {q.question_type.toUpperCase()}

                    </span>

                    </div>
                </div>

              <p>
                <strong>Question :</strong> {q.question}
              </p>

              <p>
                <strong>Type :</strong> {q.question_type}
              </p>

              <p>
                <strong>Required :</strong>{" "}
                {q.required ? "Yes" : "No"}
              </p>

              <p>
                <strong>Display Order :</strong>{" "}
                {q.display_order}
              </p>

              <hr />
              <h4>Options</h4>

              {q.options.length > 0 ? (

                  <ul>

                      {q.options.map((option) => (

                          <li
                              key={option.id}
                              className="option-item"
                          >

                              <span>

                                  {option.is_correct ? "✅" : "○"}

                                  {" "}

                                  {option.option_text}

                              </span>

                              <div>

                                  <button
                                      className="edit-btn"
                                      onClick={() => {

                                          setSelectedQuestion(q);

                                          setEditingOption(option);

                                          setOptionForm({

                                              option_text: option.option_text,

                                              is_correct: option.is_correct,

                                          });

                                          setShowOptionModal(true);

                                      }}
                                  >

                                      Edit

                                  </button>

                                  <button
                                      className="delete-btn"
                                      onClick={async () => {

                                          if (!window.confirm("Delete this option?"))
                                              return;

                                          try {

                                              await deleteOption(option.id);

                                              loadQuestions();

                                          } catch (err) {

                                              console.error(err);

                                          }

                                      }}
                                  >

                                      Delete

                                  </button>

                              </div>

                          </li>

                      ))}

                  </ul>

              ) : (

                  <p>No options added.</p>

              )}

              <div className="question-actions">

              <button

                  className="primary-btn"

                  onClick={()=>{

                      setSelectedQuestion(q);

                      setEditingOption(null);

                      setOptionForm({

                          option_text:"",

                          is_correct:false,

                      });

                      setShowOptionModal(true);

                  }}

              >

                  + Add Option

              </button>

                <button
                    className="edit-btn"
                    onClick={() => {

                        setEditingQuestion(q);

                    setQuestionForm    ({

                            question: q.question,
                            question_type: q.question_type,
                            required: q.required,
                            display_order: q.display_order,

                        });

                        setShowQuestionModal(true);

                    }}
                >
                    Edit
                </button>

                <button
                    className="delete-btn"
                    onClick={async () => {

                        if (!window.confirm("Delete this question?"))
                            return;

                        try {

                            await deleteQuestion(q.id);

                            loadQuestions();

                        } catch (err) {

                            console.error(err);

                        }

                    }}
                >
                    Delete
                </button>

              </div>

            </div>

          ))

        ) : (

          <div className="no-data">
            No Screening Questions Found
          </div>

        )}

      </div>

      {/* Question Modal (Next Step) */}
      {showQuestionModal && (
        <div className="modal-overlay">

          <div className="supplier-modal">

            <div className="modal-header">

              <h2>
                {editingQuestion
                  ? "Edit Question"
                  : "Add Question"}
              </h2>

              <button
                className="close-btn"
                onClick={() =>
                  setShowQuestionModal(false)
                }
              >
                ✕
              </button>

            </div>

           <form onSubmit={handleSaveQuestion}>

                <div className="form-group">

                    <label>Question</label>

                    <input
                        type="text"
                        value={questionForm.question}
                        onChange={(e)=>
                            setQuestionForm({
                                ...questionForm,
                                question:e.target.value
                            })
                        }
                        required
                    />

                </div>

                <div className="form-group">

                    <label>Question Type</label>

                    <select
                        value={questionForm.question_type}
                        onChange={(e)=>
                            setQuestionForm({
                                ...questionForm,
                                question_type:e.target.value
                            })
                        }
                    >

                        <option value="radio">Radio</option>

                        <option value="checkbox">Checkbox</option>

                        <option value="text">Text</option>

                        <option value="textarea">Textarea</option>

                    </select>

                </div>

                <div className="form-group">

                    <label>Display Order</label>

                    <input
                        type="number"
                        value={questionForm.display_order}
                        onChange={(e)=>
                            setQuestionForm({
                                ...questionForm,
                                display_order:e.target.value
                            })
                        }
                    />

                </div>

                <div
                    className="form-group"
                    style={{
                        display:"flex",
                        gap:"10px",
                        alignItems:"center"
                    }}
                >

                    <input
                        type="checkbox"
                        checked={questionForm.required}
                        onChange={(e)=>
                            setQuestionForm({
                                ...questionForm,
                                required:e.target.checked
                            })
                        }
                    />

                    <label>Required</label>

                </div>

                <button
                    className="primary-btn"
                    type="submit"
                >

                    {editingQuestion
                        ? "Update Question"
                        : "Create Question"}

                </button>

            </form>

          </div>

        </div>
      )}
      {/* option mode */}
      {showOptionModal && (
            <div className="modal-overlay">

                <div className="supplier-modal">

                    <div className="modal-header">

                        <h2>

                            {editingOption
                                ? "Edit Option"
                                : "Add Option"}

                        </h2>

                        <button
                            className="close-btn"
                            onClick={() => {

                                setShowOptionModal(false);

                                setEditingOption(null);

                                setSelectedQuestion(null);

                            }}
                        >
                            ✕
                        </button>

                    </div>

                    <form onSubmit={handleSaveOption}>

                        <div className="form-group">

                            <label>Option Text</label>

                            <input
                                type="text"
                                value={optionForm.option_text}
                                onChange={(e)=>
                                    setOptionForm({
                                        ...optionForm,
                                        option_text:e.target.value
                                    })
                                }
                                required
                            />

                        </div>

                        <div
                            className="form-group"
                            style={{
                                display:"flex",
                                alignItems:"center",
                                gap:"10px"
                            }}
                        >

                            <input
                                type="checkbox"
                                checked={optionForm.is_correct}
                                onChange={(e)=>
                                    setOptionForm({
                                        ...optionForm,
                                        is_correct:e.target.checked
                                    })
                                }
                            />

                            <label>Correct Answer</label>

                        </div>

                        <button
                            type="submit"
                            className="primary-btn"
                        >

                            {editingOption
                                ? "Update Option"
                                : "Save Option"}

                        </button>

                    </form>

                </div>

            </div>
        )}
    </div>
  );
}

export default ScreeningQuestions;