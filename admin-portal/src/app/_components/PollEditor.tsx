"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import '../_styles/PollEditor.css';

interface Choice {
  id: number;
  text: string;
  count: number;
}

interface Question {
  question: string;
  options: Choice[];
}

interface PollEditorProps {
  activityId: string;
  timeStart: Date;
  timeEnd: Date;
}

export default function PollEditor({
  activityId,
  timeStart,
  timeEnd,
}: PollEditorProps) {
  const [questions, setQuestions] = useState<Question[]>([]);

  // load once
  useEffect(() => {
    (async () => {
      const data = await getActivityById(activityId);
      if (data.content && data.content.length) {
        setQuestions(data.content);
      } else {
        setQuestions([{ question: "New Poll Question", options: [{ id: 1, text: "", count: 0 }] }]);
      }
    })();
  }, [activityId]);

  const getActivityById = async (id: string) => {
    try {
      const resp: AxiosResponse = await axios.get(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${id}`
      );
      return resp.data.data;
    } catch {
      return { content: [] };
    }
  };

  const savePoll = async (updated: Question[]) => {
    try {
      const resp: AxiosResponse = await axios.patch(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activityId}`,
        { content: updated, timeStart, timeEnd }
      );
      const data = resp.data.data;
      setQuestions(data.content);
      return data.content;
    } catch (e) {
      console.error(e);
      return questions;
    }
  };

  const updateQuestionText = (qIdx: number, text: string) =>
    savePoll(
      questions.map((q, i) => i === qIdx ? { ...q, question: text } : q)
    );

  const deleteQuestion = (qIdx: number) =>
    savePoll(questions.filter((_, i) => i !== qIdx));

  const addQuestion = () =>
    savePoll([
      ...questions,
      { question: "New Poll Question", options: [{ id: 1, text: "", count: 0 }] },
    ]);

  const updateChoiceText = (qIdx: number, cIdx: number, text: string) =>
    savePoll(
      questions.map((q, i) =>
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
    savePoll(
      questions.map((q, i) =>
        i !== qIdx
          ? q
          : { ...q, options: q.options.filter((_, j) => j !== cIdx) }
      )
    );

  const addChoice = (qIdx: number) =>
    savePoll(
      questions.map((q, i) =>
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
                  text: "",
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
      </div>

      <div className="draftSavePublishBox">
        <div className="draftButton">Draft</div>
        <div className="savePublishBox">
          <button className="savePollButton">Save</button>
          <button className="publishButton">Publish</button>
        </div>
      </div>

      <div className="questionBox">
        <h1 className="pollTitle">UNTITLED PAGE</h1>
        <div className="questionList">
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="questionPanel">
              <div className="questionHeader">
                <label className="questionLabel">
                  Question {qIdx + 1}:
                </label>
                <input
                  className="questionInput"
                  type="text"
                  value={q.question}
                  onChange={(e) =>
                    updateQuestionText(qIdx, e.target.value)
                  }
                />
                <div className="questionToolbar">
                  {/* <button onClick={() => updateQuestionText(qIdx, q.question)}>
                    ✏️
                  </button> */}
                  <button onClick={() => deleteQuestion(qIdx)}>🗑️</button>
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