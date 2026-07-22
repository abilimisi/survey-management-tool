import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getScreeningQuestions,submitScreening } from "../../api/screeningSurveyApi";
import "./ScreeningSurvey.css";

function ScreeningSurvey() {

    const { respondentId } = useParams();

    const [loading, setLoading] = useState(true);

    const [data, setData] = useState(null);

    const [answers,setAnswers]=useState({});

    useEffect(() => {

        loadQuestions();

    }, [respondentId]);

    const loadQuestions = async () => {

        try {

            const response = await getScreeningQuestions(
                respondentId
            );

            setData(response);

        }

        catch(err){

            console.error(err);

        }

        finally{

            setLoading(false);

        }

    };

    if(loading){

        return <h2>Loading Questions...</h2>;

    }

    if(!data){

        return <h2>No Questions Found.</h2>;

    }

    const handleAnswer=(questionId,value)=>{

        setAnswers(prev=>({

            ...prev,

            [questionId]:value

        }));

    };

    const handleSubmit=async()=>{

        const payload={

            respondent_id:data.respondent_id,

            answers:Object.entries(answers).map(

                ([questionId,answer])=>({

                    question_id:questionId,

                    answer:Array.isArray(answer)

                        ? answer.join(",")

                        : answer

                })

            )

        };

        try{

            const response=

            await submitScreening(payload);

            if (response.passed) {

                alert("Qualified");

                window.location.href = response.redirect_url;

            }
            else {

                alert("Screening Failed");

                window.location.href = response.redirect_url;

            }

        }

        catch(err){

            console.log(err);

        }

    };
     return (
        <div className="ps-page">

            <div className="ps-card">

            <div className="ps-header">
                <h1>Pre Screening Survey</h1>

                <p>
                Please answer the following questions before continuing to the main survey.
                </p>

            </div>

            <div className="ps-body">

                {data.questions.map((question, index) => (

                <div
                    className="ps-question-box"
                    key={question.id}
                >

                    <label className="ps-question-title">
                    {index + 1}. {question.question}
                    </label>

                                {

                                    question.question_type==="radio" &&

                                    question.options.map(option=>(

                                        <label
                                            key={option.id}
                                        >

                                            <input

                                                type="radio"

                                                name={`question_${question.id}`}

                                                value={option.option_text}
                                                checked={
                                                (answers[question.id] || "") === option.option_text
                                                }

                                                onChange={(e)=>

                                                    handleAnswer(
                                                        question.id,
                                                        e.target.value
                                                    )

                                                }

                                            />

                                            {option.option_text}

                                        </label>

                                    ))

                                }
                      

                        {

                            question.question_type==="checkbox" &&

                            question.options.map(option=>(

                                <label
                                    key={option.id}
                                >

                                    <input

                                        type="checkbox"

                                        checked={
                                        (answers[question.id] || []).includes(option.option_text)
                                        }

                                        onChange={(e)=>{
                                        const current =
                                        answers[question.id] || [];

                                        const updated = e.target.checked
                                            ? [...current, option.option_text]
                                            : current.filter(
                                                item => item !== option.option_text
                                            );

                                        handleAnswer(
                                            question.id,
                                            updated
                                        );

                                        }}

                                        />

                                    {option.option_text}

                                </label>

                            ))

                        }

                        {

                            question.question_type==="text" &&

                          <input

                            type="text"

                            value={answers[question.id] || ""}

                            onChange={(e)=>

                            handleAnswer(

                            question.id,

                            e.target.value

                            )

                            }

                         />

                        }


                        {

                            question.question_type==="number" &&

                        <input

                        type="number"

                        value={
                                            
                        answers[question.id] || ""

                        }

                        onChange={(e)=>

                        handleAnswer(

                        question.id,

                        e.target.value

                        )

                        }

                        />

                        }

                        {

                            question.question_type==="select" &&

                            <select

                                value={

                                answers[question.id] || ""

                                }

                                onChange={(e)=>

                                handleAnswer(

                                question.id,

                                e.target.value

                                )

                                }
                                >

                                <option value="">Select</option>

                                {

                                question.options.map(option=>(

                                <option

                                key={option.id}

                                value={option.option_text}

                                >

                                {option.option_text}

                                </option>

                                ))

                                }

                            </select>
                        }

                    </div>

                ))

            }
            </div>
            <div className="ps-footer">

                <button
                className="ps-submit-btn"
                onClick={handleSubmit}
                >
                Submit
                </button>

            </div>

            </div>

        </div>
      );
    }

export default ScreeningSurvey;