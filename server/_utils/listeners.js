export const joinEvent = (socket, eventDetails) => {
    const eventRoom = eventDetails._id.toString();
    socket.join(eventRoom);
    console.log(`Client ${socket.id} joined room: ${eventRoom}`);
}

export const leaveEvent = (socket, eventDetails, eventRooms) => {
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

export const joinRaffle = (socket, eventDetails, eventRooms) => {
    const eventRoom = eventDetails._id.toString();
    const raffleRoom = `${eventRoom}-raffle`;
    socket.join(raffleRoom);
    console.log(`Client ${socket.id} joined raffle room: ${raffleRoom}`);
    // Add entry in eventRooms data structure if it doesn't exist
    if (!eventRooms[eventRoom]) {
        eventRooms[eventRoom] = {};
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