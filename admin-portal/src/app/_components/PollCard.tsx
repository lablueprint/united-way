import React, {useState, useEffect} from "react";
import axios from 'axios';
import PollEditor from './PollEditor';


export default function PollCard()
{  
    interface PollInterface {
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
  
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const { data } = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/6785fa3aeee89e20063f6930/getPolls`);
        setPolls(data.polls);
        console.log(data.polls)
      } catch (error) {
        console.error("Error fetching polls:", error)
      }
    }
    fetchPolls();
  }, []);
  


  // return (
  //     <div>

  //       <button onClick = {fetchPolls}> Fetch Polls </button>

  //       {polls.map((poll) => (
  //         <PollEditor
  //           key={poll.id}
  //           questionData={poll.content.options.question}
  //           answerData={poll.content.options.answers}
  //         />
  //         console.log(poll.content.options.answers)
  //       ))}
      
  //     </div>
  // )

  return (
    <div>
      {polls.map((poll) => {
        console.log("Answers for poll:", poll._id);
        return (
          <PollEditor
            key={poll._id}
            idData = {poll._id}
            questionData={poll.content.question}
            answerData={poll.content.options}
          />
        );
      })}
    </div>
  );
  
}
