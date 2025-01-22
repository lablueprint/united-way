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
  
  // useEffect(() => {
  //   const fetchPolls = async () => {
  //     try {
  //       const { data } = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/getEventById`);
  //     } catch (error) {
  //       console.error("Error fetching polls:", error)
  //     }
  //   }
  // })
  // useEffect(() => {
  //   const fetchPolls = async () => {
  //     try {
  //       const { data } = await axios.post(
  //         `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/filtered`,
  //         {
  //           type: "poll", // Filter for activities of type "poll"
  //         }
  //       );
  //       console.log(polls);
  //       setPolls(data.polls); // Assuming the filtered activities are in `data.data`
  //       console.log(data.polls);
  //     } catch (error) {
  //       console.error("Error fetching polls:", error);
  //     }
  //   };

  //   fetchPolls(); // Call the function inside useEffect
  // }, []); // Empty dependency array ensures this runs only once

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const { data } = await axios.post(
          `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/filtered`,
          {
            type: "poll", // Send type "poll" in the request body
          }
        );
        setPolls(data.polls); // Save the filtered activities in state
        console.log(data.polls);
      } catch (error) {
        console.error("Error fetching polls:", error);
      }
    };

    fetchPolls(); // Call fetchPolls when the component mounts
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
      <PollEditor 
        idData={0}
        questionData=""
        answerData={[{
          id: 0,
          text: "",
          count: 0,
        }]}
      />
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
  )
  
}
