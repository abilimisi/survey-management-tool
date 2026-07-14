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
import QuestionModal from "../../components/screening/QuestionModal";
import OptionModal from "../../components/screening/OptionModal";

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
  const handleSaveQuestion = async (form) => {

        try {

            if (editingQuestion) {

                await updateQuestion(

                    editingQuestion.id,

                    form

                );

            }

            else {

                await createQuestion(

                    projectId,

                    form

                );

            }

            setShowQuestionModal(false);

            setEditingQuestion(null);

            loadQuestions();

        }

        catch (err) {

            console.error(err);

        }

    };

    const handleSaveOption = async (form) => {

        try {

            if (editingOption) {

                await updateOption(

                    editingOption.id,

                    form

                );

            }

            else {

                await createOption(

                    selectedQuestion.id,

                    form

                );

            }

            setShowOptionModal(false);

            setEditingOption(null);

            setSelectedQuestion(null);

            loadQuestions();

        }

        catch (err) {

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

        <QuestionModal

            open={showQuestionModal}

            editingQuestion={editingQuestion}

            onClose={() => setShowQuestionModal(false)}

            onSave={handleSaveQuestion}

        />

            {/* option mode */}
      <OptionModal

            open={showOptionModal}

            editingOption={editingOption}

            selectedQuestion={selectedQuestion}

            onClose={() => {

                setShowOptionModal(false);

                setEditingOption(null);

            }}

            onSave={handleSaveOption}

        />
    </div>
  );
}

export default ScreeningQuestions;