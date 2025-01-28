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
    
  const [polls, setPolls] = useState<PollInterface[]>([]);

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
      setPolls(data.data); // Save the filtered activities in state
      console.log("Data " + data.data);
    } catch (error) {
      console.error("Error fetching polls:", error);
    }
  };

  useEffect(() => {
    fetchPolls(); // Fetch polls when the component mounts
  }, []);

  return (
    <div>
      <PollEditor 
        eventID={id}
        idData={0}
        questionData=""
        answerData={[{
          id: 0,
          text: "",
          count: 0,
        }]}
        onSave={fetchPolls}
      />
      {polls.map((poll) => {
        // console.log("Answers for poll:", poll._id);
        return (
          <PollEditor 
            key={poll._id}
            eventID={poll.eventID}
            idData = {poll._id}
            questionData={poll.content.question}
            answerData={poll.content.options}
            onSave={fetchPolls}
          />
        );
      })}
    </div>
  )
  
}
