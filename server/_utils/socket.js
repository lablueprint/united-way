import activityModel from '../models/activityModel.js';

const emitActivity = async (activity, eventRoom, eventRooms, io) => {
    const activityStartTimeDiff = new Date(activity.timeStart).getTime() - new Date().getTime();
    const activityEndTimeDiff = new Date(activity.timeEnd).getTime() - new Date().getTime();
    if (activity.type === "raffle") {
        // Create a raffle room for the event
        const raffleRoom = `${eventRoom}-raffle`;
        if (activityStartTimeDiff > 0) {
            setTimeout(async () => {
                const sockets = await io.in(raffleRoom).allSockets();
                const raffleRoomSize = sockets.size;
                if (raffleRoomSize > 0) {
                    // Draw a random raffle number
                    const randomIndex = Math.floor(Math.random() * raffleRoomSize);
                    const raffleNumbers = Array.from(eventRooms[eventRoom].usedRaffleNumbers);
                    const randomRaffleNumber = raffleNumbers[randomIndex];
                    console.log(`Drew raffle number: ${randomRaffleNumber}`);
                    // Tell all clients in the raffle room if they won or lost
                    sockets.forEach((socketId) => {
                        const socket = io.sockets.sockets.get(socketId);
                        if (socket.raffleNumber === randomRaffleNumber) {
                            socket.emit('raffle winner', { randomRaffleNumber });
                        }
                        else {
                            socket.emit('raffle loser', { randomRaffleNumber });
                        }
                    });
                    // Regenerate random raffle numbers for all clients in the raffle room
                    eventRooms[eventRoom].usedRaffleNumbers = new Set();
                    sockets.forEach((socketId) => {
                        const socket = io.sockets.sockets.get(socketId);
                        let raffleNumber;
                        do {
                            raffleNumber = Math.floor(100000 + Math.random() * 900000);
                        } while (eventRooms[eventRoom].usedRaffleNumbers.has(raffleNumber));
                        eventRooms[eventRoom].usedRaffleNumbers.add(raffleNumber);
                        socket.raffleNumber = raffleNumber;
                        socket.emit('new raffle number', { raffleNumber });
                        console.log(`Generated raffle number: ${raffleNumber}`);
                    });
                } else {
                    console.log(`No clients in raffle room ${raffleRoom}`);
                }
            }, activityStartTimeDiff);
        }
    } else if (activity.type === "announcement") {
        if (activityStartTimeDiff > 0) {
            setTimeout(() => {
                // Let all clients in the event room know the activity is starting
                io.to(eventRoom).emit('announcement', activity);
            }, activityStartTimeDiff);
        }
    } else if (activity.type === "poll") {
        // Add entry in eventRooms data structure if it doesn't exist
        if (!eventRooms[eventRoom]) {
            eventRooms[eventRoom] = {};
        }
        if (!eventRooms[eventRoom].pollResponses) {
            eventRooms[eventRoom].pollResponses = {};
        }
        // Initialize poll responses for the activity
        eventRooms[eventRoom].pollResponses[activity._id.toString()] = activity.content.map((question) => {
            return {
                question: question.question,
                options: question.options.map((option) => ({
                    id: option.id,
                    text: option.text,
                    count: option.count
                })),
                totalVotes: question.totalVotes || 0
            }
        });
        if (activityStartTimeDiff > 0) {
            setTimeout(() => {
                // Let all clients in the event room know the activity is starting
                io.to(eventRoom).emit('poll', activity);
            }, activityStartTimeDiff);
        }
        if (activityEndTimeDiff > 0) {
            setTimeout(async () => {
                const results = {content: eventRooms[eventRoom].pollResponses[activity._id.toString()]};
                try {
                    await activityModel.findByIdAndUpdate(
                        activity._id.toString(),
                        results,
                        { new: true }
                    );
                } catch (err) {
                    console.error(err);
                }
                io.to(eventRoom).emit('poll results', activity, results);
            }, activityEndTimeDiff);
    }
    } else {
        if (activityStartTimeDiff > 0) {
            setTimeout(() => {
                // Let all clients in the event room know the activity is starting
                io.to(eventRoom).emit('activity start', activity);
            }, activityStartTimeDiff);
        }
        if (activityEndTimeDiff > 0) {
            setTimeout(() => {
                // Let all clients in the event room know the activity is ending
                io.to(eventRoom).emit('activity end', activity);
            }, activityEndTimeDiff);
        }
    }
}

