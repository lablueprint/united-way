import React, {useState, useEffect} from "react";
import axios from 'axios';
import PollEditor from './PollEditor';

interface PollCardProps {
  id: string;
  timeStart: Date;
  timeEnd: Date;
}

export default function PollCard({ id, timeStart, timeEnd }: PollCardProps)
{  
  interface PollInterface {
      eventID: string;
      _id: number;
      content: {
          options: Choices[];
          question: string;
      };
  }
  interface Choices {
      id: number;
      text: string;
      count: number;
  }
    
  const [polls, setPolls] = useState<PollInterface[]>([{
      eventID: id,
      _id: 0,
      content:{
        options: [],
        question: "",
    }}]);

  const fetchPolls = async () => {
    try {
      console.log("Polls id: " + id);
      const { data } = await axios.post(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/filtered`,
        {
          eventID: id,
          type: "poll",
        }
      );
      console.log(data);
      if(data.data.length != 0){
        setPolls(data.data);
      }
    } catch (error) {
      console.error("Error fetching polls:", error);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  return (
    <div> 
      {polls.map((poll) => (
        <PollEditor 
          key={poll._id}
          eventID={poll.eventID}
          idData={poll._id}
          questionsData={Array.isArray(poll.content) ? poll.content.map((q, index) => ({
            id: index + 1, 
            question: q.question,
            answers: q.options,
        })) : []}
          startTime = {timeStart}
          endTime = {timeEnd}
          onSave={fetchPolls}
        />
      ))}
    </div>
  )
  
}
