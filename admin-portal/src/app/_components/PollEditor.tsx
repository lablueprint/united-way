"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../_interfaces/AuthInterfaces";
import "../_styles/PollEditor.css";
import Image from 'next/image';
import TrashCanIcon from "../_styles/_images/trashcan.svg";
import MoveIcon from "../_styles/_images/move.svg";

interface Choice {
  id: number;
  text: string;
  count: number;
}

interface Question {
  title?: string;
  question: string;
  options: Choice[];
}

interface PollEditorProps {
  activityId: string;
  timeStart: Date;
  timeEnd: Date;
  isDraft: boolean;
  createPoll: () => void;
}

export default function PollEditor({
  activityId,
  timeStart,
  timeEnd,
  isDraft,
  createPoll,
}: PollEditorProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pageTitle, setPageTitle] = useState("");
  const org = useSelector((state: RootState) => ({
    authToken: state.auth.authToken,
  }));

  useEffect(() => {
    (async () => {
      const data = await getActivityById(activityId);
      if (data.content && data.content.length) {
        setQuestions(data.content);
        setPageTitle(data.content[0].title);
      } else {
        setQuestions([
          {
            question: "New Poll Question",
            options: [{ id: 1, text: "", count: 0 }],
          },
        ]);
        setPageTitle("Untitled Page");
      }
    })();
  }, [activityId]);

  const getActivityById = async (id: string) => {
    try {
      const resp: AxiosResponse = await axios.get(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${id}`,
        {
          headers: {
            Authorization: `Bearer ${org.authToken}`,
          },
        }
      );
      return resp.data.data;
    } catch {
      return { content: [] };
    }
  };

  const handleSave = async () => {
    try {
      const updatedContent = [...questions];
      if (updatedContent.length > 0) {
        updatedContent[0].title = pageTitle;
      }

      const response: AxiosResponse = await axios.patch(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activityId}`,
        {
          content: updatedContent,
          timeStart,
          timeEnd,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${org.authToken}`,
          },
        }
      );
      alert("Poll content saved.");
    } catch (e) {
      console.error("Failed to patch activity:", e);
      alert("Failed to save poll.");
    }
  };

  const updateQuestionText = (qIdx: number, text: string) =>
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, question: text } : q))
    );

  const deleteQuestion = (qIdx: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== qIdx));

  const addQuestion = () =>
    setQuestions((prev) => [
      ...prev,
      {
        question: "New Poll Question",
        options: [{ id: 1, text: "Choice 1", count: 0 }],
      },
    ]);

  const updateChoiceText = (qIdx: number, cIdx: number, text: string) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i !== qIdx
          ? q
          : {
              ...q,
              options: q.options.map((c, j) =>
                j !== cIdx ? c : { ...c, text }
              ),
            }
      )
    );

  const deleteChoice = (qIdx: number, cIdx: number) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i !== qIdx
          ? q
          : { ...q, options: q.options.filter((_, j) => j !== cIdx) }
      )
    );

  const addChoice = (qIdx: number) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i !== qIdx
          ? q
          : {
              ...q,
              options: [
                ...q.options,
                {
                  id: q.options.length
                    ? Math.max(...q.options.map((c) => c.id)) + 1
                    : 1,
                  text: `Choice ${q.options.length + 1}`,
                  count: 0,
                },
              ],
            }
      )
    );

  if (!questions.length) return null;

  return (
    <div className="pollEditor">
      <div className="pollEditorHeader">
        <h1 className="pollEditorHeaderTitle">POLLS</h1>
        <h2 className="pollEditorHeaderSubtitle">
          View and edit your created polls.
        </h2>
        <button className="createPollsButton" onClick={createPoll}>
          + Create Polls
        </button>
      </div>

      <div className="draftSavePublishBox">
        <div className="draftButton">{isDraft ? "Draft" : "Published"}</div>
        <div className="savePublishBox">
          <button className="savePollButton" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>

      <div className="questionBox">
        <input
          className="pollTitle"
          type="text"
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
        />
        <div className="questionList">
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="questionPanel">
              <div className="questionHeader">
                <label className="questionLabel">Question {qIdx + 1}:</label>
                <input
                  className="questionInput"
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                />
                <div className="questionToolbar">
                  <button onClick={() => deleteQuestion(qIdx)}>
                    <Image src={TrashCanIcon} alt="Delete" />
                  </button>
                  <Image src={MoveIcon} />
                </div>
              </div>

              <div className="optionList">
                {q.options.map((choice, cIdx) => (
                  <div key={cIdx} className="optionRow">
                    <input type="radio" disabled />
                    <input
                      className="optionInput"
                      type="text"
                      value={choice.text}
                      onChange={(e) =>
                        updateChoiceText(qIdx, cIdx, e.target.value)
                      }
                    />
                    <button
                      className="removeOptionButton"
                      onClick={() => deleteChoice(qIdx, cIdx)}
                    >
                      ✖️
                    </button>
                  </div>
                ))}

                <button
                  className="addOptionButton optionRow"
                  type="button"
                  onClick={() => addChoice(qIdx)}
                >
                  <input type="radio" disabled />
                  <span className="optionText">Add Another Choice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="questionActions">
        <button
          className="addQuestionButton"
          type="button"
          onClick={addQuestion}
        >
          + Add Another Question
        </button>
      </div>
    </div>
  );
}


// "use client";
// import React, { useEffect, useState } from "react";
// import axios, { AxiosResponse } from "axios";
// import { useSelector } from "react-redux";
// import { RootState } from "../_interfaces/AuthInterfaces";
// import "../_styles/PollEditor.css";

// interface Choice {
//   id: number;
//   text: string;
//   count: number;
// }

// interface Question {
//   question: string;
//   options: Choice[];
// }

// interface PollEditorProps {
//   activityId: string;
//   timeStart: Date;
//   timeEnd: Date;
//   isDraft: boolean;
//   createPoll: () => void;
// }

// export default function PollEditor({
//   activityId,
//   timeStart,
//   timeEnd,
//   isDraft,
//   createPoll,
// }: PollEditorProps) {
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const org = useSelector((state: RootState) => ({
//     authToken: state.auth.authToken,
//   }));

//   useEffect(() => {
//     (async () => {
//       const data = await getActivityById(activityId);
//       if (data.content && data.content.length) {
//         setQuestions(data.content);
//       } else {
//         setQuestions([
//           {
//             question: "New Poll Question",
//             options: [{ id: 1, text: "", count: 0 }],
//           },
//         ]);
//       }
//     })();
//   }, [activityId]);

//   const getActivityById = async (id: string) => {
//     try {
//       const resp: AxiosResponse = await axios.get(
//         `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${org.authToken}`,
//           },
//         }
//       );
//       return resp.data.data;
//     } catch {
//       return { content: [] };
//     }
//   };

//   const handleSave = async () => {
//     try {
//       const response: AxiosResponse = await axios.patch(
//         `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activityId}`,
//         {
//           content: questions,
//           timeStart,
//           timeEnd,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${org.authToken}`,
//           },
//         }
//       );
//       alert("Poll content saved.");
//     } catch (e) {
//       console.error("Failed to patch activity:", e);
//       alert("Failed to save poll.");
//     }
//   };

//   const updateQuestionText = (qIdx: number, text: string) =>
//     setQuestions((prev) =>
//       prev.map((q, i) => (i === qIdx ? { ...q, question: text } : q))
//     );

//   const deleteQuestion = (qIdx: number) =>
//     setQuestions((prev) => prev.filter((_, i) => i !== qIdx));

//   const addQuestion = () =>
//     setQuestions((prev) => [
//       ...prev,
//       {
//         question: "New Poll Question",
//         options: [{ id: 1, text: "Choice 1", count: 0 }],
//       },
//     ]);

//   const updateChoiceText = (qIdx: number, cIdx: number, text: string) =>
//     setQuestions((prev) =>
//       prev.map((q, i) =>
//         i !== qIdx
//           ? q
//           : {
//               ...q,
//               options: q.options.map((c, j) =>
//                 j !== cIdx ? c : { ...c, text }
//               ),
//             }
//       )
//     );

//   const deleteChoice = (qIdx: number, cIdx: number) =>
//     setQuestions((prev) =>
//       prev.map((q, i) =>
//         i !== qIdx
//           ? q
//           : { ...q, options: q.options.filter((_, j) => j !== cIdx) }
//       )
//     );

//   const addChoice = (qIdx: number) =>
//     setQuestions((prev) =>
//       prev.map((q, i) =>
//         i !== qIdx
//           ? q
//           : {
//               ...q,
//               options: [
//                 ...q.options,
//                 {
//                   id: q.options.length
//                     ? Math.max(...q.options.map((c) => c.id)) + 1
//                     : 1,
//                   text: `Choice ${q.options.length + 1}`,
//                   count: 0,
//                 },
//               ],
//             }
//       )
//     );

//   if (!questions.length) return null;

//   return (
//     <div className="pollEditor">
//       <div className="pollEditorHeader">
//         <h1 className="pollEditorHeaderTitle">POLLS</h1>
//         <h2 className="pollEditorHeaderSubtitle">
//           View and edit your created polls.
//         </h2>
//         <button className="createPollsButton" onClick={createPoll}>+ Create Polls</button>
//       </div>

//       <div className="draftSavePublishBox">
//         <div className="draftButton">{isDraft ? "Draft" : "Published"}</div>
//         <div className="savePublishBox">
//           <button className="savePollButton" onClick={handleSave}>
//             Save
//           </button>
//         </div>
//       </div>

//       <div className="questionBox">
//         <h1 className="pollTitle">UNTITLED PAGE</h1>
//         <div className="questionList">
//           {questions.map((q, qIdx) => (
//             <div key={qIdx} className="questionPanel">
//               <div className="questionHeader">
//                 <label className="questionLabel">Question {qIdx + 1}:</label>
//                 <input
//                   className="questionInput"
//                   type="text"
//                   value={q.question}
//                   onChange={(e) => updateQuestionText(qIdx, e.target.value)}
//                 />
//                 <div className="questionToolbar">
//                   <button onClick={() => deleteQuestion(qIdx)}>🗑️</button>
//                 </div>
//               </div>

//               <div className="optionList">
//                 {q.options.map((choice, cIdx) => (
//                   <div key={cIdx} className="optionRow">
//                     <input type="radio" disabled />
//                     <input
//                       className="optionInput"
//                       type="text"
//                       value={choice.text}
//                       onChange={(e) =>
//                         updateChoiceText(qIdx, cIdx, e.target.value)
//                       }
//                     />
//                     <button
//                       className="removeOptionButton"
//                       onClick={() => deleteChoice(qIdx, cIdx)}
//                     >
//                       ✖️
//                     </button>
//                   </div>
//                 ))}

//                 <button
//                   className="addOptionButton optionRow"
//                   type="button"
//                   onClick={() => addChoice(qIdx)}
//                 >
//                   <input type="radio" disabled />
//                   <span className="optionText">Add Another Choice</span>
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="questionActions">
//         <button
//           className="addQuestionButton"
//           type="button"
//           onClick={addQuestion}
//         >
//           + Add Another Question
//         </button>
//       </div>
//     </div>
//   );
// }