export const emitEvent = async (event, eventRooms, io) => {
    const eventRoom = event._id.toString();
    const startTimeDiff = new Date(event.startDate).getTime() - new Date().getTime();
    const endTimeDiff = new Date(event.endDate).getTime() - new Date().getTime();
    if (startTimeDiff > 0) {
        setTimeout(() => {
            // Let all clients in the event room know the event is starting
            io.to(eventRoom).emit('event start', event);
        }, startTimeDiff);
    }
    if (endTimeDiff > 0) {
        setTimeout(() => {
            // Let all clients in the event room know the event is ending
            io.to(eventRoom).emit('event end', event);
            // Disconnect all sockets in the event room
            io.of("/").in(eventRoom).fetchSockets().then((sockets) => {
                sockets.forEach((socket) => {
                    // Disconnect each socket
                    socket.disconnect(true);
                });
            });
        }, endTimeDiff);
    }
    // Get activities for the event
    const eventActivities = event.activity;
    for (const id of eventActivities) {
        try {
            const activity = await activityModel.findById(id);
            if (activity) {
                emitActivity(activity, eventRoom, eventRooms, io);
            } else {
                console.log(`Activity with ID ${id} not found`);
            }
        } catch (err) {
            console.error(err);
        }
    }
}

const joinEvent = (socket, eventDetails) => {
    const eventRoom = eventDetails._id.toString();
    socket.join(eventRoom);
    console.log(`Client ${socket.id} joined room: ${eventRoom}`);
}

const leaveEvent = (socket, eventDetails, eventRooms) => {
    const eventRoom = eventDetails._id.toString();
    socket.leave(eventRoom);
    console.log(`Client ${socket.id} left room: ${eventRoom}`);
    socket.leave(`${eventRoom}-raffle`);
    console.log(`Client ${socket.id} left room: ${eventRoom}-raffle`);
    // Remove the raffle number from the usedRaffleNumbers set
    if (socket.raffleNumber && eventRooms[eventRoom]) {
        eventRooms[eventRoom].usedRaffleNumbers.delete(socket.raffleNumber);
    }
}

const joinRaffle = (socket, eventDetails, eventRooms) => {
    const eventRoom = eventDetails._id.toString();
    const raffleRoom = `${eventRoom}-raffle`;
    socket.join(raffleRoom);
    console.log(`Client ${socket.id} joined raffle room: ${raffleRoom}`);
    // Add entry in eventRooms data structure if it doesn't exist
    if (!eventRooms[eventRoom]) {
        eventRooms[eventRoom] = {};
    }
    if (!eventRooms[eventRoom].usedRaffleNumbers) {
        eventRooms[eventRoom].usedRaffleNumbers = new Set();
    }
    // TODO: Decide if there is a limit to the number of people who can join a raffle
    // Generate a random raffle number for the client
    let raffleNumber;
    do {
        raffleNumber = Math.floor(100000 + Math.random() * 900000);
    } while (eventRooms[eventRoom].usedRaffleNumbers.has(raffleNumber));
    eventRooms[eventRoom].usedRaffleNumbers.add(raffleNumber);
    socket.raffleNumber = raffleNumber;
    socket.emit('new raffle number', { raffleNumber });
    console.log(`Generated raffle number: ${raffleNumber}`);
}

const submitPoll = (socket, responses, poll, eventRooms) => {
    const eventRoom = poll.eventID.toString();
    console.log(eventRooms[eventRoom]);
    // Add to poll response counts
    for (let i = 0; i < responses.length; i++) {
        const response = responses[i] - 1; // Adjust for 0-based index
        eventRooms[eventRoom].pollResponses[poll._id][i].options[response].count += 1;
        eventRooms[eventRoom].pollResponses[poll._id][i].totalVotes += 1;
    }
    console.log(`Client ${socket.id} submitted poll responses: ${responses}`);
    console.log(`Poll responses for event ${eventRoom}:`, JSON.stringify(eventRooms[eventRoom].pollResponses[poll._id]));
}

export const interactWithAttendee = (socket, eventRooms) => {
    console.log(`New client connected: ${socket.id}`);
    // Send a message to the client upon connection
    socket.emit('message', 'Welcome to the server!');

    // Listen for messages from the client
    socket.on('message', (data) => {
        console.log(`Message from client: ${data}`);
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });

    // Handle client joining a room based on the event ID
    socket.on('join event', (eventDetails) => {
        joinEvent(socket, eventDetails);
    });

    // Handle client leaving an event room
    socket.on('leave event', (eventDetails) => {
        leaveEvent(socket, eventDetails, eventRooms);
    });

    // Listen for raffle join requests
    socket.on('join raffle', (eventDetails) => {
        joinRaffle(socket, eventDetails, eventRooms);
    });

    // Listen for poll submission
    socket.on('submit poll', (responses, poll) => {
        submitPoll(socket, responses, poll, eventRooms);
    });
}