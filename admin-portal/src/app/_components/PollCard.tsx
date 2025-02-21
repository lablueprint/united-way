import React, {useState, useEffect} from "react";
import axios from 'axios';
import PollEditor from './PollEditor';
// import DateTimePicker from 'react-datetime-picker';
// import 'react-datetime-picker/dist/DateTimePicker.css';
// import 'react-calendar/dist/Calendar.css';
// import 'react-clock/dist/Clock.css';

interface PollCardProps {
  id: string;
  timeStart: Date;
  timeEnd: Date;
}

// type ValuePiece = Date | null;
// type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function PollCard({ id, timeStart, timeEnd }: PollCardProps)
{  
  // const [start, setStart] = useState<Value>(new Date());
  // const [end, setEnd] = useState<Value>(new Date());
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
          type: "poll", // Send type "poll" in the request body
        }
      );
      console.log(data);
      if(data.data.length != 0){
        setPolls(data.data); // Save the filtered activities in state
      }
    } catch (error) {
      console.error("Error fetching polls:", error);
    }
  };

  useEffect(() => {
    fetchPolls(); // Fetch polls when the component mounts
  }, []);

  return (
    <div>
        {/* <div>
          <DateTimePicker onChange={setStart} value={start}/>
        </div>
        <div>
          <DateTimePicker onChange={setEnd} value={end} />
        </div> */}
        
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
