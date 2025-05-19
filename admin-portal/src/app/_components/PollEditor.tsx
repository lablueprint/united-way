"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../_interfaces/AuthInterfaces";
import "../_styles/PollEditor.css";
import Image from 'next/image';
import TrashCanIcon from "../_styles/_images/trashcan.svg";
import MoveIcon from "../_styles/_images/move.svg";
import Draft from "../_styles/_images/draft.svg";
import StarIcon from "../_styles/_images/star.svg";
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';

interface Choice {
  id: number;
  text: string;
  count: number;
}

interface Question {
  question: string;
  options: Choice[];
}

interface PollContent {
  title: string;
  questions: Question[];
  pointValue: number;
}

interface PollEditorProps {
  activityId: string;
  timeStart: Date;
  timeEnd: Date;
  isDraft: boolean;
  onDelete?: () => void;
  updateTime: (newStart: Date, newEnd: Date) => Promise<void>;
}

export default function PollEditor({
  activityId,
  timeStart,
  timeEnd,
  isDraft,
  onDelete,
  updateTime,
}: PollEditorProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pageTitle, setPageTitle] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [pointValue, setPointValue] = useState(0);
  
  const org = useSelector((state: RootState) => ({
    authToken: state.auth.authToken,
  }));

  useEffect(() => {
    (async () => {
      const data = await getActivityById(activityId);
      if (data.content) {
        setQuestions(data.content.questions || []);
        setPageTitle(data.content.title || "Untitled Page");
        setPointValue(data.content.pointValue || 0);
      } else {
        setQuestions([
          {
            question: "New Poll Question",
            options: [{ id: 1, text: "Choice 1", count: 0 }],
          },
        ]);
        setPageTitle("Untitled Page");
        setPointValue(1);
      }
    })();
  }, [activityId]);

  const handleSave = async () => {
    try {
      const updatedContent: PollContent = {
        title: pageTitle,
        questions: questions,
        pointValue
      };

      await axios.patch(
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
    } catch (e) {
      console.error("Failed to patch activity:", e);
      alert("Failed to save poll.");
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setQuestions(prev => {
      const newQuestions = [...prev];
      const [draggedQuestion] = newQuestions.splice(draggedIndex, 1);
      newQuestions.splice(index, 0, draggedQuestion);
      return newQuestions;
    });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

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
          View current, published, past, and event drafts.
        </h2>
      </div>

      <div className="draftSavePublishBox">
        <div className="draftButton">
          <Image src={Draft} alt="Draft status" />
          <span>{isDraft ? "Draft" : "Published"}</span>
        </div>
        <div className="savePublishBox">
          {onDelete && (
            <button className="deletePollButton" onClick={onDelete}>
              Cancel
            </button>
          )}
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

        <div className="pollControls">
          <DatePicker
            start={timeStart}
            end={timeEnd}
            onChange={({ newStart, newEnd }) => updateTime(newStart, newEnd)}
            label="SCHEDULE START DATE"
          />

          <TimePicker
            start={timeStart}
            end={timeEnd}
            onChange={({ newStart, newEnd }) => updateTime(newStart, newEnd)}
            label="SCHEDULE TIME"
          />

          <div className="controlGroup">
            <Image src={StarIcon} alt="Star" width={24} height={24} />
            <label>POINT VALUE</label>
            <div className="pointValueControl">
              <button 
                onClick={() => setPointValue(prev => Math.max(0, prev - 1))}
                disabled={pointValue <= 0}
              >
                −
              </button>
              <span className="pointValueDisplay">{pointValue}</span>
              <button onClick={() => setPointValue(prev => prev + 1)}>
                +
              </button>
            </div>
          </div>
        </div>

        <div className="questionList">
          {questions.map((q, qIdx) => (
            <div 
              key={qIdx} 
              className="questionPanel"
              onDragOver={(e) => handleDragOver(e, qIdx)}
            >
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
                  <div 
                    className="dragHandle"
                    draggable
                    onDragStart={() => handleDragStart(qIdx)}
                    onDragEnd={handleDragEnd}
                  >
                    <Image src={MoveIcon} alt="Move" />
                  </div>
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
        <button className="addQuestionButton" type="button" onClick={addQuestion}>
          + Add Another Question
        </button>
      </div>
    </div>
  );
}