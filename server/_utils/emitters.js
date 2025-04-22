import activityModel from '../models/activityModel.js';

const emitActivity = async (activity, eventRoom, io) => {
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

export const emitEvent = async (event, io) => {
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
                emitActivity(activity, eventRoom, io);
            } else {
                console.log(`Activity with ID ${id} not found`);
            }
        } catch (err) {
            console.error(err);
        }
    }
}