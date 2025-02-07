import React, {useState, useEffect} from "react";
import axios from 'axios';
import PollEditor from './PollEditor';

interface PollCardProps {
  id: string; // Ensure the type here is a string, not an object
}
export default function PollCard({ id }: PollCardProps)
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
      {/* <PollEditor 
        eventID={id}
        idData={0}
        questionsData={[{
            id: 0,
            question: "",
            answers: [{
              id: 0,
              text: "",
              count: 0,
            }]
        }]}
        onSave={fetchPolls}
      /> */}
        
        {polls.map((poll) => (
          <PollEditor 
            key={poll._id}
            eventID={poll.eventID}
            idData={poll._id}
            questionsData={Array.isArray(poll.content) ? poll.content.map((q, index) => ({
              id: index + 1,  // Ensures IDs are unique and incremented
              question: q.question,
              answers: q.options,
            })) : []} // Fallback to an empty array if poll.content is not an array
            onSave={fetchPolls}
          />
        ))}
    </div>
  )
  
}
